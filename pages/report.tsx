import React, { useState } from 'react';
import Link from 'next/link';

export default function ReportPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/report?audit=true&positions=true&orders=true&stats=true');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch report');
      }

      setReport(data.report);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="container">
      <div className="header">
        <h1>Reports</h1>
        <nav>
          <Link href="/">Dashboard</Link>
          <Link href="/ingest">Ingest Markets</Link>
          <Link href="/markets">Markets</Link>
          <Link href="/scan">Scan</Link>
          <Link href="/report" className="active">
            Reports
          </Link>
        </nav>
      </div>

      <div className="card">
        <div className="flex-between">
          <h2>System Report</h2>
          <button className="button secondary" onClick={fetchReport} disabled={loading}>
            {loading ? <div className="loading" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> : 'Refresh'}
          </button>
        </div>

        {loading && (
          <div className="flex" style={{ justifyContent: 'center', padding: '2rem' }}>
            <div className="loading" />
          </div>
        )}

        {error && <div className="status error">{error}</div>}

        {report && (
          <div>
            {report.audit && (
              <div className="mt-2">
                <h3>Database Audit</h3>
                <div className="grid">
                  <div>
                    <strong>Markets:</strong> {report.audit.markets}
                  </div>
                  <div>
                    <strong>Events:</strong> {report.audit.events}
                  </div>
                  <div>
                    <strong>Orders:</strong> {report.audit.orders}
                  </div>
                  <div>
                    <strong>Positions:</strong> {report.audit.positions}
                  </div>
                </div>
                {report.audit.issues && report.audit.issues.length > 0 && (
                  <div className="status warning mt-2">
                    <strong>Issues:</strong>
                    <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
                      {report.audit.issues.map((issue: string, i: number) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {report.stats && (
              <div className="mt-2">
                <h3>Execution Statistics</h3>
                <div className="grid">
                  <div>
                    <strong>Total Orders:</strong> {report.stats.totalOrders}
                  </div>
                  <div>
                    <strong>Filled:</strong> {report.stats.filledOrders}
                  </div>
                  <div>
                    <strong>Cancelled:</strong> {report.stats.cancelledOrders}
                  </div>
                  <div>
                    <strong>Fill Rate:</strong> {(report.stats.fillRate * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            )}

            <div className="code mt-2">{JSON.stringify(report, null, 2)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
