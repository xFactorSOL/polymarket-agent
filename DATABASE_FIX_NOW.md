# IMMEDIATE FIX - Set Environment Variable

The code fixes are deploying, but you can fix it RIGHT NOW by setting an environment variable:

## Quick Fix (2 minutes):

1. **Go to Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. **Add New Variable**:
   - **Key**: `DATABASE_PATH`
   - **Value**: `/tmp/polymarket.db`
   - **Environment**: Select ALL (Production, Preview, Development)

3. **Save**

4. **Redeploy**: Go to Deployments → Click "..." → **Redeploy**

This will force the database to use `/tmp` immediately, bypassing the directory creation issue.

## Why This Works:

- `/tmp` always exists on Vercel serverless functions
- No directory creation needed
- Works immediately without waiting for code deployment

After redeploy, the error should disappear!
