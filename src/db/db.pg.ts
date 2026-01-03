import { Pool } from 'pg';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('db-pg');

let pool: Pool | null = null;
let schemaInitialized = false;

/**
 * Get database connection pool (Postgres - works with Neon, Vercel Postgres, etc.)
 */
function getPool(): Pool {
  if (pool) {
    return pool;
  }

  // Use POSTGRES_URL (Neon/Vercel) or DATABASE_URL
  const connectionString = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required');
  }

  logger.info('Connecting to PostgreSQL database');

  // Create connection pool
  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10, // Maximum pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  // Handle pool errors
  pool.on('error', (err) => {
    logger.error({ error: err.message }, 'Unexpected database pool error');
  });

  return pool;
}

/**
 * Initialize database schema (idempotent)
 */
async function initializeSchema(): Promise<void> {
  if (schemaInitialized) {
    return;
  }

  try {
    schemaInitialized = true;
    logger.info('Using PostgreSQL database (schema should be initialized via SQL editor)');
  } catch (error: any) {
    logger.error({ error: error.message }, 'Error initializing database schema');
  }
}

/**
 * Get database instance (Postgres)
 */
export async function getDb() {
  if (!schemaInitialized) {
    await initializeSchema();
  }
  return getPool();
}

/**
 * Close database connection
 */
export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    schemaInitialized = false;
  }
}

/**
 * Execute a query and return rows
 */
export async function query(text: string, params?: any[]): Promise<any[]> {
  try {
    const client = getPool();
    const result = await client.query(text, params || []);
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
    const results = await query(text, params);
    return results[0] || null;
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
    const client = getPool();
    const result = await client.query(text, params || []);
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
