import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import App from './App';

export default function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#020617' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-utensils" style={{ fontSize: 48, color: '#fb923c', marginBottom: 16, display: 'block' }}></i>
          <div style={{ color: '#94a3b8', fontSize: 14 }}>Loading RMS Pro...</div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*"    element={user ? <App />  : <Navigate to="/login" replace />} />
    </Routes>
  );
}
