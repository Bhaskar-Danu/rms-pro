import { useEffect, useState } from 'react';
import api from '../../api/axios';

const MAX_TABLES = 12;

export default function Tables() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders?today=true').then(r => setOrders(r.data.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)))).catch(() => {});
  }, []);

  const tableMap = {};
  orders.forEach(o => { if (o.table_number) tableMap[o.table_number] = o; });

  return (
    <section className="view active">
      <div className="section">
        <div className="view-header">
          <div>
            <h2>Table Management</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Visual floor map and occupancy tracking</p>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--success)' }}></div>Available</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--danger)' }}></div>Occupied</div>
          </div>
        </div>

        <div className="tables-grid">
          {Array.from({ length: MAX_TABLES }, (_, i) => i + 1).map(tableNo => {
            const order = tableMap[tableNo];
            const occupied = !!order;
            return (
              <div key={tableNo} className={`table-card ${occupied ? 'occupied' : 'available'}`}>
                <span className="table-status-tag">{occupied ? 'Occupied' : 'Free'}</span>
                <h3>Table {tableNo}</h3>
                <div className="table-icon"><i className="fas fa-chair"></i></div>
                <div className="table-details">
                  {occupied ? (
                    <>
                      <span className="table-order-id">#{order._id.slice(-6)}</span>
                      <span className="table-total">₹{order.total}</span>
                      <span className={`badge ${order.status}`}>{order.status}</span>
                      <span className="table-time">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </>
                  ) : (
                    <span className="table-msg">Available</span>
                  )}
                </div>
                <div className="table-indicator"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
