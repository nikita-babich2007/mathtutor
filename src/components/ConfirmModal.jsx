import { FiAlertTriangle } from 'react-icons/fi';

function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', marginTop: 0, marginBottom: '15px' }}>
          <FiAlertTriangle size={24} /> Підтвердження дії
        </h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>Скасувати</button>
          <button className="btn-submit" style={{ backgroundColor: '#dc2626' }} onClick={onConfirm}>
            Так, підтверджую
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;