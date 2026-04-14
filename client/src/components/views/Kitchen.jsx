import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';

export default function Kitchen() {
  const [orders, setOrders] = useState([]);

  const load = useCallback(() => {
    api.get('/orders').then(r => setOrders(r.data.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)))).catch(() => {});
  }, []);

  useEffect(() => { load(); const interval = setInterval(load, 15000); return () => clearInterval(interval); }, [load]);

  const advance = async (order) => {
    const NEXT = { pending: 'preparing', preparing: 'ready', ready: 'completed' };
    const next = NEXT[order.status];
    if (!next) return;
    await api.put(`/orders/${order._id}/status`, { status: next });
    load();
  };

  const COLS = [
    { status: 'pending',   icon: 'fa-clock',       label: 'Pending',   btnLabel: 'Start Preparing', btnClass: 'btn-secondary' },
    { status: 'preparing', icon: 'fa-fire',         label: 'Preparing', btnLabel: 'Mark Ready',      btnClass: 'btn-primary' },
    { status: 'ready',     icon: 'fa-check-double', label: 'Ready',     btnLabel: 'Complete',        btnClass: 'btn-success' },
  ];

  const elapsed = (createdAt) => {
    const mins = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    return mins < 1 ? 'Just now' : `${mins}m ago`;
  };

  return (
    <section className="view active">
      <div className="section">
        <div className="view-header">
          <div>
            <h2>Kitchen Display System</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Live order processing and preparation</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <span className="badge pending">{orders.filter(o => o.status === 'pending').length} Pending</span>
            <span className="badge preparing">{orders.filter(o => o.status === 'preparing').length} Preparing</span>
          </div>
        </div>

        <div className="kds-columns">
          {COLS.map(col => (
            <div className="kds-column" key={col.status}>
              <h3><i className={`fas ${col.icon}`}></i> {col.label}</h3>
              <div className="kds-list">
                {orders.filter(o => o.status === col.status).length === 0
                  ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No orders</p>
                  : orders.filter(o => o.status === col.status).map(o => (
                    <div className="kds-card" key={o._id}>
                      <div className="kds-header">
                        <span className="kds-order-no">#{o._id.slice(-6)}</span>
                        <span className="kds-table">Table {o.table_number}</span>
                        <span className="kds-time">{elapsed(o.createdAt)}</span>
                      </div>
                      <div className="kds-customer">{o.customer_name}</div>
                      <ul className="kds-items">
                        {o.items.map((it, i) => (
                          <li key={i}><span className="item-qty">×{it.quantity}</span><span className="item-name">{it.name}</span></li>
                        ))}
                      </ul>
                      <button className={`kds-btn ${col.btnClass}`} onClick={() => advance(o)}>{col.btnLabel}</button>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
