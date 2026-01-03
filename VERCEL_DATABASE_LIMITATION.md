# ⚠️ CRITICAL: SQLite Limitation on Vercel

## The Problem

**SQLite databases don't persist on Vercel serverless functions!**

Each serverless function invocation gets a fresh `/tmp` directory. This means:

1. When you run ingestion → markets are stored in `/tmp/polymarket.db`
2. When the function finishes → the database is **deleted**
3. When you view markets → new function invocation → **empty database**

## Why This Happens

Vercel serverless functions are **stateless**:
- Each request = new container
- `/tmp` is ephemeral (cleared after function execution)
- No persistent file system

## Solutions

### Option 1: Use Vercel Postgres (Recommended for Production)

1. Go to Vercel Dashboard → Your Project → Storage → Create Database
2. Select "Postgres"
3. Update code to use Postgres instead of SQLite

**Pros:**
- Persistent storage
- Shared across all function invocations
- Production-ready

**Cons:**
- Requires code changes (different SQL syntax)
- Additional cost (free tier available)

### Option 2: Use External Database Service

- **Supabase** (free tier, Postgres)
- **PlanetScale** (free tier, MySQL)
- **Neon** (free tier, Postgres)

### Option 3: Use Vercel KV (Redis) for Caching

- Fast key-value storage
- Good for caching markets temporarily
- Still ephemeral but shared across functions

### Option 4: Accept the Limitation (Development Only)

For development/testing, you can:
- Run ingestion and viewing in the same function invocation
- Or use SQLite locally only

## Current Status

The ingestion **is working** - it's storing 250 markets successfully. But because each API call is a separate serverless function invocation, the database doesn't persist between:
- Ingestion function → Markets viewing function

## Recommendation

For a production dashboard, **migrate to Vercel Postgres** or another persistent database. SQLite is not suitable for serverless architectures.
