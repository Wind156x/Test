
import React from 'react';
import { User } from '../../types';

interface Pp6ReportPageProps {
  onOpenStudentSelection: () => void;
  currentSubjectName: string;
  currentUser: User;
}

const Pp6ReportPage: React.FC<Pp6ReportPageProps> = ({ onOpenStudentSelection, currentSubjectName, currentUser }) => {
  return (
    <div className="p-2 sm:p-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6">พิมพ์ ปพ.6 (แบบรายงานผลการพัฒนาคุณภาพผู้เรียนรายบุคคล)</h1>
      <div className="bg-white p-6 rounded-lg shadow-xl text-center">
        <p className="text-gray-700 mb-2">
          ปพ.6 เป็นแบบรายงานผลการพัฒนาคุณภาพผู้เรียนรายบุคคลสำหรับรายวิชาที่เลือก
        </p>
         <p className="text-gray-700 mb-4">
          วิชาที่เลือกปัจจุบัน: <strong className="text-indigo-600">{currentSubjectName}</strong> (ชั้น {currentUser.className})
        </p>
        <p className="text-gray-700 mb-6">
          คุณสามารถเลือกพิมพ์ ปพ.6 สำหรับนักเรียนทั้งหมดในวิชานี้ หรือเลือกนักเรียนเป็นรายบุคคล
        </p>
        <button
          onClick={onOpenStudentSelection}
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg text-base shadow hover:shadow-md transition-all flex items-center justify-center mx-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
          </svg>
          เลือกนักเรียน/สร้าง ปพ.6
        </button>
      </div>
    </div>
  );
};

export default Pp6ReportPage;
