
import React from 'react';
import { User } from '../../types';

interface DashboardPageProps {
  currentUser: User;
  activeAcademicYear: string;
  subjectCompletionStatus: { completed: number; total: number };
  studentsCount: number;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser, activeAcademicYear, subjectCompletionStatus, studentsCount }) => {
  const completionPercentage = subjectCompletionStatus.total > 0
    ? (subjectCompletionStatus.completed / subjectCompletionStatus.total) * 100
    : 0;

  return (
    <div className="p-2 sm:p-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6">หน้าหลัก (Dashboard)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">ข้อมูลปัจจุบัน</h2>
          <p className="text-gray-700"><strong>ชั้นเรียน:</strong> {currentUser.className}</p>
          <p className="text-gray-700"><strong>ปีการศึกษา:</strong> {activeAcademicYear}</p>
          <p className="text-gray-700"><strong>จำนวนนักเรียน:</strong> {studentsCount} คน</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">ความคืบหน้าการกรอกคะแนน</h2>
          <div className="w-full bg-gray-200 rounded-full h-5 mb-1 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${completionPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-center font-medium">
            <span className={`${completionPercentage === 100 ? 'text-green-700' : 'text-blue-700'}`}>
              {subjectCompletionStatus.completed} / {subjectCompletionStatus.total}
            </span>
            &nbsp;รายวิชา ({completionPercentage.toFixed(0)}%)
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">ทางลัด</h2>
          <ul className="space-y-2">
            <li><button onClick={() => { /* Navigate to scores */ }} className="text-blue-600 hover:underline">ไปที่หน้ากรอกคะแนน</button></li>
            <li><button onClick={() => { /* Navigate to student info */ }} className="text-blue-600 hover:underline">จัดการข้อมูลนักเรียน</button></li>
          </ul>
        </div>

      </div>
       <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
         <h2 className="text-xl font-semibold text-gray-800 mb-2">ประกาศหรือข้อมูลสำคัญ</h2>
         <p className="text-gray-600">ส่วนนี้สามารถใช้แสดงประกาศสำคัญจากผู้ดูแลระบบ หรือข้อมูลอัปเดตต่างๆ เกี่ยวกับระบบ</p>
       </div>
    </div>
  );
};

export default DashboardPage;
