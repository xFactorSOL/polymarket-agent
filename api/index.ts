import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  response.status(200).json({
    message: 'Polymarket Agent API',
    version: '1.0.0',
    endpoints: {
      ingest: '/api/ingest',
      scan: '/api/scan',
      report: '/api/report',
      health: '/api/health',
    },
  });
}
