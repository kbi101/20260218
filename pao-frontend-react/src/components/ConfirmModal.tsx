import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  type?: 'danger' | 'warning';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Delete Permanently',
  type = 'danger'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          padding: '1rem', 
          backgroundColor: type === 'danger' ? '#fef2f2' : '#fffbeb', 
          border: `1px solid ${type === 'danger' ? '#fee2e2' : '#fef3c7'}`,
          borderRadius: '12px' 
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '10px', 
            backgroundColor: type === 'danger' ? '#fee2e2' : '#fef3c7', 
            color: type === 'danger' ? '#ef4444' : '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={20} />
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>

        <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '0.75rem',
            marginTop: '0.5rem'
        }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{ 
                padding: '0.625rem 1.25rem', 
                borderRadius: '8px', 
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#4b5563'
            }}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={() => { onConfirm(); onClose(); }}
            style={{ 
                padding: '0.625rem 1.25rem', 
                borderRadius: '8px', 
                backgroundColor: type === 'danger' ? '#ef4444' : '#f59e0b',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
            }}
          >
            <Trash2 size={16} />
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
