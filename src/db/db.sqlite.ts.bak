// Database wrapper - uses Postgres on Vercel, SQLite locally
import { getLogger } from '../utils/logger.js';

const logger = getLogger('db');

// Check if we're using Postgres (Vercel Postgres connection string exists)
const usePostgres = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING;

if (usePostgres) {
  // Use Postgres
  logger.info('Using PostgreSQL database');
  export * from './db.pg.js';
} else {
  // Fallback: try to use SQLite
  logger.warn('No POSTGRES_URL found, attempting to use SQLite (may not work on Vercel)');
  try {
    export * from './db.sqlite.js';
  } catch (error) {
    logger.error('Failed to load SQLite database module');
    throw new Error('No database configured. Set POSTGRES_URL for Vercel Postgres or use SQLite locally.');
  }
}
