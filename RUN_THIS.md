# How to Run & Test (FIXED VERSION)

## The Problem
Vite doesn't run serverless functions. We need Vercel CLI.

## The Solution - 3 Steps

### 1. Make sure you have `.env.local` configured

Your `.env.local` should look like this (NO quotes needed):
```env
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google-callback

SESSION_SECRET=any_random_string_here
NODE_ENV=development
```

**Important:** 
- NO quotes around values
- Redirect URI uses port **3000** (not 5173)
- Update this in Google Console too!

### 2. Update Google Console Redirect URI

Go to Google Cloud Console → Credentials → Your OAuth Client
- Change redirect URI to: `http://localhost:3000/api/auth/google-callback`
- Save

### 3. Run with Vercel CLI

Stop any running servers, then:

```bash
npm run dev:vercel
```

This will:
- Start Vercel dev server on port 3000
- Run your serverless functions
- Serve your React app

### 4. Test

Open browser to:
```
http://localhost:3000
```

Click "🧪 Test Scanner" → "Sign in with Google" → Should work!

## Why This Works

- **Vercel CLI** runs serverless functions locally
- Uses port **3000** by default
- Exactly like production
- No more "import __v... is not valid JSON" error

## Troubleshooting

**"Vercel CLI not starting"**
- Make sure no other process is using port 3000
- Try: `lsof -ti:3000 | xargs kill` then retry

**"Still getting JSON error"**
- Make sure you're using `npm run dev:vercel` (not `npm run dev`)
- Check you're on `http://localhost:3000` (not 5173)

**"OAuth redirect error"**
- Update Google Console redirect URI to port 3000
- Restart Vercel dev server

## Quick Check

If everything is working:
1. ✅ Server starts on port 3000
2. ✅ You see the homepage
3. ✅ Click test button → OAuth page loads
4. ✅ Sign in → Redirected back with session
5. ✅ Scan works → See results

Let me know which step fails!