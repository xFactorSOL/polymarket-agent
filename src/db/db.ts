// Database wrapper - uses Postgres when POSTGRES_URL is available
import { getLogger } from '../utils/logger.js';

const logger = getLogger('db');

// Check if we're using Postgres (Vercel Postgres connection string exists)
const usePostgres = !!(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING);

if (usePostgres) {
  logger.info('Using PostgreSQL database (Vercel Postgres)');
  export * from './db.pg.js';
} else {
  logger.warn('No POSTGRES_URL found - database operations will fail on Vercel. Please set up Vercel Postgres.');
  // For now, export Postgres interface but it will fail without connection
  // This forces the user to set up Postgres
  export * from './db.pg.js';
}
