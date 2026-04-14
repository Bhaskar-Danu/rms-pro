import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState({});
  const [pwStrength, setPwStrength] = useState(null);

  // ── Login form state
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });

  // ── Register form state
  const [regForm, setRegForm] = useState({ username: '', email: '', password: '', confirm: '', restaurant_name: '' });

  const checkStrength = (pw) => {
    if (!pw) { setPwStrength(null); return; }
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels = [
      { pct: '20%', color: '#ef4444', text: 'Very weak' },
      { pct: '40%', color: '#f97316', text: 'Weak' },
      { pct: '60%', color: '#eab308', text: 'Fair' },
      { pct: '80%', color: '#84cc16', text: 'Good' },
      { pct: '100%', color: '#22c55e', text: 'Strong' },
    ];
    setPwStrength(levels[Math.min(score - 1, 4)]);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.login || !loginForm.password) { addToast('Please fill in all fields', 'error'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { login: loginForm.login, password: loginForm.password });
      login(data.token, data.user);
      addToast(`Welcome back, ${data.user.username}!`);
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.error || 'Login failed', 'error');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.username || !regForm.email || !regForm.password) { addToast('Please fill required fields', 'error'); return; }
    if (regForm.password !== regForm.confirm) { addToast('Passwords do not match', 'error'); return; }
    if (regForm.password.length < 6) { addToast('Password must be at least 6 characters', 'error'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        username: regForm.username, email: regForm.email,
        password: regForm.password, restaurant_name: regForm.restaurant_name,
      });
      login(data.token, data.user);
      addToast(`Account created! Welcome, ${data.user.username}!`);
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.error || 'Registration failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="auth-wrapper">
        <div className="brand">
          <h1>RMS Pro</h1>
          <p>Restaurant Management System</p>
        </div>

        <div className="auth-card">
          <div className="tabs">
            <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
            <button className={`tab-btn ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Create Account</button>
          </div>

          {/* LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email or Username</label>
                <input type="text" placeholder="Enter email or username" autoComplete="username"
                  value={loginForm.login} onChange={e => setLoginForm(p => ({ ...p, login: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrap">
                  <input type={showPw.login ? 'text' : 'password'} placeholder="Enter your password" autoComplete="current-password"
                    value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} />
                  <button type="button" className="toggle-pw" onClick={() => setShowPw(p => ({ ...p, login: !p.login }))}>
                    {showPw.login ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
              <div className="divider">Don't have an account? <span onClick={() => setTab('register')}>Create one</span></div>
            </form>
          )}

          {/* REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Restaurant Name</label>
                <input type="text" placeholder="e.g. Spice Garden"
                  value={regForm.restaurant_name} onChange={e => setRegForm(p => ({ ...p, restaurant_name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input type="text" placeholder="Choose a username" autoComplete="username"
                  value={regForm.username} onChange={e => setRegForm(p => ({ ...p, username: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="you@example.com" autoComplete="email"
                  value={regForm.email} onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrap">
                  <input type={showPw.reg ? 'text' : 'password'} placeholder="Minimum 6 characters" autoComplete="new-password"
                    value={regForm.password}
                    onChange={e => { setRegForm(p => ({ ...p, password: e.target.value })); checkStrength(e.target.value); }} />
                  <button type="button" className="toggle-pw" onClick={() => setShowPw(p => ({ ...p, reg: !p.reg }))}>
                    {showPw.reg ? '🙈' : '👁'}
                  </button>
                </div>
                {pwStrength && (
                  <div className="pw-strength show">
                    <div className="strength-bar"><div className="strength-fill" style={{ width: pwStrength.pct, background: pwStrength.color }} /></div>
                    <div className="strength-label" style={{ color: pwStrength.color }}>{pwStrength.text}</div>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-wrap">
                  <input type={showPw.reg2 ? 'text' : 'password'} placeholder="Re-enter password" autoComplete="new-password"
                    value={regForm.confirm} onChange={e => setRegForm(p => ({ ...p, confirm: e.target.value }))} />
                  <button type="button" className="toggle-pw" onClick={() => setShowPw(p => ({ ...p, reg2: !p.reg2 }))}>
                    {showPw.reg2 ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
              <div className="divider">Already have an account? <span onClick={() => setTab('login')}>Sign in</span></div>
            </form>
          )}
        </div>
        <div className="auth-footer">© 2026 <span>RMS Pro</span> | MERN Stack</div>
      </div>
    </div>
  );
}
