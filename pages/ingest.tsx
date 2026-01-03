import React, { useState } from 'react';
import Link from 'next/link';

export default function IngestPage() {
  const [sinceDays, setSinceDays] = useState('30');
  const [limit, setLimit] = useState('100');
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIngest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markets: true,
          limit: parseInt(limit),
          sinceDays: parseInt(sinceDays),
          active: active || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ingestion failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Ingest Markets</h1>
        <nav>
          <Link href="/">Dashboard</Link>
          <Link href="/ingest" className="active">
            Ingest Markets
          </Link>
          <Link href="/markets">Markets</Link>
          <Link href="/scan">Scan</Link>
          <Link href="/report">Reports</Link>
        </nav>
      </div>

      <div className="card">
        <h2>Gamma API Ingestion</h2>
        <p>Fetch and store markets from Polymarket's Gamma API.</p>

        <div style={{ marginTop: '2rem' }}>
          <label className="label">Days to look back (sinceDays)</label>
          <input
            type="number"
            className="input"
            value={sinceDays}
            onChange={(e) => setSinceDays((e.target as HTMLInputElement).value)}
            min="1"
            max="365"
          />

          <label className="label">Batch limit</label>
          <input
            type="number"
            className="input"
            value={limit}
            onChange={(e) => setLimit((e.target as HTMLInputElement).value)}
            min="1"
            max="1000"
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Only active markets
          </label>

          <button
            className="button mt-2"
            onClick={handleIngest}
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? (
              <span className="flex" style={{ justifyContent: 'center', gap: '0.5rem' }}>
                <div className="loading" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                Ingesting...
              </span>
            ) : (
              'Start Ingestion'
            )}
          </button>
        </div>

        {error && (
          <div className="status error mt-2">{error}</div>
        )}

        {result && (
          <div className="mt-2">
            <div className="status success">
              Ingestion completed successfully!
            </div>
            <div className="code mt-2">{JSON.stringify(result, null, 2)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
