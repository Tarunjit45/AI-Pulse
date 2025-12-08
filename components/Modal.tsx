import React, { useEffect } from 'react';
import { XIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fadeIn"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-transparent w-full max-w-2xl max-h-[90vh] flex flex-col relative transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 md:-right-12 p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10 border border-white/5"
          aria-label="Close"
        >
          <XIcon className="h-6 w-6" />
        </button>
        
        <div className="flex-grow overflow-y-auto rounded-2xl shadow-2xl shadow-neon-cyan/5">
          {children}
        </div>
      </div>
    </div>
  );
};