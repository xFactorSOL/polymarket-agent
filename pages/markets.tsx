import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MarketsPage() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/markets?limit=100');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch markets');
      }

      setMarkets(data.markets || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Markets</h1>
        <nav>
          <Link href="/">Dashboard</Link>
          <Link href="/ingest">Ingest Markets</Link>
          <Link href="/markets" className="active">
            Markets
          </Link>
          <Link href="/scan">Scan</Link>
          <Link href="/report">Reports</Link>
        </nav>
      </div>

      <div className="card">
        <div className="flex-between">
          <h2>Cached Markets</h2>
          <button className="button secondary" onClick={fetchMarkets}>
            Refresh
          </button>
        </div>

        {loading && (
          <div className="flex" style={{ justifyContent: 'center', padding: '2rem' }}>
            <div className="loading" />
          </div>
        )}

        {error && <div className="status error">{error}</div>}

        {!loading && !error && markets.length === 0 && (
          <p>No markets found. Run ingestion first.</p>
        )}

        {markets.length > 0 && (
          <div>
            <p style={{ marginBottom: '1rem', color: '#aaa' }}>
              Showing {markets.length} markets
            </p>
            <div className="table">
              <table>
                <thead>
                  <tr>
                    <th>Market ID</th>
                    <th>Question</th>
                    <th>Slug</th>
                    <th>Status</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {markets.map((market: any) => (
                    <tr key={market.marketId}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {market.marketId.slice(0, 8)}...
                      </td>
                      <td>{market.question}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {market.slug}
                      </td>
                      <td>
                        {market.isActive === 1 ? (
                          <span className="status success">Active</span>
                        ) : (
                          <span className="status">Inactive</span>
                        )}
                        {market.isClosed === 1 && (
                          <span className="status" style={{ marginLeft: '0.5rem' }}>Closed</span>
                        )}
                      </td>
                      <td>{market.endDate || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
