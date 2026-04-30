# Quick Test Guide - 5 Minutes to Test Gmail OAuth

## Step-by-Step Testing Instructions

### 1. Get Google OAuth Credentials (5 minutes)

**A. Go to Google Cloud Console:**
```
https://console.cloud.google.com/
```

**B. Create/Select Project:**
- Click "Select a project" → "New Project"
- Name: `BobCorn-Test`
- Click "Create"

**C. Enable Gmail API:**
- In search bar, type "Gmail API"
- Click "Gmail API" → Click "Enable"
- Wait ~10 seconds for it to enable

**D. Configure OAuth Consent Screen:**
- Left sidebar: "OAuth consent screen"
- User Type: Select "External" → Click "Create"
- Fill in:
  - App name: `BobCorn Scanner Test`
  - User support email: Your email
  - Developer contact: Your email
- Click "Save and Continue"
- Scopes: Click "Add or Remove Scopes"
  - Search for "gmail.readonly"
  - Check the box
  - Click "Update" → "Save and Continue"
- Test users: Click "Add Users"
  - Add your Gmail address
  - Click "Save and Continue"
- Click "Back to Dashboard"

**E. Create OAuth Credentials:**
- Left sidebar: "Credentials"
- Click "Create Credentials" → "OAuth client ID"
- Application type: "Web application"
- Name: `BobCorn Local`
- Authorized redirect URIs: Click "Add URI"
  - Add: `http://localhost:5173/api/auth/google-callback`
- Click "Create"
- **COPY** the Client ID and Client Secret (you'll need these!)

### 2. Configure Your Project (1 minute)

**A. Create `.env.local` file in project root:**
```bash
# In your terminal, in the project directory:
cp .env.local.example .env.local
```

**B. Edit `.env.local` and paste your credentials:**
```env
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5173/api/auth/google-callback

SESSION_SECRET=any_random_string_like_abc123xyz789
NODE_ENV=development
```

Save the file.

### 3. Start the Server (30 seconds)

```bash
# Make sure you're in the project directory
npm run dev
```

You should see:
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 4. Test the OAuth Flow (2 minutes)

**A. Open your browser:**
```
http://localhost:5173
```

**B. Click the test button:**
- Look for the red button in bottom-right corner: **"🧪 Test Scanner"**
- Click it

**C. Sign in with Google:**
- Click **"Sign in with Google"** button
- You'll be redirected to Google
- Sign in with the Gmail account you added as a test user
- Click **"Allow"** to grant permissions

**D. You'll be redirected back:**
- URL will be: `http://localhost:5173/?session=xxx&provider=google&success=true`
- You should see: **"✓ Active"** next to Session status

**E. Scan your inbox:**
- Click **"Scan Inbox"** button
- Wait 2-10 seconds
- You should see results grouped into:
  - 💰 Paid Subscriptions
  - 📧 Newsletters & Free Plans
  - ❓ Unclassified

### 5. What You Should See

**If it works:**
- ✅ OAuth redirect happens smoothly
- ✅ Session shows as "Active"
- ✅ Scan completes in <10 seconds
- ✅ Results show your actual subscriptions
- ✅ Known services (Netflix, Spotify, etc.) appear in "Paid Subscriptions"

**Example output:**
```
Scan Complete
Total: 23
Paid: 8
Newsletters: 12
Unclassified: 3

💰 Paid Subscriptions (8)
- Netflix (netflix.com) - Tier 1 - High confidence
- Spotify (spotify.com) - Tier 1 - High confidence
- Adobe Creative Cloud (adobe.com) - Tier 1 - High confidence
...
```

### 6. Check the Logs

**In your terminal (where `npm run dev` is running):**
You should see logs like:
```
Starting multi-strategy inbox scan...
Strategy "payment_keywords" found 45 messages
Strategy "known_senders" found 23 messages
Strategy "subscription_signals" found 18 messages
Strategy "account_related" found 12 messages
Total messages found: 98, Unique: 67
After deduplication: 23 unique subscriptions
Scan complete: { total: 23, paid: 8, newsletters: 12, unclassified: 3 }
```

### Troubleshooting

**"OAuth configuration error"**
- Check that `.env.local` exists in project root
- Restart the dev server: Stop (Ctrl+C) and run `npm run dev` again

**"Invalid redirect URI"**
- In Google Console, make sure redirect URI is exactly:
  `http://localhost:5173/api/auth/google-callback`
- No trailing slash, no https, port 5173

**"Access denied" or "Error 400"**
- Make sure you added your Gmail as a test user in OAuth consent screen
- Try using the exact email you added

**"Failed to scan inbox"**
- Open browser console (F12) to see detailed error
- Check if Gmail API is enabled in Google Console

**Nothing happens when clicking "Sign in with Google"**
- Open browser console (F12) and check for errors
- Make sure the dev server is running
- Try refreshing the page

### Testing Different Scenarios

**Test with different Gmail accounts:**
1. Sign out or use incognito mode
2. Go through OAuth flow with different account
3. Compare results

**Test the multi-strategy search:**
- Check terminal logs to see how many emails each strategy found
- Strategy 1 (payment keywords) should find the most
- Strategy 2 (known senders) should have high precision

**Test classification:**
- Known services (Netflix, Spotify) should be Tier 1
- Invoices/receipts should be Tier 2
- Newsletters should be Tier 3

### What to Report Back

After testing, let me know:
1. ✅ Did OAuth work? (redirected to Google and back)
2. ✅ Did scan complete? (how long did it take?)
3. ✅ How many subscriptions found? (total, paid, newsletters)
4. ✅ Were known services correctly identified?
5. ❌ Any errors? (paste error messages)

### Next Steps After Successful Test

If everything works:
1. ✅ Gmail OAuth is working
2. ✅ Multi-strategy search is working
3. ✅ Classification is working
4. → We can add Outlook support
5. → We can build the polished modal UI
6. → We can deploy to production

If something doesn't work:
- Share the error messages
- Share terminal logs
- Share browser console logs
- I'll help debug!