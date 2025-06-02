
import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';
import { ToastMessage } from '../../types';

interface AddCustomSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subjectName: string) => void;
  showToast: (message: string, type: ToastMessage['type']) => void;
  isEditable: boolean;
}

const AddCustomSubjectModal: React.FC<AddCustomSubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  showToast,
  isEditable,
}) => {
  const [subjectName, setSubjectName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSubjectName(''); // Reset form when modal opens
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!isEditable) {
      showToast('กรุณาเข้าสู่ระบบเพื่อบันทึก', 'warning');
      return;
    }
    if (subjectName.trim() === '') {
      showToast('กรุณากรอกชื่อรายวิชาที่ต้องการเพิ่ม', 'error');
      return;
    }
    onSave(subjectName.trim());
  };
  
  const inputBaseClass = "mt-1 w-full p-2.5 border border-gray-300 rounded-md outline-none text-base";
  const enabledInputClass = `${inputBaseClass} bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500`;
  const disabledInputClass = `${inputBaseClass} bg-gray-100 text-gray-500 cursor-not-allowed`;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="เพิ่มรายวิชาใหม่ (กำหนดเอง)"
      maxWidth="max-w-md"
      footerContent={
        <>
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors text-base">
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isEditable}
            className={`px-4 py-2 text-white rounded-md transition-colors text-base ${isEditable ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            เพิ่มรายวิชา
          </button>
        </>
      }
    >
      <div className="space-y-4 text-base">
        <div>
          <label htmlFor="customSubjectName" className="block font-medium text-gray-700">ชื่อรายวิชา <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="customSubjectName"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            className={isEditable ? enabledInputClass : disabledInputClass}
            disabled={!isEditable}
            placeholder="เช่น ดนตรี-นาฏศิลป์, การเขียนโปรแกรมเบื้องต้น"
            required
          />
        </div>
        <p className="text-xs text-gray-500">
          เมื่อเพิ่มแล้ว รายวิชานี้จะปรากฏในรายการให้เลือกสำหรับชั้นเรียนและปีการศึกษาปัจจุบัน และท่านสามารถเริ่มกรอกคะแนนหรือจัดการตัวชี้วัดได้
        </p>
      </div>
    </ModalWrapper>
  );
};

export default AddCustomSubjectModal;
