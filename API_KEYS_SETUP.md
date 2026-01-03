# 🔐 Polymarket API Keys Setup

## ⚠️ SECURITY WARNING

**NEVER commit API keys to git!** These credentials are sensitive and should only be stored as environment variables.

## Setup Instructions

### For Local Development

1. Create a `.env` file in the project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Add your Polymarket API credentials to `.env`:
   ```env
   CLOB_API_KEY=019b6695-b755-7a74-86f0-f7c2e2cdc36b
   CLOB_SECRET=yv9W8NoNPRpTcVNnpFv0yp0bs-57DrvLBXCRb1HsR9Q=
   CLOB_PASSPHRASE=89f98d31f135a949e2cb5fb6f8507d228230b8aab9644af3c0127d6617ad9165
   ```

3. The `.env` file is already in `.gitignore` - it will NOT be committed to git.

### For Vercel Deployment

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add these three environment variables:
   - **Name**: `CLOB_API_KEY`
     **Value**: `019b6695-b755-7a74-86f0-f7c2e2cdc36b`
   
   - **Name**: `CLOB_SECRET`
     **Value**: `yv9W8NoNPRpTcVNnpFv0yp0bs-57DrvLBXCRb1HsR9Q=`
   
   - **Name**: `CLOB_PASSPHRASE`
     **Value**: `89f98d31f135a949e2cb5fb6f8507d228230b8aab9644af3c0127d6617ad9165`

3. Make sure to select **all environments** (Production, Preview, Development)

4. Click **Save**

5. **Redeploy** your project for the changes to take effect

## Security Best Practices

- ✅ Store credentials in environment variables only
- ✅ Use `.env` files for local development (already in `.gitignore`)
- ✅ Add credentials to Vercel environment variables for deployment
- ❌ Never commit `.env` files to git
- ❌ Never hardcode credentials in source code
- ❌ Never share credentials in screenshots or messages (too late for this one, but rotate if needed)

## Rotating Keys

If these keys are ever exposed or compromised:
1. Go to https://polymarket.com/settings/api
2. Revoke the old keys
3. Generate new keys
4. Update the environment variables in Vercel and local `.env`
