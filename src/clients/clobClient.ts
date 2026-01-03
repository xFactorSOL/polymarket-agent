import { ClobApi, CLOBCreateOrderParams, CLOBOrderResponse } from './clobApi.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('clobClient');

/**
 * Higher-level CLOB client wrapper
 * Provides convenience methods and order management
 */
export class ClobClient {
  private api: ClobApi;

  constructor() {
    this.api = new ClobApi();
  }

  /**
   * Submit an order with retry logic
   */
  async submitOrder(params: CLOBCreateOrderParams): Promise<CLOBOrderResponse> {
    logger.info({ params }, 'Submitting order');
    
    try {
      const order = await this.api.createOrder(params);
      logger.info({ orderId: order.id }, 'Order submitted successfully');
      return order;
    } catch (error) {
      logger.error({ error, params }, 'Failed to submit order');
      throw error;
    }
  }

  /**
   * Cancel an order with retry logic
   */
  async cancelOrder(orderId: string): Promise<void> {
    logger.info({ orderId }, 'Canceling order');
    
    try {
      await this.api.cancelOrder(orderId);
      logger.info({ orderId }, 'Order canceled successfully');
    } catch (error) {
      logger.error({ error, orderId }, 'Failed to cancel order');
      throw error;
    }
  }

  /**
   * Get current orderbook and calculate mid price
   */
  async getMidPrice(marketConditionId: string): Promise<string | null> {
    logger.debug({ marketConditionId }, 'Getting mid price');
    
    try {
      const orderbook = await this.api.getOrderBook(marketConditionId);
      
      if (orderbook.bids.length === 0 || orderbook.asks.length === 0) {
        return null;
      }

      const bestBid = parseFloat(orderbook.bids[0].price);
      const bestAsk = parseFloat(orderbook.asks[0].price);
      const midPrice = ((bestBid + bestAsk) / 2).toFixed(8);
      
      logger.debug({ marketConditionId, midPrice }, 'Calculated mid price');
      return midPrice;
    } catch (error) {
      logger.error({ error, marketConditionId }, 'Failed to get mid price');
      return null;
    }
  }

  /**
   * Check if an order is filled
   */
  async isOrderFilled(orderId: string): Promise<boolean> {
    try {
      const order = await this.api.getOrder(orderId);
      return order?.status === 'FILLED' || false;
    } catch (error) {
      logger.error({ error, orderId }, 'Failed to check order status');
      return false;
    }
  }

  /**
   * Get all open orders
   */
  async getOpenOrders(): Promise<CLOBOrderResponse[]> {
    return this.api.getOpenOrders();
  }
}
