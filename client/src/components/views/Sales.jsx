import { useEffect, useState, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import api from '../../api/axios';
Chart.register(...registerables);

export default function Sales() {
  const [data, setData] = useState({ daily: [], totalRevenue: 0 });
  const chartRef = useRef(null);
  const chartInst = useRef(null);

  useEffect(() => {
    api.get('/sales?days=30').then(r => {
      setData(r.data);
      if (!chartRef.current) return;
      if (chartInst.current) chartInst.current.destroy();
      chartInst.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: r.data.daily.map(d => d.date),
          datasets: [{
            label: 'Revenue (₹)', data: r.data.daily.map(d => d.total),
            borderColor: '#fb923c', backgroundColor: 'rgba(251,146,60,0.1)',
            borderWidth: 2, tension: 0.4, fill: true, pointBackgroundColor: '#fb923c',
          }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } } } },
      });
    }).catch(() => {});
    return () => { if (chartInst.current) chartInst.current.destroy(); };
  }, []);

  const exportCSV = () => {
    const rows = [['Date','Revenue','Orders'], ...data.daily.map(d => [d.date, d.total, d.orders])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'Sales_Report.csv'; a.click();
  };

  return (
    <section className="view active">
      <div className="section">
        <div className="view-header">
          <div><h2>Sales Intelligence</h2><p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Analyze revenue trends and growth patterns (last 30 days)</p></div>
          <button className="btn-secondary" onClick={exportCSV}><i className="fas fa-download"></i> Export CSV</button>
        </div>
        <div className="sales-grid">
          <div className="stat-box large" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-coins" style={{ fontSize: 36, color: 'var(--primary)' }}></i>
            <p>Total Revenue</p>
            <h3>₹{data.totalRevenue}</h3>
          </div>
          <div className="chart-card"><canvas ref={chartRef}></canvas></div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Revenue</th><th>Orders</th></tr></thead>
            <tbody>
              {data.daily.length === 0 ? <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No sales data yet</td></tr>
              : data.daily.slice().reverse().map((d, i) => (
                <tr key={i}><td>{d.date}</td><td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{d.total}</td><td>{d.orders}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
