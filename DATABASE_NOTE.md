# Database Configuration for Vercel

## Important Note

SQLite databases on Vercel serverless functions have limitations:

1. **Ephemeral Storage**: The `/tmp` directory is ephemeral - data is lost between invocations
2. **Better-SQLite3 Limitation**: Native bindings may have issues on serverless platforms

## Setting Environment Variable

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Set `DATABASE_PATH=/tmp/polymarket.db`

This ensures the database uses the `/tmp` directory which exists on Vercel's serverless functions.

## Alternative: Use a Cloud Database

For production use, consider:
- **Vercel Postgres** (recommended - native integration)
- **Supabase** (free tier available)
- **PlanetScale** (serverless MySQL)
- **Neon** (serverless Postgres)

## Current Status

The health check endpoint will show "unhealthy" if the database can't be initialized, but this is expected for stub implementations. The API endpoints will still work, they just won't persist data.
