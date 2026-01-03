# Vercel Deployment Guide

## Important Notes

⚠️ **Better-sqlite3 Limitation**: The `better-sqlite3` package uses native bindings and may have issues on Vercel's serverless functions. For production use, consider:
- Using Vercel Postgres (recommended)
- Using another cloud database (Supabase, PlanetScale, etc.)
- Using a REST API approach instead of direct database access

## Deployment Steps

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI**:
   ```bash
   vercel
   ```

3. **Or deploy via GitHub Integration**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select `xFactorSOL/polymarket-agent`
   - Configure environment variables (see below)
   - Click "Deploy"

## Environment Variables

Set these in Vercel dashboard under Project Settings → Environment Variables:

- `DATABASE_PATH` (optional): `/tmp/polymarket.db` (default, ephemeral)
- `GAMMA_API_BASE_URL` (optional): `https://gamma-api.polymarket.com` (default)
- `CLOB_API_BASE_URL` (optional): `https://clob.polymarket.com` (default)
- `LOG_LEVEL` (optional): `info` (default)
- `LOG_PRETTY` (optional): `false` (default)

## Testing Deployment

After deployment, test the endpoints:

```bash
# Health check
curl https://your-project.vercel.app/api/health

# API info
curl https://your-project.vercel.app/api

# Test ingest (POST)
curl -X POST https://your-project.vercel.app/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"markets": true, "limit": 10}'
```

## Troubleshooting

### Build Errors

If you see build errors related to `better-sqlite3`:
- This is expected - SQLite doesn't work well in serverless environments
- Consider migrating to Vercel Postgres or another database
- For now, the API routes will fail when trying to access the database

### Function Timeout

If functions timeout:
- Increase `maxDuration` in `vercel.json` (max 60s for Hobby, 300s for Pro)
- Optimize database queries
- Consider using edge functions for simpler operations
