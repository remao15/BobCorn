import { randomUUID } from 'crypto';

// In-memory session store (resets on server restart)
const sessions = new Map();

// Session expiration time (1 hour)
const SESSION_EXPIRY = 60 * 60 * 1000;

/**
 * Create a new session with OAuth token
 * @param {string} provider - 'google' or 'outlook'
 * @param {object} token - OAuth token object
 * @returns {string} sessionId
 */
export function createSession(provider, token) {
  const sessionId = randomUUID();
  const now = Date.now();
  
  sessions.set(sessionId, {
    provider,
    token,
    createdAt: now,
    expiresAt: now + SESSION_EXPIRY,
    lastAccessed: now
  });
  
  return sessionId;
}

/**
 * Get session by ID
 * @param {string} sessionId
 * @returns {object|null} session data or null if expired/not found
 */
export function getSession(sessionId) {
  if (!sessionId) return null;
  
  const session = sessions.get(sessionId);
  
  if (!session) return null;
  
  // Check if expired
  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  
  // Update last accessed time
  session.lastAccessed = Date.now();
  
  return session;
}

/**
 * Delete a session
 * @param {string} sessionId
 */
export function deleteSession(sessionId) {
  sessions.delete(sessionId);
}

/**
 * Generate a secure state parameter for OAuth CSRF protection
 * @returns {string} state parameter
 */
export function generateState() {
  return randomUUID();
}

// Cleanup expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(id);
    }
  }
}, 5 * 60 * 1000);

// Store state parameters temporarily (for CSRF validation)
const stateStore = new Map();

/**
 * Store state parameter with expiration
 * @param {string} state
 */
export function storeState(state) {
  stateStore.set(state, {
    createdAt: Date.now(),
    expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
  });
}

/**
 * Validate and consume state parameter
 * @param {string} state
 * @returns {boolean} true if valid
 */
export function validateState(state) {
  const stateData = stateStore.get(state);
  
  if (!stateData) return false;
  
  if (stateData.expiresAt < Date.now()) {
    stateStore.delete(state);
    return false;
  }
  
  // Consume the state (one-time use)
  stateStore.delete(state);
  return true;
}

// Cleanup expired states every minute
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of stateStore.entries()) {
    if (data.expiresAt < now) {
      stateStore.delete(state);
    }
  }
}, 60 * 1000);

// Made with Bob
