import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { view: 'home',         icon: 'fa-house',           label: 'Home' },
  { view: 'dashboard',    icon: 'fa-chart-pie',        label: 'Dashboard' },
  { view: 'orders',       icon: 'fa-receipt',          label: 'Orders' },
  { view: 'payments',     icon: 'fa-cash-register',    label: 'Payments' },
  { view: 'menu',         icon: 'fa-utensils',         label: 'Menu' },
  { view: 'staff',        icon: 'fa-users',            label: 'Staff' },
  { view: 'inventory',    icon: 'fa-boxes-stacked',    label: 'Inventory' },
  { view: 'kitchen',      icon: 'fa-fire-burner',      label: 'Kitchen' },
  { view: 'tables',       icon: 'fa-table-cells',      label: 'Tables' },
  { view: 'reservations', icon: 'fa-calendar-check',   label: 'Reservations' },
  { view: 'feedback',     icon: 'fa-star',             label: 'Feedback' },
  { view: 'profile',      icon: 'fa-user-gear',        label: 'Profile' },
  // Admin only
  { view: 'activity',  icon: 'fa-list-check',       label: 'Activity',  adminOnly: true },
  { view: 'expenses',  icon: 'fa-wallet',            label: 'Expenses',  adminOnly: true },
  { view: 'sales',     icon: 'fa-indian-rupee-sign', label: 'Sales',     adminOnly: true },
  { view: 'reports',   icon: 'fa-chart-bar',         label: 'Reports',   adminOnly: true },
];

export default function Sidebar({ currentView, onNavigate, isOpen, isAdmin }) {
  const { user, logout } = useAuth();

  return (
    <nav id="sidebar" className={isOpen ? 'open' : ''}>
      <h2><i className="fas fa-utensils"></i> RMS Pro</h2>
      <ul>
        {NAV_ITEMS.filter(item => !item.adminOnly || isAdmin).map(item => (
          <li
            key={item.view}
            data-view={item.view}
            className={currentView === item.view ? 'active' : ''}
            onClick={() => onNavigate(item.view)}
          >
            <i className={`fas ${item.icon}`}></i>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>

      {user && (
        <div id="nav-user">
          <div className="user-info">
            <span className="nav-restaurant">{user.restaurant_name || 'RMS Pro'}</span>
            <div className="user-meta">
              <span className="user-name">{user.username}</span>
              <span className="user-badge">{isAdmin ? 'Admin' : 'Staff'}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={logout} title="Logout">
            <i className="fas fa-power-off"></i>
          </button>
        </div>
      )}
    </nav>
  );
}
