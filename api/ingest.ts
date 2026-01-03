import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MarketService } from '../src/services/marketService.js';
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

  // Set timeout for long-running operations
  const timeout = setTimeout(() => {
    logger.warn('Ingestion request timeout');
  }, 25000); // 25 seconds (Vercel functions have 30s default, but we want to finish before)

  try {
    const { markets, events, limit, offset, sinceDays, active, closed } = request.body || {};
    const results: any = {};

    // New Gamma API ingestion using MarketService
    if (sinceDays !== undefined || markets || (!markets && !events)) {
      logger.info({ sinceDays, limit, active, closed }, 'Ingesting markets via MarketService');
      
      const marketService = new MarketService();
      const sinceDaysNum = sinceDays ? Number(sinceDays) : 30;
      
      // Limit to reasonable values to avoid timeouts
      const ingestLimit = limit ? Math.min(Number(limit), 100) : 100;
      
      const ingestResult = await marketService.refreshMarkets({
        sinceDays: sinceDaysNum,
        limit: ingestLimit,
        active: active !== undefined ? Boolean(active) : undefined,
        closed: closed !== undefined ? Boolean(closed) : undefined,
      });

      results.markets = {
        fetched: ingestResult.fetched,
        stored: ingestResult.stored,
        errors: ingestResult.errors,
        totalCached: marketService.getCachedMarketsCount(),
      };
    }

    // Legacy event ingestion
    if (events && !sinceDays) {
      logger.info({ limit, offset }, 'Ingesting events');
      const gammaApi = new GammaApi();
      const eventResults = await gammaApi.searchEvents({
        limit: Number(limit),
        offset: Number(offset),
      });
      results.events = eventResults;
    }

    clearTimeout(timeout);
    closeDb();

    return response.status(200).json({
      success: true,
      results,
    });
  } catch (error: any) {
    clearTimeout(timeout);
    logger.error({ error: error.message }, 'Error during ingest');
    closeDb();
    return response.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
