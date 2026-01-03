import React, { useState } from 'react';
import Link from 'next/link';

export default function ScanPage() {
  const [liquidity, setLiquidity] = useState('1000');
  const [volume, setVolume] = useState('5000');
  const [minProb, setMinProb] = useState('0.05');
  const [maxProb, setMaxProb] = useState('0.95');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liquidity: parseFloat(liquidity),
          volume: parseFloat(volume),
          minProb: parseFloat(minProb),
          maxProb: parseFloat(maxProb),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Scan failed');
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
        <h1>Scan Markets</h1>
        <nav>
          <Link href="/">Dashboard</Link>
          <Link href="/ingest">Ingest Markets</Link>
          <Link href="/markets">Markets</Link>
          <Link href="/scan" className="active">
            Scan
          </Link>
          <Link href="/report">Reports</Link>
        </nav>
      </div>

      <div className="card">
        <h2>Market Scanner</h2>
        <p>Scan markets using EV filter criteria.</p>

        <div style={{ marginTop: '2rem' }}>
          <label className="label">Minimum Liquidity</label>
          <input
            type="number"
            className="input"
            value={liquidity}
            onChange={(e) => setLiquidity(e.target.value)}
            min="0"
            step="100"
          />

          <label className="label">Minimum Volume</label>
          <input
            type="number"
            className="input"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            min="0"
            step="100"
          />

          <label className="label">Min Probability</label>
          <input
            type="number"
            className="input"
            value={minProb}
            onChange={(e) => setMinProb(e.target.value)}
            min="0"
            max="1"
            step="0.01"
          />

          <label className="label">Max Probability</label>
          <input
            type="number"
            className="input"
            value={maxProb}
            onChange={(e) => setMaxProb(e.target.value)}
            min="0"
            max="1"
            step="0.01"
          />

          <button
            className="button mt-2"
            onClick={handleScan}
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? (
              <span className="flex" style={{ justifyContent: 'center', gap: '0.5rem' }}>
                <div className="loading" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                Scanning...
              </span>
            ) : (
              'Start Scan'
            )}
          </button>
        </div>

        {error && (
          <div className="status error mt-2">{error}</div>
        )}

        {result && (
          <div className="mt-2">
            <div className="status success">
              Found {result.count || 0} markets matching criteria
            </div>
            {result.markets && result.markets.length > 0 && (
              <div className="table">
                <table>
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Slug</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.markets.map((market: any, i: number) => (
                      <tr key={i}>
                        <td>{market.question}</td>
                        <td>{market.slug}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="code mt-2">{JSON.stringify(result, null, 2)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
