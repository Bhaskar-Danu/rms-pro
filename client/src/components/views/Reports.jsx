import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import api from '../../api/axios';
Chart.register(...registerables);

export default function Reports() {
  const topRef = useRef(null);
  const catRef = useRef(null);
  const peakRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Store instances so we can destroy on cleanup — critical to avoid canvas reuse errors
  const topInst = useRef(null);
  const catInst = useRef(null);
  const peakInst = useRef(null);

  const formatHour = (h) => {
    const hr = parseInt(h);
    if (hr === 0) return '12 AM';
    if (hr < 12) return `${hr} AM`;
    if (hr === 12) return '12 PM';
    return `${hr - 12} PM`;
  };

  useEffect(() => {
    let cancelled = false;

    const buildCharts = async () => {
      try {
        setLoading(true);
        const [topRes, catRes, peakRes] = await Promise.all([
          api.get('/reports/top-items'),
          api.get('/reports/categories'),
          api.get('/reports/peak-hours'),
        ]);

        if (cancelled) return; // Component unmounted before responses arrived

        // — Top Items Bar Chart ——
        if (topRef.current) {
          if (topInst.current) topInst.current.destroy();
          topInst.current = new Chart(topRef.current, {
            type: 'bar',
            data: {
              labels: topRes.data.map(i => i.name),
              datasets: [{
                label: 'Units Sold',
                data: topRes.data.map(i => i.total_sold),
                backgroundColor: 'rgba(251,146,60,0.7)',
                borderColor: '#fb923c',
                borderWidth: 2,
                borderRadius: 6,
              }],
            },
            options: {
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
              },
            },
          });
        }

        // — Category Doughnut Chart ——
        if (catRef.current) {
          if (catInst.current) catInst.current.destroy();
          catInst.current = new Chart(catRef.current, {
            type: 'doughnut',
            data: {
              labels: catRes.data.map(c => c.category),
              datasets: [{
                data: catRes.data.map(c => c.revenue),
                backgroundColor: ['#fb923c', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'],
              }],
            },
            options: {
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12 } } },
            },
          });
        }

        // — Peak Hours Bar Chart ——
        if (peakRef.current) {
          if (peakInst.current) peakInst.current.destroy();
          peakInst.current = new Chart(peakRef.current, {
            type: 'bar',
            data: {
              labels: peakRes.data.map(d => formatHour(d.hour)),
              datasets: [{
                label: 'Orders',
                data: peakRes.data.map(d => d.order_count),
                backgroundColor: 'rgba(59,130,246,0.7)',
                borderColor: '#3b82f6',
                borderWidth: 2,
                borderRadius: 6,
              }],
            },
            options: {
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
              },
            },
          });
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load report data. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    buildCharts();

    // Cleanup: destroy all chart instances when component unmounts
    return () => {
      cancelled = true;
      if (topInst.current) { topInst.current.destroy(); topInst.current = null; }
      if (catInst.current) { catInst.current.destroy(); catInst.current = null; }
      if (peakInst.current) { peakInst.current.destroy(); peakInst.current = null; }
    };
  }, []);

  return (
    <section className="view active">
      <div className="section">
        <div className="view-header">
          <div>
            <h2>Business Reports</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Deep analytics and performance insights</p>
          </div>
        </div>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'center' }}>
              <i className="fas fa-chart-bar" style={{
                fontSize: 32, color: 'var(--primary)', marginBottom: 12, display: 'block',
                animation: 'pulse 1.5s ease-in-out infinite'
              }} />
              <p>Loading analytics…</p>
            </div>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', color: 'var(--danger)', padding: 40 }}>
            <i className="fas fa-circle-exclamation" style={{ fontSize: 28, marginBottom: 10, display: 'block' }} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="reports-grid">
            <div className="card">
              <h3><i className="fas fa-trophy" /> Top Selling Items</h3>
              <div className="chart-card" style={{ height: 300 }}><canvas ref={topRef} /></div>
            </div>
            <div className="card">
              <h3><i className="fas fa-tags" /> Revenue by Category</h3>
              <div className="chart-card" style={{ height: 300 }}><canvas ref={catRef} /></div>
            </div>
            <div className="card reports-full-width">
              <h3><i className="fas fa-clock" /> Peak Hours Analysis</h3>
              <div className="chart-card" style={{ height: 300 }}><canvas ref={peakRef} /></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
