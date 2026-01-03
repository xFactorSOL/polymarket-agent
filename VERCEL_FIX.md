# Vercel Deployment Guide

## ✅ Current Status

Vercel is now correctly detecting this as a Node.js/TypeScript project! 

The TypeScript configuration has been fixed to exclude the `api/` folder from the main build (since Vercel compiles API routes separately).

## Recommended Settings

For API routes on Vercel, you have two options:

### Option 1: No Build Command (Recommended for API Routes)

1. **Go to Vercel Dashboard** → Your Project → Settings → General
2. **Build & Development Settings**:
   - **Framework Preset**: "Other"
   - **Build Command**: **LEAVE EMPTY** (Vercel compiles TypeScript automatically)
   - **Output Directory**: **LEAVE EMPTY**
   - **Install Command**: `npm install`

3. **Save and Redeploy**

### Option 2: Keep Build Command (for CLI)

If you want to build the CLI (`src/` folder), keep:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

**Note**: The `api/` folder is excluded from the TypeScript build since Vercel compiles it separately for serverless functions.

### Alternative: Delete and Re-import

1. Delete the project in Vercel
2. Create new project
3. Import `xFactorSOL/polymarket-agent`
4. **IMPORTANT**: When configuring, manually set:
   - Framework: **"Other"**
   - Build Command: **LEAVE EMPTY**
   - Output Directory: **LEAVE EMPTY**
5. Deploy

### Why This Happens

Vercel's auto-detection is incorrectly identifying this as Python. By explicitly setting Framework to "Other" and leaving Build Command empty, Vercel will:
1. Detect `package.json` exists → knows it's Node.js
2. See `api/` folder with `.ts` files → knows these are serverless functions
3. Compile TypeScript automatically (no build command needed for API routes)

### Verify It's Working

After deployment, you should see:
- No Python/FastAPI errors
- API endpoints available at `/api/*`
- Build logs show Node.js/npm commands, not Python
