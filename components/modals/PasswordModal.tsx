
import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';
import { SETTINGS_PASSWORD } from '../../constants'; // Or a different password for settings

interface SettingsPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Called when correct password for settings is entered
  title?: string;
}

const SettingsPasswordModal: React.FC<SettingsPasswordModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  title = "ป้อนรหัสผ่านเพื่อเข้าถึงส่วนนี้" 
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (password === SETTINGS_PASSWORD) { // Check against the specific password for this action
      onSuccess();
    } else {
      setError('รหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <ModalWrapper 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      maxWidth="max-w-sm"
      footerContent={
        <>
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors text-base"
          >
            ยกเลิก
          </button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-base"
          >
            ตกลง
          </button>
        </>
      }
    >
      <input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-md mb-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
        placeholder="รหัสผ่าน"
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        aria-label="รหัสผ่าน"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </ModalWrapper>
  );
};

export default SettingsPasswordModal;
