
import React, { useState, useEffect } from 'react';
import { User, StudentProfile, AttendanceStatus, DailyAttendanceRecord, StudentAttendanceSummary, ToastMessage } from '../../types';

interface AttendancePageProps {
  currentUser: User;
  studentsInClass: StudentProfile[];
  showToast: (message: string, type: ToastMessage['type']) => void;
  isLoggedIn: boolean;
  currentAttendance: Record<string, /* dateISOString */ DailyAttendanceRecord>; // Attendance for current class & year
  onSaveDailyAttendance: (date: string, dailyData: DailyAttendanceRecord) => void;
  studentSummaries: Record<string, /* studentId */ StudentAttendanceSummary>;
  onOpenAISummaryModal: (student: StudentProfile) => void;
}

const AttendancePage: React.FC<AttendancePageProps> = ({ 
    currentUser, 
    studentsInClass, 
    showToast, 
    isLoggedIn,
    currentAttendance,
    onSaveDailyAttendance,
    studentSummaries,
    onOpenAISummaryModal
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyDataForSelectedDate, setDailyDataForSelectedDate] = useState<DailyAttendanceRecord>({});

  useEffect(() => {
    // Load attendance for the selected date when it changes or when currentAttendance (from props) changes
    setDailyDataForSelectedDate(currentAttendance[selectedDate] || {});
  }, [selectedDate, currentAttendance]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (!isLoggedIn) {
      showToast('กรุณาเข้าสู่ระบบเพื่อบันทึกการเช็คชื่อ', 'warning');
      return;
    }
    setDailyDataForSelectedDate(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = () => {
    if (!isLoggedIn) {
      showToast('กรุณาเข้าสู่ระบบเพื่อบันทึกการเช็คชื่อ', 'warning');
      return;
    }
    onSaveDailyAttendance(selectedDate, dailyDataForSelectedDate);
  };
  
  const getStatusButtonStyle = (currentStudentStatus: AttendanceStatus, buttonStatusValue: AttendanceStatus) => {
    let baseStyle = "px-2 py-1 text-xs rounded-md border transition-colors flex-grow text-center disabled:opacity-50 disabled:cursor-not-allowed ";
    if (currentStudentStatus === buttonStatusValue) {
        switch(buttonStatusValue) {
            case 'present': return baseStyle + "bg-green-500 text-white border-green-600";
            case 'absent': return baseStyle + "bg-red-500 text-white border-red-600";
            case 'late': return baseStyle + "bg-yellow-400 text-black border-yellow-500"; // Changed yellow for better contrast
            case 'excused': return baseStyle + "bg-blue-500 text-white border-blue-600";
            default: return baseStyle + "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300";
        }
    }
    return baseStyle + "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300";
  };
  
  const handleOpenAISummary = (student: StudentProfile) => {
    if (!isLoggedIn) {
      showToast('กรุณาเข้าสู่ระบบเพื่อใช้คุณสมบัตินี้', 'warning');
      return;
    }
    onOpenAISummaryModal(student);
  };

  return (
    <div className="p-2 sm:p-4 text-base"> {/* Increased base font size */}
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6">เช็คชื่อนักเรียน ชั้น {currentUser.className}</h1>
      
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl">
        <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
            <label htmlFor="attendanceDate" className="font-semibold text-gray-700 text-lg">เลือกวันที่:</label> {/* Increased font size */}
            <input 
                type="date" 
                id="attendanceDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-lg" /* White background, Increased font size */
            />
        </div>

        {studentsInClass.length === 0 ? (
            <p className="text-gray-500 text-center py-4 text-lg">ไม่มีนักเรียนในชั้นเรียนนี้</p>
        ) : (
            <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">ลำดับ</th> {/* Increased font size */}
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">ชื่อ-นามสกุล</th> {/* Increased font size */}
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider min-w-[200px]">สถานะ (สำหรับวันที่เลือก)</th> {/* Increased font size */}
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">สรุปการมาเรียน (ภาพรวม)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {studentsInClass.map((student, index) => {
                            const summary = studentSummaries[student.id];
                            const attendanceRate = summary && summary.totalInstructionalDays > 0 
                                ? (summary.daysPresent / summary.totalInstructionalDays) * 100 
                                : null;
                            return (
                            <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-base text-gray-700">{index + 1}</td> {/* Increased font size */}
                                <td className="px-4 py-3 whitespace-nowrap text-base text-gray-900 font-medium">{student.fullName}</td> {/* Increased font size */}
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex space-x-1">
                                        <button onClick={() => handleStatusChange(student.id, 'present')} className={getStatusButtonStyle(dailyDataForSelectedDate[student.id], 'present')} disabled={!isLoggedIn}>มา</button>
                                        <button onClick={() => handleStatusChange(student.id, 'absent')}  className={getStatusButtonStyle(dailyDataForSelectedDate[student.id], 'absent')} disabled={!isLoggedIn}>ขาด</button>
                                        <button onClick={() => handleStatusChange(student.id, 'late')}    className={getStatusButtonStyle(dailyDataForSelectedDate[student.id], 'late')} disabled={!isLoggedIn}>สาย</button>
                                        <button onClick={() => handleStatusChange(student.id, 'excused')} className={getStatusButtonStyle(dailyDataForSelectedDate[student.id], 'excused')} disabled={!isLoggedIn}>ลา</button>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                    {summary ? (
                                        <div className="text-xs">
                                            <p>มา: {summary.daysPresent}/{summary.totalInstructionalDays} วัน</p>
                                            <p>ขาด: {summary.daysAbsent}, ลา: {summary.daysExcused}, สาย: {summary.daysLate}</p>
                                            {attendanceRate !== null && <p>ร้อยละ: {attendanceRate.toFixed(1)}%</p>}
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleOpenAISummary(student)}
                                            disabled={!isLoggedIn}
                                            className={`text-xs px-2 py-1 rounded ${isLoggedIn ? 'bg-sky-100 text-sky-700 hover:bg-sky-200' : 'bg-gray-100 text-gray-400'}`}
                                        >
                                            AI ช่วยบันทึกสรุป
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        )}
        {studentsInClass.length > 0 && (
            <div className="mt-6 text-right">
                <button 
                    onClick={handleSaveAttendance}
                    disabled={!isLoggedIn}
                    className={`font-bold py-2.5 px-6 rounded-lg shadow hover:shadow-md transition-all text-base
                                ${isLoggedIn ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                    บันทึกการเช็คชื่อ (สำหรับวันที่เลือก)
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
