import React, { useEffect, useRef } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = 'Are you sure?', 
  message = 'This action cannot be undone.', 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  variant = 'danger' // 'danger' | 'default'
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const confirmStyles = variant === 'danger'
    ? 'bg-red-500/90 hover:bg-red-500 focus:ring-red-500/50 text-white shadow-lg shadow-red-500/20'
    : 'btn-accent';

  const iconBg = variant === 'danger'
    ? 'bg-red-500/10'
    : 'bg-[var(--accent)]/10';

  const iconColor = variant === 'danger'
    ? 'text-red-400'
    : 'text-[var(--accent)]';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative card-glass-static w-full max-w-sm overflow-hidden animate-fadeInScale"
      >
        <div className="p-6">
          {/* Close Button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
          >
            <FiX size={18} />
          </button>

          {/* Icon */}
          <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-4`}>
            <FiAlertTriangle className={`w-6 h-6 ${iconColor}`} />
          </div>
          
          {/* Text */}
          <h3 className="text-lg font-semibold text-[var(--text-primary)] text-center mb-2">
            {title}
          </h3>
          <p className="text-sm text-[var(--text-muted)] text-center leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 p-4 pt-0">
          <button
            onClick={onCancel}
            className="btn-ghost flex-1 py-2.5 text-sm font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 ${confirmStyles}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
