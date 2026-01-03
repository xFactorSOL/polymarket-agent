import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GammaApi } from '../src/clients/gammaApi.js';
import { getDb, closeDb } from '../src/db/db.js';
import { getLogger } from '../src/utils/logger.js';

const logger = getLogger('api-ingest');

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Only allow POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { markets, events, limit = 100, offset = 0 } = request.body || {};
    const gammaApi = new GammaApi();
    const db = getDb();

    const results: any = {};

    if (markets || (!markets && !events)) {
      logger.info({ limit, offset }, 'Ingesting markets');
      const marketResults = await gammaApi.searchMarkets({
        limit: Number(limit),
        offset: Number(offset),
      });
      results.markets = marketResults;
    }

    if (events) {
      logger.info({ limit, offset }, 'Ingesting events');
      const eventResults = await gammaApi.searchEvents({
        limit: Number(limit),
        offset: Number(offset),
      });
      results.events = eventResults;
    }

    closeDb();

    return response.status(200).json({
      success: true,
      results,
    });
  } catch (error: any) {
    logger.error({ error }, 'Error during ingest');
    closeDb();
    return response.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
