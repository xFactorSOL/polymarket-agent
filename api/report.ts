import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AuditorAgent } from '../src/agents/auditorAgent.js';
import { ExecutionAgent } from '../src/agents/executionAgent.js';
import { getDb, closeDb } from '../src/db/db.js';
import { getLogger } from '../src/utils/logger.js';

const logger = getLogger('api-report');

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      audit,
      positions,
      orders,
      stats,
      trail,
    } = request.method === 'POST' ? request.body : request.query;

    const db = getDb();
    const auditorAgent = new AuditorAgent();
    const executionAgent = new ExecutionAgent();

    const report: any = {};

    if (audit || (!audit && !positions && !orders && !stats && !trail)) {
      report.audit = await auditorAgent.auditDatabase();
    }

    if (positions) {
      report.positions = db.prepare('SELECT * FROM positions ORDER BY opened_at DESC').all();
    }

    if (orders) {
      report.orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 20').all();
    }

    if (stats) {
      report.stats = await executionAgent.getExecutionStats();
    }

    if (trail && typeof trail === 'string') {
      report.trail = await auditorAgent.getAuditTrail(trail);
    }

    closeDb();

    return response.status(200).json({
      success: true,
      report,
    });
  } catch (error: any) {
    logger.error({ error }, 'Error during report');
    closeDb();
    return response.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
