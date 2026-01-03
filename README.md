# Polymarket Agent System

An agentic trading system for Polymarket using Gamma API for market/event metadata and CLOB API for orderbook data and execution.

## Features

- **Multi-Agent Architecture**: Specialized agents for different tasks
  - `WatcherAgent`: Monitors markets and events for changes
  - `EvFilterAgent`: Filters markets based on expected value criteria
  - `LiquidityAgent`: Analyzes and monitors market liquidity
  - `ExecutionAgent`: Handles order execution (STUB - trading not implemented)
  - `ExitAgent`: Manages position exits (STUB - trading not implemented)
  - `AuditorAgent`: Audits system state and provides audit trails

- **CLI Commands**:
  - `ingest`: Ingest market/event data from Gamma API
  - `scan`: Scan markets using EV filter to find opportunities
  - `trade`: Execute trades (STUB - not implemented)
  - `monitor`: Start monitoring agents (watcher, exit)
  - `report`: Generate reports on system state

- **Database**: SQLite persistence for markets, events, orders, positions, and audit logs

- **Configuration**: Environment-based configuration with Zod validation

## Prerequisites

- Node.js 20+
- pnpm

## Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build the project**:
   ```bash
   pnpm build
   ```

## Usage

### Ingest Market Data

Ingest markets and events from Gamma API:

```bash
# Ingest markets
pnpm ingest --markets --limit 100

# Ingest events
pnpm ingest --events --limit 50

# Ingest both (default)
pnpm ingest --limit 100
```

### Scan Markets

Scan markets using EV filter agent:

```bash
# Scan with default criteria
pnpm scan

# Scan with custom criteria
pnpm scan --liquidity 5000 --volume 10000 --min-prob 0.1 --max-prob 0.9
```

### Monitor

Start monitoring agents:

```bash
# Start watcher agent (default)
pnpm monitor --watcher --interval 60000

# Start exit agent
pnpm monitor --exit --interval 30000
```

### Reports

Generate reports:

```bash
# Database audit (default)
pnpm report --audit

# Show positions
pnpm report --positions

# Show orders
pnpm report --orders

# Show execution statistics
pnpm report --stats

# Show audit trail for a market
pnpm report --trail <marketId>

# Show all reports
pnpm report --audit --positions --orders --stats
```

### Development

Run in development mode with hot reload:

```bash
pnpm dev ingest
```

## Project Structure

```
polymarket-agent/
├── src/
│   ├── clients/          # API clients
│   │   ├── gammaApi.ts   # Gamma API client
│   │   ├── clobApi.ts    # CLOB API client
│   │   └── clobClient.ts # CLOB client wrapper
│   ├── agents/           # Trading agents
│   │   ├── watcherAgent.ts
│   │   ├── evFilterAgent.ts
│   │   ├── liquidityAgent.ts
│   │   ├── executionAgent.ts
│   │   ├── exitAgent.ts
│   │   └── auditorAgent.ts
│   ├── db/               # Database
│   │   ├── schema.sql    # Database schema
│   │   └── db.ts         # Database wrapper
│   ├── cli/              # CLI commands
│   │   └── index.ts
│   ├── config/           # Configuration
│   │   └── index.ts
│   └── utils/            # Utilities
│       └── logger.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Configuration

Configuration is managed via environment variables (see `.env.example`):

- `DATABASE_PATH`: Path to SQLite database file
- `GAMMA_API_BASE_URL`: Gamma API base URL
- `CLOB_API_BASE_URL`: CLOB API base URL
- `CLOB_API_KEY`: CLOB API key (optional)
- `CLOB_PRIVATE_KEY`: CLOB private key (optional)
- `LOG_LEVEL`: Logging level (trace, debug, info, warn, error, fatal)
- `LOG_PRETTY`: Enable pretty logging (true/false)
- `WATCHER_INTERVAL_MS`: Watcher agent interval in milliseconds
- `SCAN_BATCH_SIZE`: Batch size for scanning
- `MAX_POSITIONS`: Maximum number of positions

## API Clients

### Gamma API

The Gamma API client (`gammaApi.ts`) provides methods to interact with the Gamma API:
- `searchMarkets()`: Search markets
- `getMarket()`: Get market by slug
- `searchEvents()`: Search events
- `getEvent()`: Get event by slug
- `getTags()`: Get tags/categories

**Note**: Currently stubbed - implement actual API calls as needed.

### CLOB API

The CLOB API client (`clobApi.ts`) provides methods to interact with the CLOB API:
- `getOrderBook()`: Get orderbook for a market
- `createOrder()`: Create an order
- `cancelOrder()`: Cancel an order
- `getOrder()`: Get order status
- `getTrades()`: Get recent trades
- `getOpenOrders()`: Get user's open orders

The `ClobClient` wrapper provides higher-level functionality:
- `submitOrder()`: Submit order with retry logic
- `cancelOrder()`: Cancel order with retry logic
- `getMidPrice()`: Calculate mid price from orderbook
- `isOrderFilled()`: Check if order is filled

**Note**: Currently stubbed - implement actual API calls and authentication as needed.

## Database Schema

The database stores:
- **markets**: Market metadata from Gamma API
- **events**: Event metadata from Gamma API
- **event_markets**: Junction table linking events to markets
- **orders**: Orders placed via CLOB API
- **positions**: Current trading positions
- **agent_logs**: Agent actions and audit trail
- **scans**: Market scan results

See `src/db/schema.sql` for full schema.

## Deployment

### GitHub

The repository is available at: https://github.com/xFactorSOL/polymarket-agent

### Vercel Deployment

This project can be deployed to Vercel as serverless API functions. The API routes are located in the `/api` directory.

#### Deploy to Vercel

1. **Go to Vercel Dashboard**:
   - Visit [vercel.com](https://vercel.com) and sign in
   - Click "Add New..." → "Project"

2. **Import GitHub Repository**:
   - Select "Import Git Repository"
   - Choose `xFactorSOL/polymarket-agent`
   - Click "Import"

3. **Configure Project Settings**:
   - **Framework Preset**: Select "Other" (or leave as "Other")
   - **Root Directory**: `./` (default)
   - **Build Command**: Leave empty (Vercel compiles TypeScript automatically)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install` (should auto-detect)

4. **Set Environment Variables** (optional, in "Environment Variables" section):
   - `DATABASE_PATH=/tmp/polymarket.db`
   - Add any other env vars from `.env.example` as needed

5. **Deploy**: Click "Deploy"

3. **Set Environment Variables** in Vercel dashboard:
   - `DATABASE_PATH` - Note: Vercel serverless functions use `/tmp` for temporary storage (database resets on each invocation)
   - `GAMMA_API_BASE_URL` - Default: `https://gamma-api.polymarket.com`
   - `CLOB_API_BASE_URL` - Default: `https://clob.polymarket.com`
   - `LOG_LEVEL` - Default: `info`
   - `LOG_PRETTY` - Default: `false`

#### API Endpoints

Once deployed, the following endpoints are available:

- `GET /api` - API information
- `GET /api/health` - Health check
- `POST /api/ingest` - Ingest markets/events
  ```json
  {
    "markets": true,
    "events": false,
    "limit": 100,
    "offset": 0
  }
  ```
- `POST /api/scan` - Scan markets
  ```json
  {
    "liquidity": 1000,
    "volume": 5000,
    "maxProb": 0.95,
    "minProb": 0.05
  }
  ```
- `GET /api/report?audit=true&positions=true&orders=true&stats=true` - Generate reports
- `GET /api/report?trail=<marketId>` - Get audit trail for a market

**Note**: SQLite database on Vercel is ephemeral (stored in `/tmp`). For persistent storage, consider using Vercel Postgres or another database service.

## Important Notes

⚠️ **Trading is NOT implemented** - This is a scaffold/stub system. The `ExecutionAgent` and `ExitAgent` contain stubs that log actions but do not execute actual trades. Implement trading logic carefully with proper testing and risk management.

⚠️ **Database on Vercel** - The SQLite database is stored in `/tmp` which is ephemeral. Each serverless function invocation may not have access to previous data. For production use, consider migrating to Vercel Postgres or another persistent database service.

## License

MIT
