import { getServiceByDomain, isKnownService } from './known-services.js';

/**
 * Extract domain from email address
 * @param {string} email
 * @returns {string} domain
 */
export function extractDomain(email) {
  if (!email) return '';
  
  // Handle "Name <email@domain.com>" format
  const match = email.match(/<(.+)>/);
  const cleanEmail = match ? match[1] : email;
  
  // Extract domain
  const parts = cleanEmail.split('@');
  return parts.length > 1 ? parts[1].toLowerCase() : '';
}

/**
 * Classify subscription into confidence tiers
 * @param {object} message - Email message with from, subject, date
 * @returns {object} Classified subscription
 */
export function classifySubscription(message) {
  const domain = extractDomain(message.from);
  const subject = message.subject || '';
  
  // Tier 1: Known service (highest confidence)
  if (isKnownService(domain)) {
    const service = getServiceByDomain(domain);
    return {
      ...message,
      tier: 1,
      confidence: 'high',
      service: {
        name: service.name,
        domain,
        category: service.category,
        logo: service.logo
      }
    };
  }
  
  // Tier 2: Payment signals (medium confidence)
  const paymentKeywords = /invoice|receipt|payment|billing|€|\$|USD|GBP|EUR|amount|charged|paid|subscription|renewal/i;
  if (paymentKeywords.test(subject)) {
    return {
      ...message,
      tier: 2,
      confidence: 'medium',
      service: {
        name: domain || 'Unknown Service',
        domain,
        category: 'unknown',
        logo: null
      }
    };
  }
  
  // Tier 3: Subscription signals but no payment (lower confidence)
  const subscriptionKeywords = /plan|membership|trial|account|premium|pro|upgrade/i;
  if (subscriptionKeywords.test(subject)) {
    return {
      ...message,
      tier: 3,
      confidence: 'low',
      service: {
        name: domain || 'Unknown Service',
        domain,
        category: 'unknown',
        logo: null
      }
    };
  }
  
  // Tier 4: Matched search but unclear (lowest confidence)
  return {
    ...message,
    tier: 4,
    confidence: 'very_low',
    service: {
      name: domain || 'Unknown Service',
      domain,
      category: 'unknown',
      logo: null
    }
  };
}

/**
 * Deduplicate messages by sender domain, keeping most recent
 * @param {array} messages - Array of email messages
 * @returns {array} Deduplicated messages
 */
export function deduplicateByDomain(messages) {
  const domainMap = new Map();
  
  for (const msg of messages) {
    const domain = extractDomain(msg.from);
    if (!domain) continue;
    
    const existing = domainMap.get(domain);
    
    // Keep the most recent message for each domain
    if (!existing || new Date(msg.date) > new Date(existing.date)) {
      domainMap.set(domain, msg);
    }
  }
  
  return Array.from(domainMap.values());
}

/**
 * Group subscriptions by tier for display
 * @param {array} subscriptions - Classified subscriptions
 * @returns {object} Grouped subscriptions
 */
export function groupByTier(subscriptions) {
  const grouped = {
    paid: [], // Tier 1 + 2
    newsletters: [], // Tier 3
    unclassified: [] // Tier 4
  };
  
  for (const sub of subscriptions) {
    if (sub.tier === 1 || sub.tier === 2) {
      grouped.paid.push(sub);
    } else if (sub.tier === 3) {
      grouped.newsletters.push(sub);
    } else {
      grouped.unclassified.push(sub);
    }
  }
  
  // Sort each group by date (most recent first)
  grouped.paid.sort((a, b) => new Date(b.date) - new Date(a.date));
  grouped.newsletters.sort((a, b) => new Date(b.date) - new Date(a.date));
  grouped.unclassified.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return grouped;
}

/**
 * Calculate confidence score based on multiple factors
 * @param {object} subscription
 * @returns {number} Score from 0-100
 */
export function calculateConfidenceScore(subscription) {
  let score = 0;
  
  // Base score by tier
  if (subscription.tier === 1) score += 80;
  else if (subscription.tier === 2) score += 60;
  else if (subscription.tier === 3) score += 40;
  else score += 20;
  
  // Bonus for known service
  if (subscription.service.category !== 'unknown') score += 10;
  
  // Bonus for payment keywords in subject
  const paymentKeywords = /invoice|receipt|payment|billing/i;
  if (paymentKeywords.test(subscription.subject)) score += 10;
  
  return Math.min(100, score);
}

// Made with Bob
