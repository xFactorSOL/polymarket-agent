import type { VercelRequest, VercelResponse } from '@vercel/node';
import { queryOne, closeDb } from '../src/db/db.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    // Test database connection
    await queryOne('SELECT 1 as test');
    await closeDb();

    return response.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL',
    });
  } catch (error: any) {
    // Return 200 with unhealthy status (don't fail the request)
    const hasPostgres = !!(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING);
    
    let errorMessage = error.message;
    let note = 'Database connection failed';
    
    if (!hasPostgres) {
      errorMessage = 'POSTGRES_URL not configured';
      note = 'Please set up Vercel Postgres in your project settings';
    }
    
    return response.status(200).json({
      status: 'unhealthy',
      error: errorMessage,
      timestamp: new Date().toISOString(),
      note: note,
      hasPostgres: hasPostgres,
    });
  }
}
