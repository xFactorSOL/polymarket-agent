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

export interface GammaSearchMarketsParams {
  query?: string;
  limit?: number;
  offset?: number;
  closed?: boolean;
  tagId?: number;
  liquidityMin?: number;
  volumeMin?: number;
  order?: string;
  ascending?: boolean;
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

export class GammaApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.GAMMA_API_BASE_URL;
  }

  /**
   * Search markets
   */
  async searchMarkets(params: GammaSearchMarketsParams = {}): Promise<GammaMarket[]> {
    logger.debug({ params }, 'Searching markets');
    
    // TODO: Implement actual API call
    // const url = new URL('/markets', this.baseUrl);
    // Object.entries(params).forEach(([key, value]) => {
    //   if (value !== undefined) {
    //     url.searchParams.append(key, String(value));
    //   }
    // });
    // const response = await fetch(url.toString());
    // return response.json();

    logger.warn('GammaApi.searchMarkets() is a stub - not implemented yet');
    return [];
  }

  /**
   * Get market by slug
   */
  async getMarket(slug: string): Promise<GammaMarket | null> {
    logger.debug({ slug }, 'Getting market');
    
    // TODO: Implement actual API call
    // const url = `${this.baseUrl}/markets/${slug}`;
    // const response = await fetch(url);
    // return response.json();

    logger.warn('GammaApi.getMarket() is a stub - not implemented yet');
    return null;
  }

  /**
   * Search events
   */
  async searchEvents(params: GammaSearchEventsParams = {}): Promise<GammaEvent[]> {
    logger.debug({ params }, 'Searching events');
    
    // TODO: Implement actual API call
    // const url = new URL('/events', this.baseUrl);
    // Object.entries(params).forEach(([key, value]) => {
    //   if (value !== undefined) {
    //     url.searchParams.append(key, String(value));
    //   }
    // });
    // const response = await fetch(url.toString());
    // return response.json();

    logger.warn('GammaApi.searchEvents() is a stub - not implemented yet');
    return [];
  }

  /**
   * Get event by slug
   */
  async getEvent(slug: string): Promise<GammaEvent | null> {
    logger.debug({ slug }, 'Getting event');
    
    // TODO: Implement actual API call
    // const url = `${this.baseUrl}/events/${slug}`;
    // const response = await fetch(url);
    // return response.json();

    logger.warn('GammaApi.getEvent() is a stub - not implemented yet');
    return null;
  }

  /**
   * Get all tags/categories
   */
  async getTags(limit = 50, offset = 0): Promise<any[]> {
    logger.debug({ limit, offset }, 'Getting tags');
    
    // TODO: Implement actual API call
    // const url = new URL('/tags', this.baseUrl);
    // url.searchParams.append('limit', String(limit));
    // url.searchParams.append('offset', String(offset));
    // const response = await fetch(url.toString());
    // return response.json();

    logger.warn('GammaApi.getTags() is a stub - not implemented yet');
    return [];
  }
}
