import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, closeDb } from '../src/db/db.js';
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
    const db = getDb();
    const { limit = '100', offset = '0', active, closed } = request.query;

    let query = 'SELECT * FROM markets_cache';
    const conditions: string[] = [];
    const params: any[] = [];

    if (active === 'true') {
      conditions.push('isActive = ?');
      params.push(1);
    } else if (active === 'false') {
      conditions.push('isActive = ?');
      params.push(0);
    }

    if (closed === 'true') {
      conditions.push('isClosed = ?');
      params.push(1);
    } else if (closed === 'false') {
      conditions.push('isClosed = ?');
      params.push(0);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY updatedAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const markets = db.prepare(query).all(...params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM markets_cache';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = db.prepare(countQuery).get(...params.slice(0, -2)) as { total: number };

    closeDb();

    return response.status(200).json({
      success: true,
      markets,
      total: countResult.total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Error fetching markets');
    closeDb();
    return response.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
