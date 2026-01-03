# Vercel Deployment Guide

## ✅ Current Status

The TypeScript build is now working! However, Vercel is complaining about a missing output directory.

## 🚨 IMPORTANT: Remove Build Command for API Routes

For API-only projects (serverless functions), you should **NOT have a build command** in Vercel settings. Vercel compiles TypeScript in the `api/` folder automatically.

### Fix Steps (Do This Now):

1. **Go to Vercel Dashboard** → Your Project (`polymarket-agent1`)
2. Click **"Settings"** (top navigation)
3. Go to **"General"** tab
4. Scroll down to **"Build & Development Settings"**
5. **Clear/Delete these fields**:
   - **Build Command**: DELETE THIS (leave completely empty)
   - **Output Directory**: DELETE THIS (leave completely empty)
6. Click **"Save"**
7. Go to **"Deployments"** tab
8. Click the **"..."** menu on the latest deployment → **"Redeploy"**

### Why This Works:

- **API Routes**: Vercel automatically compiles TypeScript files in `api/` folder as serverless functions
- **No Build Needed**: You don't need to run `npm run build` for API routes
- **No Output Directory**: API functions don't produce static files, so no output directory is needed

### If You Need the CLI Build (Optional):

If you want to build the CLI (`src/` folder) for some reason:
- Keep Build Command: `npm run build`
- Set Output Directory: `dist`

But for API-only deployment, **leave both empty**.

## Testing After Deployment

Once deployed successfully, test your API:

```bash
# Health check
curl https://your-project.vercel.app/api/health

# API info
curl https://your-project.vercel.app/api
```

## Troubleshooting

- **"No Output Directory" error**: You have a Build Command set → Remove it
- **"Missing public directory"**: You have Output Directory set → Remove it  
- **TypeScript errors**: Should be fixed now with updated tsconfig.json
