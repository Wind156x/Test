
import React from 'react';
import { User, ToastMessage, SubjectContextForModal, CustomSubjectDefinition } from '../../types'; // SIMPLE_SUBJECT_NAMES not needed if allSubjectsForClass passed, imported SubjectContextForModal
import { getSubjectNameWithClassLevel } from '../../utils';

interface ManageSubjectsPageProps {
  showToast: (message: string, type: ToastMessage['type']) => void;
  currentUser: User;
  isLoggedIn: boolean;
  allSubjectsForClass: SubjectContextForModal[]; // Changed type
  customSubjectsForClass: CustomSubjectDefinition[]; // To identify which ones are truly custom and can be deleted/edited by user
  onOpenAddCustomSubjectModal: () => void;
  onOpenManageIndicatorsModal: (subject: SubjectContextForModal) => void; // Changed type of subject parameter
  onDeleteCustomSubject: (subjectId: string) => void;
}

const ManageSubjectsPage: React.FC<ManageSubjectsPageProps> = ({ 
    showToast, 
    currentUser, 
    isLoggedIn,
    allSubjectsForClass,
    customSubjectsForClass,
    onOpenAddCustomSubjectModal,
    onOpenManageIndicatorsModal,
    onDeleteCustomSubject
}) => {

  const handleAddSubjectClick = () => {
    if (!isLoggedIn) {
      showToast('กรุณาเข้าสู่ระบบเพื่อเพิ่มรายวิชา', 'warning');
      return;
    }
    onOpenAddCustomSubjectModal();
  };

  const handleManageIndicatorsClick = (subject: SubjectContextForModal) => { // Changed type of subject parameter
    // Indicators can be managed for any subject, but saving them might be restricted by isLoggedIn inside the modal/App.tsx
    onOpenManageIndicatorsModal(subject);
  };
  
  const handleEditCustomSubject = (subjectId: string) => {
      if (!isLoggedIn) { showToast('กรุณาเข้าสู่ระบบเพื่อแก้ไข', 'warning'); return; }
      showToast(`ฟังก์ชันแก้ไขรายวิชา "${subjectId}" ยังไม่เปิดใช้งาน`, 'info');
  };

  const handleDeleteCustomSubjectClick = (subjectId: string) => {
      if (!isLoggedIn) { showToast('กรุณาเข้าสู่ระบบเพื่อลบ', 'warning'); return; }
      onDeleteCustomSubject(subjectId);
  };


  return (
    <div className="p-2 sm:p-4 text-base"> {/* Increased base font size */}
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6">จัดการรายวิชา (สำหรับชั้น {currentUser.className})</h1>
      
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">เพิ่มรายวิชาใหม่ (กำหนดเอง)</h2>
        <button 
            onClick={handleAddSubjectClick}
            disabled={!isLoggedIn}
            className={`font-semibold py-2.5 px-4 rounded-md shadow hover:shadow-md transition-all text-lg
                        ${isLoggedIn ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} /* Increased font size */
          >
            เพิ่มรายวิชาใหม่
        </button>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">รายการวิชาทั้งหมด</h2>
        <p className="text-sm text-gray-600 mb-3">รายวิชาพื้นฐานไม่สามารถแก้ไขหรือลบได้ ท่านสามารถจัดการตัวชี้วัดได้สำหรับทุกรายวิชา</p>
        <div className="max-h-[60vh] overflow-y-auto">
          {allSubjectsForClass.length === 0 && (
            <p className="text-gray-500 text-center py-3 text-lg">ไม่พบรายวิชา</p>
          )}
          <ul className="divide-y divide-gray-200">
            {allSubjectsForClass.map((subject, index) => {
              const isTrulyCustom = customSubjectsForClass.some(cs => cs.id === subject.id);
              return (
              <li key={subject.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex-grow">
                  <span className="font-medium text-gray-900 text-lg">{index + 1}. {getSubjectNameWithClassLevel(subject.baseName, currentUser.className!)}</span> {/* Increased font size */}
                  {!isTrulyCustom && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">พื้นฐาน</span>}
                  {isTrulyCustom && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">กำหนดเอง</span>}
                </div>
                <div className="flex space-x-2 flex-wrap gap-1 self-start sm:self-center mt-1 sm:mt-0">
                    <button 
                        onClick={() => handleManageIndicatorsClick(subject)}
                        className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors
                                    ${isLoggedIn ? 'bg-sky-100 text-sky-700 hover:bg-sky-200 border-sky-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'}`}
                        disabled={!isLoggedIn}
                        title="จัดการตัวชี้วัดสำหรับวิชานี้"
                    >
                        จัดการตัวชี้วัด
                    </button>
                    {isTrulyCustom && (
                        <>
                            <button 
                                onClick={() => handleEditCustomSubject(subject.id)}
                                disabled={!isLoggedIn}
                                className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors
                                            ${isLoggedIn ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'}`}
                                title="แก้ไขชื่อรายวิชา (เร็วๆ นี้)"
                            >
                                แก้ไข
                            </button>
                            <button 
                                onClick={() => handleDeleteCustomSubjectClick(subject.id)}
                                disabled={!isLoggedIn}
                                className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors
                                            ${isLoggedIn ? 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'}`}
                                title="ลบรายวิชาที่กำหนดเองนี้"
                            >
                                ลบ
                            </button>
                        </>
                    )}
                </div>
              </li>
            )})}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManageSubjectsPage;
