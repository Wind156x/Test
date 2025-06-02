
import React from 'react';
import { StudentScore, ToastMessage } from '../types'; // Added ToastMessage
import { calculateTermTotal } from '../../utils'; 

interface StudentScoreTableProps {
  studentsInSubject: StudentScore[];
  maxClassworkScore: number; 
  maxExamScore: number;    
  onScoreChange: (
    profileId: string, 
    field: keyof Pick<StudentScore, 'term1ClassworkScore' | 'term1ExamScore' | 'term2ClassworkScore' | 'term2ExamScore'>, 
    value: number | null
  ) => void;
  isLoading: boolean;
  selectedClass: string;
  isEditable: boolean; // To control score inputs and action buttons
  onOpenStudyTips: (student: StudentScore) => void; // New prop to open study tips modal
  showToast: (message: string, type: ToastMessage['type']) => void; // For showing toast directly if needed
}

const StudentScoreTable: React.FC<StudentScoreTableProps> = ({
  studentsInSubject,
  maxClassworkScore,
  maxExamScore,
  onScoreChange,
  isLoading,
  selectedClass,
  isEditable,
  onOpenStudyTips,
  showToast,
}) => {

  const getNumericGrade = (totalScoreOutOf100: number | null): number | string => {
    if (totalScoreOutOf100 === null || isNaN(totalScoreOutOf100) || totalScoreOutOf100 < 0) return '-';
    if (totalScoreOutOf100 > 100) totalScoreOutOf100 = 100; 
    if (totalScoreOutOf100 >= 80) return 4;
    if (totalScoreOutOf100 >= 75) return 3.5;
    if (totalScoreOutOf100 >= 70) return 3;
    if (totalScoreOutOf100 >= 65) return 2.5;
    if (totalScoreOutOf100 >= 60) return 2;
    if (totalScoreOutOf100 >= 55) return 1.5;
    if (totalScoreOutOf100 >= 50) return 1;
    return 0;
  };

  const handleInputChange = (
    profileId: string, 
    field: keyof Pick<StudentScore, 'term1ClassworkScore' | 'term1ExamScore' | 'term2ClassworkScore' | 'term2ExamScore'>, 
    valueStr: string
  ) => {
    const value = valueStr === '' ? null : parseFloat(valueStr);
    let validatedValue = value;
    const currentMax = field.includes('Classwork') ? maxClassworkScore : maxExamScore;

    if (value !== null && !isNaN(value)) {
        if (value > currentMax) validatedValue = currentMax;
        else if (value < 0) validatedValue = 0;
    }
    onScoreChange(profileId, field, validatedValue);
  };

  const handleStudyTipsClick = (student: StudentScore) => {
    if (!isEditable) { // isEditable here also implies loggedIn status for AI feature access
        showToast('กรุณาเข้าสู่ระบบเพื่อใช้คุณสมบัติ AI', 'warning');
        return;
    }
    onOpenStudyTips(student);
  };

  const currentTermTotalMax = maxClassworkScore + maxExamScore;
  const yearTotalMax = currentTermTotalMax * 2;

  const thTextSize = "text-sm"; 
  const tdTextSize = "text-base"; 
  const studentNameTextSize = "text-lg"; 
  const inputFieldTextSize = "text-base"; 

  return (
    <div className="bg-white rounded-lg shadow-xl p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-blue-600">
          รายชื่อนักเรียนและคะแนน
        </h2>
      </div>

      {isLoading && <div className="text-center py-4 text-blue-600 font-semibold text-lg">กำลังโหลดข้อมูล...</div>}
      
      {!isLoading && studentsInSubject.length === 0 && (
        <p className="text-center text-gray-500 py-6 text-base">ยังไม่มีข้อมูลนักเรียนสำหรับชั้นเรียนนี้ในระบบ หรือยังไม่ได้เพิ่มนักเรียนผ่านการนำเข้า CSV</p>
      )}

      {!isLoading && studentsInSubject.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full border-collapse min-w-[900px] md:min-w-full"> {/* Adjusted min-width for new column */}
            <thead className="sticky top-0 z-10">
              <tr className="bg-blue-100 text-blue-800">
                <th rowSpan={2} className={`border px-2 py-2 sm:px-3 sm:py-3 text-left ${thTextSize} align-middle`}>ลำดับ</th>
                <th rowSpan={2} className={`border px-2 py-2 sm:px-3 sm:py-3 text-left ${thTextSize} align-middle min-w-[120px]`}>เลขประจำตัว</th>
                <th rowSpan={2} className={`border px-2 py-2 sm:px-3 sm:py-3 text-left ${thTextSize} align-middle w-1/3 min-w-[200px]`}>ชื่อ-นามสกุล</th>
                <th colSpan={3} className={`border px-1 py-2 sm:px-2 sm:py-3 text-center ${thTextSize}`}>ภาคเรียนที่ 1</th>
                <th colSpan={3} className={`border px-1 py-2 sm:px-2 sm:py-3 text-center ${thTextSize}`}>ภาคเรียนที่ 2</th>
                <th rowSpan={2} className={`border px-2 py-2 sm:px-3 sm:py-3 text-center ${thTextSize} align-middle`}>รวม ({yearTotalMax})</th>
                <th rowSpan={2} className={`border px-2 py-2 sm:px-3 sm:py-3 text-center ${thTextSize} align-middle`}>เกรดปี</th>
                <th rowSpan={2} className={`border px-2 py-2 sm:px-3 sm:py-3 text-center ${thTextSize} align-middle min-w-[100px]`}>AI แนะนำ</th>
              </tr>
              <tr className="bg-blue-100 text-blue-800">
                <th className={`border px-1 py-1 sm:px-2 sm:py-2 text-center ${thTextSize}`}>เก็บ ({maxClassworkScore})</th>
                <th className={`border px-1 py-1 sm:px-2 sm:py-2 text-center ${thTextSize}`}>สอบ ({maxExamScore})</th>
                <th className={`border px-1 py-1 sm:px-2 sm:py-2 text-center ${thTextSize}`}>รวม ({currentTermTotalMax})</th>
                <th className={`border px-1 py-1 sm:px-2 sm:py-2 text-center ${thTextSize}`}>เก็บ ({maxClassworkScore})</th>
                <th className={`border px-1 py-1 sm:px-2 sm:py-2 text-center ${thTextSize}`}>สอบ ({maxExamScore})</th>
                <th className={`border px-1 py-1 sm:px-2 sm:py-2 text-center ${thTextSize}`}>รวม ({currentTermTotalMax})</th>
              </tr>
            </thead>
            <tbody>
              {studentsInSubject.map((student, index) => {
                const t1cw = student.term1ClassworkScore;
                const t1ex = student.term1ExamScore;
                const t1Total = calculateTermTotal(t1cw, t1ex);

                const t2cw = student.term2ClassworkScore;
                const t2ex = student.term2ExamScore;
                const t2Total = calculateTermTotal(t2cw, t2ex);

                let yearTotalScore: number | null = null;
                if (t1Total !== null || t2Total !== null) {
                    yearTotalScore = (t1Total || 0) + (t2Total || 0);
                }
                
                let yearScoreForGradeCalc = yearTotalScore;
                if (yearTotalMax !== 100 && yearTotalScore !== null && yearTotalMax > 0) {
                     yearScoreForGradeCalc = (yearTotalScore / yearTotalMax) * 100;
                }
                const yearGrade = getNumericGrade(yearScoreForGradeCalc);

                const inputClass = `w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-md text-center ${inputFieldTextSize} focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`;

                return (
                  <tr key={student.profileId} className={`hover:bg-gray-50 transition-colors ${tdTextSize}`}>
                    <td className="border px-2 py-2 text-center">{index + 1}</td>
                    <td className="border px-2 py-2 text-left">{student.studentIdNumber || 'N/A'}</td>
                    <td className={`border px-2 py-2 ${studentNameTextSize} text-left`}>{student.name || 'N/A'}</td>
                    <td className="border px-1 py-1"><input type="number" aria-label={`คะแนนเก็บภาคเรียนที่ 1 ของ ${student.name}`} className={inputClass} value={t1cw ?? ''} onChange={(e) => handleInputChange(student.profileId, 'term1ClassworkScore', e.target.value)} min="0" max={maxClassworkScore} disabled={!isEditable}/></td>
                    <td className="border px-1 py-1"><input type="number" aria-label={`คะแนนสอบภาคเรียนที่ 1 ของ ${student.name}`} className={inputClass} value={t1ex ?? ''} onChange={(e) => handleInputChange(student.profileId, 'term1ExamScore', e.target.value)} min="0" max={maxExamScore} disabled={!isEditable}/></td>
                    <td className="border px-2 py-2 text-center font-semibold">{t1Total === null ? '-' : t1Total.toFixed(1)}</td>
                    <td className="border px-1 py-1"><input type="number" aria-label={`คะแนนเก็บภาคเรียนที่ 2 ของ ${student.name}`} className={inputClass} value={t2cw ?? ''} onChange={(e) => handleInputChange(student.profileId, 'term2ClassworkScore', e.target.value)} min="0" max={maxClassworkScore} disabled={!isEditable}/></td>
                    <td className="border px-1 py-1"><input type="number" aria-label={`คะแนนสอบภาคเรียนที่ 2 ของ ${student.name}`} className={inputClass} value={t2ex ?? ''} onChange={(e) => handleInputChange(student.profileId, 'term2ExamScore', e.target.value)} min="0" max={maxExamScore} disabled={!isEditable}/></td>
                    <td className="border px-2 py-2 text-center font-semibold">{t2Total === null ? '-' : t2Total.toFixed(1)}</td>
                    <td className="border px-2 py-2 text-center font-bold">{yearTotalScore === null ? '-' : yearTotalScore.toFixed(1)}</td>
                    <td className={`border px-2 py-2 text-center font-bold ${yearGrade === '-' || yearGrade === 0 ? 'text-red-600' : 'text-blue-600'}`}>{yearGrade}</td>
                    <td className="border px-1 py-1 text-center">
                        <button 
                            onClick={() => handleStudyTipsClick(student)}
                            disabled={!isEditable} // Disable if not logged in
                            className={`p-1.5 rounded-md text-xs font-medium transition-colors
                                        ${isEditable ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            aria-label={`ขอคำแนะนำ AI สำหรับ ${student.name}`}
                            title="ขอคำแนะนำ AI"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M6 10a.5.5 0 000-1H5.5a.5.5 0 00-.5.5v.5a.5.5 0 00.5.5H6zM18 10a.5.5 0 000-1h-.5a.5.5 0 00-.5.5v.5a.5.5 0 00.5.5H18zM12 12a1 1 0 100-2 1 1 0 000 2z" />
                            </svg>
                            Tips
                        </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentScoreTable;