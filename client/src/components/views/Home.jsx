export default function Home({ onNavigate }) {
  return (
    <section className="view active">
      <div className="hero">
        <div className="hero-content">
          <h1>Elevate Your <span>Dining Operations</span></h1>
          <p>Welcome to the next generation of restaurant management. Unified control, real-time analytics, and seamless kitchen coordination — all in one place.</p>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => onNavigate('dashboard')}>
              <i className="fas fa-rocket"></i> Launch Dashboard
            </button>
            <button className="btn-secondary" onClick={() => onNavigate('orders')}>
              <i className="fas fa-receipt"></i> Active Orders
            </button>
          </div>
        </div>
      </div>

      <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 30, marginTop: 40 }}>
        {[
          { icon: 'fa-fire-burner', title: 'KDS Intelligence', desc: 'Advanced kitchen display system with real-time sync and order prioritization to eliminate delays.' },
          { icon: 'fa-chart-line', title: 'Deep Analytics', desc: 'Gain insights into revenue trends, popular menu items, and staff performance with live data.' },
          { icon: 'fa-boxes-stacked', title: 'Inventory Guard', desc: 'Automated stock tracking with low-level alerts to ensure your kitchen never runs out of essentials.' },
          { icon: 'fa-calendar-check', title: 'Smart Reservations', desc: 'Manage bookings, track guest history, and coordinate table availability effortlessly.' },
          { icon: 'fa-users', title: 'Staff Management', desc: 'Track employee roles, salaries, and attendance with complete staff directory management.' },
          { icon: 'fa-wallet', title: 'Expense Tracking', desc: 'Monitor all restaurant spending by category with visual breakdowns and report exports.' },
        ].map(item => (
          <div className="card" key={item.title}>
            <i className={`fas ${item.icon}`}></i>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
