import { sql } from '@vercel/postgres';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('db-pg');

let schemaInitialized = false;

/**
 * Initialize database schema (idempotent)
 * Note: Vercel Postgres automatically creates tables, but we'll run schema for safety
 */
async function initializeSchema(): Promise<void> {
  if (schemaInitialized) {
    return;
  }

  try {
    // For Vercel Postgres, tables are created automatically via migrations
    // or we can create them on first run. For now, we'll let Vercel handle it
    // or create tables via Vercel dashboard/SQL editor
    schemaInitialized = true;
    logger.info('Using Vercel Postgres (schema managed via Vercel)');
  } catch (error: any) {
    logger.error({ error: error.message }, 'Error initializing database schema');
    // Don't throw - let queries create tables as needed
  }
}

/**
 * Get database instance (Postgres via @vercel/postgres)
 */
export async function getDb() {
  // Initialize schema on first access
  if (!schemaInitialized) {
    await initializeSchema();
  }
  
  return sql;
}

/**
 * Close database connection (no-op for @vercel/postgres, connection is managed)
 */
export async function closeDb(): Promise<void> {
  // @vercel/postgres manages connections automatically
  // No explicit close needed
}

/**
 * Execute a query and return rows
 */
export async function query(text: string, params?: any[]): Promise<any[]> {
  try {
    const result = await sql.query(text, params || []);
    return result.rows;
  } catch (error: any) {
    logger.error({ error: error.message, query: text.substring(0, 100) }, 'Query error');
    throw error;
  }
}

/**
 * Execute a query and return a single row
 */
export async function queryOne(text: string, params?: any[]): Promise<any | null> {
  try {
    const result = await sql.query(text, params || []);
    return result.rows[0] || null;
  } catch (error: any) {
    logger.error({ error: error.message, query: text.substring(0, 100) }, 'QueryOne error');
    throw error;
  }
}

/**
 * Execute a query (INSERT/UPDATE/DELETE) and return row count
 */
export async function execute(text: string, params?: any[]): Promise<number> {
  try {
    const result = await sql.query(text, params || []);
    return result.rowCount || 0;
  } catch (error: any) {
    logger.error({ error: error.message, query: text.substring(0, 100) }, 'Execute error');
    throw error;
  }
}

// Database helper types
export type Market = {
  id: string;
  slug: string;
  question: string;
  description: string | null;
  end_date_iso: string | null;
  image: string | null;
  icon: string | null;
  active: number;
  liquidity: string | null;
  volume: string | null;
  created_at: Date;
  updated_at: Date;
};

export type Event = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  active: number;
  created_at: Date;
  updated_at: Date;
};

export type Order = {
  id: string;
  market_id: string;
  outcome: string;
  side: 'BUY' | 'SELL';
  price: string;
  size: string;
  status: 'PENDING' | 'OPEN' | 'FILLED' | 'CANCELLED' | 'REJECTED';
  clob_order_id: string | null;
  filled_size: string;
  created_at: Date;
  updated_at: Date;
};

export type Position = {
  id: number;
  market_id: string;
  outcome: 'YES' | 'NO';
  side: 'YES' | 'NO';
  size: string;
  avg_price: string;
  current_price: string | null;
  unrealized_pnl: string;
  realized_pnl: string;
  status: 'OPEN' | 'CLOSED';
  opened_at: Date;
  closed_at: Date | null;
};
