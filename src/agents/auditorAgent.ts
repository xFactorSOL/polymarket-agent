import { getLogger } from '../utils/logger.js';
import { getDb } from '../db/db.js';

const logger = getLogger('auditorAgent');

/**
 * AuditorAgent - Audits system state and logs
 * Validates data consistency, tracks agent actions, and provides audit trails
 */
export class AuditorAgent {
  private db: ReturnType<typeof getDb>;

  constructor() {
    this.db = getDb();
  }

  /**
   * Log an agent action
   */
  logAction(agentName: string, action: string, marketId?: string, details?: any): void {
    logger.debug({ agentName, action, marketId, details }, 'Logging agent action');
    
    try {
      const stmt = this.db.prepare(`
        INSERT INTO agent_logs (agent_name, action, market_id, details)
        VALUES (?, ?, ?, ?)
      `);
      
      stmt.run(
        agentName,
        action,
        marketId || null,
        details ? JSON.stringify(details) : null
      );
    } catch (error) {
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
      const marketsCount = this.db.prepare('SELECT COUNT(*) as count FROM markets').get() as { count: number };
      const eventsCount = this.db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
      const ordersCount = this.db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
      const positionsCount = this.db.prepare('SELECT COUNT(*) as count FROM positions').get() as { count: number };

      // Check for orphaned orders
      const orphanedOrders = this.db.prepare(`
        SELECT COUNT(*) as count 
        FROM orders o
        LEFT JOIN markets m ON o.market_id = m.id
        WHERE m.id IS NULL
      `).get() as { count: number };

      if (orphanedOrders.count > 0) {
        issues.push(`Found ${orphanedOrders.count} orphaned orders`);
      }

      // Check for orphaned positions
      const orphanedPositions = this.db.prepare(`
        SELECT COUNT(*) as count 
        FROM positions p
        LEFT JOIN markets m ON p.market_id = m.id
        WHERE m.id IS NULL
      `).get() as { count: number };

      if (orphanedPositions.count > 0) {
        issues.push(`Found ${orphanedPositions.count} orphaned positions`);
      }

      // Check for positions with invalid status
      const invalidPositions = this.db.prepare(`
        SELECT COUNT(*) as count 
        FROM positions 
        WHERE status = 'OPEN' AND closed_at IS NOT NULL
        OR status = 'CLOSED' AND closed_at IS NULL
      `).get() as { count: number };

      if (invalidPositions.count > 0) {
        issues.push(`Found ${invalidPositions.count} positions with invalid status`);
      }

      logger.info({ issues: issues.length }, 'Database audit completed');

      return {
        markets: marketsCount.count,
        events: eventsCount.count,
        orders: ordersCount.count,
        positions: positionsCount.count,
        issues,
      };
    } catch (error) {
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
      const logs = this.db.prepare(`
        SELECT * FROM agent_logs 
        WHERE market_id = ? 
        ORDER BY created_at DESC
        LIMIT 100
      `).all(marketId);

      return logs.map((log: any) => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
      }));
    } catch (error) {
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
      const since = Date.now() / 1000 - hours * 3600;
      
      const logs = this.db.prepare(`
        SELECT agent_name, COUNT(*) as count
        FROM agent_logs
        WHERE created_at >= ?
        GROUP BY agent_name
      `).all(since) as Array<{ agent_name: string; count: number }>;

      const summary: Record<string, number> = {};
      logs.forEach((log) => {
        summary[log.agent_name] = log.count;
      });

      return summary;
    } catch (error) {
      logger.error({ error }, 'Error getting activity summary');
      throw error;
    }
  }
}
