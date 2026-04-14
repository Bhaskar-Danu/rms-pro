import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';

export default function Feedback() {
  const { addToast } = useToast();
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0, distribution: [] });
  const [showAdd, setShowAdd] = useState(false);
  const [hover, setHover] = useState(0);
  const [form, setForm] = useState({ customer_name: '', rating: 0, comment: '', order_id: '' });

  const load = () => {
    api.get('/feedback').then(r => setFeedback(r.data)).catch(() => {});
    api.get('/feedback/stats').then(r => setStats(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.customer_name) { addToast('Customer name required', 'error'); return; }
    if (!form.rating) { addToast('Please select a star rating', 'error'); return; }
    try {
      await api.post('/feedback', { customer_name: form.customer_name, rating: form.rating, comment: form.comment });
      addToast('Review submitted!'); setShowAdd(false); setForm({ customer_name: '', rating: 0, comment: '', order_id: '' }); load();
    } catch (err) { addToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  const stars = (rating, color = '#fb923c') => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <section className="view active">
      <div className="section">
        <div className="view-header">
          <div><h2>Customer Feedback</h2><p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Ratings and reviews from your guests</p></div>
          <button className="btn-primary" onClick={() => setShowAdd(true)}><i className="fas fa-plus"></i> Add Review</button>
        </div>
        <div className="stats" style={{ marginBottom: 30 }}>
          <div className="stat-box"><i className="fas fa-star"></i><p>Average Rating</p><h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{stats.avgRating} <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>/ 5</span></h3></div>
          <div className="stat-box"><i className="fas fa-comments"></i><p>Total Reviews</p><h3>{stats.totalReviews}</h3></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
          {feedback.length === 0 ? <div style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>No reviews yet. Add the first one!</div>
          : feedback.map(fb => (
            <div key={fb._id} className="card feedback-card" style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{fb.customer_name}</div>
                  <div style={{ color: '#fb923c', fontSize: 20, letterSpacing: 2 }}>{stars(fb.rating)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(fb.createdAt).toLocaleDateString()}</span>
                  <button className="btn-icon btn-del" onClick={() => api.delete(`/feedback/${fb._id}`).then(() => { load(); addToast('Review removed'); })} style={{ width: 28, height: 28, fontSize: 11 }}><i className="fas fa-times"></i></button>
                </div>
              </div>
              {fb.comment && <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, fontStyle: 'italic' }}>"{fb.comment}"</p>}
            </div>
          ))}
        </div>
      </div>
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Customer Review" icon="fa-star">
        <form onSubmit={submit}>
          <div className="form-group"><label>Customer Name</label><input type="text" placeholder="Guest name" value={form.customer_name} onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))} required /></div>
          <div className="form-group">
            <label>Rating</label>
            <div style={{ display: 'flex', gap: 8, fontSize: 32, cursor: 'pointer', marginTop: 8 }}>
              {[1,2,3,4,5].map(n => (
                <span key={n} style={{ color: n <= (hover || form.rating) ? '#fb923c' : '#334155', transition: 'color 0.2s', userSelect: 'none' }}
                  onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                  onClick={() => setForm(p => ({ ...p, rating: n }))}>★</span>
              ))}
            </div>
          </div>
          <div className="form-group"><label>Comment</label><textarea placeholder="How was the experience?" rows={3} style={{ width: '100%' }} value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}></textarea></div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Submit Review</button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
