import { useEffect, useState, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import api from '../../api/axios';
Chart.register(...registerables);

export default function Dashboard() {
  const [stats, setStats] = useState({ ordersToday: 0, activeStaff: 0, dailyRevenue: 0, menuItems: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/stats').then(r => setStats(r.data)).catch(() => { }),
      api.get('/orders?today=true').then(r => setOrders(r.data)).catch(() => { }),
    ]).finally(() => setLoading(false));

    api.get('/sales?days=7').then(r => {
      const canvas = chartRef.current;
      if (!canvas) return;
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new Chart(canvas, {
        type: 'line',
        data: {
          labels: r.data.daily.map(d => d.date),
          datasets: [{
            label: 'Revenue (₹)',
            data: r.data.daily.map(d => d.total),
            borderColor: '#fb923c',
            backgroundColor: 'rgba(251,146,60,0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#fb923c',
          }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } } } },
      });
    }).catch(() => { });
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, []);

  const statBoxes = [
    { icon: 'fa-shopping-cart', label: 'Orders Today', value: stats.ordersToday },
    { icon: 'fa-user-check', label: 'Active Staff', value: stats.activeStaff },
    { icon: 'fa-coins', label: 'Daily Revenue', value: `₹${stats.dailyRevenue}` },
    { icon: 'fa-utensils', label: 'Menu Items', value: stats.menuItems },
  ];

  if (loading) {
    return (
      <section className="view active">
        <div className="section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'center' }}>
              <i className="fas fa-chart-pie" style={{ fontSize: 32, color: 'var(--primary)', marginBottom: 12, display: 'block', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <p>Loading dashboard…</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="view active">
      <div className="section">
        <div className="view-header">
          <div>
            <h2>Live Overview</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Real-time restaurant performance metrics</p>
          </div>
        </div>

        <div className="stats">
          {statBoxes.map(s => (
            <div className="stat-box" key={s.label}>
              <i className={`fas ${s.icon}`} style={{ fontSize: 24, color: 'var(--primary)', marginBottom: 10 }}></i>
              <p>{s.label}</p>
              <h3>{s.value}</h3>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <h3><i className="fas fa-chart-line"></i> 7-Day Sales</h3>
            <div className="chart-card"><canvas ref={chartRef}></canvas></div>
          </div>
          <div className="card">
            <h3><i className="fas fa-history"></i> Recent Orders</h3>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {orders.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No orders today</p> : orders.slice(0, 6).map(o => (
                <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', marginRight: 10 }}>#{o._id.slice(-6)}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Table {o.table_number}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700 }}>₹{o.total}</span>
                    <span className={`badge ${o.status}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
