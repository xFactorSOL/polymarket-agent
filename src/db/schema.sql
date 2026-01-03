-- Polymarket Agent Database Schema

-- Markets table - stores market metadata from Gamma API
CREATE TABLE IF NOT EXISTS markets (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    question TEXT NOT NULL,
    description TEXT,
    end_date_iso TEXT,
    image TEXT,
    icon TEXT,
    active INTEGER DEFAULT 1,
    liquidity TEXT,
    volume TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Events table - stores event metadata from Gamma API
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT,
    icon TEXT,
    active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Event markets junction table
CREATE TABLE IF NOT EXISTS event_markets (
    event_id TEXT NOT NULL,
    market_id TEXT NOT NULL,
    PRIMARY KEY (event_id, market_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (market_id) REFERENCES markets(id) ON DELETE CASCADE
);

-- Orders table - tracks orders placed via CLOB API
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    market_id TEXT NOT NULL,
    outcome TEXT NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
    price TEXT NOT NULL,
    size TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'OPEN', 'FILLED', 'CANCELLED', 'REJECTED')),
    clob_order_id TEXT,
    filled_size TEXT DEFAULT '0',
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (market_id) REFERENCES markets(id)
);

-- Positions table - tracks current positions
CREATE TABLE IF NOT EXISTS positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    market_id TEXT NOT NULL,
    outcome TEXT NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('YES', 'NO')),
    size TEXT NOT NULL,
    avg_price TEXT NOT NULL,
    current_price TEXT,
    unrealized_pnl TEXT DEFAULT '0',
    realized_pnl TEXT DEFAULT '0',
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'CLOSED')),
    opened_at INTEGER DEFAULT (strftime('%s', 'now')),
    closed_at INTEGER,
    FOREIGN KEY (market_id) REFERENCES markets(id)
);

-- Agent logs table - tracks agent actions and decisions
CREATE TABLE IF NOT EXISTS agent_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name TEXT NOT NULL,
    action TEXT NOT NULL,
    market_id TEXT,
    details TEXT, -- JSON string
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (market_id) REFERENCES markets(id)
);

-- Scans table - tracks market scan results
CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_type TEXT NOT NULL,
    markets_scanned INTEGER DEFAULT 0,
    markets_filtered INTEGER DEFAULT 0,
    results TEXT, -- JSON string
    started_at INTEGER DEFAULT (strftime('%s', 'now')),
    completed_at INTEGER
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_markets_active ON markets(active);
CREATE INDEX IF NOT EXISTS idx_markets_slug ON markets(slug);
CREATE INDEX IF NOT EXISTS idx_orders_market_id ON orders(market_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_positions_market_id ON positions(market_id);
CREATE INDEX IF NOT EXISTS idx_positions_status ON positions(status);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_name ON agent_logs(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON agent_logs(created_at);
