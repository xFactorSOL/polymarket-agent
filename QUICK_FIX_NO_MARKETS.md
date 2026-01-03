# Quick Fix: No Markets Showing

## Problem
The database table was created with unquoted column names, but queries use quoted names. This causes a mismatch.

## Solution: Recreate the Table

**Option 1: Drop and Recreate (Easiest)**

1. Go to **Neon Dashboard** → Your Project → **SQL Editor**
2. Run this to drop the table:
   ```sql
   DROP TABLE IF EXISTS markets_cache CASCADE;
   ```
3. Then copy/paste the entire `src/db/schema.pg.sql` file and run it
4. This recreates all tables with correct column names

**Option 2: Rename Columns (If you want to keep data)**

```sql
ALTER TABLE markets_cache RENAME COLUMN "marketId" TO marketId;
ALTER TABLE markets_cache RENAME COLUMN "endDate" TO endDate;
ALTER TABLE markets_cache RENAME COLUMN "isActive" TO isActive;
ALTER TABLE markets_cache RENAME COLUMN "isClosed" TO isClosed;
ALTER TABLE markets_cache RENAME COLUMN "yesTokenId" TO yesTokenId;
ALTER TABLE markets_cache RENAME COLUMN "noTokenId" TO noTokenId;
ALTER TABLE markets_cache RENAME COLUMN "conditionId" TO conditionId;
ALTER TABLE markets_cache RENAME COLUMN "eventId" TO eventId;
ALTER TABLE markets_cache RENAME COLUMN "rawJson" TO rawJson;
ALTER TABLE markets_cache RENAME COLUMN "updatedAt" TO updatedAt;
ALTER TABLE markets_cache RENAME COLUMN "createdAt" TO createdAt;
```

**Then run the schema again** to add the proper quoted column names.

## Verify It Worked

1. In Neon SQL Editor, run:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'markets_cache';
   ```
   
   You should see columns with quoted names like `"marketId"`, `"endDate"`, etc.

2. Try ingestion again from your dashboard

3. Check markets: `https://your-app.vercel.app/api/markets`

## Still Not Working?

1. **Check environment variables are set in Vercel**
   - Settings → Environment Variables
   - `POSTGRES_URL` should be your Neon connection string
   - Redeploy after adding/changing

2. **Check database connection**
   - Visit: `https://your-app.vercel.app/api/health`
   - Should show: `{"status":"healthy","database":"PostgreSQL"}`

3. **Check ingestion is working**
   - Go to `/ingest` page
   - Click "Start Ingestion"
   - Check browser console for errors
   - Should show `stored: X` where X > 0
