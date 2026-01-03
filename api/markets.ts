import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne, closeDb } from '../src/db/db.js';
import { getLogger } from '../src/utils/logger.js';

const logger = getLogger('api-markets');

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = '100', offset = '0', active, closed } = request.query;

    let queryText = 'SELECT * FROM markets_cache';
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (active === 'true') {
      conditions.push(`"isActive" = $${paramIndex++}`);
      params.push(1);
    } else if (active === 'false') {
      conditions.push(`"isActive" = $${paramIndex++}`);
      params.push(0);
    }

    if (closed === 'true') {
      conditions.push(`"isClosed" = $${paramIndex++}`);
      params.push(1);
    } else if (closed === 'false') {
      conditions.push(`"isClosed" = $${paramIndex++}`);
      params.push(0);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ` ORDER BY "updatedAt" DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const markets = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM markets_cache';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await queryOne(countQuery, params.slice(0, -2)) as { total: string | number } | null;

    await closeDb();

    return response.status(200).json({
      success: true,
      markets,
      total: countResult ? Number(countResult.total) : 0,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Error fetching markets');
    await closeDb();
    return response.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
