import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';

const EMPTY = { name: '', category: '', price: '', description: '' };

export default function Menu() {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/menu').then(r => setItems(r.data)).catch(() => { }).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY); setShowAdd(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ name: item.name, category: item.category, price: item.price, description: item.description }); };

  const submitAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { addToast('Name and price required', 'error'); return; }
    try {
      await api.post('/menu', form);
      addToast('Menu item added!');
      setShowAdd(false);
      load();
    } catch (err) { addToast(err.response?.data?.error || 'Failed to add item', 'error'); }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/menu/${editItem._id}`, form);
      addToast('Menu item updated!');
      setEditItem(null);
      load();
    } catch (err) { addToast(err.response?.data?.error || 'Update failed', 'error'); }
  };

  const deleteItem = async (id) => {
    try { await api.delete(`/menu/${id}`); setItems(prev => prev.filter(i => i._id !== id)); addToast('Item removed'); }
    catch { addToast('Delete failed', 'error'); }
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="view active">
      <div className="section">
        <div className="view-header">
          <div>
            <h2>Digital Menu</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Curate and manage your restaurant's offerings</p>
          </div>
          <button className="btn-primary" onClick={openAdd}><i className="fas fa-plus" /> Add Item</button>
        </div>
        <div className="view-actions">
          <div className="search-box"><i className="fas fa-search" /><input placeholder="Search menu items…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <i className="fas fa-utensils" style={{ fontSize: 28, marginBottom: 10, display: 'block', color: 'var(--primary)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <p>Loading menu items…</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Description</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No items found</td></tr>
                  : filtered.map(it => (
                    <tr key={it._id}>
                      <td style={{ fontWeight: 600 }}>{it.name}</td>
                      <td><span className="badge pending">{it.category}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{it.price}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{it.description || '—'}</td>
                      <td><div className="action-group">
                        <button className="btn-icon" title="Edit" onClick={() => openEdit(it)}><i className="fas fa-pencil" /></button>
                        <button className="btn-icon btn-del" title="Delete" onClick={() => setConfirmDel(it._id)}><i className="fas fa-trash" /></button>
                      </div></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Menu Item" icon="fa-utensils">
        <form onSubmit={submitAdd}>
          <div className="form-group"><label>Item Name</label><input type="text" placeholder="e.g. Grilled Salmon" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}><label>Category</label><input type="text" placeholder="Main Course" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} /></div>
            <div className="form-group" style={{ flex: 1 }}><label>Price (₹)</label><input type="number" placeholder="0.00" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea placeholder="Briefly describe the dish…" rows={3} style={{ width: '100%' }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Add Item</button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Menu Item" icon="fa-pencil">
        <form onSubmit={submitEdit}>
          <div className="form-group"><label>Item Name</label><input type="text" placeholder="e.g. Grilled Salmon" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}><label>Category</label><input type="text" placeholder="Main Course" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} /></div>
            <div className="form-group" style={{ flex: 1 }}><label>Price (₹)</label><input type="number" placeholder="0.00" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea placeholder="Briefly describe the dish…" rows={3} style={{ width: '100%' }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setEditItem(null)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>
      <ConfirmModal isOpen={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={() => deleteItem(confirmDel)} title="Remove Menu Item" message="This item will be permanently removed from the menu." confirmLabel="Remove Item" />
    </section>
  );
}
