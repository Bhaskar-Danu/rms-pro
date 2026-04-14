import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, icon, size = '', children }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`}>
        <h3>
          {icon && <i className={`fas ${icon}`}></i>}
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}
