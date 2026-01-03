# Vercel Postgres Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Postgres Database in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Storage** tab
2. Click **"Create Database"**
3. Select **"Postgres"**
4. Choose a name (e.g., `polymarket-db`)
5. Select a region (closest to you)
6. Click **"Create"**

Vercel will automatically set the `POSTGRES_URL` environment variable.

### Step 2: Initialize Database Schema

1. Go to **Vercel Dashboard** → Your Project → **Storage** → Your Postgres Database
2. Click **"Data"** tab (or "SQL Editor")
3. Copy the contents of `src/db/schema.pg.sql`
4. Paste and execute the SQL to create all tables

**OR** use the Vercel CLI:

```bash
vercel env pull .env.local
# Then connect to your database and run schema.pg.sql
```

### Step 3: Verify Environment Variables

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

You should see:
- `POSTGRES_URL` (automatically set by Vercel)
- `POSTGRES_PRISMA_URL` (automatically set)
- `POSTGRES_URL_NON_POOLING` (automatically set)

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

Or push a new commit to trigger automatic deployment.

## That's It!

After setup, your database will:
- ✅ Persist data across function invocations
- ✅ Work with all API endpoints
- ✅ Store markets, orders, positions, etc.

## Testing

1. Run ingestion: Dashboard → Ingest Markets
2. View markets: Dashboard → Markets tab
3. Data will persist! 🎉
