import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

const ConfigSchema = z.object({
  // Database
  DATABASE_PATH: z.string(),

  // Gamma API
  GAMMA_API_BASE_URL: z.string().url(),

  // CLOB API
  CLOB_API_BASE_URL: z.string().url(),
  CLOB_API_KEY: z.string().optional(),
  CLOB_PRIVATE_KEY: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']),
  LOG_PRETTY: z.string().transform((val) => val === 'true'),

  // Agent Configuration
  WATCHER_INTERVAL_MS: z.string().transform(Number),
  SCAN_BATCH_SIZE: z.string().transform(Number),
  MAX_POSITIONS: z.string().transform(Number),
});

export type Config = z.infer<typeof ConfigSchema>;

let cachedConfig: Config | null = null;

export function getConfig(): Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    // Merge process.env with defaults for missing values
    const envWithDefaults = {
      DATABASE_PATH: process.env.DATABASE_PATH || './data/polymarket.db',
      GAMMA_API_BASE_URL: process.env.GAMMA_API_BASE_URL || 'https://gamma-api.polymarket.com',
      CLOB_API_BASE_URL: process.env.CLOB_API_BASE_URL || 'https://clob.polymarket.com',
      CLOB_API_KEY: process.env.CLOB_API_KEY,
      CLOB_PRIVATE_KEY: process.env.CLOB_PRIVATE_KEY,
      LOG_LEVEL: process.env.LOG_LEVEL || 'info',
      LOG_PRETTY: process.env.LOG_PRETTY || 'false',
      WATCHER_INTERVAL_MS: process.env.WATCHER_INTERVAL_MS || '60000',
      SCAN_BATCH_SIZE: process.env.SCAN_BATCH_SIZE || '100',
      MAX_POSITIONS: process.env.MAX_POSITIONS || '10',
    };
    
    cachedConfig = ConfigSchema.parse(envWithDefaults);
    return cachedConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation error:');
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}
