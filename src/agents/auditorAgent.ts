import { getLogger } from '../utils/logger.js';
import { query, queryOne, closeDb } from '../db/db.js';

const logger = getLogger('auditorAgent');

/**
 * AuditorAgent - Audits system state and logs
 * Validates data consistency, tracks agent actions, and provides audit trails
 */
export class AuditorAgent {
  /**
   * Log an agent action
   */
  async logAction(agentName: string, action: string, marketId?: string, details?: any): Promise<void> {
    logger.debug({ agentName, action, marketId, details }, 'Logging agent action');
    
    try {
      await query(`
        INSERT INTO agent_logs (agent_name, action, market_id, details)
        VALUES ($1, $2, $3, $4)
      `, [
        agentName,
        action,
        marketId || null,
        details ? JSON.stringify(details) : null,
      ]);
    } catch (error: any) {
      logger.error({ error, agentName, action }, 'Error logging agent action');
    }
  }

  /**
   * Audit database consistency
   */
  async auditDatabase(): Promise<{
    markets: number;
    events: number;
    orders: number;
    positions: number;
    issues: string[];
  }> {
    logger.info('Auditing database consistency');
    
    const issues: string[] = [];

    try {
      // Count records
      const marketsResult = await queryOne('SELECT COUNT(*) as count FROM markets') as { count: string | number } | null;
      const eventsResult = await queryOne('SELECT COUNT(*) as count FROM events') as { count: string | number } | null;
      const ordersResult = await queryOne('SELECT COUNT(*) as count FROM orders') as { count: string | number } | null;
      const positionsResult = await queryOne('SELECT COUNT(*) as count FROM positions') as { count: string | number } | null;

      const marketsCount = marketsResult ? Number(marketsResult.count) : 0;
      const eventsCount = eventsResult ? Number(eventsResult.count) : 0;
      const ordersCount = ordersResult ? Number(ordersResult.count) : 0;
      const positionsCount = positionsResult ? Number(positionsResult.count) : 0;

      // Check for orphaned orders
      const orphanedOrdersResult = await queryOne(`
        SELECT COUNT(*) as count 
        FROM orders o
        LEFT JOIN markets m ON o.market_id = m.id
        WHERE m.id IS NULL
      `) as { count: string | number } | null;

      const orphanedOrders = orphanedOrdersResult ? Number(orphanedOrdersResult.count) : 0;
      if (orphanedOrders > 0) {
        issues.push(`Found ${orphanedOrders} orphaned orders`);
      }

      // Check for orphaned positions
      const orphanedPositionsResult = await queryOne(`
        SELECT COUNT(*) as count 
        FROM positions p
        LEFT JOIN markets m ON p.market_id = m.id
        WHERE m.id IS NULL
      `) as { count: string | number } | null;

      const orphanedPositions = orphanedPositionsResult ? Number(orphanedPositionsResult.count) : 0;
      if (orphanedPositions > 0) {
        issues.push(`Found ${orphanedPositions} orphaned positions`);
      }

      // Check for positions with invalid status
      const invalidPositionsResult = await queryOne(`
        SELECT COUNT(*) as count 
        FROM positions 
        WHERE (status = 'OPEN' AND closed_at IS NOT NULL)
        OR (status = 'CLOSED' AND closed_at IS NULL)
      `) as { count: string | number } | null;

      const invalidPositions = invalidPositionsResult ? Number(invalidPositionsResult.count) : 0;
      if (invalidPositions > 0) {
        issues.push(`Found ${invalidPositions} positions with invalid status`);
      }

      logger.info({ issues: issues.length }, 'Database audit completed');

      return {
        markets: marketsCount,
        events: eventsCount,
        orders: ordersCount,
        positions: positionsCount,
        issues,
      };
    } catch (error: any) {
      logger.error({ error }, 'Error auditing database');
      throw error;
    }
  }

  /**
   * Get audit trail for a market
   */
  async getAuditTrail(marketId: string): Promise<any[]> {
    logger.debug({ marketId }, 'Getting audit trail');
    
    try {
      const logs = await query(`
        SELECT * FROM agent_logs 
        WHERE market_id = $1 
        ORDER BY created_at DESC
        LIMIT 100
      `, [marketId]);

      return logs.map((log: any) => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
      }));
    } catch (error: any) {
      logger.error({ error, marketId }, 'Error getting audit trail');
      throw error;
    }
  }

  /**
   * Get agent activity summary
   */
  async getActivitySummary(hours = 24): Promise<Record<string, number>> {
    logger.debug({ hours }, 'Getting activity summary');
    
    try {
      const since = new Date(Date.now() - hours * 3600 * 1000);
      
      const logs = await query(`
        SELECT agent_name, COUNT(*) as count
        FROM agent_logs
        WHERE created_at >= $1
        GROUP BY agent_name
      `, [since]) as Array<{ agent_name: string; count: string | number }>;

      const summary: Record<string, number> = {};
      logs.forEach((log) => {
        summary[log.agent_name] = Number(log.count);
      });

      return summary;
    } catch (error: any) {
      logger.error({ error }, 'Error getting activity summary');
      throw error;
    }
  }
}
