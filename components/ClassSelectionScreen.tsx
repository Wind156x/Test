
import React, { useState } from 'react';
import { CLASS_LEVELS } from '../constants';

interface ClassSelectionScreenProps {
  onClassSelected: (className: string) => void;
}

const ClassSelectionScreen: React.FC<ClassSelectionScreenProps> = ({ onClassSelected }) => {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = () => {
    setError("");
    if (!selectedClass) {
      setError("กรุณาเลือกชั้นเรียนเพื่อเริ่มใช้งาน");
      return;
    }
    onClassSelected(selectedClass);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col justify-center items-center p-4 z-[2000]">
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl text-center w-full max-w-lg mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-4">ยินดีต้อนรับ</h1>
        <p className="text-gray-600 mb-8 text-base sm:text-lg">
          กรุณาเลือกชั้นเรียนที่คุณต้องการจัดการ เพื่อเริ่มต้นใช้งานระบบบันทึกผลการเรียน
        </p>
        
        <div className="mb-6">
          <label htmlFor="classSelectScreen" className="block text-left mb-2 font-semibold text-gray-700 text-lg">เลือกชั้นเรียน</label>
          <select 
            id="classSelectScreen" 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            aria-label="เลือกชั้นเรียน"
          >
            <option value="">-- เลือกชั้นเรียน --</option>
            {CLASS_LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <button 
          onClick={handleSubmit}
          className="w-full p-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-lg transition-colors duration-150 ease-in-out shadow-md hover:shadow-lg"
        >
          เริ่มใช้งานสำหรับชั้นเรียนนี้
        </button>
      </div>
      <footer className="mt-8 text-center">
        <p className="text-sm text-indigo-100">&copy; {new Date().getFullYear()} ระบบบันทึกผลการเรียน</p>
      </footer>
    </div>
  );
};

export default ClassSelectionScreen;
