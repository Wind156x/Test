
import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  confirmText?: string; // Text to type for confirmation
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  message, 
  confirmText 
}) => {
  const [typedConfirmText, setTypedConfirmText] = useState('');
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(!!confirmText);

  useEffect(() => {
    if (isOpen) {
      setTypedConfirmText('');
      setIsConfirmDisabled(!!confirmText);
    }
  }, [isOpen, confirmText]);

  useEffect(() => {
    if (confirmText) {
      setIsConfirmDisabled(typedConfirmText.trim() !== confirmText);
    } else {
      setIsConfirmDisabled(false);
    }
  }, [typedConfirmText, confirmText]);

  const handleConfirm = () => {
    if (!isConfirmDisabled) {
      onConfirm();
    }
  };

  return (
    <ModalWrapper 
      isOpen={isOpen} 
      onClose={onClose} 
      title="ยืนยันการกระทำ"
      maxWidth="max-w-md"
      footerContent={
        <>
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`px-4 py-2 text-white rounded-md transition-colors ${
              isConfirmDisabled 
                ? 'bg-red-300 cursor-not-allowed' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            ยืนยัน
          </button>
        </>
      }
    >
      <p className="text-lg mb-4">{message}</p>
      {confirmText && (
        <>
          <p className="text-sm text-gray-700 mb-2">กรุณาพิมพ์ "{confirmText}" เพื่อยืนยัน:</p>
          <input 
            type="text" 
            value={typedConfirmText}
            onChange={(e) => setTypedConfirmText(e.target.value)}
            className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-md mb-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
            placeholder="พิมพ์เพื่อยืนยัน"
          />
        </>
      )}
    </ModalWrapper>
  );
};

export default ConfirmationModal;
