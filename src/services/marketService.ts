import { getDb } from '../db/db.js';
import { GammaApi, GammaMarket } from '../clients/gammaApi.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('marketService');

export interface RefreshMarketsOptions {
  sinceDays: number;
  limit?: number;
  active?: boolean;
  closed?: boolean;
}

export interface MarketCacheRecord {
  marketId: string;
  question: string;
  slug: string;
  endDate: string | null;
  isActive: number;
  isClosed: number;
  yesTokenId: string | null;
  noTokenId: string | null;
  conditionId: string | null;
  eventId: string | null;
  rawJson: string;
  updatedAt: number;
  createdAt: number;
}

/**
 * Service for managing market data ingestion from Gamma API
 */
export class MarketService {
  private gammaApi: GammaApi;
  private db: ReturnType<typeof getDb>;

  constructor() {
    this.gammaApi = new GammaApi();
    this.db = getDb();
  }

  /**
   * Extract token IDs and condition ID from market data
   */
  private extractTokenIds(market: GammaMarket): {
    yesTokenId?: string;
    noTokenId?: string;
    conditionId?: string;
  } {
    // Gamma API structure may vary, try common patterns
    const tokens = (market as any).tokens || (market as any).outcomes;
    const yesTokenId = market.yesTokenId || tokens?.[0]?.tokenId || tokens?.[0]?.id;
    const noTokenId = market.noTokenId || tokens?.[1]?.tokenId || tokens?.[1]?.id;
    const conditionId = market.conditionId || (market as any).conditionId || market.id;

    return {
      yesTokenId,
      noTokenId,
      conditionId,
    };
  }

  /**
   * Store a market in the cache
   */
  private storeMarket(market: GammaMarket): void {
    const { yesTokenId, noTokenId, conditionId } = this.extractTokenIds(market);
    
    const record = {
      marketId: market.id,
      question: market.question,
      slug: market.slug,
      endDate: market.endDateISO || null,
      isActive: market.active !== false ? 1 : 0,
      isClosed: (market as any).closed === true ? 1 : 0,
      yesTokenId: yesTokenId || null,
      noTokenId: noTokenId || null,
      conditionId: conditionId || null,
      eventId: market.eventId || null,
      rawJson: JSON.stringify(market),
      updatedAt: Math.floor(Date.now() / 1000),
    };

    const stmt = this.db.prepare(`
      INSERT INTO markets_cache (
        marketId, question, slug, endDate, isActive, isClosed,
        yesTokenId, noTokenId, conditionId, eventId, rawJson, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(marketId) DO UPDATE SET
        question = excluded.question,
        slug = excluded.slug,
        endDate = excluded.endDate,
        isActive = excluded.isActive,
        isClosed = excluded.isClosed,
        yesTokenId = excluded.yesTokenId,
        noTokenId = excluded.noTokenId,
        conditionId = excluded.conditionId,
        eventId = excluded.eventId,
        rawJson = excluded.rawJson,
        updatedAt = excluded.updatedAt
    `);

    stmt.run(
      record.marketId,
      record.question,
      record.slug,
      record.endDate,
      record.isActive,
      record.isClosed,
      record.yesTokenId,
      record.noTokenId,
      record.conditionId,
      record.eventId,
      record.rawJson,
      record.updatedAt
    );
  }

  /**
   * Refresh markets from Gamma API
   */
  async refreshMarkets(options: RefreshMarketsOptions): Promise<{
    fetched: number;
    stored: number;
    errors: number;
  }> {
    const { sinceDays, limit = 100, active, closed } = options;
    logger.info({ sinceDays, limit, active, closed }, 'Starting market refresh');

    // Calculate date range
    const now = new Date();
    const sinceDate = new Date(now);
    sinceDate.setDate(sinceDate.getDate() - sinceDays);
    const endDateMin = sinceDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    let fetched = 0;
    let stored = 0;
    let errors = 0;
    let offset = 0;
    const batchSize = limit || 100;
    let hasMore = true;

    try {
      while (hasMore) {
        logger.debug({ offset, batchSize }, 'Fetching batch of markets');

        const params: any = {
          limit: batchSize,
          offset,
          end_date_min: endDateMin,
        };

        if (active !== undefined) {
          params.active = active;
        }
        if (closed !== undefined) {
          params.closed = closed;
        }

        const markets = await this.gammaApi.getMarkets(params);
        fetched += markets.length;

        if (markets.length === 0) {
          hasMore = false;
          break;
        }

        // Store each market
        for (const market of markets) {
          try {
            this.storeMarket(market);
            stored++;
          } catch (error: any) {
            logger.error({ error: error.message, marketId: market.id }, 'Error storing market');
            errors++;
          }
        }

        // Check if we've fetched all available markets
        if (markets.length < batchSize) {
          hasMore = false;
        } else {
          offset += batchSize;
        }

        // Respect rate limits - small delay between batches
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      logger.info(
        { fetched, stored, errors, sinceDays },
        'Market refresh completed'
      );

      return { fetched, stored, errors };
    } catch (error: any) {
      logger.error({ error: error.message, options }, 'Error during market refresh');
      throw error;
    }
  }

  /**
   * Get cached market by ID
   */
  getCachedMarket(marketId: string): MarketCacheRecord | null {
    const stmt = this.db.prepare('SELECT * FROM markets_cache WHERE marketId = ?');
    const record = stmt.get(marketId) as MarketCacheRecord | undefined;
    return record || null;
  }

  /**
   * Get cached markets count
   */
  getCachedMarketsCount(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM markets_cache');
    const result = stmt.get() as { count: number };
    return result.count;
  }
}
