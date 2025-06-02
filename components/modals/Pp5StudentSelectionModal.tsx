
import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';
import { StudentProfile } from '../../types';

interface Pp5StudentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentsInClass: StudentProfile[];
  onGenerate: (selectedStudentProfileId: string) => void;
  isActionable: boolean; // New prop
}

const Pp5StudentSelectionModal: React.FC<Pp5StudentSelectionModalProps> = ({
  isOpen,
  onClose,
  studentsInClass,
  onGenerate,
  isActionable
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedStudentId(''); 
    }
  }, [isOpen]);

  const handleGenerateClick = () => {
    if (!isActionable) {
        alert("กรุณาเข้าสู่ระบบเพื่อสร้าง ปพ.5"); // Or use showToast if available
        return;
    }
    if (selectedStudentId) {
      onGenerate(selectedStudentId);
    } else {
      alert("กรุณาเลือกนักเรียนก่อนสร้าง ปพ.5");
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="เลือกนักเรียนสำหรับรายงาน ปพ.5"
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
            onClick={handleGenerateClick}
            disabled={!selectedStudentId || studentsInClass.length === 0 || !isActionable}
            className={`px-4 py-2 text-white rounded-md transition-colors text-base
                        ${isActionable ? 'bg-teal-500 hover:bg-teal-600' : 'bg-gray-400 cursor-not-allowed'}
                        disabled:opacity-70`}
          >
            สร้าง ปพ.5 (PDF)
          </button>
        </>
      }
    >
      {studentsInClass.length === 0 ? (
        <p className="text-gray-600 py-4 text-center text-base">ไม่มีนักเรียนในชั้นเรียนนี้ให้เลือก</p> {/* Increased font size */}
      ) : (
        <>
          <p className="mb-2 text-base text-gray-700">เลือกนักเรียนเพื่อสร้างรายงาน ปพ.5 (สำหรับชั้นเรียนปัจจุบัน):</p> {/* Increased font size */}
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-md mb-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-base" /* Increased font size */
            aria-label="เลือกนักเรียน"
            disabled={!isActionable}
          >
            <option value="" disabled={selectedStudentId !== ''}>-- กรุณาเลือกนักเรียน --</option>
            {studentsInClass.map(student => (
              <option key={student.id} value={student.id}>
                {student.fullName} ({student.studentSchoolId || student.nationalId || 'N/A'})
              </option>
            ))}
          </select>
        </>
      )}
       {!isActionable && studentsInClass.length > 0 && <p className="text-xs text-red-500 mt-1">กรุณาเข้าสู่ระบบเพื่อสร้างรายงาน</p>}
    </ModalWrapper>
  );
};

export default Pp5StudentSelectionModal;
