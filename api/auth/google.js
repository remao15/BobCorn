import { google } from 'googleapis';
import { generateState, storeState } from '../utils/session.js';

/**
 * Gmail OAuth initiation endpoint
 * Generates OAuth URL and redirects user to Google consent screen
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
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
    
    // Generate state parameter for CSRF protection
    const state = generateState();
    storeState(state);
    
    // Generate OAuth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Get refresh token
      scope: ['https://www.googleapis.com/auth/gmail.readonly'],
      state: state,
      prompt: 'consent' // Force consent screen to get refresh token
    });
    
    // Return the auth URL to frontend
    return res.status(200).json({
      authUrl,
      state
    });
    
  } catch (error) {
    console.error('Error generating Google OAuth URL:', error);
    return res.status(500).json({ 
      error: 'Failed to generate OAuth URL',
      message: error.message 
    });
  }
}

// Made with Bob
