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
      const response = await fetch('/api/report?positions=false&orders=false&stats=false');
      const data = await response.json();
      
      if (data.report?.audit) {
        // For now, just show the audit info
        // TODO: Add markets endpoint to API
        setMarkets([]);
      }
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
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Question</th>
                  <th>Slug</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {markets.map((market) => (
                  <tr key={market.id}>
                    <td>{market.id}</td>
                    <td>{market.question}</td>
                    <td>{market.slug}</td>
                    <td>
                      {market.isActive ? (
                        <span className="status success">Active</span>
                      ) : (
                        <span className="status">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
