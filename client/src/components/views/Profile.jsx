import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';

const TABS = [
  { key: 'personal', label: 'Personal Info', icon: 'fa-user' },
  { key: 'business', label: 'Business', icon: 'fa-store' },
  { key: 'security', label: 'Security', icon: 'fa-shield-halved' },
];

function getInitials(name = '') {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: '', color: '' },
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#f59e0b' },
    { label: 'Good', color: '#3b82f6' },
    { label: 'Strong', color: '#22c55e' },
    { label: 'Excellent', color: '#10b981' },
  ];
  return { score, ...levels[score] };
}

export default function Profile() {
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    restaurant_name: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        email: user.email || '',
        restaurant_name: user.restaurant_name || '',
        phone: user.phone || '',
        address: user.address || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (form.password && form.password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        username: form.username,
        restaurant_name: form.restaurant_name,
        phone: form.phone,
        address: form.address,
      };
      if (form.password) payload.password = form.password;

      const { data } = await api.put('/profile', payload);
      const storedToken = localStorage.getItem('rms_token');
      login(storedToken, data.user);
      setForm(p => ({ ...p, password: '', confirmPassword: '' }));
      addToast('Profile updated successfully!');
    } catch (err) {
      addToast(err.response?.data?.error || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const pwStrength = getPasswordStrength(form.password);
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <section className="view active">
      <div className="section">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="view-header">
          <div>
            <h2>Account Settings</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
              Manage your profile, business, and security settings
            </p>
          </div>
        </div>

        <div className="profile-layout">
          {/* ── Left Sidebar — Avatar + Info Cards ─────────── */}
          <aside className="profile-sidebar">
            <div className="profile-avatar-card">
              <div className="profile-avatar-ring">
                <div className="profile-avatar-circle">
                  {getInitials(user?.username)}
                </div>
              </div>
              <h3 className="profile-display-name">{user?.username || 'User'}</h3>
              <span className="profile-role-badge">
                <i className={`fas ${user?.role === 'admin' ? 'fa-crown' : 'fa-user-check'}`}></i>
                {user?.role === 'admin' ? 'Administrator' : 'Staff Member'}
              </span>
              <p className="profile-email-text">
                <i className="fas fa-envelope"></i>
                {user?.email || '—'}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="profile-stats-grid">
              <div className="profile-stat-card">
                <div className="profile-stat-icon" style={{ background: 'rgba(251,146,60,0.12)', color: '#fb923c' }}>
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div>
                  <span className="profile-stat-label">Member Since</span>
                  <span className="profile-stat-value">{memberSince}</span>
                </div>
              </div>
              <div className="profile-stat-card">
                <div className="profile-stat-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
                  <i className="fas fa-building"></i>
                </div>
                <div>
                  <span className="profile-stat-label">Restaurant</span>
                  <span className="profile-stat-value">{user?.restaurant_name || '—'}</span>
                </div>
              </div>
              <div className="profile-stat-card">
                <div className="profile-stat-icon" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                  <i className="fas fa-shield-halved"></i>
                </div>
                <div>
                  <span className="profile-stat-label">Account Status</span>
                  <span className="profile-stat-value" style={{ color: '#22c55e' }}>Active</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Right — Form Area ────────────────────────────── */}
          <div className="profile-form-area">
            {/* Tabs */}
            <div className="profile-tabs">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  className={`profile-tab-btn${activeTab === tab.key ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                  type="button"
                >
                  <i className={`fas ${tab.icon}`}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={submit}>
              {/* ── Personal Info Tab ──────────────────────────── */}
              <div className={`profile-tab-panel${activeTab === 'personal' ? ' active' : ''}`}>
                <div className="profile-section-header">
                  <i className="fas fa-user"></i>
                  <div>
                    <h3>Personal Information</h3>
                    <p>Update your personal details and contact info</p>
                  </div>
                </div>
                <div className="profile-form-grid">
                  <div className="profile-form-group">
                    <label><i className="fas fa-id-badge"></i> Display Name</label>
                    <input
                      id="profile-username"
                      type="text"
                      placeholder="Enter your name"
                      value={form.username}
                      onChange={e => handleChange('username', e.target.value)}
                    />
                  </div>
                  <div className="profile-form-group">
                    <label><i className="fas fa-envelope"></i> Email Address</label>
                    <input
                      id="profile-email"
                      type="email"
                      value={form.email}
                      disabled
                      title="Email cannot be changed"
                      className="profile-disabled-input"
                    />
                    <span className="profile-field-hint">
                      <i className="fas fa-lock"></i> Email cannot be changed
                    </span>
                  </div>
                  <div className="profile-form-group">
                    <label><i className="fas fa-phone"></i> Phone Number</label>
                    <input
                      id="profile-phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={form.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="profile-form-group full-width">
                    <label><i className="fas fa-location-dot"></i> Address</label>
                    <input
                      id="profile-address"
                      type="text"
                      placeholder="123 Main Street, City, State"
                      value={form.address}
                      onChange={e => handleChange('address', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* ── Business Tab ──────────────────────────────── */}
              <div className={`profile-tab-panel${activeTab === 'business' ? ' active' : ''}`}>
                <div className="profile-section-header">
                  <i className="fas fa-store"></i>
                  <div>
                    <h3>Business Information</h3>
                    <p>Manage your restaurant branding and details</p>
                  </div>
                </div>
                <div className="profile-form-grid">
                  <div className="profile-form-group full-width">
                    <label><i className="fas fa-utensils"></i> Restaurant Name</label>
                    <input
                      id="profile-restaurant"
                      type="text"
                      placeholder="Gourmet Heaven"
                      value={form.restaurant_name}
                      onChange={e => handleChange('restaurant_name', e.target.value)}
                    />
                  </div>
                </div>
                <div className="profile-business-preview">
                  <div className="profile-preview-label">Preview</div>
                  <div className="profile-preview-card">
                    <div className="profile-preview-icon">
                      <i className="fas fa-utensils"></i>
                    </div>
                    <div>
                      <h4>{form.restaurant_name || 'Restaurant Name'}</h4>
                      <p>Managed by <strong>{form.username || 'You'}</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Security Tab ──────────────────────────────── */}
              <div className={`profile-tab-panel${activeTab === 'security' ? ' active' : ''}`}>
                <div className="profile-section-header">
                  <i className="fas fa-shield-halved"></i>
                  <div>
                    <h3>Password & Security</h3>
                    <p>Keep your account secure with a strong password</p>
                  </div>
                </div>
                <div className="profile-form-grid">
                  <div className="profile-form-group">
                    <label><i className="fas fa-key"></i> New Password</label>
                    <input
                      id="profile-password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={e => handleChange('password', e.target.value)}
                    />
                    {form.password && (
                      <div className="profile-pw-strength">
                        <div className="profile-pw-bar">
                          <div
                            className="profile-pw-fill"
                            style={{
                              width: `${(pwStrength.score / 5) * 100}%`,
                              background: pwStrength.color,
                            }}
                          />
                        </div>
                        <span className="profile-pw-label" style={{ color: pwStrength.color }}>
                          {pwStrength.label}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="profile-form-group">
                    <label><i className="fas fa-check-double"></i> Confirm Password</label>
                    <input
                      id="profile-confirm-password"
                      type="password"
                      placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={e => handleChange('confirmPassword', e.target.value)}
                    />
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <span className="profile-field-error">
                        <i className="fas fa-circle-exclamation"></i> Passwords don't match
                      </span>
                    )}
                    {form.confirmPassword && form.password === form.confirmPassword && form.password && (
                      <span className="profile-field-success">
                        <i className="fas fa-circle-check"></i> Passwords match
                      </span>
                    )}
                  </div>
                </div>
                <div className="profile-security-info">
                  <i className="fas fa-info-circle"></i>
                  <p>Leave password fields blank to keep your current password. Use a combination of uppercase, lowercase, numbers, and symbols for maximum security.</p>
                </div>
              </div>

              {/* ── Save Button ───────────────────────────────── */}
              <div className="profile-actions">
                <button
                  type="button"
                  className="profile-btn-secondary"
                  onClick={() => {
                    if (user) {
                      setForm({
                        username: user.username || '',
                        email: user.email || '',
                        restaurant_name: user.restaurant_name || '',
                        phone: user.phone || '',
                        address: user.address || '',
                        password: '',
                        confirmPassword: '',
                      });
                    }
                  }}
                >
                  <i className="fas fa-rotate-left"></i> Reset Changes
                </button>
                <button type="submit" className="profile-btn-save" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="profile-spinner"></span>
                      Saving…
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
