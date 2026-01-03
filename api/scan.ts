import type { VercelRequest, VercelResponse } from '@vercel/node';
import { EvFilterAgent } from '../src/agents/evFilterAgent.js';
import { execute, closeDb } from '../src/db/db.js';
import { getLogger } from '../src/utils/logger.js';

const logger = getLogger('api-scan');

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      liquidity = 1000,
      volume = 5000,
      maxProb = 0.95,
      minProb = 0.05,
    } = request.body || {};

    const evFilterAgent = new EvFilterAgent();

    const criteria = {
      minLiquidity: Number(liquidity),
      minVolume: Number(volume),
      maxProbability: Number(maxProb),
      minProbability: Number(minProb),
    };

    logger.info({ criteria }, 'Scanning markets');
    const markets = await evFilterAgent.filterMarkets(criteria);

    // Store scan results (Postgres)
    await execute(`
      INSERT INTO scans (scan_type, markets_scanned, markets_filtered, results, completed_at)
      VALUES ($1, $2, $3, $4, NOW())
    `, [
      'ev_filter',
      0,
      markets.length,
      JSON.stringify(markets),
    ]);

    await closeDb();

    return response.status(200).json({
      success: true,
      count: markets.length,
      markets,
    });
  } catch (error: any) {
    logger.error({ error }, 'Error during scan');
    await closeDb();
    return response.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
