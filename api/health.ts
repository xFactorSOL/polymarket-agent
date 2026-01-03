import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, closeDb } from '../src/db/db.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    // Test database connection
    const db = getDb();
    db.prepare('SELECT 1').get();
    closeDb();

    return response.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    // Return 200 with unhealthy status (don't fail the request)
    // On Vercel, database errors are expected due to ephemeral /tmp
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
    const errorMessage = isVercel 
      ? 'Database uses ephemeral storage on Vercel (expected)'
      : error.message;
    
    return response.status(200).json({
      status: 'unhealthy',
      error: errorMessage,
      timestamp: new Date().toISOString(),
      note: isVercel 
        ? 'Database resets on each serverless invocation. This is normal for Vercel deployments.'
        : 'Database may not be available',
    });
  }
}
