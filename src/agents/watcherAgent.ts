import { getLogger } from '../utils/logger.js';
import { GammaApi } from '../clients/gammaApi.js';
import { getDb } from '../db/db.js';

const logger = getLogger('watcherAgent');

/**
 * WatcherAgent - Monitors markets and events for changes
 * Continuously watches for new markets, updated market data, and event changes
 */
export class WatcherAgent {
  private gammaApi: GammaApi;
  private db: ReturnType<typeof getDb>;
  private intervalMs: number;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(intervalMs = 60000) {
    this.gammaApi = new GammaApi();
    this.db = getDb();
    this.intervalMs = intervalMs;
  }

  /**
   * Start watching for market updates
   */
  start(): void {
    logger.info({ intervalMs: this.intervalMs }, 'Starting watcher agent');
    
    // Initial scan
    this.watch().catch((error) => {
      logger.error({ error }, 'Error in initial watch');
    });

    // Schedule periodic updates
    this.intervalId = setInterval(() => {
      this.watch().catch((error) => {
        logger.error({ error }, 'Error in periodic watch');
      });
    }, this.intervalMs);
  }

  /**
   * Stop watching
   */
  stop(): void {
    logger.info('Stopping watcher agent');
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Perform a single watch cycle
   */
  async watch(): Promise<void> {
    logger.debug('Starting watch cycle');
    
    try {
      // TODO: Implement market watching logic
      // 1. Fetch recent markets from Gamma API
      // 2. Compare with database
      // 3. Insert/update markets
      // 4. Log changes

      logger.debug('Watch cycle completed');
    } catch (error) {
      logger.error({ error }, 'Error during watch cycle');
      throw error;
    }
  }

  /**
   * Watch a specific market
   */
  async watchMarket(slug: string): Promise<void> {
    logger.debug({ slug }, 'Watching specific market');
    
    try {
      // TODO: Implement single market watch
      const market = await this.gammaApi.getMarket(slug);
      if (market) {
        // Update database
        logger.info({ slug }, 'Market updated');
      }
    } catch (error) {
      logger.error({ error, slug }, 'Error watching market');
      throw error;
    }
  }
}
