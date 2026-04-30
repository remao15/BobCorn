import { google } from 'googleapis';
import { getSession } from '../utils/session.js';
import { classifySubscription, deduplicateByDomain, groupByTier } from '../utils/classifier.js';
import { getAllKnownDomains } from '../utils/known-services.js';

/**
 * Gmail inbox scanning endpoint
 * Implements multi-strategy search approach for maximum subscription detection
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { sessionId, accessToken } = req.body;
    
    // Development mode: use access token directly
    const isDev = process.env.NODE_ENV === 'development';
    let oauth2Client;
    
    if (isDev && accessToken) {
      // Use token directly in development
      const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
      oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI
      );
      oauth2Client.setCredentials({ access_token: accessToken });
    } else {
      // Production mode: use session
      if (!sessionId) {
        return res.status(400).json({ error: 'Missing session ID' });
      }
      
      // Get session
      const session = getSession(sessionId);
      
      if (!session) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }
      
      if (session.provider !== 'google') {
        return res.status(400).json({ error: 'Invalid provider for this endpoint' });
      }
      
      const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
      
      // Create OAuth2 client with tokens
      oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI
      );
      
      oauth2Client.setCredentials(session.token);
    }
    
    // Create Gmail API client
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Multi-strategy search (as per SEARCH_STRATEGY.md)
    const strategies = [
      {
        name: 'payment_keywords',
        query: '(subject:invoice OR subject:receipt OR subject:payment OR subject:billing OR subject:subscription OR subject:renewal OR subject:charged)',
        weight: 1.0
      },
      {
        name: 'known_senders',
        query: buildKnownSendersQuery(),
        weight: 1.0
      },
      {
        name: 'subscription_signals',
        query: '(subject:"your plan" OR subject:"your subscription" OR subject:"auto-renew" OR subject:"trial" OR subject:"membership")',
        weight: 0.8
      },
      {
        name: 'account_related',
        query: 'category:updates (subject:account OR subject:premium OR subject:pro)',
        weight: 0.6
      }
    ];
    
    // Run all searches in parallel
    console.log('Step 1: Searching inbox with multiple strategies...');
    const searchResults = await Promise.all(
      strategies.map(strategy => searchGmail(gmail, strategy.query, strategy.name))
    );
    
    // Merge and deduplicate message IDs
    const messageMap = new Map();
    let totalFound = 0;
    
    searchResults.forEach((result, idx) => {
      console.log(`Strategy "${strategies[idx].name}" found ${result.messageIds.length} messages`);
      totalFound += result.messageIds.length;
      
      result.messageIds.forEach(id => {
        if (!messageMap.has(id)) {
          messageMap.set(id, {
            id,
            foundBy: strategies[idx].name,
            weight: strategies[idx].weight
          });
        }
      });
    });
    
    const uniqueMessageIds = Array.from(messageMap.keys());
    console.log(`✓ Found ${totalFound} total emails, ${uniqueMessageIds.length} unique`);
    
    if (uniqueMessageIds.length === 0) {
      return res.status(200).json({
        success: true,
        subscriptions: [],
        grouped: { paid: [], newsletters: [], unclassified: [] },
        stats: {
          total: 0,
          paid: 0,
          newsletters: 0,
          unclassified: 0
        }
      });
    }
    
    // Fetch metadata for all unique messages (batch processing)
    console.log('Step 2: Fetching email metadata...');
    const messages = await fetchMessageMetadata(gmail, uniqueMessageIds);
    console.log(`✓ Retrieved ${messages.length} email details`);
    
    // Deduplicate by sender domain
    console.log('Step 3: Deduplicating by sender domain...');
    const deduplicated = deduplicateByDomain(messages);
    console.log(`✓ ${deduplicated.length} unique senders (removed ${messages.length - deduplicated.length} duplicates)`);
    
    // Classify each subscription
    console.log('Step 4: Classifying subscriptions...');
    const classified = deduplicated.map(msg => classifySubscription(msg)).filter(c => c !== null);
    console.log(`✓ Classified ${classified.length} subscriptions (filtered ${deduplicated.length - classified.length} non-subscriptions)`);
    
    // Group by tier
    const grouped = groupByTier(classified);
    
    // Calculate stats
    const stats = {
      initialEmails: totalFound,
      uniqueEmails: uniqueMessageIds.length,
      uniqueSenders: deduplicated.length,
      total: classified.length,
      paid: grouped.paid.length,
      newsletters: grouped.newsletters.length,
      unclassified: grouped.unclassified.length
    };
    
    console.log('✓ Scan complete:', stats);
    
    return res.status(200).json({
      success: true,
      subscriptions: classified,
      grouped,
      stats
    });
    
  } catch (error) {
    console.error('Error scanning Gmail inbox:', error);
    
    // Handle specific errors
    if (error.code === 401) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Your session has expired. Please sign in again.'
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to scan inbox',
      message: error.message 
    });
  }
}

/**
 * Search Gmail with a specific query
 * @param {object} gmail - Gmail API client
 * @param {string} query - Search query
 * @param {string} strategyName - Name of the strategy (for logging)
 * @returns {object} Search results with message IDs
 */
async function searchGmail(gmail, query, strategyName) {
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 500 // Gmail API limit per page
    });
    
    return {
      messageIds: response.data.messages?.map(m => m.id) || [],
      strategy: strategyName
    };
  } catch (error) {
    console.error(`Error in strategy "${strategyName}":`, error.message);
    return { messageIds: [], strategy: strategyName };
  }
}

/**
 * Fetch metadata for multiple messages (batch processing)
 * @param {object} gmail - Gmail API client
 * @param {array} messageIds - Array of message IDs
 * @returns {array} Array of message metadata
 */
async function fetchMessageMetadata(gmail, messageIds) {
  const messages = [];
  const batchSize = 100; // Process 100 at a time
  
  for (let i = 0; i < messageIds.length; i += batchSize) {
    const batch = messageIds.slice(i, i + batchSize);
    
    const batchPromises = batch.map(id =>
      gmail.users.messages.get({
        userId: 'me',
        id: id,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date']
      }).catch(err => {
        console.error(`Error fetching message ${id}:`, err.message);
        return null;
      })
    );
    
    const results = await Promise.all(batchPromises);
    
    // Extract metadata
    results.forEach(result => {
      if (!result || !result.data) return;
      
      const headers = result.data.payload?.headers || [];
      const from = headers.find(h => h.name === 'From')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';
      
      messages.push({
        id: result.data.id,
        from,
        subject,
        date,
        threadId: result.data.threadId
      });
    });
  }
  
  return messages;
}

/**
 * Build search query for known sender domains
 * Gmail has query length limits, so we batch the domains
 * @returns {string} Search query
 */
function buildKnownSendersQuery() {
  const domains = getAllKnownDomains();
  
  // Gmail query length limit is ~2000 characters
  // Take first 50 domains to stay under limit
  const selectedDomains = domains.slice(0, 50);
  
  return `from:(${selectedDomains.join(' OR ')})`;
}

/**
 * STAGE 2: Verify paid subscriptions by reading full email content
 * @param {object} gmail - Gmail API client
 * @param {array} paidSubscriptions - Subscriptions classified as "paid"
 * @returns {array} Verified paid subscriptions
 */
async function verifyPaidSubscriptions(gmail, paidSubscriptions) {
  const verified = [];
  
  for (const sub of paidSubscriptions) {
    try {
      // Fetch full email content
      const response = await gmail.users.messages.get({
        userId: 'me',
        id: sub.id,
        format: 'full'
      });
      
      // Extract email body
      let emailBody = '';
      const payload = response.data.payload;
      
      if (payload.body?.data) {
        emailBody = Buffer.from(payload.body.data, 'base64').toString('utf-8');
      } else if (payload.parts) {
        for (const part of payload.parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            emailBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
            break;
          } else if (part.mimeType === 'text/html' && part.body?.data && !emailBody) {
            emailBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
        }
      }
      
      // Clean HTML tags and normalize
      const cleanBody = emailBody.replace(/<[^>]*>/g, ' ').toLowerCase();
      
      // Check if it's actually a subscription (not promo/marketing)
      const isActualSubscription = analyzeEmailContent(cleanBody, sub.subject);
      
      if (isActualSubscription) {
        verified.push({
          ...sub,
          verified: true,
          snippet: cleanBody.substring(0, 300).trim()
        });
      } else {
        console.log(`Filtered out non-subscription: ${sub.subject}`);
      }
      
    } catch (err) {
      console.error(`Error verifying subscription ${sub.id}:`, err.message);
      // Keep it if we can't verify (benefit of doubt)
      verified.push({
        ...sub,
        verified: false,
        snippet: 'Could not verify'
      });
    }
  }
  
  return verified;
}

/**
 * Analyze full email content to determine if it's an actual subscription
 * @param {string} body - Email body (cleaned, lowercase)
 * @param {string} subject - Email subject
 * @returns {boolean} true if actual subscription
 */
function analyzeEmailContent(body, subject) {
  const subjectLower = subject.toLowerCase();
  
  // Strong indicators it's NOT a subscription (promotional/marketing)
  const promoIndicators = [
    'limited time', 'final hours', 'last chance', 'hurry',
    'save now', 'special offer', 'exclusive offer',
    'get started', 'try now', 'sign up now', 'join now',
    'black friday', 'cyber monday', 'flash sale',
    '% off', 'discount code', 'promo code'
  ];
  
  // Check subject for promo indicators
  if (promoIndicators.some(indicator => subjectLower.includes(indicator))) {
    return false;
  }
  
  // Strong indicators it IS a subscription (payment/billing)
  const subscriptionIndicators = [
    'payment received', 'payment successful', 'payment processed',
    'invoice', 'receipt', 'billing statement',
    'subscription renewed', 'subscription active',
    'auto-renewal', 'next billing date',
    'amount charged', 'card ending in',
    'subscription period', 'billing cycle'
  ];
  
  // Check body for subscription indicators
  const hasSubscriptionIndicator = subscriptionIndicators.some(indicator =>
    body.includes(indicator)
  );
  
  return hasSubscriptionIndicator;
}

// Made with Bob
