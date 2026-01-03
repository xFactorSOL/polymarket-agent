import { getLogger } from '../utils/logger.js';
import { ClobClient } from '../clients/clobClient.js';
import { getDb, Position } from '../db/db.js';

const logger = getLogger('exitAgent');

/**
 * ExitAgent - Manages position exits
 * Monitors open positions and executes exits based on criteria (profit targets, stop losses, etc.)
 */
export class ExitAgent {
  private clobClient: ClobClient;
  private db: ReturnType<typeof getDb>;

  constructor() {
    this.clobClient = new ClobClient();
    this.db = getDb();
  }

  /**
   * Evaluate exit conditions for all open positions
   */
  async evaluateExits(): Promise<void> {
    logger.debug('Evaluating exit conditions');
    
    try {
      // TODO: Implement exit evaluation logic
      // 1. Get all open positions
      // 2. For each position, check exit conditions:
      //    - Profit target reached
      //    - Stop loss triggered
      //    - Time-based exit
      //    - Market condition changes
      // 3. Generate exit signals

      const positions = this.db.prepare(`
        SELECT * FROM positions WHERE status = 'OPEN'
      `).all() as Position[];

      logger.debug({ count: positions.length }, 'Evaluated positions for exit');
    } catch (error) {
      logger.error({ error }, 'Error evaluating exits');
      throw error;
    }
  }

  /**
   * Exit a position
   */
  async exitPosition(positionId: number, reason: string): Promise<void> {
    logger.info({ positionId, reason }, 'Exiting position');
    
    try {
      // TODO: Implement exit logic (STUB - no actual trading)
      // 1. Get position from database
      // 2. Determine exit side (opposite of entry)
      // 3. Get current market price
      // 4. Execute exit order via ExecutionAgent
      // 5. Update position status to CLOSED
      // 6. Calculate realized P&L

      logger.warn('ExitAgent.exitPosition() is a stub - trading not implemented');
      
      // Stub: update position status
      const stmt = this.db.prepare(`
        UPDATE positions 
        SET status = 'CLOSED', closed_at = strftime('%s', 'now')
        WHERE id = ?
      `);
      stmt.run(positionId);

      logger.info({ positionId }, 'Position closed (stub)');
    } catch (error) {
      logger.error({ error, positionId }, 'Error exiting position');
      throw error;
    }
  }

  /**
   * Calculate unrealized P&L for a position
   */
  async calculateUnrealizedPnL(position: Position): Promise<string> {
    logger.debug({ positionId: position.id }, 'Calculating unrealized P&L');
    
    try {
      // TODO: Implement P&L calculation
      // P&L = (Current Price - Entry Price) * Size * Direction
      // Consider: YES vs NO positions

      return '0';
    } catch (error) {
      logger.error({ error, positionId: position.id }, 'Error calculating P&L');
      return '0';
    }
  }

  /**
   * Check if a position should be exited based on profit target
   */
  async shouldExitProfitTarget(position: Position, targetPercent: number): Promise<boolean> {
    logger.debug({ positionId: position.id, targetPercent }, 'Checking profit target');
    
    try {
      // TODO: Implement profit target check
      const unrealizedPnL = await this.calculateUnrealizedPnL(position);
      const pnlPercent = (parseFloat(unrealizedPnL) / parseFloat(position.avg_price)) * 100;
      
      return pnlPercent >= targetPercent;
    } catch (error) {
      logger.error({ error, positionId: position.id }, 'Error checking profit target');
      return false;
    }
  }

  /**
   * Check if a position should be exited based on stop loss
   */
  async shouldExitStopLoss(position: Position, stopLossPercent: number): Promise<boolean> {
    logger.debug({ positionId: position.id, stopLossPercent }, 'Checking stop loss');
    
    try {
      // TODO: Implement stop loss check
      const unrealizedPnL = await this.calculateUnrealizedPnL(position);
      const pnlPercent = (parseFloat(unrealizedPnL) / parseFloat(position.avg_price)) * 100;
      
      return pnlPercent <= -stopLossPercent;
    } catch (error) {
      logger.error({ error, positionId: position.id }, 'Error checking stop loss');
      return false;
    }
  }
}
