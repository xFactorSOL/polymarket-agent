import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <div className="container">
      <div className="header">
        <h1>Polymarket Agent Dashboard</h1>
        <nav>
          <Link href="/" className="active">
            Dashboard
          </Link>
          <Link href="/ingest">Ingest Markets</Link>
          <Link href="/markets">Markets</Link>
          <Link href="/scan">Scan</Link>
          <Link href="/report">Reports</Link>
        </nav>
      </div>

      <div className="card">
        <h2>Welcome</h2>
        <p>Manage your Polymarket trading agent from this dashboard.</p>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Quick Actions</h3>
          <div className="flex" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
            <button
              className="button"
              onClick={() => router.push('/ingest')}
            >
              Ingest Markets
            </button>
            <button
              className="button secondary"
              onClick={() => router.push('/scan')}
            >
              Scan Markets
            </button>
            <button
              className="button secondary"
              onClick={() => router.push('/report')}
            >
              View Reports
            </button>
          </div>
        </div>

        <div className="card">
          <h3>System Status</h3>
          <StatusCheck />
        </div>
      </div>
    </div>
  );
}

function StatusCheck() {
  const [status, setStatus] = useState<'loading' | 'healthy' | 'unhealthy'>('loading');
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setStatus(data.status === 'healthy' ? 'healthy' : 'unhealthy');
      if (data.error) {
        setError(data.error);
      }
    } catch (err: any) {
      setStatus('unhealthy');
      setError(err.message);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div>
      <div className="flex-between">
        <span>API Health:</span>
        {status === 'loading' && <div className="loading" />}
        {status === 'healthy' && (
          <span className="status success">Healthy</span>
        )}
        {status === 'unhealthy' && (
          <span className="status error">Unhealthy</span>
        )}
      </div>
      {error && (
        <div className="status warning mt-2" style={{ fontSize: '0.75rem' }}>
          {error}
        </div>
      )}
      <button
        className="button secondary mt-2"
        onClick={checkHealth}
        style={{ width: '100%' }}
      >
        Refresh Status
      </button>
    </div>
  );
}
