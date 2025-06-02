
import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';
import { StudentProfile, StudentAttendanceSummary, ToastMessage } from '../../types';

interface AISummaryAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile | null; // Student for whom summary is being recorded
  onSave: (studentId: string, summary: StudentAttendanceSummary) => void;
  showToast: (message: string, type: ToastMessage['type']) => void;
  isEditable: boolean;
}

const AISummaryAttendanceModal: React.FC<AISummaryAttendanceModalProps> = ({
  isOpen,
  onClose,
  student,
  onSave,
  showToast,
  isEditable,
}) => {
  const [totalInstructionalDays, setTotalInstructionalDays] = useState<number | ''>('');
  const [daysPresent, setDaysPresent] = useState<number | ''>('');
  // For simplicity, we'll derive absent, late, excused later or assume they are 0 for this AI helper.
  // A more complex UI could allow inputting these.

  useEffect(() => {
    if (isOpen) {
      setTotalInstructionalDays('');
      setDaysPresent('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!isEditable) {
      showToast('กรุณาเข้าสู่ระบบเพื่อบันทึก', 'warning');
      return;
    }
    if (!student) {
      showToast('ไม่พบข้อมูลนักเรียน', 'error');
      return;
    }
    if (totalInstructionalDays === '' || daysPresent === '' || +totalInstructionalDays <= 0 || +daysPresent < 0) {
      showToast('กรุณากรอกจำนวนวันเปิดสอนและจำนวนวันที่มาเรียนให้ถูกต้อง (เป็นตัวเลขบวก)', 'error');
      return;
    }
    if (+daysPresent > +totalInstructionalDays) {
      showToast('จำนวนวันที่มาเรียนต้องไม่เกินจำนวนวันเปิดสอนทั้งหมด', 'error');
      return;
    }

    const summaryData: StudentAttendanceSummary = {
      totalInstructionalDays: +totalInstructionalDays,
      daysPresent: +daysPresent,
      daysAbsent: +totalInstructionalDays - +daysPresent, // Simplified: all non-present days are absent
      daysLate: 0, // Default these to 0 for this helper
      daysExcused: 0, // Default these to 0 for this helper
    };
    onSave(student.id, summaryData);
  };

  const inputBaseClass = "mt-1 w-full p-2.5 border border-gray-300 rounded-md outline-none text-base";
  const enabledInputClass = `${inputBaseClass} bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500`;
  const disabledInputClass = `${inputBaseClass} bg-gray-100 text-gray-500 cursor-not-allowed`;

  if (!student) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`บันทึกสรุปการมาเรียนด้วย AI สำหรับ ${student.fullName}`}
      maxWidth="max-w-md"
      footerContent={
        <>
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors text-base">
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isEditable}
            className={`px-4 py-2 text-white rounded-md transition-colors text-base ${isEditable ? 'bg-sky-500 hover:bg-sky-600' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            บันทึกสรุป
          </button>
        </>
      }
    >
      <div className="space-y-4 text-base">
        <p className="text-sm text-gray-600">
          ป้อนข้อมูลสรุปการมาเรียนสำหรับนักเรียน <span className="font-semibold">{student.fullName}</span> ในช่วงเวลาที่ต้องการ (เช่น ตลอดปีการศึกษา)
        </p>
        <div>
          <label htmlFor="aiTotalDays" className="block font-medium text-gray-700">จำนวนวันเปิดสอนทั้งหมดในช่วงเวลานี้ <span className="text-red-500">*</span></label>
          <input
            type="number"
            id="aiTotalDays"
            value={totalInstructionalDays}
            onChange={(e) => setTotalInstructionalDays(e.target.value === '' ? '' : Number(e.target.value))}
            className={isEditable ? enabledInputClass : disabledInputClass}
            disabled={!isEditable}
            min="1"
            placeholder="เช่น 200"
          />
        </div>
        <div>
          <label htmlFor="aiDaysPresent" className="block font-medium text-gray-700">จำนวนวันที่นักเรียนมาเรียน <span className="text-red-500">*</span></label>
          <input
            type="number"
            id="aiDaysPresent"
            value={daysPresent}
            onChange={(e) => setDaysPresent(e.target.value === '' ? '' : Number(e.target.value))}
            className={isEditable ? enabledInputClass : disabledInputClass}
            disabled={!isEditable}
            min="0"
            placeholder="เช่น 190"
          />
        </div>
        <p className="text-xs text-gray-500">
          ระบบจะคำนวณจำนวนวันขาดจากข้อมูลที่ให้ (วันลาและวันมาสายจะถูกตั้งเป็น 0 สำหรับการบันทึกแบบสรุปนี้)
        </p>
      </div>
    </ModalWrapper>
  );
};

export default AISummaryAttendanceModal;
