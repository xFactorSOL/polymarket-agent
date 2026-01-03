#!/usr/bin/env node

import { Command } from 'commander';
import { getLogger } from '../utils/logger.js';
import { WatcherAgent } from '../agents/watcherAgent.js';
import { EvFilterAgent } from '../agents/evFilterAgent.js';
import { LiquidityAgent } from '../agents/liquidityAgent.js';
import { ExecutionAgent } from '../agents/executionAgent.js';
import { ExitAgent } from '../agents/exitAgent.js';
import { AuditorAgent } from '../agents/auditorAgent.js';
import { GammaApi } from '../clients/gammaApi.js';
import { getDb, closeDb } from '../db/db.js';
import { getConfig } from '../config/index.js';

const logger = getLogger('cli');
const program = new Command();

program
  .name('polymarket-agent')
  .description('Agentic Polymarket trading system using Gamma and CLOB APIs')
  .version('1.0.0');

// Ingest command - Ingest market/event data from Gamma API
program
  .command('ingest')
  .description('Ingest market and event data from Gamma API into database')
  .option('-m, --markets', 'Ingest markets')
  .option('-e, --events', 'Ingest events')
  .option('-l, --limit <number>', 'Limit number of records', '100')
  .option('-o, --offset <number>', 'Offset for pagination', '0')
  .action(async (options) => {
    logger.info('Starting ingest command');
    
    try {
      const gammaApi = new GammaApi();
      const db = getDb();

      if (options.markets || (!options.markets && !options.events)) {
        logger.info({ limit: options.limit, offset: options.offset }, 'Ingesting markets');
        
        // TODO: Implement market ingestion
        const markets = await gammaApi.searchMarkets({
          limit: parseInt(options.limit),
          offset: parseInt(options.offset),
        });

        logger.info({ count: markets.length }, 'Markets fetched');
        // Insert into database
      }

      if (options.events) {
        logger.info({ limit: options.limit, offset: options.offset }, 'Ingesting events');
        
        // TODO: Implement event ingestion
        const events = await gammaApi.searchEvents({
          limit: parseInt(options.limit),
          offset: parseInt(options.offset),
        });

        logger.info({ count: events.length }, 'Events fetched');
        // Insert into database
      }

      logger.info('Ingest completed');
    } catch (error) {
      logger.error({ error }, 'Error during ingest');
      process.exit(1);
    } finally {
      closeDb();
    }
  });

// Scan command - Scan markets using EV filter agent
program
  .command('scan')
  .description('Scan markets using EV filter agent to find trading opportunities')
  .option('-l, --liquidity <number>', 'Minimum liquidity', '1000')
  .option('-v, --volume <number>', 'Minimum volume', '5000')
  .option('--max-prob <number>', 'Maximum probability', '0.95')
  .option('--min-prob <number>', 'Minimum probability', '0.05')
  .action(async (options) => {
    logger.info('Starting scan command');
    
    try {
      const evFilterAgent = new EvFilterAgent();
      const db = getDb();

      const criteria = {
        minLiquidity: parseFloat(options.liquidity),
        minVolume: parseFloat(options.volume),
        maxProbability: parseFloat(options.maxProb),
        minProbability: parseFloat(options.minProb),
      };

      logger.info({ criteria }, 'Scanning markets with criteria');
      
      const markets = await evFilterAgent.filterMarkets(criteria);
      
      logger.info({ count: markets.length }, 'Markets found');

      // Store scan results
      const stmt = db.prepare(`
        INSERT INTO scans (scan_type, markets_scanned, markets_filtered, results, completed_at)
        VALUES (?, ?, ?, ?, strftime('%s', 'now'))
      `);
      
      stmt.run(
        'ev_filter',
        0, // TODO: track scanned count
        markets.length,
        JSON.stringify(markets)
      );

      console.log(`Found ${markets.length} markets matching criteria`);
      
      markets.forEach((market, index) => {
        console.log(`${index + 1}. ${market.question} (${market.slug})`);
      });

      logger.info('Scan completed');
    } catch (error) {
      logger.error({ error }, 'Error during scan');
      process.exit(1);
    } finally {
      closeDb();
    }
  });

// Trade command - Execute trades (STUB - not implemented)
program
  .command('trade')
  .description('Execute trades (STUB - trading not implemented)')
  .option('-m, --market <slug>', 'Market slug')
  .option('-o, --outcome <outcome>', 'Outcome (YES/NO)', 'YES')
  .option('-s, --side <side>', 'Side (BUY/SELL)', 'BUY')
  .option('-p, --price <price>', 'Price (0.0-1.0)')
  .option('-z, --size <size>', 'Size')
  .action(async (options) => {
    logger.warn('Trade command is a stub - trading not implemented');
    console.log('Trading functionality is not yet implemented.');
    console.log('This is a stub command for future implementation.');
  });

// Monitor command - Start monitoring agents
program
  .command('monitor')
  .description('Start monitoring agents (watcher, exit, etc.)')
  .option('-w, --watcher', 'Start watcher agent')
  .option('-x, --exit', 'Start exit agent')
  .option('-i, --interval <ms>', 'Check interval in milliseconds', '60000')
  .action(async (options) => {
    logger.info('Starting monitor command');
    
    try {
      const config = getConfig();
      const interval = parseInt(options.interval) || config.WATCHER_INTERVAL_MS;

      if (options.watcher || (!options.watcher && !options.exit)) {
        logger.info('Starting watcher agent');
        const watcher = new WatcherAgent(interval);
        watcher.start();

        // Keep process alive
        process.on('SIGINT', () => {
          logger.info('Stopping watcher agent');
          watcher.stop();
          closeDb();
          process.exit(0);
        });

        // Run indefinitely
        await new Promise(() => {});
      }

      if (options.exit) {
        logger.info('Starting exit agent');
        const exitAgent = new ExitAgent();
        
        const exitInterval = setInterval(async () => {
          await exitAgent.evaluateExits();
        }, interval);

        process.on('SIGINT', () => {
          logger.info('Stopping exit agent');
          clearInterval(exitInterval);
          closeDb();
          process.exit(0);
        });

        // Run indefinitely
        await new Promise(() => {});
      }
    } catch (error) {
      logger.error({ error }, 'Error during monitor');
      process.exit(1);
    }
  });

// Report command - Generate reports
program
  .command('report')
  .description('Generate reports on system state, positions, orders, etc.')
  .option('-a, --audit', 'Run database audit')
  .option('-p, --positions', 'Show positions')
  .option('-o, --orders', 'Show orders')
  .option('-s, --stats', 'Show execution statistics')
  .option('-t, --trail <marketId>', 'Show audit trail for market')
  .action(async (options) => {
    logger.info('Starting report command');
    
    try {
      const db = getDb();
      const auditorAgent = new AuditorAgent();
      const executionAgent = new ExecutionAgent();

      if (options.audit || (!options.audit && !options.positions && !options.orders && !options.stats && !options.trail)) {
        console.log('\n=== Database Audit ===');
        const audit = await auditorAgent.auditDatabase();
        console.log(`Markets: ${audit.markets}`);
        console.log(`Events: ${audit.events}`);
        console.log(`Orders: ${audit.orders}`);
        console.log(`Positions: ${audit.positions}`);
        if (audit.issues.length > 0) {
          console.log('\nIssues:');
          audit.issues.forEach((issue) => console.log(`  - ${issue}`));
        } else {
          console.log('\nNo issues found.');
        }
      }

      if (options.positions) {
        console.log('\n=== Positions ===');
        const positions = db.prepare('SELECT * FROM positions ORDER BY opened_at DESC').all();
        if (positions.length === 0) {
          console.log('No positions found.');
        } else {
          positions.forEach((pos: any) => {
            console.log(`ID: ${pos.id}, Market: ${pos.market_id}, Outcome: ${pos.outcome}, Size: ${pos.size}, Status: ${pos.status}`);
          });
        }
      }

      if (options.orders) {
        console.log('\n=== Orders ===');
        const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 20').all();
        if (orders.length === 0) {
          console.log('No orders found.');
        } else {
          orders.forEach((order: any) => {
            console.log(`ID: ${order.id}, Market: ${order.market_id}, Side: ${order.side}, Price: ${order.price}, Status: ${order.status}`);
          });
        }
      }

      if (options.stats) {
        console.log('\n=== Execution Statistics ===');
        const stats = await executionAgent.getExecutionStats();
        console.log(`Total Orders: ${stats.totalOrders}`);
        console.log(`Filled Orders: ${stats.filledOrders}`);
        console.log(`Cancelled Orders: ${stats.cancelledOrders}`);
        console.log(`Fill Rate: ${(stats.fillRate * 100).toFixed(2)}%`);
      }

      if (options.trail) {
        console.log(`\n=== Audit Trail for Market: ${options.trail} ===`);
        const trail = await auditorAgent.getAuditTrail(options.trail);
        if (trail.length === 0) {
          console.log('No audit trail found.');
        } else {
          trail.forEach((log: any) => {
            console.log(`[${new Date(log.created_at * 1000).toISOString()}] ${log.agent_name}: ${log.action}`);
          });
        }
      }

      logger.info('Report completed');
    } catch (error) {
      logger.error({ error }, 'Error during report');
      process.exit(1);
    } finally {
      closeDb();
    }
  });

// Parse arguments
program.parse();
