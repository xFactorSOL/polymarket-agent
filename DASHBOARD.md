# Dashboard Setup

## Overview

The dashboard is built with Next.js and provides a web interface to:

- **Ingest Markets**: Run Gamma API ingestion from the UI
- **View Markets**: Browse cached markets
- **Scan Markets**: Run market scans with custom criteria
- **View Reports**: See system status, statistics, and audit information

## Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Run development server**:
   ```bash
   pnpm dev
   ```

3. **Build for production**:
   ```bash
   pnpm build
   pnpm start
   ```

## Pages

- `/` - Dashboard home with quick actions and system status
- `/ingest` - Market ingestion interface
- `/markets` - View cached markets
- `/scan` - Market scanning interface
- `/report` - System reports and statistics

## Vercel Deployment

The dashboard will automatically deploy to Vercel along with your API routes. Next.js pages are served at the root, and API routes remain in `/api/*`.

## Features

- Dark theme UI
- Real-time status checking
- Form-based command execution
- Results display with JSON viewer
- Navigation between pages
- Loading states and error handling

## API Integration

All dashboard pages call the existing API routes:
- `/api/health` - Health check
- `/api/ingest` - Market ingestion
- `/api/scan` - Market scanning
- `/api/report` - System reports
