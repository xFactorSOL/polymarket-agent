import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getConfig } from '../config/index.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('db');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  let dbPath: string;
  
  try {
    const config = getConfig();
    dbPath = config.DATABASE_PATH;
    
    // Force /tmp on Vercel
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
    if (isVercel) {
      dbPath = '/tmp/polymarket.db';
    }
    
    const dbDir = dirname(dbPath);
    
    // Only try to create directory if not /tmp and not root
    if (dbDir && dbDir !== '.' && dbDir !== '/' && dbDir !== '\\' && !dbPath.startsWith('/tmp')) {
      try {
        mkdirSync(dbDir, { recursive: true });
      } catch (error: any) {
        // If directory creation fails, fallback to /tmp
        logger.warn({ originalPath: dbPath, error: error.message }, 'Directory creation failed, using /tmp fallback');
        dbPath = '/tmp/polymarket.db';
      }
    }
  } catch (error: any) {
    // If anything fails in config or directory creation, use /tmp as safe fallback
    logger.warn({ error: error.message }, 'Database initialization error, using /tmp fallback');
    dbPath = '/tmp/polymarket.db';
  }

  // Initialize database (this should always work with /tmp)
  dbInstance = new Database(dbPath);
  
  // Enable foreign keys
  dbInstance.pragma('foreign_keys = ON');
  
  // Initialize schema
  try {
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    dbInstance.exec(schema);
  } catch (error: any) {
    logger.error({ error: error.message }, 'Error initializing database schema');
    // Continue anyway - schema might already exist
  }

  return dbInstance;
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
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
  created_at: number;
  updated_at: number;
};

export type Event = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  active: number;
  created_at: number;
  updated_at: number;
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
  created_at: number;
  updated_at: number;
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
  opened_at: number;
  closed_at: number | null;
};
