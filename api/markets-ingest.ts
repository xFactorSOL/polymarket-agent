import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MarketService } from '../src/services/marketService.js';
import { getDb, closeDb } from '../src/db/db.js';
import { getLogger } from '../src/utils/logger.js';

const logger = getLogger('api-markets-ingest');

/**
 * Combined endpoint: Ingest markets and return them immediately
 * This works around Vercel's ephemeral /tmp limitation by doing
 * both operations in the same function invocation
 */
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sinceDays = '30', limit = '50', active, closed } = request.method === 'POST' ? request.body : request.query;
    
    // Ingest markets first (stores in /tmp)
    const marketService = new MarketService();
    const ingestResult = await marketService.refreshMarkets({
      sinceDays: Number(sinceDays),
      limit: Number(limit),
      active: active !== undefined ? (active === 'true' || active === true) : undefined,
      closed: closed !== undefined ? (closed === 'true' || closed === true) : undefined,
    });

    // Immediately fetch the markets (Postgres persists across invocations)
    const { query, queryOne } = await import('../src/db/db.js');
    const markets = await query(`
      SELECT * FROM markets_cache 
      ORDER BY "updatedAt" DESC 
      LIMIT $1 OFFSET 0
    `, [parseInt(limit as string)]);

    const countResult = await queryOne('SELECT COUNT(*) as total FROM markets_cache') as { total: string | number } | null;

    await closeDb();

    return response.status(200).json({
      success: true,
      ingestion: {
        fetched: ingestResult.fetched,
        stored: ingestResult.stored,
        errors: ingestResult.errors,
      },
      markets,
      total: countResult ? Number(countResult.total) : 0,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Error in markets-ingest');
    closeDb();
    return response.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
