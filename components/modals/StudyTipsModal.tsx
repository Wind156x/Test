
import React from 'react';
import ModalWrapper from './ModalWrapper';
import { StudentScore } from '../../types'; // SubjectData no longer needed directly

interface StudyTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentScore | null;
  subjectName: string;
  maxClassworkScore: number;
  maxExamScore: number;
  tips: string;
  isLoading: boolean;
  error: string | null;
  onRegenerateTips: () => void;
  canGenerate: boolean; // New prop
}

const StudyTipsModal: React.FC<StudyTipsModalProps> = ({
  isOpen,
  onClose,
  student,
  subjectName,
  maxClassworkScore,
  maxExamScore,
  tips,
  isLoading,
  error,
  onRegenerateTips,
  canGenerate
}) => {
  if (!isOpen || !student) return null;

  const currentTermTotalMax = maxClassworkScore + maxExamScore;

  const renderScore = (score: number | null, maxScore: number) => {
    return score !== null ? `${score.toFixed(1)}/${maxScore}` : `ไม่ได้กรอก`;
  };
  
  const renderTotalScore = (score: number | null, termTotal: number) => {
    return score !== null ? `${score.toFixed(1)}/${termTotal}` : `ไม่ได้กรอก`;
  };

  const calculateRawTermTotal = (classwork: number | null, exam: number | null): number | null => {
    if (classwork === null && exam === null) return null;
    return (classwork || 0) + (exam || 0);
  }

  const t1RawTotal = calculateRawTermTotal(student.term1ClassworkScore, student.term1ExamScore);
  const t2RawTotal = calculateRawTermTotal(student.term2ClassworkScore, student.term2ExamScore);

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`คำแนะนำการเรียนสำหรับ ${student.name}`}
      maxWidth="max-w-lg"
      footerContent={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors text-base"
          >
            ปิด
          </button>
          <button
            onClick={onRegenerateTips}
            disabled={isLoading || !canGenerate}
            className={`px-4 py-2 text-white rounded-md transition-colors text-base
                        ${canGenerate ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-gray-400 cursor-not-allowed'}
                        disabled:opacity-70`}
          >
            {isLoading ? 'กำลังสร้าง...' : 'สร้างคำแนะนำใหม่'}
          </button>
        </>
      }
    >
      <div className="space-y-4 text-base"> {/* Increased base font size */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800">ข้อมูลนักเรียน:</h3> {/* Increased font size */}
          <p className="text-gray-700"><strong>ชื่อ:</strong> {student.name}</p>
          <p className="text-gray-700"><strong>วิชา:</strong> {subjectName}</p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-800">คะแนน (เต็มภาคเรียน: {currentTermTotalMax}):</h4> {/* Increased font size */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700">
            <div><strong>ภาคเรียนที่ 1:</strong></div><div></div>
            <div>คะแนนเก็บ: {renderScore(student.term1ClassworkScore, maxClassworkScore)}</div>
            <div>คะแนนสอบ: {renderScore(student.term1ExamScore, maxExamScore)}</div>
            <div className="font-medium">รวม ภ.1: {renderTotalScore(t1RawTotal, currentTermTotalMax)}</div>
            
            <div></div> 
            <div><strong>ภาคเรียนที่ 2:</strong></div><div></div>
            <div>คะแนนเก็บ: {renderScore(student.term2ClassworkScore, maxClassworkScore)}</div>
            <div>คะแนนสอบ: {renderScore(student.term2ExamScore, maxExamScore)}</div>
            <div className="font-medium">รวม ภ.2: {renderTotalScore(t2RawTotal, currentTermTotalMax)}</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800">คำแนะนำจาก AI:</h3> {/* Increased font size */}
          {isLoading && <p className="text-indigo-600 animate-pulse">กำลังสร้างคำแนะนำ... กรุณารอสักครู่</p>}
          {error && <p className="text-red-600">เกิดข้อผิดพลาด: {error}</p>}
          {!isLoading && !error && tips && (
            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md border">{tips}</p>
          )}
          {!isLoading && !error && !tips && !canGenerate && (
            <p className="text-gray-500">กรุณาเข้าสู่ระบบเพื่อสร้างคำแนะนำ</p>
          )}
           {!isLoading && !error && !tips && canGenerate && (
            <p className="text-gray-500">คลิก "สร้างคำแนะนำใหม่" เพื่อรับคำแนะนำ</p>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default StudyTipsModal;
