import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import ConfirmModal from '../common/ConfirmModal';

export default function Orders() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ table: '', customer: '', menuId: '', qty: 1 });

  const load = () => {
    const p1 = api.get('/orders').then(r => setOrders(r.data)).catch(() => { });
    const p2 = api.get('/menu').then(r => setMenu(r.data)).catch(() => { });
    return Promise.all([p1, p2]).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openModal = () => {
    setOrderItems([]);
    setGrandTotal(0);
    setForm({ table: '', customer: '', menuId: menu[0]?._id || '', qty: 1 });
    setShowModal(true);
  };

  const addItem = () => {
    const mi = menu.find(m => m._id === form.menuId);
    if (!mi) return;
    const qty = parseInt(form.qty) || 1;
    setOrderItems(prev => {
      const existing = prev.find(i => i.menu_id === mi._id);
      if (existing) return prev.map(i => i.menu_id === mi._id ? { ...i, qty: i.qty + qty, total: parseFloat(((i.qty + qty) * i.price).toFixed(2)) } : i);
      return [...prev, { menu_id: mi._id, name: mi.name, price: mi.price, qty, total: parseFloat((mi.price * qty).toFixed(2)) }];
    });
    // Accumulate and round to avoid floating-point drift
    setGrandTotal(prev => parseFloat((prev + mi.price * qty).toFixed(2)));
  };

  const removeItem = (menu_id) => {
    const item = orderItems.find(i => i.menu_id === menu_id);
    if (item) setGrandTotal(prev => parseFloat((prev - item.total).toFixed(2)));
    setOrderItems(prev => prev.filter(i => i.menu_id !== menu_id));
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (!form.table) { addToast('Table number is required', 'error'); return; }
    if (orderItems.length === 0) { addToast('Add at least one item', 'error'); return; }
    try {
      await api.post('/orders', {
        table_number: form.table,
        customer_name: form.customer || 'Guest',
        items: orderItems.map(i => ({ menu_id: i.menu_id, quantity: i.qty })),
      });
      addToast('Order placed successfully!');
      setShowModal(false);
      load();
    } catch (err) { addToast(err.response?.data?.error || 'Failed to place order', 'error'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      addToast('Status updated!');
    } catch { addToast('Update failed', 'error'); }
  };

  const deleteOrder = async (id) => {
    try {
      await api.delete(`/orders/${id}`);
      setOrders(prev => prev.filter(o => o._id !== id));
      addToast('Order deleted');
    } catch { addToast('Delete failed', 'error'); }
  };

  const exportCSV = () => {
    const rows = [
      ['ID', 'Table', 'Customer', 'Total', 'Status', 'Date'],
      ...filtered.map(o => [o._id.slice(-6), o.table_number, o.customer_name, o.total, o.status, new Date(o.createdAt).toLocaleDateString()]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'Orders.csv';
    a.click();
  };

  const filtered = orders.filter(o =>
    o._id.includes(search) ||
    String(o.table_number).includes(search) ||
    o.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  const STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

  return (
    <section className="view active">
      <div className="section">
        <div className="view-header">
          <div>
            <h2>Manage Orders</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Track and update customer orders in real-time</p>
          </div>
          <button className="btn-primary" onClick={openModal}><i className="fas fa-plus" /> New Order</button>
        </div>

        <div className="view-actions">
          <div className="search-box">
            <i className="fas fa-search" />
            <input placeholder="Search by ID, Table or Customer…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn-secondary" onClick={exportCSV}><i className="fas fa-download" /> Export</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <i className="fas fa-receipt" style={{ fontSize: 28, marginBottom: 10, display: 'block', color: 'var(--primary)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <p>Loading orders…</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Table</th><th>Customer</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No orders found</td></tr>
                ) : filtered.map(o => (
                  <tr key={o._id}>
                    <td><span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>#{o._id.slice(-6)}</span></td>
                    <td><span className="table-badge">Table {o.table_number}</span></td>
                    <td>{o.customer_name}</td>
                    <td style={{ fontWeight: 700 }}>₹{o.total}</td>
                    <td>
                      <select value={o.status} className={`badge ${o.status}`}
                        style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                        onChange={e => updateStatus(o._id, e.target.value)}>
                        {STATUSES.map(s => <option key={s} value={s} style={{ background: '#0f172a', color: '#fff' }}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      {o.payment_status === 'paid' ? (
                        <span className="badge completed" style={{ fontSize: 11 }}>
                          <i className="fas fa-check-circle" style={{ marginRight: 4 }} />
                          Paid{o.payment_method ? ` (${o.payment_method})` : ''}
                        </span>
                      ) : o.payment_status === 'refunded' ? (
                        <span className="badge" style={{ background: 'rgba(139,92,246,0.2)', color: '#8b5cf6', fontSize: 11 }}>Refunded</span>
                      ) : (
                        <span className="badge pending" style={{ fontSize: 11 }}>Unpaid</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-group">
                        <button className="btn-icon btn-del" title="Delete" onClick={() => setConfirmDel(o._id)}><i className="fas fa-trash" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Order Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Order" icon="fa-cart-plus" size="large">
        <form onSubmit={submitOrder}>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Table Number</label>
              <input type="number" placeholder="e.g. 5" min="1" value={form.table} onChange={e => setForm(p => ({ ...p, table: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ flex: 2 }}>
              <label>Customer Name</label>
              <input type="text" placeholder="Optional guest name" value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))} />
            </div>
          </div>
          <div className="order-builder">
            <label style={{ display: 'block', marginBottom: 12, fontWeight: 600 }}>Add Items</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={form.menuId} onChange={e => setForm(p => ({ ...p, menuId: e.target.value }))} style={{ flex: 1, minWidth: 200 }}>
                {menu.map(m => <option key={m._id} value={m._id}>{m.name} — ₹{m.price}</option>)}
              </select>
              <input type="number" placeholder="Qty" min="1" value={form.qty} onChange={e => setForm(p => ({ ...p, qty: e.target.value }))} style={{ width: 80 }} />
              <button type="button" className="btn-primary" onClick={addItem} style={{ padding: '12px 20px' }}><i className="fas fa-plus" /></button>
            </div>
          </div>
          <div className="table-wrap" style={{ maxHeight: 240, overflowY: 'auto', marginBottom: 24 }}>
            <table>
              <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th><th /></tr></thead>
              <tbody>
                {orderItems.map(i => (
                  <tr key={i.menu_id}>
                    <td>{i.name}</td>
                    <td><span className="qty-badge">{i.qty}</span></td>
                    <td>₹{i.price}</td>
                    <td style={{ fontWeight: 700 }}>₹{i.total.toFixed(2)}</td>
                    <td><button type="button" className="btn-icon btn-del" onClick={() => removeItem(i.menu_id)}><i className="fas fa-times" /></button></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <th colSpan={3}>Grand Total</th>
                  <th>₹{grandTotal.toFixed(2)}</th>
                  <th />
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Discard</button>
            <button type="submit" className="btn-primary">Place Order</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!confirmDel} onClose={() => setConfirmDel(null)}
        onConfirm={() => deleteOrder(confirmDel)}
        title="Delete Order" message="This order will be permanently removed. This action cannot be undone."
        confirmLabel="Delete Order"
      />
    </section>
  );
}
