
import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';
import { StudentScore } from '../../types';

interface Pp6SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentsInSubject: StudentScore[];
  subjectName: string; 
  className: string;
  onGenerate: (selectedStudentProfileId: string | 'all') => void;
  isActionable: boolean; // New prop
}

const Pp6SelectionModal: React.FC<Pp6SelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  studentsInSubject,
  subjectName,
  className,
  onGenerate,
  isActionable
}) => {
  const [selectedStudent, setSelectedStudent] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      setSelectedStudent('all');
    }
  }, [isOpen]);

  const contextInfo = `${className} - ${subjectName} (ทั้งปีการศึกษา)`;

  return (
    <ModalWrapper 
      isOpen={isOpen} 
      onClose={onClose} 
      title="เลือกนักเรียนสำหรับรายงาน ปพ.6"
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
            onClick={() => onGenerate(selectedStudent)}
            disabled={!isActionable}
            className={`px-4 py-2 text-white rounded-md transition-colors text-base
                        ${isActionable ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            สร้าง PDF
          </button>
        </>
      }
    >
      <p className="mb-2 text-base">เลือกนักเรียนจากรายวิชาปัจจุบัน (<span className="font-semibold">{contextInfo}</span>):</p> {/* Increased font size */}
      <select 
        value={selectedStudent}
        onChange={(e) => setSelectedStudent(e.target.value)}
        className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-md mb-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-base" /* Increased font size */
        disabled={!isActionable}
      >
        <option value="all">นักเรียนทั้งหมดในรายการนี้</option>
        {studentsInSubject.map(student => (
          <option key={student.profileId} value={student.profileId}>
            {student.name} ({student.studentIdNumber || 'N/A'})
          </option>
        ))}
      </select>
      {!isActionable && <p className="text-xs text-red-500 mt-1">กรุณาเข้าสู่ระบบเพื่อสร้างรายงาน</p>}
    </ModalWrapper>
  );
};

export default Pp6SelectionModal;
