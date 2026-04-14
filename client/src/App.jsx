import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/views/Dashboard';
import Orders from './components/views/Orders';
import Menu from './components/views/Menu';
import Staff from './components/views/Staff';
import Inventory from './components/views/Inventory';
import Kitchen from './components/views/Kitchen';
import Tables from './components/views/Tables';
import Reservations from './components/views/Reservations';
import Feedback from './components/views/Feedback';
import Expenses from './components/views/Expenses';
import Reports from './components/views/Reports';
import Sales from './components/views/Sales';
import Activity from './components/views/Activity';
import Profile from './components/views/Profile';
import Payments from './components/views/Payments';
import Home from './components/views/Home';

const VIEWS = {
  home: Home, dashboard: Dashboard, orders: Orders, menu: Menu,
  staff: Staff, inventory: Inventory, kitchen: Kitchen, tables: Tables,
  reservations: Reservations, feedback: Feedback, expenses: Expenses,
  reports: Reports, sales: Sales, activity: Activity, profile: Profile,
  payments: Payments,
};

export default function App() {
  const { isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ViewComponent = VIEWS[currentView] || Home;

  const navigate = (view) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  // Close sidebar on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sidebarOpen && !e.target.closest('#sidebar') && !e.target.closest('.hamburger'))
        setSidebarOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [sidebarOpen]);

  return (
    <div className="app-layout">
      {/* Mobile hamburger */}
      <button className={`hamburger ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(!sidebarOpen)}>
        <span /><span /><span />
      </button>
      {sidebarOpen && <div className="nav-overlay" onClick={() => setSidebarOpen(false)} />}

      <Sidebar currentView={currentView} onNavigate={navigate} isOpen={sidebarOpen} isAdmin={isAdmin} />

      <main id="main-container">
        <ViewComponent onNavigate={navigate} />
      </main>
    </div>
  );
}
