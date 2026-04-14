import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';

const EMPTY = { name: '', quantity: '', unit: 'kg', min_level: '0' };

export default function Inventory() {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/inventory').then(r => setItems(r.data)).catch(() => { }).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openEdit = (it) => { setEditItem(it); setForm({ name: it.name, quantity: it.quantity, unit: it.unit, min_level: it.min_level }); };

  const submitAdd = async (e) => {
    e.preventDefault();
    if (!form.name || form.quantity === '') { addToast('Name and quantity required', 'error'); return; }
    try { await api.post('/inventory', form); addToast('Item added to inventory!'); setShowAdd(false); setForm(EMPTY); load(); }
    catch (err) { addToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try { await api.put(`/inventory/${editItem._id}`, form); addToast('Inventory updated!'); setEditItem(null); load(); }
    catch (err) { addToast(err.response?.data?.error || 'Update failed', 'error'); }
  };

  const deleteItem = async (id) => {
    try { await api.delete(`/inventory/${id}`); setItems(prev => prev.filter(i => i._id !== id)); addToast('Item removed'); }
    catch { addToast('Delete failed', 'error'); }
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="view active">
      <div className="section">
        <div className="view-header">
          <div>
            <h2>Inventory Control</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Monitor stock levels and avoid shortages</p>
          </div>
          <button className="btn-primary" onClick={() => { setForm(EMPTY); setShowAdd(true); }}><i className="fas fa-plus"></i> Add Item</button>
        </div>
        <div className="view-actions">
          <div className="search-box"><i className="fas fa-search"></i><input placeholder="Search inventory…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Item</th><th>Quantity</th><th>Min Level</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No items found</td></tr>
                : filtered.map(it => {
                  const isLow = it.quantity <= it.min_level;
                  return (
                    <tr key={it._id} className={isLow ? 'low-stock-row' : ''}>
                      <td style={{ fontWeight: 600 }}>{it.name}</td>
                      <td><span className="qty-badge">{it.quantity} {it.unit}</span></td>
                      <td style={{ color: 'var(--text-muted)' }}>{it.min_level} {it.unit}</td>
                      <td>{isLow ? <span className="badge cancelled"><i className="fas fa-triangle-exclamation"></i> Low Stock</span> : <span className="badge completed"><i className="fas fa-check"></i> In Stock</span>}</td>
                      <td><div className="action-group">
                        <button className="btn-icon" title="Edit" onClick={() => openEdit(it)}><i className="fas fa-pencil"></i></button>
                        <button className="btn-icon btn-del" title="Remove" onClick={() => setConfirmDel(it._id)}><i className="fas fa-trash"></i></button>
                      </div></td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Stock Management" icon="fa-boxes-packing">
        <form onSubmit={submitAdd}>
          <div className="form-group"><label>Item Name</label><input type="text" placeholder="e.g. Basmati Rice" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}><label>Quantity</label><input type="number" placeholder="0.00" step="0.01" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} required /></div>
            <div className="form-group" style={{ flex: 1 }}><label>Unit</label><input type="text" placeholder="kg, ltr, pcs" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label>Min Level (Restock Alert)</label><input type="number" placeholder="Alert at this level" step="0.01" value={form.min_level} onChange={e => setForm(p => ({ ...p, min_level: e.target.value }))} /></div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Add to Inventory</button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Inventory Item" icon="fa-pencil">
        <form onSubmit={submitEdit}>
          <div className="form-group"><label>Item Name</label><input type="text" placeholder="e.g. Basmati Rice" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}><label>Quantity</label><input type="number" placeholder="0.00" step="0.01" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} required /></div>
            <div className="form-group" style={{ flex: 1 }}><label>Unit</label><input type="text" placeholder="kg, ltr, pcs" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label>Min Level (Restock Alert)</label><input type="number" placeholder="Alert at this level" step="0.01" value={form.min_level} onChange={e => setForm(p => ({ ...p, min_level: e.target.value }))} /></div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setEditItem(null)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>
      <ConfirmModal isOpen={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={() => deleteItem(confirmDel)} title="Remove Item" message="This inventory item will be permanently deleted." confirmLabel="Remove" />
    </section>
  );
}
