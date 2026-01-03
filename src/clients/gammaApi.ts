import { getConfig } from '../config/index.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('gammaApi');
const config = getConfig();

export interface GammaMarket {
  id: string;
  slug: string;
  question: string;
  description?: string;
  endDateISO?: string;
  image?: string;
  icon?: string;
  active?: boolean;
  liquidity?: string;
  volume?: string;
  conditionId?: string;
  eventId?: string;
  yesTokenId?: string;
  noTokenId?: string;
  [key: string]: any; // For raw JSON storage
}

export interface GammaMarketsResponse {
  results?: GammaMarket[];
  data?: GammaMarket[];
  markets?: GammaMarket[];
  total?: number;
  limit?: number;
  offset?: number;
}

export interface GammaSearchMarketsParams {
  limit?: number;
  offset?: number;
  active?: boolean;
  closed?: boolean;
  archived?: boolean;
  start_date_min?: string;
  start_date_max?: string;
  end_date_min?: string;
  end_date_max?: string;
  sort?: string;
}

export interface GammaEvent {
  id: string;
  slug: string;
  title: string;
  description?: string;
  image?: string;
  icon?: string;
  active?: boolean;
  markets?: GammaMarket[];
}

export interface GammaSearchEventsParams {
  limit?: number;
  offset?: number;
  closed?: boolean;
  tagId?: number;
  featured?: boolean;
  order?: string;
  ascending?: boolean;
}

/**
 * Retry helper with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const status = error.response?.status || error.status;
      
      // Don't retry on 4xx errors (except 429)
      if (status >= 400 && status < 500 && status !== 429) {
        throw error;
      }
      
      // Retry on 429 (rate limit) and 5xx errors
      if (attempt < maxRetries && (status === 429 || status >= 500)) {
        const delay = baseDelay * Math.pow(2, attempt);
        const retryAfter = error.response?.headers?.['retry-after'] 
          ? parseInt(error.response.headers['retry-after']) * 1000 
          : delay;
        
        logger.warn({ 
          attempt: attempt + 1, 
          maxRetries, 
          status, 
          delay: retryAfter 
        }, 'Retrying after error');
        
        await new Promise(resolve => setTimeout(resolve, retryAfter));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError!;
}

export class GammaApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.GAMMA_API_BASE_URL;
  }

  /**
   * Get markets with pagination and filters
   */
  async getMarkets(params: GammaSearchMarketsParams = {}): Promise<GammaMarket[]> {
    logger.debug({ params }, 'Fetching markets from Gamma API');
    
    try {
      const url = new URL('/markets', this.baseUrl);
      
      // Add query parameters
      if (params.limit !== undefined) {
        url.searchParams.append('limit', String(params.limit));
      }
      if (params.offset !== undefined) {
        url.searchParams.append('offset', String(params.offset));
      }
      if (params.active !== undefined) {
        url.searchParams.append('active', String(params.active));
      }
      if (params.closed !== undefined) {
        url.searchParams.append('closed', String(params.closed));
      }
      if (params.archived !== undefined) {
        url.searchParams.append('archived', String(params.archived));
      }
      if (params.start_date_min) {
        url.searchParams.append('start_date_min', params.start_date_min);
      }
      if (params.start_date_max) {
        url.searchParams.append('start_date_max', params.start_date_max);
      }
      if (params.end_date_min) {
        url.searchParams.append('end_date_min', params.end_date_min);
      }
      if (params.end_date_max) {
        url.searchParams.append('end_date_max', params.end_date_max);
      }
      if (params.sort) {
        url.searchParams.append('sort', params.sort);
      }

      const response = await retryWithBackoff(async () => {
        const res = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'polymarket-agent/1.0.0',
          },
        });

        if (!res.ok) {
          const error: any = new Error(`HTTP ${res.status}: ${res.statusText}`);
          error.status = res.status;
          error.response = {
            status: res.status,
            headers: Object.fromEntries(res.headers.entries()),
          };
          throw error;
        }

        return res;
      });

      const data: GammaMarketsResponse = await response.json();
      
      // Handle different response formats
      const markets = data.results || data.data || data.markets || [];
      
      logger.info({ count: markets.length, params }, 'Fetched markets from Gamma API');
      return markets;
    } catch (error: any) {
      logger.error({ error: error.message, params }, 'Error fetching markets from Gamma API');
      throw error;
    }
  }

  /**
   * Search markets (legacy method, wraps getMarkets)
   */
  async searchMarkets(params: GammaSearchMarketsParams = {}): Promise<GammaMarket[]> {
    return this.getMarkets(params);
  }

  /**
   * Get market by slug
   */
  async getMarket(slug: string): Promise<GammaMarket | null> {
    logger.debug({ slug }, 'Getting market by slug');
    
    try {
      const url = `${this.baseUrl}/markets/${slug}`;
      
      const response = await retryWithBackoff(async () => {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'polymarket-agent/1.0.0',
          },
        });

        if (res.status === 404) {
          return null;
        }

        if (!res.ok) {
          const error: any = new Error(`HTTP ${res.status}: ${res.statusText}`);
          error.status = res.status;
          error.response = {
            status: res.status,
            headers: Object.fromEntries(res.headers.entries()),
          };
          throw error;
        }

        return res;
      });

      if (!response) {
        return null;
      }

      const market = await response.json();
      logger.debug({ slug }, 'Fetched market from Gamma API');
      return market;
    } catch (error: any) {
      logger.error({ error: error.message, slug }, 'Error fetching market from Gamma API');
      throw error;
    }
  }

  /**
   * Search events
   */
  async searchEvents(params: GammaSearchEventsParams = {}): Promise<GammaEvent[]> {
    logger.debug({ params }, 'Searching events');
    
    // TODO: Implement actual API call
    logger.warn('GammaApi.searchEvents() is a stub - not implemented yet');
    return [];
  }

  /**
   * Get event by slug
   */
  async getEvent(slug: string): Promise<GammaEvent | null> {
    logger.debug({ slug }, 'Getting event');
    
    // TODO: Implement actual API call
    logger.warn('GammaApi.getEvent() is a stub - not implemented yet');
    return null;
  }

  /**
   * Get all tags/categories
   */
  async getTags(limit = 50, offset = 0): Promise<any[]> {
    logger.debug({ limit, offset }, 'Getting tags');
    
    // TODO: Implement actual API call
    logger.warn('GammaApi.getTags() is a stub - not implemented yet');
    return [];
  }
}
