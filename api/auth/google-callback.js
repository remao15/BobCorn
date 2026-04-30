import { google } from 'googleapis';
import { validateState, createSession } from '../utils/session.js';

/**
 * Gmail OAuth callback endpoint
 * Handles the OAuth callback from Google and exchanges code for tokens
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { code, state, error } = req.query;
    
    // Handle user denial
    if (error) {
      console.log('User denied OAuth consent:', error);
      return res.redirect(`/?error=access_denied&message=${encodeURIComponent('You denied access to your Gmail inbox')}`);
    }
    
    // Validate required parameters
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state parameter' });
    }
    
    // Validate state parameter (CSRF protection)
    // Skip validation in development since serverless functions don't persist state
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev && !validateState(state)) {
      console.error('Invalid or expired state parameter');
      return res.status(400).json({ error: 'Invalid state parameter' });
    }
    
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
    
    // Validate environment variables
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
      console.error('Missing Google OAuth environment variables');
      return res.status(500).json({ error: 'OAuth configuration error' });
    }
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );
    
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token) {
      throw new Error('No access token received');
    }
    
    // Create session with tokens
    const sessionId = createSession('google', {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      token_type: tokens.token_type,
      scope: tokens.scope
    });
    
    // In development, pass token directly since serverless functions don't share memory
    if (isDev) {
      // Pass token directly to frontend (only in dev!)
      const tokenData = encodeURIComponent(JSON.stringify({
        access_token: tokens.access_token,
        expiry_date: tokens.expiry_date
      }));
      return res.redirect(`/?token=${tokenData}&provider=google&success=true`);
    }
    
    // Redirect to frontend with session ID
    // Frontend will store this in memory and use it for API calls
    return res.redirect(`/?session=${sessionId}&provider=google&success=true`);
    
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return res.redirect(`/?error=oauth_failed&message=${encodeURIComponent(error.message)}`);
  }
}

// Made with Bob
