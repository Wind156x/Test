
import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';
import { StudentProfile, ToastMessage } from '../../types';

type NewStudentData = Omit<StudentProfile, 'id' | 'schoolCode' | 'schoolName' | 'classNameCSV' | 'roomCSV' | 'birthDate' | 'ageYear' | 'weightKg' | 'heightCm' | 'bloodGroup' | 'religion' | 'ethnicity' | 'nationality' | 'address' | 'guardianInfo' | 'fatherInfo' | 'motherInfo' | 'disadvantage' | 'statusNote' | 'lastProfileUpdate' | 'nationalId' | 'fullName'>;

interface AddStudentToClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newStudentData: NewStudentData) => void;
  showToast: (message: string, type: ToastMessage['type']) => void;
  isEditable: boolean; // To control if save is possible
}

const AddStudentToClassModal: React.FC<AddStudentToClassModalProps> = ({
  isOpen,
  onClose,
  onSave,
  showToast,
  isEditable,
}) => {
  const initialFormData: NewStudentData = {
    title: '',
    firstName: '',
    lastName: '',
    gender: '',
    studentSchoolId: '',
  };
  const [formData, setFormData] = useState<NewStudentData>(initialFormData);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData); // Reset form when modal opens
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!isEditable) {
      showToast('กรุณาเข้าสู่ระบบเพื่อบันทึก', 'warning');
      return;
    }
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showToast('กรุณากรอกชื่อและนามสกุลนักเรียน', 'error');
      return;
    }
    if (!formData.studentSchoolId.trim()) {
      showToast('กรุณากรอกเลขประจำตัวนักเรียน', 'error');
      return;
    }
     if (!formData.gender) {
      showToast('กรุณาเลือกเพศของนักเรียน', 'error');
      return;
    }
    onSave(formData);
  };

  const inputBaseClass = "mt-1 w-full p-2.5 border border-gray-300 rounded-md outline-none text-base";
  const enabledInputClass = `${inputBaseClass} bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500`;
  const disabledInputClass = `${inputBaseClass} bg-gray-100 text-gray-500 cursor-not-allowed`;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="เพิ่มนักเรียนใหม่เข้าชั้นเรียนปัจจุบัน"
      maxWidth="max-w-lg"
      footerContent={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors text-base"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isEditable}
            className={`px-4 py-2 text-white rounded-md transition-colors text-base
                        ${isEditable ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            เพิ่มนักเรียน
          </button>
        </>
      }
    >
      <div className="space-y-4 text-base">
        <p className="text-sm text-gray-600">
          ข้อมูลนักเรียนที่เพิ่มด้วยวิธีนี้ จะเป็นการสร้างโปรไฟล์พื้นฐานสำหรับชั้นเรียนปัจจุบันเท่านั้น หากต้องการข้อมูลที่ครบถ้วน กรุณานำเข้าผ่านไฟล์ CSV
        </p>
        <div>
          <label htmlFor="addStudent_studentSchoolId" className="block font-medium text-gray-700">เลขประจำตัวนักเรียน <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="studentSchoolId"
            id="addStudent_studentSchoolId"
            value={formData.studentSchoolId}
            onChange={handleChange}
            className={isEditable ? enabledInputClass : disabledInputClass}
            disabled={!isEditable}
            required
          />
        </div>
        <div>
          <label htmlFor="addStudent_title" className="block font-medium text-gray-700">คำนำหน้าชื่อ</label>
          <input
            type="text"
            name="title"
            id="addStudent_title"
            value={formData.title}
            onChange={handleChange}
            className={isEditable ? enabledInputClass : disabledInputClass}
            placeholder="เช่น ด.ช., ด.ญ., นาย, น.ส."
            disabled={!isEditable}
          />
        </div>
        <div>
          <label htmlFor="addStudent_firstName" className="block font-medium text-gray-700">ชื่อจริง <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="firstName"
            id="addStudent_firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className={isEditable ? enabledInputClass : disabledInputClass}
            disabled={!isEditable}
          />
        </div>
        <div>
          <label htmlFor="addStudent_lastName" className="block font-medium text-gray-700">นามสกุล <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="lastName"
            id="addStudent_lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className={isEditable ? enabledInputClass : disabledInputClass}
            disabled={!isEditable}
          />
        </div>
        <div>
          <label htmlFor="addStudent_gender" className="block font-medium text-gray-700">เพศ <span className="text-red-500">*</span></label>
          <select
            name="gender"
            id="addStudent_gender"
            value={formData.gender}
            onChange={handleChange}
            className={isEditable ? enabledInputClass : disabledInputClass}
            disabled={!isEditable}
            required
          >
            <option value="">-- เลือกเพศ --</option>
            <option value="ชาย">ชาย</option>
            <option value="หญิง">หญิง</option>
            <option value="อื่น ๆ">อื่น ๆ</option>
          </select>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default AddStudentToClassModal;
