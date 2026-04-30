import { useState, useEffect } from 'react';

/**
 * Minimal test UI for Gmail OAuth and scanning
 * This is a simple component to validate the backend works before building the full UI
 */
export default function ScannerTest() {
  const [sessionId, setSessionId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Check URL for OAuth callback parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get('session');
    const token = params.get('token');
    const success = params.get('success');
    const errorParam = params.get('error');
    const message = params.get('message');

    if (token && success === 'true') {
      // Development mode - token passed directly
      try {
        const tokenData = JSON.parse(decodeURIComponent(token));
        setAccessToken(tokenData.access_token);
        setSessionId('dev-mode');
        setError(null);
      } catch (e) {
        setError('Failed to parse token');
      }
      // Clean URL
      window.history.replaceState({}, '', '/?test');
    } else if (session && success === 'true') {
      // Production mode - session ID
      setSessionId(session);
      setError(null);
      // Clean URL
      window.history.replaceState({}, '', '/?test');
    } else if (errorParam) {
      setError(message || errorParam);
      // Clean URL
      window.history.replaceState({}, '', '/?test');
    }
  }, []);

  // Start Gmail OAuth flow
  const handleGmailLogin = async () => {
    try {
      setError(null);
      const response = await fetch('/api/auth/google');
      const data = await response.json();

      if (data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        setError('Failed to generate OAuth URL');
      }
    } catch (err) {
      setError(`OAuth error: ${err.message}`);
    }
  };

  // Scan inbox
  const handleScan = async () => {
    if (!sessionId && !accessToken) {
      setError('No active session. Please sign in first.');
      return;
    }

    try {
      setScanning(true);
      setError(null);

      const response = await fetch('/api/scan/gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          accessToken: accessToken // Pass token directly in dev mode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        setError(data.error || 'Scan failed');
      }
    } catch (err) {
      setError(`Scan error: ${err.message}`);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-bone p-8">
      <div className="max-w-4xl mx-auto">
        <div className="card-brutal p-8 bg-paper">
          <h1 className="font-display font-bold text-3xl mb-2">
            Gmail Scanner Test
          </h1>
          <p className="text-ink/70 mb-6">
            Minimal UI to test OAuth and scanning functionality
          </p>

          {/* Status */}
          <div className="mb-6 p-4 border-2 border-ink bg-bone">
            <div className="text-sm font-mono">
              <div>
                <strong>Session:</strong>{' '}
                {sessionId ? (
                  <span className="text-cash">✓ Active ({sessionId.slice(0, 8)}...)</span>
                ) : (
                  <span className="text-blood">✗ Not authenticated</span>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 border-2 border-blood bg-blood/10">
              <div className="font-bold text-blood mb-1">Error</div>
              <div className="text-sm">{error}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleGmailLogin}
              disabled={sessionId !== null}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sessionId ? '✓ Signed In' : 'Sign in with Google'}
            </button>

            <button
              onClick={handleScan}
              disabled={!sessionId || scanning}
              className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {scanning ? 'Scanning...' : 'Scan Inbox'}
            </button>
          </div>

          {/* Results */}
          {scanning && (
            <div className="p-6 border-2 border-ink bg-acid/20">
              <div className="font-bold mb-2">Scanning your inbox...</div>
              <div className="text-sm text-ink/70">
                Running multi-strategy search across your emails
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="p-4 border-2 border-ink bg-cash/20">
                <div className="font-bold mb-2">Scan Complete</div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-mono text-2xl">{results.stats.total}</div>
                    <div className="text-ink/70">Total</div>
                  </div>
                  <div>
                    <div className="font-mono text-2xl">{results.stats.paid}</div>
                    <div className="text-ink/70">Paid</div>
                  </div>
                  <div>
                    <div className="font-mono text-2xl">{results.stats.newsletters}</div>
                    <div className="text-ink/70">Newsletters</div>
                  </div>
                  <div>
                    <div className="font-mono text-2xl">{results.stats.unclassified}</div>
                    <div className="text-ink/70">Unclassified</div>
                  </div>
                </div>
              </div>

              {/* Paid Subscriptions */}
              {results.grouped.paid.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3">
                    💰 Paid Subscriptions ({results.grouped.paid.length})
                  </h3>
                  <div className="space-y-2">
                    {results.grouped.paid.map((sub, idx) => (
                      <SubscriptionCard key={idx} subscription={sub} />
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletters */}
              {results.grouped.newsletters.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3">
                    📧 Newsletters & Free Plans ({results.grouped.newsletters.length})
                  </h3>
                  <div className="space-y-2">
                    {results.grouped.newsletters.slice(0, 5).map((sub, idx) => (
                      <SubscriptionCard key={idx} subscription={sub} />
                    ))}
                    {results.grouped.newsletters.length > 5 && (
                      <div className="text-sm text-ink/70 p-2">
                        + {results.grouped.newsletters.length - 5} more...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Unclassified */}
              {results.grouped.unclassified.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3">
                    ❓ Unclassified ({results.grouped.unclassified.length})
                  </h3>
                  <div className="text-sm text-ink/70 mb-2">
                    These matched our search but need manual review
                  </div>
                  <div className="space-y-2">
                    {results.grouped.unclassified.slice(0, 3).map((sub, idx) => (
                      <SubscriptionCard key={idx} subscription={sub} />
                    ))}
                    {results.grouped.unclassified.length > 3 && (
                      <div className="text-sm text-ink/70 p-2">
                        + {results.grouped.unclassified.length - 3} more...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SubscriptionCard({ subscription }) {
  const tierColors = {
    1: 'bg-cash/20 border-cash',
    2: 'bg-acid/20 border-acid',
    3: 'bg-bone border-ink',
    4: 'bg-paper border-ink/30'
  };

  const confidenceLabels = {
    high: '✓ High',
    medium: '~ Medium',
    low: '? Low',
    very_low: '? Very Low'
  };

  return (
    <div className={`p-3 border-2 ${tierColors[subscription.tier] || 'border-ink'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate">
            {subscription.service.name}
          </div>
          <div className="text-sm text-ink/70 truncate">
            {subscription.from}
          </div>
          <div className="text-sm text-ink/60 mt-1 truncate">
            {subscription.subject}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-mono text-ink/60">
            Tier {subscription.tier}
          </div>
          <div className="text-xs font-mono text-ink/60">
            {confidenceLabels[subscription.confidence]}
          </div>
          {subscription.service.category !== 'unknown' && (
            <div className="text-xs mt-1 px-2 py-0.5 bg-ink text-paper">
              {subscription.service.category}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob
