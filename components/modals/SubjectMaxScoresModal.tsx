
import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';
import { DEFAULT_MAX_CLASSWORK_SCORE, DEFAULT_MAX_EXAM_SCORE } from '../../constants';
import { ToastMessage } from '../../types'; // Import ToastMessage

interface SubjectMaxScoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubjectName: string; 
  initialMaxClasswork: number;
  initialMaxExam: number;
  onSave: (maxClasswork: number, maxExam: number) => void;
  showToast: (message: string, type: ToastMessage['type']) => void; // Use ToastMessage['type']
  isEditable: boolean; // New prop
}

const SubjectMaxScoresModal: React.FC<SubjectMaxScoresModalProps> = ({ 
  isOpen, 
  onClose, 
  currentSubjectName,
  initialMaxClasswork,
  initialMaxExam,
  onSave,
  showToast,
  isEditable
}) => {
  const [maxClasswork, setMaxClasswork] = useState(initialMaxClasswork);
  const [maxExam, setMaxExam] = useState(initialMaxExam);

  const newDefaultTermTotal = DEFAULT_MAX_CLASSWORK_SCORE + DEFAULT_MAX_EXAM_SCORE;

  useEffect(() => {
    if (isOpen) {
      setMaxClasswork(initialMaxClasswork || DEFAULT_MAX_CLASSWORK_SCORE);
      setMaxExam(initialMaxExam || DEFAULT_MAX_EXAM_SCORE);
    }
  }, [isOpen, initialMaxClasswork, initialMaxExam]);

  const handleSave = () => {
    if (!isEditable) {
        showToast('กรุณาเข้าสู่ระบบเพื่อบันทึก', 'warning'); // This is now valid
        return;
    }
    const cw = parseFloat(String(maxClasswork));
    const ex = parseFloat(String(maxExam));

    if (isNaN(cw) || isNaN(ex) || cw < 0 || ex < 0) {
      showToast('กรุณากรอกคะแนนเต็มที่ถูกต้อง (ตัวเลขเท่านั้น และไม่ติดลบ)', 'error');
      return;
    }
    if (cw + ex !== newDefaultTermTotal) {
      showToast(`คะแนนเก็บและคะแนนสอบรวมกันต้องได้ ${newDefaultTermTotal}`, 'error');
      return;
    }
    onSave(cw, ex);
  };

  return (
    <ModalWrapper 
      isOpen={isOpen} 
      onClose={onClose} 
      title="ตั้งค่าคะแนนเต็มสำหรับวิชา (ต่อภาคเรียน)"
      maxWidth="max-w-md"
      footerContent={
        <>
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors text-base"
          >
            ยกเลิก
          </button>
          <button 
            onClick={handleSave}
            disabled={!isEditable}
            className={`px-4 py-2 text-white rounded-md transition-colors text-base
                        ${isEditable ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            บันทึกคะแนนเต็มวิชานี้
          </button>
        </>
      }
    >
      <p className="mb-3 text-base">วิชา: <span className="font-semibold">{currentSubjectName}</span></p> {/* Increased font size */}
      <div className="space-y-4">
        <div>
          <label htmlFor="subjectMaxClassworkInput" className="block text-base font-medium text-gray-700">คะแนนเก็บเต็ม (ต่อภาคเรียน)</label> {/* Increased font size */}
          <input 
            type="number" 
            id="subjectMaxClassworkInput" 
            value={maxClasswork}
            onChange={(e) => setMaxClasswork(Number(e.target.value))}
            className="mt-1 w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-base" /* Increased font size */
            disabled={!isEditable}
          />
        </div>
        <div>
          <label htmlFor="subjectMaxExamInput" className="block text-base font-medium text-gray-700">คะแนนสอบเต็ม (ต่อภาคเรียน)</label> {/* Increased font size */}
          <input 
            type="number" 
            id="subjectMaxExamInput"
            value={maxExam}
            onChange={(e) => setMaxExam(Number(e.target.value))} 
            className="mt-1 w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-base" /* Increased font size */
            disabled={!isEditable}
          />
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-600">หมายเหตุ: คะแนนเก็บและคะแนนสอบรวมกันต้องได้ {newDefaultTermTotal} คะแนนสำหรับวิชานี้ต่อภาคเรียน</p> {/* Increased font size */}
    </ModalWrapper>
  );
};

export default SubjectMaxScoresModal;