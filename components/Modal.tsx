import React, { useEffect, useRef } from 'react';
// Assuming extension-less import resolves correctly
import { XIcon } from './icons'; 

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * An accessible and responsive modal component with focus management and Esc key dismissal.
 * FIX: Wrapped in React.memo for performance.
 */
export const Modal: React.FC<ModalProps> = React.memo(({ isOpen, onClose, children }) => {
  // Ref to hold the modal content div to manage focus
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // 1. Keyboard and Focus Management (Mount/Unmount)
  useEffect(() => {
    if (isOpen) {
      // 1a. Store the element that had focus before the modal opened
      previouslyFocusedElement.current = document.activeElement as HTMLElement | null;
      
      // 1b. Move focus to the modal container (A11y requirement)
      // Use setTimeout to ensure the DOM has finished painting
      setTimeout(() => modalRef.current?.focus(), 0);

      // 1c. Escape Key Listener
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEsc);
      
      // Cleanup for event listener
      return () => {
        window.removeEventListener('keydown', handleEsc);
        
        // 1d. Restore focus when the modal closes (Cleanup phase)
        if (previouslyFocusedElement.current) {
            previouslyFocusedElement.current.focus();
        }
      };
    }
  }, [isOpen, onClose]); // Rerun when modal state or onClose changes

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        ref={modalRef} // Set the ref on the container
        tabIndex={-1} // Makes the div programmatically focusable
        className="bg-gray-950/80 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6 relative transform transition-all duration-300 focus:outline-none"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
          aria-label="Close modal"
        >
          <XIcon className="h-6 w-6" />
        </button>
        
        <div className="flex-grow overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
});