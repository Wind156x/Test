
import React, { useState, useEffect, useRef } from 'react';
import { StudentProfile, ToastMessage } from '../../types'; // Added ToastMessage
import { parseStudentProfilesCsv } from '../../services/csvProcessingService';

interface SettingsPageProps {
  currentAcademicYear: string;
  onSaveAcademicYear: (year: string) => void;
  onImportStudentProfiles: (parsedProfiles: StudentProfile[]) => {importedCount: number, updatedCount: number, globalSkippedCount: number};
  showToast: (message: string, type: ToastMessage['type']) => void;
  isLoggedIn: boolean; // Added prop
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  currentAcademicYear, 
  onSaveAcademicYear,
  onImportStudentProfiles,
  showToast,
  isLoggedIn
}) => {
  const [academicYearInput, setAcademicYearInput] = useState(currentAcademicYear);
  const [profileImportStatus, setProfileImportStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAcademicYearInput(currentAcademicYear);
  }, [currentAcademicYear]);

  const handleSaveAcademicYearClick = () => {
    if (!isLoggedIn) {
      showToast('กรุณาเข้าสู่ระบบเพื่อบันทึกปีการศึกษา', 'warning');
      return;
    }
    if (academicYearInput.trim()) {
      onSaveAcademicYear(academicYearInput.trim());
      showToast('บันทึกปีการศึกษาเรียบร้อยแล้ว', 'success');
    } else {
      showToast('กรุณากรอกปีการศึกษา', 'error');
    }
  };

  const handleImportProfilesClick = async () => {
    if (!isLoggedIn) {
      showToast('กรุณาเข้าสู่ระบบเพื่อนำเข้าข้อมูล', 'warning');
      return;
    }
    if (!fileInputRef.current?.files?.length) {
      setProfileImportStatus('กรุณาเลือกไฟล์ CSV');
      showToast('กรุณาเลือกไฟล์ CSV', 'error');
      return;
    }

    const file = fileInputRef.current.files[0];
    setProfileImportStatus('กำลังประมวลผลไฟล์...');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const { profiles: parsedProfiles, skippedCount: csvParserSkipped } = parseStudentProfilesCsv(csvData);
        const { importedCount, updatedCount, globalSkippedCount } = onImportStudentProfiles(parsedProfiles);
        const finalSkipped = csvParserSkipped + globalSkippedCount;

        setProfileImportStatus(`นำเข้าไฟล์เสร็จสิ้น: ใหม่ ${importedCount}, อัปเดต ${updatedCount}, ข้าม ${finalSkipped} รายการ`);
        showToast('นำเข้าโปรไฟล์นักเรียนเสร็จสิ้น', 'success');
        if (fileInputRef.current) fileInputRef.current.value = ""; 
      } catch (error: any) {
        console.error("Error importing student profiles: ", error);
        setProfileImportStatus(`เกิดข้อผิดพลาดในการนำเข้า: ${error.message}`);
        showToast('เกิดข้อผิดพลาดในการนำเข้าโปรไฟล์นักเรียน: ' + error.message, 'error');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div className="p-2 sm:p-4 text-base"> {/* Increased base font size */}
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6">ตั้งค่าระบบ</h1>
      <div className="space-y-8">
        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-2">1. ตั้งค่าปีการศึกษาปัจจุบัน</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2">
            <input 
              type="text" 
              value={academicYearInput}
              onChange={(e) => setAcademicYearInput(e.target.value)}
              placeholder="เช่น 2567" 
              aria-label="ปีการศึกษา"
              className="flex-grow w-full sm:w-auto px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400 text-lg" /* Increased font size */
              disabled={!isLoggedIn}
            />
            <button 
              onClick={handleSaveAcademicYearClick}
              disabled={!isLoggedIn}
              className={`px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap shadow hover:shadow-md text-lg
                          ${isLoggedIn ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} /* Increased font size */
            >
              บันทึกปีการศึกษา
            </button>
          </div>
        </section>
        
        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-2">2. จัดการข้อมูลนักเรียน (นำเข้า/อัปเดตโปรไฟล์)</h2>
          <p className="text-base text-gray-700 mb-1">นำเข้าหรืออัปเดตข้อมูลนักเรียนจากไฟล์ CSV (ระบบจะอ่านข้อมูลชั้นเรียนของนักเรียนแต่ละคนจากในไฟล์โดยตรง)</p> {/* Increased font size */}
          <p className="text-sm text-gray-600 mb-1">ระบบจะใช้ "เลขประจำตัวประชาชน" ในการตรวจสอบข้อมูลซ้ำเพื่ออัปเดตโปรไฟล์ที่มีอยู่</p> {/* Increased font size */}
          <p className="text-sm text-gray-600 mb-3">หัวข้อ CSV ที่คาดหวัง: รหัสโรงเรียน, ชื่อโรงเรียน, เลขประจำตัวประชาชน, ชั้น, ห้อง, ... (ตามที่ระบุ)</p> {/* Increased font size */}
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-2">
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".csv" 
              aria-label="เลือกไฟล์ CSV สำหรับนำเข้าข้อมูลนักเรียน"
              className={`flex-grow w-full text-base text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-base file:font-semibold border border-gray-300 rounded-lg
                          ${isLoggedIn ? 'file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer' : 'file:bg-gray-100 file:text-gray-400 cursor-not-allowed'}`} /* Increased font size */
              onChange={() => setProfileImportStatus('')} 
              disabled={!isLoggedIn}
            />
            <button 
              onClick={handleImportProfilesClick}
              disabled={!isLoggedIn}
              className={`px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap shadow hover:shadow-md text-lg
                          ${isLoggedIn ? 'bg-sky-600 text-white hover:bg-sky-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} /* Increased font size */
            >
              นำเข้า/อัปเดตโปรไฟล์
            </button>
          </div>
          {profileImportStatus && <p className="text-base mt-3 text-gray-800 p-3 bg-gray-50 rounded-md border">{profileImportStatus}</p>} {/* Increased font size */}
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
