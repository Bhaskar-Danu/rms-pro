import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';

export default function Reservations() {
  const { addToast } = useToast();
  const [reservations, setReservations] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm] = useState({ customer_name: '', phone: '', date: '', time: '', guests: 2, table_number: '', notes: '' });

  const load = () => api.get('/reservations').then(r => setReservations(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.date || !form.time) { addToast('Name, date and time required', 'error'); return; }
    try { await api.post('/reservations', form); addToast('Reservation confirmed!'); setShowAdd(false); load(); }
    catch (err) { addToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  const updateStatus = async (id, status) => {
    try { await api.put(`/reservations/${id}/status`, { status }); load(); addToast('Status updated!'); }
    catch { addToast('Update failed', 'error'); }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayCount = reservations.filter(r => r.date === today).length;
  const upcoming = reservations.filter(r => r.date >= today && r.status === 'confirmed').length;
  const completed = reservations.filter(r => r.status === 'completed').length;

  return (
    <section className="view active">
      <div className="section">
        <div className="view-header">
          <div><h2>Reservations</h2><p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Manage table bookings and upcoming guests</p></div>
          <button className="btn-primary" onClick={() => setShowAdd(true)}><i className="fas fa-plus"></i> New Booking</button>
        </div>
        <div className="stats" style={{ marginBottom: 30 }}>
          <div className="stat-box"><i className="fas fa-calendar-day"></i><p>Today</p><h3>{todayCount}</h3></div>
          <div className="stat-box"><i className="fas fa-clock"></i><p>Upcoming</p><h3>{upcoming}</h3></div>
          <div className="stat-box"><i className="fas fa-check-circle"></i><p>Completed</p><h3>{completed}</h3></div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Guest</th><th>Phone</th><th>Date</th><th>Time</th><th>Guests</th><th>Table</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {reservations.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No reservations found</td></tr>
              : reservations.map(r => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 600 }}>{r.customer_name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.phone || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{r.date}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{r.time}</td>
                  <td>{r.guests}</td>
                  <td>{r.table_number ? `Table ${r.table_number}` : '—'}</td>
                  <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                  <td><div className="action-group">
                    {r.status === 'confirmed' && <button className="btn-icon btn-success" title="Complete" onClick={() => updateStatus(r._id, 'completed')}><i className="fas fa-check"></i></button>}
                    {r.status === 'confirmed' && <button className="btn-icon" title="Cancel" onClick={() => updateStatus(r._id, 'cancelled')}><i className="fas fa-ban"></i></button>}
                    <button className="btn-icon btn-del" title="Delete" onClick={() => setConfirmDel(r._id)}><i className="fas fa-trash"></i></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Reservation" icon="fa-calendar-plus">
        <form onSubmit={submit}>
          <div className="form-group"><label>Guest Name</label><input type="text" placeholder="Customer name" value={form.customer_name} onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))} required /></div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}><label>Phone</label><input type="text" placeholder="+91 ..." value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="form-group" style={{ flex: 1 }}><label>Guests</label><input type="number" min="1" max="20" value={form.guests} onChange={e => setForm(p => ({ ...p, guests: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}><label>Date</label><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required /></div>
            <div className="form-group" style={{ flex: 1 }}><label>Time</label><input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} required /></div>
          </div>
          <div className="form-group"><label>Table Number (Optional)</label><input type="number" placeholder="e.g. 5" min="1" value={form.table_number} onChange={e => setForm(p => ({ ...p, table_number: e.target.value }))} /></div>
          <div className="form-group"><label>Special Notes</label><textarea placeholder="Allergies, special requests…" rows={2} style={{ width: '100%' }} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}></textarea></div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Confirm Booking</button>
          </div>
        </form>
      </Modal>
      <ConfirmModal isOpen={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={() => { api.delete(`/reservations/${confirmDel}`).then(() => { load(); addToast('Reservation deleted'); }).catch(() => addToast('Delete failed', 'error')); setConfirmDel(null); }} title="Delete Reservation" message="This reservation will be permanently deleted." confirmLabel="Delete" />
    </section>
  );
}
