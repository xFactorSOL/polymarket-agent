# Neon Postgres Setup Guide

You've provided Neon Postgres connection strings. Here's how to set them up:

## Step 1: Add Environment Variables to Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add these variables (copy from your Neon dashboard):

```
POSTGRES_URL=postgresql://neondb_owner:npg_D8zeVupsol7W@ep-silent-heart-abpybvjp-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
POSTGRES_PRISMA_URL=postgresql://neondb_owner:npg_D8zeVupsol7W@ep-silent-heart-abpybvjp-pooler.eu-west-2.aws.neon.tech/neondb?connect_timeout=15&sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://neondb_owner:npg_D8zeVupsol7W@ep-silent-heart-abpybvjp.eu-west-2.aws.neon.tech/neondb?sslmode=require
DATABASE_URL=postgresql://neondb_owner:npg_D8zeVupsol7W@ep-silent-heart-abpybvjp-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

3. Select environments: **Production**, **Preview**, **Development**
4. Click **Save**

## Step 2: Initialize Database Schema

1. Go to **Neon Dashboard** → Your Project → **SQL Editor**
2. Copy the contents of `src/db/schema.pg.sql`
3. Paste and execute the SQL to create all tables

OR use the Neon CLI:

```bash
# Install Neon CLI (if needed)
npm install -g neonctl

# Connect and run schema
neonctl connection-string --project-id YOUR_PROJECT_ID
# Then run schema.pg.sql using psql or your SQL client
```

## Step 3: Redeploy

1. Go to **Vercel Dashboard** → **Deployments**
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

Or push a new commit to trigger automatic deployment.

## That's It!

After setup, your database will:
- ✅ Persist data across function invocations
- ✅ Work with all API endpoints
- ✅ Store markets, orders, positions, etc.
- ✅ Actually work on Vercel! 🎉

## Testing

1. **Run ingestion**: Dashboard → Ingest Markets → Click "Start Ingestion"
2. **View markets**: Dashboard → Markets tab
3. **Data persists!** Refresh the page, data is still there! 🎉

## Troubleshooting

**"Database connection failed"**:
- Verify `POSTGRES_URL` is set in Vercel environment variables
- Check that the connection string is correct (no extra spaces)
- Redeploy after adding environment variables

**"Table does not exist"**:
- Run the schema.sql file in the Neon SQL Editor
- Or tables will be created on first use (slower)

**SSL errors**:
- Neon requires SSL, which is included in the connection string (`sslmode=require`)
- The code is configured to use SSL automatically
