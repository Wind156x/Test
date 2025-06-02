
import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';
// SETTINGS_PASSWORD is used as a general login password for now
import { SETTINGS_PASSWORD } from '../../constants'; 

interface LoginPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => void; // Passes password up to App.tsx for validation
}

const LoginPasswordModal: React.FC<LoginPasswordModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  // Error handling will be done in App.tsx via toast

  useEffect(() => {
    if (isOpen) {
      setPassword('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onLogin(password);
    // Do not close modal here, App.tsx will close if login is successful
  };

  return (
    <ModalWrapper 
      isOpen={isOpen} 
      onClose={onClose} 
      title="เข้าสู่ระบบเพื่อแก้ไขข้อมูล"
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
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-base"
          >
            เข้าสู่ระบบ
          </button>
        </>
      }
    >
      <p className="text-gray-700 mb-3 text-base">กรุณาป้อนรหัสผ่านเพื่อเปิดใช้งานการแก้ไขและบันทึกข้อมูล</p>
      <input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-md mb-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
        placeholder="รหัสผ่าน"
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        aria-label="รหัสผ่าน"
      />
    </ModalWrapper>
  );
};

export default LoginPasswordModal;
