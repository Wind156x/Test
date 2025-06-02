
import React from 'react';
import { User, StudentProfile, ToastMessage } from '../../types'; // Added ToastMessage

interface StudentInfoPageProps {
  currentUser: User;
  studentsInClass: StudentProfile[];
  onRemoveStudentFromClass: (profileId: string, studentName: string, actionType: 'delete' | 'transfer') => void;
  onEditStudent: (studentProfile: StudentProfile) => void;
  showToast: (message: string, type: ToastMessage['type']) => void;
  isLoggedIn: boolean; // Added prop
  onOpenAddStudentModal: () => void; // Added prop
}

const StudentInfoPage: React.FC<StudentInfoPageProps> = ({
  currentUser,
  studentsInClass,
  onRemoveStudentFromClass,
  onEditStudent,
  showToast,
  isLoggedIn,
  onOpenAddStudentModal,
}) => {

  const handleAddStudentClick = () => {
    if (!isLoggedIn) {
      showToast("กรุณาเข้าสู่ระบบเพื่อเพิ่มนักเรียน", 'warning');
      return;
    }
    onOpenAddStudentModal();
  };
  
  const handleActionClick = (action: () => void) => {
    if (!isLoggedIn) {
      showToast("กรุณาเข้าสู่ระบบเพื่อดำเนินการ", 'warning');
      return;
    }
    action();
  };


  return (
    <div className="p-2 sm:p-4 text-base"> {/* Increased base font size */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">ข้อมูลนักเรียน ชั้น {currentUser.className}</h1>
        <button
            onClick={handleAddStudentClick}
            disabled={!isLoggedIn}
            className={`mt-3 sm:mt-0 font-semibold py-2 px-4 rounded-lg text-sm shadow hover:shadow-md transition-all
                        ${isLoggedIn ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
            เพิ่มนักเรียนใหม่ (ในชั้นนี้)
        </button>
      </div>
      
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl">
        <p className="text-base text-gray-700 mb-1"> {/* Increased font size */}
          นักเรียนในชั้นเรียนปัจจุบัน: <span className="font-semibold">{studentsInClass.length}</span> คน
        </p>
        <p className="text-sm text-gray-600 mb-4"> {/* Increased font size */}
          การ "แก้ไขข้อมูล" จะเป็นการแก้ไขรายละเอียดโปรไฟล์นักเรียน | "แจ้งย้าย/ลาออก" และ "ลบข้อมูล" จะนำนักเรียนออกจากชั้นเรียนนี้และลบข้อมูลคะแนนที่เกี่ยวข้อง
        </p>
        <div className="max-h-[70vh] overflow-y-auto border border-gray-200 rounded-md bg-gray-50">
          {studentsInClass.length === 0 && (
            <p className="text-gray-500 text-lg p-6 text-center">ยังไม่มีข้อมูลนักเรียนในชั้นเรียนนี้</p> 
          )}
          {studentsInClass.map((student, index) => (
            <div 
              key={student.id} 
              className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 hover:bg-gray-100 
                         ${index < studentsInClass.length -1 ? 'border-b border-gray-200' : ''}`}
            >
              <div className="mb-2 sm:mb-0 flex-grow">
                <span className="font-medium text-gray-800 text-lg">{index + 1}. {student.fullName}</span> {/* Increased font size */}
                <span className="text-gray-600 ml-2 text-sm block sm:inline">เลขประจำตัว: {student.studentSchoolId || student.nationalId || 'N/A'}</span> {/* Increased font size */}
                <span className="text-gray-600 ml-2 text-sm block sm:inline">เพศ: {student.gender || 'N/A'}</span> {/* Increased font size */}
              </div>
              <div className="flex space-x-2 flex-wrap gap-1 self-start sm:self-center">
                <button
                  onClick={() => handleActionClick(() => onEditStudent(student))}
                  disabled={!isLoggedIn}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors font-medium border 
                              ${isLoggedIn ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-100 border-blue-300' : 'text-gray-400 bg-gray-100 cursor-not-allowed border-gray-300'}`}
                  title="แก้ไขข้อมูลนักเรียน"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleActionClick(() => onRemoveStudentFromClass(student.id, student.fullName, 'transfer'))}
                  disabled={!isLoggedIn}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors font-medium border
                              ${isLoggedIn ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-100 border-orange-300' : 'text-gray-400 bg-gray-100 cursor-not-allowed border-gray-300'}`}
                  title="แจ้งย้ายหรือลาออก"
                >
                  แจ้งย้าย/ลาออก
                </button>
                <button
                  onClick={() => handleActionClick(() => onRemoveStudentFromClass(student.id, student.fullName, 'delete'))}
                  disabled={!isLoggedIn}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors font-medium border
                              ${isLoggedIn ? 'text-red-600 hover:text-red-800 hover:bg-red-100 border-red-300' : 'text-gray-400 bg-gray-100 cursor-not-allowed border-gray-300'}`}
                  title="ลบข้อมูลนักเรียน"
                >
                  ลบข้อมูล
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentInfoPage;
