
import React from 'react';
import { User, StudentScore, SubjectData, ToastMessage, StudentProfile } from '../../types';
import StudentScoreTable from '../StudentScoreTable'; 
import { getSubjectNameWithClassLevel } from '../../utils';
import { SubjectContextForModal } from '../../types'; 

interface ScoresPageProps {
  currentUser: User;
  activeAcademicYear: string;
  currentSubjectId: string;
  onSubjectChange: (subjectId: string) => void;
  studentsInSubject: StudentScore[];
  maxClassworkScore: number;
  maxExamScore: number;
  onScoreChange: (
    profileId: string, 
    field: keyof Pick<StudentScore, 'term1ClassworkScore' | 'term1ExamScore' | 'term2ClassworkScore' | 'term2ExamScore'>, 
    value: number | null
  ) => void;
  onSetSubjectScores: () => void; 
  isLoading: boolean;
  subjectCompletionStatus: { completed: number; total: number };
  getSubjectCompletionIcon: (subjectId: string) => '✔️' | '❌' | '';
  isLoggedIn: boolean; 
  allSubjectsForClass: SubjectContextForModal[]; 
  showToast: (message: string, type: ToastMessage['type']) => void;
  onOpenStudyTips: (student: StudentScore) => void; // Added prop
}

const ScoresPage: React.FC<ScoresPageProps> = ({
  currentUser,
  activeAcademicYear,
  currentSubjectId,
  onSubjectChange,
  studentsInSubject,
  maxClassworkScore,
  maxExamScore,
  onScoreChange,
  onSetSubjectScores,
  isLoading,
  subjectCompletionStatus,
  getSubjectCompletionIcon,
  isLoggedIn,
  allSubjectsForClass,
  showToast,
  onOpenStudyTips, // Use this prop
}) => {
  
  const displayClassNumber = currentUser.className!.replace('ป.', '');
  const completionPercentage = subjectCompletionStatus.total > 0 
    ? (subjectCompletionStatus.completed / subjectCompletionStatus.total) * 100 
    : 0;

  const handleSetSubjectScoresClick = () => {
    if (!isLoggedIn) {
      showToast('กรุณาเข้าสู่ระบบเพื่อตั้งค่าคะแนน', 'warning');
      return;
    }
    onSetSubjectScores();
  };

  return (
    <div className="space-y-6 text-base">
      <header className="text-center mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">กรอกคะแนนผลการเรียน</h1>
        <p className="text-lg text-gray-700">
          ชั้นประถมศึกษาปีที่ {displayClassNumber} ปีการศึกษา {activeAcademicYear || "ยังไม่ได้ตั้งค่า"}
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4 md:mb-6 items-center">
          <div>
            <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-base" htmlFor="subjectSelectScoresPage">รายวิชา</label>
            <select 
              id="subjectSelectScoresPage" 
              value={currentSubjectId}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="เลือกรายวิชา"
            >
              {allSubjectsForClass.map((subject) => {
                const completionIcon = getSubjectCompletionIcon(subject.id);
                return (
                    <option key={subject.id} value={subject.id}>
                    {completionIcon} {getSubjectNameWithClassLevel(subject.baseName, currentUser.className!)}
                    </option>
                );
              })}
            </select>
          </div>
          <div className="md:text-right">
             <p className="font-semibold text-gray-700 mb-1 text-base">สถานะการกรอกคะแนน:</p>
             <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden shadow-inner my-1">
                <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${completionPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${completionPercentage}%` }}
                    role="progressbar"
                    aria-valuenow={completionPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`ความคืบหน้าการกรอกคะแนน ${completionPercentage.toFixed(0)}%`}
                >
                </div>
             </div>
             {/* Text "X / Y รายวิชา กรอกข้อมูลสมบูรณ์" is removed as requested */}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-start items-center mt-4 gap-3">
          <button 
            onClick={handleSetSubjectScoresClick}
            disabled={!isLoggedIn}
            className={`font-bold py-2.5 px-4 rounded-lg text-base w-full sm:w-auto flex-grow sm:flex-grow-0
                        ${isLoggedIn ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            aria-label="ตั้งค่าคะแนนเต็มวิชานี้ ต่อภาคเรียน"
            aria-disabled={!isLoggedIn}
          >
            ตั้งค่าคะแนนเต็มวิชานี้
          </button>
        </div>
      </div>

      <StudentScoreTable 
        studentsInSubject={studentsInSubject}
        maxClassworkScore={maxClassworkScore}
        maxExamScore={maxExamScore}
        onScoreChange={onScoreChange}
        isLoading={isLoading}
        selectedClass={currentUser.className!}
        isEditable={isLoggedIn}
        onOpenStudyTips={onOpenStudyTips} // Pass it down
        showToast={showToast}
      />
    </div>
  );
};

export default ScoresPage;