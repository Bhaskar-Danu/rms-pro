import Modal from './Modal';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title = 'Confirm', message, confirmLabel = 'Delete', danger = true }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} icon="fa-triangle-exclamation">
      <p style={{ color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6 }}>{message}</p>
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button
          type="button"
          className={danger ? 'btn-danger' : 'btn-primary'}
          onClick={() => { onConfirm(); onClose(); }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
