import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';

const EMPTY = { name: '', role: '', phone: '', salary: '' };

export default function Staff() {
  const { addToast } = useToast();
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/staff').then(r => setStaff(r.data)).catch(() => { }).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openEdit = (s) => { setEditMember(s); setForm({ name: s.name, role: s.role, phone: s.phone, salary: s.salary }); };

  const submitAdd = async (e) => {
    e.preventDefault();
    if (!form.name) { addToast('Name is required', 'error'); return; }
    try { await api.post('/staff', form); addToast('Staff member added!'); setShowAdd(false); setForm(EMPTY); load(); }
    catch (err) { addToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try { await api.put(`/staff/${editMember._id}`, form); addToast('Staff updated!'); setEditMember(null); load(); }
    catch (err) { addToast(err.response?.data?.error || 'Update failed', 'error'); }
  };

  const deleteStaff = async (id) => {
    try { await api.delete(`/staff/${id}`); setStaff(prev => prev.filter(s => s._id !== id)); addToast('Staff member removed'); }
    catch { addToast('Delete failed', 'error'); }
  };

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="view active">
      <div className="section">
        <div className="view-header">
          <div>
            <h2>Staff Directory</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Manage employee details and roles</p>
          </div>
          <button className="btn-primary" onClick={() => { setForm(EMPTY); setShowAdd(true); }}><i className="fas fa-plus" /> Add Staff</button>
        </div>
        <div className="view-actions">
          <div className="search-box"><i className="fas fa-search" /><input placeholder="Search staff members…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <i className="fas fa-users" style={{ fontSize: 28, marginBottom: 10, display: 'block', color: 'var(--primary)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <p>Loading staff directory…</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Salary</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No staff found</td></tr>
                  : filtered.map(s => (
                    <tr key={s._id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td><span className="badge preparing">{s.role || '—'}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{s.phone || '—'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{s.salary?.toLocaleString() || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</td>
                      <td><div className="action-group">
                        <button className="btn-icon" title="Edit" onClick={() => openEdit(s)}><i className="fas fa-pencil" /></button>
                        <button className="btn-icon btn-del" title="Remove" onClick={() => setConfirmDel(s._id)}><i className="fas fa-trash" /></button>
                      </div></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Register Staff" icon="fa-user-plus">
        <form onSubmit={submitAdd}>
          <div className="form-group"><label>Full Name</label><input type="text" placeholder="John Doe" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}><label>Role</label><input type="text" placeholder="Chef, Waiter, etc." value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} /></div>
            <div className="form-group" style={{ flex: 1 }}><label>Monthly Salary (₹)</label><input type="number" placeholder="0.00" step="0.01" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label>Contact Phone</label><input type="text" placeholder="+91 …" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Member</button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={!!editMember} onClose={() => setEditMember(null)} title="Edit Staff Member" icon="fa-pencil">
        <form onSubmit={submitEdit}>
          <div className="form-group"><label>Full Name</label><input type="text" placeholder="John Doe" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}><label>Role</label><input type="text" placeholder="Chef, Waiter, etc." value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} /></div>
            <div className="form-group" style={{ flex: 1 }}><label>Monthly Salary (₹)</label><input type="number" placeholder="0.00" step="0.01" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label>Contact Phone</label><input type="text" placeholder="+91 …" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setEditMember(null)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>
      <ConfirmModal isOpen={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={() => deleteStaff(confirmDel)} title="Remove Staff Member" message="This staff member will be marked as inactive and removed from the directory." confirmLabel="Remove" />
    </section>
  );
}
