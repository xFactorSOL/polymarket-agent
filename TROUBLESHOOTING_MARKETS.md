# Troubleshooting: No Markets Showing

If markets aren't showing up, check these steps:

## Step 1: Verify Database Connection

1. Go to your deployed Vercel app
2. Visit: `https://your-app.vercel.app/api/health`
3. Should return: `{"status":"healthy","database":"PostgreSQL"}`

If you see an error, the database connection isn't working.

## Step 2: Check Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Verify `POSTGRES_URL` is set (should be your Neon connection string)
3. Make sure it's set for **Production**, **Preview**, and **Development**
4. **Redeploy** after adding/changing environment variables

## Step 3: Initialize Database Schema

**THIS IS CRITICAL** - The tables must exist before ingestion works!

1. Go to **Neon Dashboard** → Your Project → **SQL Editor**
2. Copy the entire contents of `src/db/schema.pg.sql`
3. Paste into the SQL Editor
4. Click **Run** or **Execute**
5. You should see "Success" - tables created

## Step 4: Test Ingestion

1. Go to your dashboard: `https://your-app.vercel.app/ingest`
2. Click **"Start Ingestion"**
3. Check the response - should show `fetched` and `stored` counts
4. If `stored: 0`, check the browser console for errors

## Step 5: Check Markets API

1. Visit: `https://your-app.vercel.app/api/markets`
2. Should return JSON with markets array
3. If empty array `[]`, the schema wasn't created or ingestion failed

## Step 6: Check Database Directly

1. Go to **Neon Dashboard** → **SQL Editor**
2. Run: `SELECT COUNT(*) FROM markets_cache;`
3. Should return a number > 0 if ingestion worked

## Common Issues

**"Table does not exist" error:**
- Schema wasn't created - run `schema.pg.sql` in Neon SQL Editor

**"Connection refused" or SSL errors:**
- Check `POSTGRES_URL` is correct in Vercel
- Make sure connection string includes `?sslmode=require`

**Ingestion shows "stored: 0":**
- Check browser console for errors
- Verify Gamma API is accessible (no rate limiting)
- Check database connection is working (Step 1)

**Markets API returns empty array:**
- Tables exist but no data - run ingestion again
- Check that `markets_cache` table was created (Step 6)
