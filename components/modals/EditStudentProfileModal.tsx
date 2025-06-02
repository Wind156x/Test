
import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';
import { StudentProfile, EditableStudentProfileData, ToastMessage } from '../../types'; // Added ToastMessage

interface EditStudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: StudentProfile | null;
  onSave: (updatedProfileData: EditableStudentProfileData) => void;
  showToast: (message: string, type: ToastMessage['type']) => void;
  isEditable: boolean; // New prop
}

const EditStudentProfileModal: React.FC<EditStudentProfileModalProps> = ({
  isOpen,
  onClose,
  studentProfile,
  onSave,
  showToast,
  isEditable
}) => {
  const [formData, setFormData] = useState<EditableStudentProfileData>({
    id: '',
    title: '',
    firstName: '',
    lastName: '',
    gender: '',
    studentSchoolId: '',
  });

  useEffect(() => {
    if (isOpen && studentProfile) {
      setFormData({
        id: studentProfile.id,
        title: studentProfile.title || '',
        firstName: studentProfile.firstName || '',
        lastName: studentProfile.lastName || '',
        gender: studentProfile.gender || '',
        studentSchoolId: studentProfile.studentSchoolId || '',
      });
    }
  }, [isOpen, studentProfile]);

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
      showToast('กรุณากรอกชื่อและนามสกุล', 'error');
      return;
    }
    onSave(formData);
  };

  if (!studentProfile) return null;

  const inputBaseClass = "mt-1 w-full p-2.5 border border-gray-300 rounded-md outline-none text-base"; // Increased font size
  const enabledInputClass = `${inputBaseClass} bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500`;
  const disabledInputClass = `${inputBaseClass} bg-gray-100 text-gray-500 cursor-not-allowed`;


  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`แก้ไขข้อมูลนักเรียน: ${studentProfile.fullName}`}
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
                        ${isEditable ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            บันทึกการเปลี่ยนแปลง
          </button>
        </>
      }
    >
      <div className="space-y-4 text-base"> {/* Increased base font size */}
        <div>
          <label htmlFor="editStudent_id" className="block font-medium text-gray-700">
            รหัสโปรไฟล์ (ID): <span className="text-gray-500 text-xs">(ไม่สามารถแก้ไขได้)</span>
          </label>
          <input
            type="text"
            id="editStudent_id"
            name="id"
            value={formData.id}
            readOnly
            className={`${inputBaseClass} bg-gray-100 text-gray-700`}
          />
        </div>
         <div>
          <label htmlFor="editStudent_studentSchoolId" className="block font-medium text-gray-700">เลขประจำตัวนักเรียน</label>
          <input
            type="text"
            name="studentSchoolId"
            id="editStudent_studentSchoolId"
            value={formData.studentSchoolId}
            onChange={handleChange}
            className={isEditable ? enabledInputClass : disabledInputClass}
            disabled={!isEditable}
          />
        </div>
        <div>
          <label htmlFor="editStudent_title" className="block font-medium text-gray-700">คำนำหน้าชื่อ</label>
          <input
            type="text"
            name="title"
            id="editStudent_title"
            value={formData.title}
            onChange={handleChange}
            className={isEditable ? enabledInputClass : disabledInputClass}
            placeholder="เช่น เด็กชาย, เด็กหญิง, นาย, นางสาว"
            disabled={!isEditable}
          />
        </div>
        <div>
          <label htmlFor="editStudent_firstName" className="block font-medium text-gray-700">ชื่อจริง</label>
          <input
            type="text"
            name="firstName"
            id="editStudent_firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className={isEditable ? enabledInputClass : disabledInputClass}
            disabled={!isEditable}
          />
        </div>
        <div>
          <label htmlFor="editStudent_lastName" className="block font-medium text-gray-700">นามสกุล</label>
          <input
            type="text"
            name="lastName"
            id="editStudent_lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className={isEditable ? enabledInputClass : disabledInputClass}
            disabled={!isEditable}
          />
        </div>
        <div>
          <label htmlFor="editStudent_gender" className="block font-medium text-gray-700">เพศ</label>
          <select
            name="gender"
            id="editStudent_gender"
            value={formData.gender}
            onChange={handleChange}
            className={isEditable ? enabledInputClass : disabledInputClass}
            disabled={!isEditable}
          >
            <option value="">-- เลือกเพศ --</option>
            <option value="ชาย">ชาย</option>
            <option value="หญิง">หญิง</option>
            <option value="อื่น ๆ">อื่น ๆ</option>
          </select>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          หมายเหตุ: การแก้ไขข้อมูลที่สำคัญอื่นๆ เช่น เลขประจำตัวประชาชน ควรทำผ่านการนำเข้าไฟล์ CSV หรือติดต่อผู้ดูแลระบบ
        </p>
      </div>
    </ModalWrapper>
  );
};

export default EditStudentProfileModal;
