# Dashboard 404 Fix

## Issue
Getting 404 when accessing the dashboard on Vercel.

## Solution

### Option 1: Update Vercel Project Settings (Recommended)

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **General**
2. Scroll to **"Build & Development Settings"**
3. **IMPORTANT**: Make sure these are set:
   - **Framework Preset**: `Next.js` (NOT "Other")
   - **Build Command**: `next build` (or leave empty - Vercel auto-detects)
   - **Output Directory**: `.next` (or leave empty - Vercel auto-detects)
   - **Install Command**: `npm install` (or `pnpm install`)

4. **Save** and **Redeploy**

### Option 2: Delete and Re-import Project

If Option 1 doesn't work:

1. Delete the project in Vercel
2. Create new project
3. Import `xFactorSOL/polymarket-agent`
4. **When configuring**:
   - Framework: Select **"Next.js"** (Vercel should auto-detect it)
   - Build Command: Leave empty (auto-detects)
   - Output Directory: Leave empty (auto-detects)
5. Deploy

### Why This Happens

- Vercel needs to know this is a Next.js project
- If Framework is set to "Other", Vercel won't serve the Next.js pages
- The `pages/` directory and `next.config.mjs` tell Vercel it's Next.js, but the Framework setting must match

### Verify It's Working

After redeploy, you should be able to access:
- `https://your-project.vercel.app/` - Dashboard home
- `https://your-project.vercel.app/ingest` - Ingest page
- `https://your-project.vercel.app/markets` - Markets page
- `https://your-project.vercel.app/scan` - Scan page
- `https://your-project.vercel.app/report` - Report page

### API Routes Still Work

Your API routes in `/api/*` will continue to work regardless of the Framework setting.
