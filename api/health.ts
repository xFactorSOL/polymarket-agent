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
    return response.status(200).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      note: 'Database may not be available in serverless environment',
    });
  }
}
