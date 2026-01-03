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

    response.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    response.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
