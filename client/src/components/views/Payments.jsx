import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';

const METHOD_ICONS = { cash: 'fa-money-bill-wave', card: 'fa-credit-card', upi: 'fa-mobile-screen', online: 'fa-globe' };
const METHOD_LABELS = { cash: 'Cash', card: 'Card', upi: 'UPI', online: 'Online (Razorpay)' };
const STATUS_COLORS = { completed: '#22c55e', pending: '#f59e0b', failed: '#ef4444', refunded: '#8b5cf6' };

export default function Payments() {
  const { addToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showPay, setShowPay] = useState(false);
  const [confirmRefund, setConfirmRefund] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Payment form state
  const [payMethod, setPayMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const load = async () => {
    try {
      const [pRes, oRes, sRes] = await Promise.all([
        api.get('/payments'),
        api.get('/orders'),
        api.get('/payments/stats'),
      ]);
      setPayments(pRes.data);
      setOrders(oRes.data);
      setStats(sRes.data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Unpaid orders for the payment modal
  const unpaidOrders = orders.filter(o => o.payment_status !== 'paid' && o.status !== 'cancelled');

  const openPayModal = (order = null) => {
    setSelectedOrder(order);
    setPayMethod('cash');
    setCashReceived('');
    setReferenceNo('');
    setPayNotes('');
    setShowPay(true);
  };

  const handleOfflinePayment = async (e) => {
    e.preventDefault();
    if (!selectedOrder) { addToast('Please select an order', 'error'); return; }
    try {
      const res = await api.post('/payments/offline', {
        order_id: selectedOrder._id,
        method: payMethod,
        received_amount: payMethod === 'cash' ? parseFloat(cashReceived) : selectedOrder.total,
        reference_number: referenceNo,
        notes: payNotes,
      });
      addToast(`Payment received! ${res.data.change > 0 ? `Change: ₹${res.data.change}` : ''}`);
      setShowPay(false);
      load();
    } catch (err) {
      addToast(err.response?.data?.error || 'Payment failed', 'error');
    }
  };

  const handleOnlinePayment = async () => {
    if (!selectedOrder) return;
    try {
      const { data } = await api.post('/payments/online/create', { order_id: selectedOrder._id });

      if (data.demo) {
        // Demo mode — simulate success
        await api.post('/payments/online/verify', {
          payment_id: data.payment_id,
          gateway_payment_id: 'demo_pay_' + Date.now(),
          gateway_order_id: data.gateway_order_id,
          gateway_signature: 'demo_sig',
        });
        addToast('Online payment successful (Demo Mode)!');
        setShowPay(false);
        load();
        return;
      }

      // Real Razorpay checkout
      const options = {
        key: data.key,
        amount: Math.round(data.amount * 100),
        currency: data.currency,
        name: 'RMS Pro',
        description: `Order for Table ${selectedOrder.table_number}`,
        order_id: data.gateway_order_id,
        handler: async function (response) {
          try {
            await api.post('/payments/online/verify', {
              payment_id: data.payment_id,
              gateway_payment_id: response.razorpay_payment_id,
              gateway_order_id: response.razorpay_order_id,
              gateway_signature: response.razorpay_signature,
            });
            addToast('Online payment verified successfully!');
            setShowPay(false);
            load();
          } catch (err) {
            addToast(err.response?.data?.error || 'Payment verification failed', 'error');
          }
        },
        prefill: { name: selectedOrder.customer_name },
        theme: { color: '#f97316' },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        addToast('Razorpay SDK not loaded. Please check your internet connection.', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to initiate online payment', 'error');
    }
  };

  const handleRefund = async (paymentId) => {
    try {
      await api.post(`/payments/${paymentId}/refund`);
      addToast('Payment refunded successfully');
      load();
    } catch (err) {
      addToast(err.response?.data?.error || 'Refund failed', 'error');
    }
  };

  const filtered = payments.filter(p =>
    p._id?.includes(search) ||
    p.method?.toLowerCase().includes(search.toLowerCase()) ||
    p.order?.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.status?.toLowerCase().includes(search.toLowerCase())
  );

  const changeAmount = payMethod === 'cash' && cashReceived && selectedOrder
    ? parseFloat((parseFloat(cashReceived) - selectedOrder.total).toFixed(2))
    : 0;

  return (
    <section className="view active">
      <div className="section">
        <div className="view-header">
          <div>
            <h2>Payments</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Process and track all payment transactions</p>
          </div>
          <button className="btn-primary" onClick={() => openPayModal(null)}>
            <i className="fas fa-cash-register" /> Collect Payment
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))', borderRadius: 12, padding: '20px 24px', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Total Revenue</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#22c55e' }}>₹{stats.totalRevenue?.toLocaleString()}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{stats.totalTransactions} transactions</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))', borderRadius: 12, padding: '20px 24px', border: '1px solid rgba(249,115,22,0.2)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Today's Revenue</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#f97316' }}>₹{stats.todayRevenue?.toLocaleString()}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{stats.todayTransactions} today</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))', borderRadius: 12, padding: '20px 24px', border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Cash</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#3b82f6' }}>₹{stats.byMethod?.cash?.toLocaleString() || 0}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{stats.countByMethod?.cash || 0} payments</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))', borderRadius: 12, padding: '20px 24px', border: '1px solid rgba(139,92,246,0.2)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Digital</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#8b5cf6' }}>₹{((stats.byMethod?.card || 0) + (stats.byMethod?.upi || 0) + (stats.byMethod?.online || 0)).toLocaleString()}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{(stats.countByMethod?.card || 0) + (stats.countByMethod?.upi || 0) + (stats.countByMethod?.online || 0)} payments</div>
            </div>
          </div>
        )}

        <div className="view-actions">
          <div className="search-box">
            <i className="fas fa-search" />
            <input placeholder="Search payments…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <i className="fas fa-spinner" style={{ fontSize: 28, marginBottom: 10, display: 'block', color: 'var(--primary)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <p>Loading payments…</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Order</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Processed By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No payments found</td></tr>
                ) : filtered.map(p => (
                  <tr key={p._id}>
                    <td><span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>#{p._id.slice(-6)}</span></td>
                    <td>
                      {p.order ? (
                        <span className="table-badge">Table {p.order.table_number} — {p.order.customer_name}</span>
                      ) : '—'}
                    </td>
                    <td style={{ fontWeight: 700, color: '#22c55e' }}>₹{p.amount}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                        <i className={`fas ${METHOD_ICONS[p.method]}`} style={{ color: 'var(--primary)' }} />
                        {METHOD_LABELS[p.method]}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.status}`} style={{ background: STATUS_COLORS[p.status] + '22', color: STATUS_COLORS[p.status], border: `1px solid ${STATUS_COLORS[p.status]}44` }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{p.processed_by}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(p.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="action-group">
                        {p.status === 'completed' && (
                          <button className="btn-icon btn-del" title="Refund" onClick={() => setConfirmRefund(p._id)}>
                            <i className="fas fa-rotate-left" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Collect Payment Modal */}
      <Modal isOpen={showPay} onClose={() => setShowPay(false)} title="Collect Payment" icon="fa-cash-register" size="large">
        <div style={{ marginBottom: 20 }}>
          {/* Order Selection */}
          {!selectedOrder ? (
            <div className="form-group">
              <label>Select Unpaid Order</label>
              {unpaidOrders.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', padding: 20, textAlign: 'center' }}>No unpaid orders available</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                  {unpaidOrders.map(o => (
                    <button
                      key={o._id}
                      type="button"
                      onClick={() => setSelectedOrder(o)}
                      style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10, padding: '14px 18px', cursor: 'pointer', textAlign: 'left',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        transition: 'all 0.2s', color: 'var(--text)',
                      }}
                      onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                    >
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>
                          <i className="fas fa-receipt" style={{ color: 'var(--primary)', marginRight: 8 }} />
                          Table {o.table_number} — {o.customer_name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          #{o._id.slice(-6)} • {o.items?.length || 0} items • {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>₹{o.total}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Selected Order Summary */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(249,115,22,0.04))',
                border: '1px solid rgba(249,115,22,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 20,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>
                      <i className="fas fa-receipt" style={{ color: 'var(--primary)', marginRight: 8 }} />
                      Table {selectedOrder.table_number} — {selectedOrder.customer_name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Order #{selectedOrder._id.slice(-6)} • {selectedOrder.items?.length || 0} items
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>₹{selectedOrder.total}</div>
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedOrder(null)} style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, padding: 0,
                }}>
                  <i className="fas fa-arrow-left" /> Choose different order
                </button>
              </div>

              {/* Payment Method Selector */}
              <div className="form-group">
                <label style={{ marginBottom: 12, display: 'block', fontWeight: 600 }}>Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {[
                    { id: 'cash', icon: 'fa-money-bill-wave', label: 'Cash', color: '#22c55e' },
                    { id: 'card', icon: 'fa-credit-card', label: 'Card', color: '#3b82f6' },
                    { id: 'upi', icon: 'fa-mobile-screen', label: 'UPI', color: '#8b5cf6' },
                    { id: 'online', icon: 'fa-globe', label: 'Online (Razorpay)', color: '#f97316' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayMethod(m.id)}
                      style={{
                        background: payMethod === m.id ? m.color + '22' : 'rgba(255,255,255,0.03)',
                        border: `2px solid ${payMethod === m.id ? m.color : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: 12, padding: '16px 12px', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        transition: 'all 0.2s', color: payMethod === m.id ? m.color : 'var(--text-muted)',
                      }}
                    >
                      <i className={`fas ${m.icon}`} style={{ fontSize: 24 }} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash-specific fields */}
              {payMethod === 'cash' && (
                <div className="form-row" style={{ marginTop: 16 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Amount Received (₹)</label>
                    <input
                      type="number" placeholder={`Min ₹${selectedOrder.total}`} step="0.01"
                      value={cashReceived} onChange={e => setCashReceived(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Change to Return</label>
                    <div style={{
                      padding: '14px 18px', background: changeAmount > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                      borderRadius: 10, fontSize: 20, fontWeight: 800,
                      color: changeAmount > 0 ? '#22c55e' : changeAmount < 0 ? '#ef4444' : 'var(--text-muted)',
                      border: `1px solid ${changeAmount >= 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    }}>
                      ₹{changeAmount >= 0 ? changeAmount.toFixed(2) : '—'}
                      {changeAmount < 0 && <span style={{ fontSize: 12, marginLeft: 8 }}>Insufficient</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Card / UPI reference */}
              {(payMethod === 'card' || payMethod === 'upi') && (
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label>{payMethod === 'card' ? 'Card Last 4 Digits / Transaction ID' : 'UPI Reference Number'}</label>
                  <input
                    type="text" placeholder={payMethod === 'card' ? 'e.g. 4582 or TXN123456' : 'e.g. 123456789012'}
                    value={referenceNo} onChange={e => setReferenceNo(e.target.value)}
                  />
                </div>
              )}

              {/* Notes */}
              <div className="form-group" style={{ marginTop: 16 }}>
                <label>Notes (Optional)</label>
                <input type="text" placeholder="Any special notes…" value={payNotes} onChange={e => setPayNotes(e.target.value)} />
              </div>

              {/* Actions */}
              <div className="modal-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowPay(false)}>Cancel</button>
                {payMethod === 'online' ? (
                  <button type="button" className="btn-primary" onClick={handleOnlinePayment}
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                    <i className="fas fa-globe" /> Pay Online — ₹{selectedOrder.total}
                  </button>
                ) : (
                  <button type="button" className="btn-primary" onClick={handleOfflinePayment}
                    style={{ background: payMethod === 'cash' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : payMethod === 'card' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                    <i className={`fas ${METHOD_ICONS[payMethod]}`} /> Confirm — ₹{selectedOrder.total}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Refund Confirmation */}
      <ConfirmModal
        isOpen={!!confirmRefund} onClose={() => setConfirmRefund(null)}
        onConfirm={() => handleRefund(confirmRefund)}
        title="Refund Payment" message="This payment will be marked as refunded and the order will be cancelled. This action cannot be undone."
        confirmLabel="Process Refund"
      />
    </section>
  );
}
