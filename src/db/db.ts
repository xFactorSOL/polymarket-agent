import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getConfig } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const config = getConfig();
  
  // Ensure database directory exists
  let dbPath = config.DATABASE_PATH;
  
  // Force /tmp on Vercel if not already set
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
  if (isVercel && !dbPath.startsWith('/tmp')) {
    dbPath = '/tmp/polymarket.db';
  }
  
  const dbDir = dirname(dbPath);
  
  // Create directory if needed (skip for root paths like /tmp)
  // Never try to create /tmp - it always exists
  if (dbDir && dbDir !== '.' && dbDir !== '/' && dbDir !== '\\' && !dbPath.startsWith('/tmp')) {
    try {
      mkdirSync(dbDir, { recursive: true });
    } catch (error: any) {
      // Directory might already exist, ignore EEXIST errors
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  // Initialize database
  dbInstance = new Database(dbPath);
  
  // Enable foreign keys
  dbInstance.pragma('foreign_keys = ON');
  
  // Initialize schema
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  dbInstance.exec(schema);

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
