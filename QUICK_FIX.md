# 🚨 QUICK FIX - Do This RIGHT NOW

The build command is set in your Vercel dashboard. You MUST remove it manually.

## Step-by-Step (Takes 30 seconds):

1. **Open Vercel Dashboard**: https://vercel.com/dashboard
2. **Click on your project**: `polymarket-agent1` (or whatever it's named)
3. **Click "Settings"** (top menu bar)
4. **Click "General"** (left sidebar, should be selected by default)
5. **Scroll down to "Build & Development Settings"**
6. **Find "Build Command" field** - DELETE EVERYTHING IN IT (make it completely empty)
7. **Find "Output Directory" field** - DELETE EVERYTHING IN IT (make it completely empty)  
8. **Click the "Save" button** (bottom of the page)
9. **Go to "Deployments" tab** (top menu)
10. **Find the latest failed deployment**
11. **Click the "..." menu (3 dots)** on the right
12. **Click "Redeploy"**

## That's It!

After step 12, wait 1-2 minutes and it should deploy successfully.

## Why This Happens:

- Vercel sees you have a `package.json` with a `build` script
- It auto-sets "Build Command" to `npm run build`
- When a build command exists, Vercel expects an output directory
- API routes don't NEED a build command (Vercel compiles TypeScript automatically)
- So you must DELETE the build command manually

## Screenshot Locations:

- Settings: Top menu bar → "Settings"
- Build Settings: Settings page → Scroll down → "Build & Development Settings"
- Build Command: First field in that section
- Output Directory: Second field in that section
