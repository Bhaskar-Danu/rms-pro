const STATUS_MAP = {
  pending:   { cls: 'pending',   icon: 'fa-clock' },
  preparing: { cls: 'preparing', icon: 'fa-fire' },
  ready:     { cls: 'ready',     icon: 'fa-bell' },
  completed: { cls: 'completed', icon: 'fa-check' },
  cancelled: { cls: 'cancelled', icon: 'fa-times' },
  confirmed: { cls: 'confirmed', icon: 'fa-calendar-check' },
  danger:    { cls: 'danger',    icon: 'fa-triangle-exclamation' },
  success:   { cls: 'success',   icon: 'fa-check-circle' },
};

export default function Badge({ status, label }) {
  const s = STATUS_MAP[status?.toLowerCase()] || { cls: 'pending', icon: 'fa-circle' };
  return (
    <span className={`badge ${s.cls}`}>
      <i className={`fas ${s.icon}`}></i>
      {label || status}
    </span>
  );
}
