
import React from 'react';
import { User } from '../../types';

interface Pp5ReportPageProps {
  onOpenStudentSelection: () => void;
  currentUser: User;
}

const Pp5ReportPage: React.FC<Pp5ReportPageProps> = ({ onOpenStudentSelection, currentUser }) => {
  return (
    <div className="p-2 sm:p-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6">พิมพ์ ปพ.5 (สมุดรายงานประจำตัวนักเรียน)</h1>
      <div className="bg-white p-6 rounded-lg shadow-xl text-center">
        <p className="text-gray-700 mb-4">
          ปพ.5 เป็นสมุดรายงานประจำตัวนักเรียน (หรือสมุดพก) ที่สรุปผลการเรียนทุกรายวิชา, ข้อมูลส่วนตัว, และข้อมูลการเข้าเรียน (ถ้ามี) ของนักเรียนแต่ละคนตลอดปีการศึกษา
        </p>
        <p className="text-gray-700 mb-6">
          กรุณาเลือกนักเรียนเพื่อสร้างรายงาน ปพ.5 สำหรับชั้น {currentUser.className}
        </p>
        <button
          onClick={onOpenStudentSelection}
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg text-base shadow hover:shadow-md transition-all flex items-center justify-center mx-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m0 0A7.5 7.5 0 1012 6.253v11.494z" /> {/* Placeholder icon for selection */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9.75l-3.75 3.75-3.75-3.75" />
          </svg>
          เลือกนักเรียนและสร้าง ปพ.5
        </button>
      </div>
    </div>
  );
};

export default Pp5ReportPage;
