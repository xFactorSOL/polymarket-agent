# Troubleshooting 404 Errors

## If you're getting a 404 error:

### 1. Check the URL you're accessing

Make sure you're using the correct API endpoint URLs:

- ✅ **CORRECT**: `https://your-project.vercel.app/api/health`
- ✅ **CORRECT**: `https://your-project.vercel.app/api`
- ✅ **CORRECT**: `https://your-project.vercel.app/api/ingest`
- ❌ **WRONG**: `https://your-project.vercel.app/` (root URL - no route here)
- ❌ **WRONG**: `https://your-project.vercel.app/health` (missing `/api` prefix)

### 2. Verify deployment completed successfully

1. Go to Vercel Dashboard → Your Project → Deployments
2. Check that the latest deployment shows ✅ "Ready" (green)
3. If it shows errors, check the build logs

### 3. Test the endpoints

Try these in order:

```bash
# 1. Health check (simplest endpoint)
curl https://your-project.vercel.app/api/health

# 2. API info
curl https://your-project.vercel.app/api

# 3. Report endpoint (GET request)
curl https://your-project.vercel.app/api/report
```

### 4. Common issues

**Issue**: Getting 404 on `/api/health`
- **Solution**: Make sure the deployment completed successfully with the latest code

**Issue**: Getting 404 on root `/`
- **Solution**: This is expected - there's no route at root. Use `/api/*` endpoints

**Issue**: Deployment shows errors
- **Solution**: Check build logs in Vercel dashboard for TypeScript or build errors

### 5. Verify API routes structure

Your `api/` folder should have:
- `api/index.ts` → Available at `/api`
- `api/health.ts` → Available at `/api/health`
- `api/ingest.ts` → Available at `/api/ingest`
- `api/scan.ts` → Available at `/api/scan`
- `api/report.ts` → Available at `/api/report`

### 6. Still not working?

1. Check Vercel deployment logs
2. Verify the deployment URL is correct
3. Make sure you're using HTTPS (not HTTP)
4. Try accessing `/api/health` first (simplest endpoint)
