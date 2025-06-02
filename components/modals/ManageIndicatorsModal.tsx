
import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';
import { Indicator, SubjectContextForModal, ToastMessage } from '../../types'; // Use SubjectContextForModal
import { GoogleGenAI } from "@google/genai"; 
import { getSubjectNameWithClassLevel } from '../../utils';


interface ManageIndicatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectContextForModal | null; // Use SubjectContextForModal
  currentIndicators: Indicator[];
  onSave: (subjectId: string, newIndicators: Indicator[]) => void;
  showToast: (message: string, type: ToastMessage['type']) => void;
  isEditable: boolean;
  aiInstance: GoogleGenAI | null;
}

const ManageIndicatorsModal: React.FC<ManageIndicatorsModalProps> = ({
  isOpen,
  onClose,
  subject,
  currentIndicators,
  onSave,
  showToast,
  isEditable,
  aiInstance,
}) => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [newIndicatorText, setNewIndicatorText] = useState('');
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiResults, setAiResults] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (isOpen && subject) {
      setIndicators(currentIndicators.map(ind => ({...ind}))); 
      setAiSearchQuery(subject.baseName || ''); // Use subject.baseName
      setAiResults([]);
      setNewIndicatorText('');
    }
  }, [isOpen, subject, currentIndicators]);

  const handleAddIndicator = () => {
    if (!isEditable) { showToast('กรุณาเข้าสู่ระบบเพื่อเพิ่มตัวชี้วัด', 'warning'); return; }
    if (newIndicatorText.trim() === '') { showToast('กรุณากรอกข้อความตัวชี้วัด', 'error'); return; }
    setIndicators(prev => [...prev, { id: `manual_${Date.now()}`, text: newIndicatorText.trim(), source: 'manual' }]);
    setNewIndicatorText('');
  };

  const handleRemoveIndicator = (idToRemove: string) => {
    if (!isEditable) { showToast('กรุณาเข้าสู่ระบบเพื่อลบตัวชี้วัด', 'warning'); return; }
    setIndicators(prev => prev.filter(ind => ind.id !== idToRemove));
  };

  const handleAiSearch = async () => {
    if (!isEditable) { showToast('กรุณาเข้าสู่ระบบเพื่อใช้ AI', 'warning'); return; }
    if (!aiInstance) { showToast('คุณสมบัติ AI ไม่พร้อมใช้งาน (API Key อาจไม่ถูกต้อง)', 'error'); return; }
    if (!subject) return; // Should not happen if isOpen and subject are true in useEffect
    if (aiSearchQuery.trim() === '') { showToast('กรุณากรอกคำค้นหาสำหรับ AI', 'error'); return; }

    setIsAiLoading(true); setAiResults([]);
    const classNameForPrompt = subject.className; // Use subject.className
    const prompt = `สำหรับวิชา "${aiSearchQuery}" ระดับชั้น "${classNameForPrompt}", กรุณาค้นหาตัวชี้วัดผลการเรียนรู้ที่คาดหวังในหลักสูตรแกนกลางของประเทศไทย (หรือตัวชี้วัดที่เกี่ยวข้องหากเป็นวิชาเพิ่มเติม)
    กรุณาตอบกลับเป็น JSON array ของ strings โดยแต่ละ string คือตัวชี้วัดหนึ่งรายการ และแต่ละรายการควรสั้นกระชับ ไม่เกิน 150 ตัวอักษร ตัวอย่างเช่น: ["อ่านออกเสียงคำและข้อความสั้นๆได้ถูกต้อง", "คำนวณบวกลบเลขไม่เกิน 100 ได้"]
    หากไม่พบข้อมูลที่ตรงกัน ให้ตอบกลับเป็น JSON array ว่าง []`;

    try {
      const response = await aiInstance.models.generateContent({ // Type annotation removed
        model: 'gemini-2.5-flash-preview-04-17', 
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      const parsedData = JSON.parse(jsonStr);

      if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
        setAiResults(parsedData);
        if (parsedData.length === 0) {
            showToast('AI ไม่พบตัวชี้วัดที่ตรงกับคำค้นหา', 'info');
        }
      } else {
        throw new Error('AI response was not a valid JSON array of strings.');
      }
    } catch (error: any) {
      console.error("AI search error:", error);
      showToast(`เกิดข้อผิดพลาดจาก AI: ${error.message || 'ไม่สามารถประมวลผลคำขอได้'}`, 'error');
      setAiResults([]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddAiResultAsIndicator = (text: string) => {
    if (!isEditable) { return; } 
    if (!indicators.some(ind => ind.text.trim() === text.trim())) { 
      setIndicators(prev => [...prev, { id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, text: text.trim(), source: 'ai' }]);
    } else {
      showToast('ตัวชี้วัดนี้มีอยู่แล้ว', 'info');
    }
  };

  const handleSubmit = () => {
    if (!isEditable) { showToast('กรุณาเข้าสู่ระบบเพื่อบันทึก', 'warning'); return; }
    if (!subject) return; // Should not happen
    onSave(subject.id, indicators); // Use subject.id
  };

  const inputBaseClass = "mt-1 w-full p-2.5 border border-gray-300 rounded-md outline-none text-base";
  const enabledInputClass = `${inputBaseClass} bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500`;
  const disabledInputClass = `${inputBaseClass} bg-gray-100 text-gray-500 cursor-not-allowed`;

  if (!subject) return null;
  const displaySubjectName = getSubjectNameWithClassLevel(subject.baseName, subject.className); // Use subject.baseName and subject.className

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`จัดการตัวชี้วัดสำหรับวิชา: ${displaySubjectName}`}
      maxWidth="max-w-2xl" 
      footerContent={
        <>
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors text-base">ยกเลิก</button>
          <button
            onClick={handleSubmit}
            disabled={!isEditable}
            className={`px-4 py-2 text-white rounded-md transition-colors text-base ${isEditable ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
          >บันทึกตัวชี้วัด</button>
        </>
      }
    >
      <div className="space-y-6 text-base max-h-[70vh] overflow-y-auto pr-2">
        {/* Manual Add Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">เพิ่มตัวชี้วัดด้วยตนเอง</h3>
          <div className="flex gap-2 items-start">
            <textarea
              rows={2}
              value={newIndicatorText}
              onChange={(e) => setNewIndicatorText(e.target.value)}
              placeholder="กรอกข้อความตัวชี้วัดที่นี่..."
              className={isEditable ? enabledInputClass : disabledInputClass}
              disabled={!isEditable}
            />
            <button onClick={handleAddIndicator} disabled={!isEditable || newIndicatorText.trim() === ''} 
                    className={`px-3 py-2 text-white rounded-md transition-colors text-sm self-center whitespace-nowrap ${isEditable && newIndicatorText.trim() !== '' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}>เพิ่ม</button>
          </div>
        </section>

        {/* AI Search Section */}
        <section className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">ค้นหาตัวชี้วัดด้วย AI</h3>
          <div className="flex gap-2 items-start mb-2">
            <input
              type="text"
              value={aiSearchQuery}
              onChange={(e) => setAiSearchQuery(e.target.value)}
              placeholder="คำค้นหา (เช่น ชื่อวิชา)"
              className={isEditable ? enabledInputClass : disabledInputClass}
              disabled={!isEditable}
            />
            <button onClick={handleAiSearch} disabled={!isEditable || isAiLoading || !aiInstance}
                    className={`px-3 py-2 text-white rounded-md transition-colors text-sm self-center whitespace-nowrap ${isEditable && aiInstance ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-300 cursor-not-allowed'} disabled:opacity-70`}>
              {isAiLoading ? 'กำลังค้นหา...' : 'ค้นหา AI'}
            </button>
          </div>
          {isAiLoading && <p className="text-sm text-purple-600">AI กำลังค้นหาข้อมูลตัวชี้วัด...</p>}
          {aiResults.length > 0 && (
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50">
              <p className="text-xs text-gray-600 mb-1">ผลลัพธ์จาก AI (คลิกเพื่อเพิ่ม):</p>
              {aiResults.map((res, idx) => (
                <button key={idx} onClick={() => handleAddAiResultAsIndicator(res)} disabled={!isEditable}
                        className={`block w-full text-left p-1.5 text-xs rounded hover:bg-purple-100 ${!isEditable ? 'text-gray-400 cursor-not-allowed' : 'text-purple-700'}`}>
                  {res}
                </button>
              ))}
            </div>
          )}
        </section>
        
        {/* Current Indicators List */}
        <section className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">รายการตัวชี้วัดปัจจุบัน ({indicators.length})</h3>
          {indicators.length === 0 ? <p className="text-sm text-gray-500">ยังไม่มีตัวชี้วัดสำหรับวิชานี้</p> : (
            <ul className="space-y-2">
              {indicators.map((indicator, index) => (
                <li key={indicator.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md border text-sm">
                  <span className="flex-grow pr-2">{index + 1}. {indicator.text} {indicator.source === 'ai' && <span className="text-xs text-purple-500">(AI)</span>}</span>
                  <button onClick={() => handleRemoveIndicator(indicator.id)} disabled={!isEditable}
                          className={`text-xs px-2 py-0.5 rounded ${isEditable ? 'text-red-500 hover:text-red-700 hover:bg-red-100' : 'text-gray-400 cursor-not-allowed'}`}>ลบ</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </ModalWrapper>
  );
};

export default ManageIndicatorsModal;
