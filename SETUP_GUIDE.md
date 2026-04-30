# Setup Guide - Gmail OAuth Testing

## Prerequisites
- Google Cloud Console account
- Node.js installed
- This project running locally

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it something like "BobCorn Scanner"

## Step 2: Enable Gmail API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Gmail API"
3. Click on it and press **Enable**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - User Type: **External** (for testing)
   - App name: **BobCorn Scanner**
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add `gmail.readonly`
   - Test users: Add your Gmail address
   - Save and continue

4. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: **BobCorn Local Dev**
   - Authorized redirect URIs:
     - `http://localhost:5173/api/auth/google-callback`
     - `http://localhost:3000/api/auth/google-callback` (backup)
   - Click **Create**

5. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:5173/api/auth/google-callback
   
   SESSION_SECRET=any_random_string_here
   NODE_ENV=development
   ```

3. Generate a random session secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Step 5: Install Dependencies & Run

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open browser to `http://localhost:5173`

## Step 6: Test the OAuth Flow

### Option 1: Use Test Button
1. On the homepage, click the **🧪 Test Scanner** button in bottom-right corner
2. Click **Sign in with Google**
3. You'll be redirected to Google's consent screen
4. Sign in with your test Gmail account
5. Grant permissions (read-only access to Gmail)
6. You'll be redirected back to the test page with an active session

### Option 2: Direct URL
1. Navigate to `http://localhost:5173/?test`
2. Follow steps 2-6 above

## Step 7: Scan Your Inbox

1. After successful OAuth, you'll see "✓ Active" session status
2. Click **Scan Inbox** button
3. Wait for the scan to complete (should take 2-10 seconds)
4. Review the results:
   - **Total**: Number of unique subscriptions found
   - **Paid**: High-confidence paid subscriptions
   - **Newsletters**: Free plans and newsletters
   - **Unclassified**: Needs manual review

## Expected Results

### What You Should See:
- **Paid Subscriptions**: Netflix, Spotify, Adobe, etc. (if you have them)
- **Newsletters**: Substack, Medium, news sites
- **Unclassified**: Emails that matched search but unclear

### Multi-Strategy Search in Action:
The backend runs 4 parallel searches:
1. **Payment keywords**: invoice, receipt, billing, etc.
2. **Known senders**: From our 200+ service database
3. **Subscription signals**: "your plan", "renewal", etc.
4. **Account-related**: Gmail's categorization + keywords

Check the browser console and server logs to see each strategy's results.

## Troubleshooting

### "OAuth configuration error"
- Check that `.env.local` exists and has correct values
- Restart the dev server after changing `.env.local`

### "Invalid redirect URI"
- Make sure the redirect URI in Google Console matches exactly
- Check the port number (5173 for Vite default)
- No trailing slashes

### "Access denied"
- You clicked "Cancel" on Google's consent screen
- Try again and click "Allow"

### "Invalid or expired session"
- Sessions expire after 1 hour
- Click "Sign in with Google" again

### "Failed to scan inbox"
- Check browser console for detailed error
- Check server terminal for backend logs
- Verify Gmail API is enabled in Google Console

## Testing with Different Inboxes

To test with different Gmail accounts:
1. Sign out or use incognito mode
2. Go through OAuth flow with different account
3. Compare results

## What to Look For

### Success Indicators:
✅ OAuth redirect works smoothly
✅ Session is created and stored
✅ Scan completes in <10 seconds
✅ Known services (Netflix, Spotify) are classified as Tier 1
✅ Payment emails are classified as Tier 2
✅ Results are deduplicated by domain

### Issues to Watch For:
❌ OAuth errors or infinite redirects
❌ Scan takes >30 seconds
❌ Known services not recognized
❌ Duplicate subscriptions from same domain
❌ Missing obvious subscriptions

## Next Steps After Successful Test

1. ✅ Gmail OAuth works
2. ✅ Multi-strategy search works
3. ✅ Classification works
4. ⏭️ Add Outlook OAuth (if needed)
5. ⏭️ Build polished UI modal
6. ⏭️ Add progressive rendering
7. ⏭️ Deploy to Vercel

## Production Deployment Notes

Before deploying to production:
1. Update redirect URIs in Google Console to production URL
2. Set environment variables in Vercel dashboard
3. Remove the test button from App.jsx
4. Switch OAuth consent screen from "Testing" to "Published"
5. Add privacy policy and terms of service URLs

## Support

If you encounter issues:
1. Check browser console (F12)
2. Check server terminal logs
3. Verify all environment variables are set
4. Ensure Gmail API is enabled
5. Check OAuth consent screen configuration