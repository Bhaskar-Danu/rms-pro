import { useEffect, useState, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
Chart.register(...registerables);

const CATS = ['Ingredients','Utilities','Salaries','Rent','Equipment','Marketing','Maintenance','Other'];

export default function Expenses() {
  const { addToast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [report, setReport] = useState({ byCategory: [], totalExpenses: 0 });
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm] = useState({ category: 'Ingredients', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  const chartRef = useRef(null);
  const chartInst = useRef(null);

  const load = () => {
    api.get('/expenses').then(r => setExpenses(r.data)).catch(() => {});
    api.get('/expenses/report').then(r => setReport(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!chartRef.current || report.byCategory.length === 0) return;
    if (chartInst.current) chartInst.current.destroy();
    chartInst.current = new Chart(chartRef.current, {
      type: 'doughnut',
      data: {
        labels: report.byCategory.map(c => c.category),
        datasets: [{ data: report.byCategory.map(c => c.total), backgroundColor: ['#fb923c','#3b82f6','#22c55e','#f59e0b','#a855f7','#ec4899','#14b8a6','#ef4444'] }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, font: { size: 12 } } } } },
    });
    return () => { if (chartInst.current) chartInst.current.destroy(); };
  }, [report]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) { addToast('Valid amount required', 'error'); return; }
    try { await api.post('/expenses', form); addToast('Expense recorded!'); setShowAdd(false); load(); }
    catch (err) { addToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  const deleteExpense = async (id) => {
    try { await api.delete(`/expenses/${id}`); setExpenses(prev => prev.filter(e => e._id !== id)); addToast('Expense removed'); load(); }
    catch { addToast('Delete failed', 'error'); }
  };

  return (
    <section className="view active">
      <div className="section">
        <div className="view-header">
          <div><h2>Expense Tracker</h2><p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Track and analyze restaurant spending</p></div>
          <button className="btn-primary" onClick={() => setShowAdd(true)}><i className="fas fa-plus"></i> Add Expense</button>
        </div>
        <div className="dashboard-grid">
          <div className="card">
            <h3><i className="fas fa-pie-chart"></i> By Category</h3>
            <div className="chart-card" style={{ height: 280 }}><canvas ref={chartRef}></canvas></div>
            <h3 style={{ marginTop: 20, fontSize: 26, textAlign: 'center' }}>Total: <span style={{ color: 'var(--danger)' }}>₹{report.totalExpenses}</span></h3>
          </div>
          <div className="card">
            <h3><i className="fas fa-list"></i> Recent Expenses</h3>
            <div className="table-wrap" style={{ maxHeight: 380, overflowY: 'auto' }}>
              <table>
                <thead><tr><th>Category</th><th>Amount</th><th>Description</th><th>Date</th><th></th></tr></thead>
                <tbody>
                  {expenses.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>No expenses recorded</td></tr>
                  : expenses.map(ex => (
                    <tr key={ex._id}>
                      <td><span className="badge pending">{ex.category}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--danger)' }}>₹{ex.amount}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{ex.description || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{ex.date}</td>
                      <td><button className="btn-icon btn-del" onClick={() => setConfirmDel(ex._id)}><i className="fas fa-trash"></i></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Record Expense" icon="fa-wallet">
        <form onSubmit={submit}>
          <div className="form-group"><label>Category</label><select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}><label>Amount (₹)</label><input type="number" placeholder="0.00" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required /></div>
            <div className="form-group" style={{ flex: 1 }}><label>Date</label><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label>Description</label><input type="text" placeholder="What was this expense for?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Expense</button>
          </div>
        </form>
      </Modal>
      <ConfirmModal isOpen={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={() => deleteExpense(confirmDel)} title="Delete Expense" message="This expense record will be permanently deleted." confirmLabel="Delete" />
    </section>
  );
}
