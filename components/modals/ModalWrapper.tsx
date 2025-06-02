
import React from 'react';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  maxWidth?: string;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footerContent,
  maxWidth = "max-w-xl" // Default max width
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[1900] flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out p-4" // Added padding for small screens
      onClick={onClose} 
    >
      <div 
        className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} modal-content-animated`} // w-full applies first, then constrained by maxWidth
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="modal-header flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-2" // Adjusted padding for better touch target
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body p-4 sm:p-6 max-h-[70vh] sm:max-h-[75vh] overflow-y-auto">
          {children}
        </div>
        {footerContent && (
          <div className="modal-footer p-3 sm:p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            {footerContent}
          </div>
        )}
      </div>
      <style>{`
        @keyframes modalShow {
          from {
            transform: scale(0.95) translateY(10px); /* Slight upward animation */
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .modal-content-animated {
          transform: scale(0.95) translateY(10px); 
          opacity: 0; 
          animation-name: modalShow;
          animation-duration: 250ms; /* Slightly faster */
          animation-timing-function: ease-out; 
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};

export default ModalWrapper;