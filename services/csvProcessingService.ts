
import { StudentProfile, StudentAddress, PersonInfo } from '../types';
import { STUDENT_PROFILE_CSV_HEADERS } from '../constants';

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const parseStudentProfilesCsv = (csvData: string): {
  profiles: StudentProfile[],
  skippedCount: number
} => {
  const lines = csvData.split(/\r\n|\n/).slice(1); // Skip header row
  const profiles: StudentProfile[] = [];
  let skippedCount = 0;

  lines.forEach(line => {
    if (line.trim() === '') {
      skippedCount++;
      return;
    }
    const values = line.split(',');
    if (values.length < STUDENT_PROFILE_CSV_HEADERS.length) {
      skippedCount++;
      console.warn(`Skipping line due to insufficient columns: ${line}`);
      return;
    }
    
    const rawStudentData: Record<string, string> = {};
    STUDENT_PROFILE_CSV_HEADERS.forEach((header, index) => {
        rawStudentData[header] = values[index] ? values[index].trim() : "";
    });

    const studentClassFromCSV = rawStudentData["ชั้น"];
    // No longer filtering by targetClass here. App.tsx will handle distribution.
    if (!studentClassFromCSV) {
        skippedCount++;
        console.warn(`Skipping line due to missing class information: ${line}`);
        return;
    }


    const nationalId = rawStudentData["เลขประจำตัวประชาชน"];
    const firstName = rawStudentData["ชื่อ"];
    const lastName = rawStudentData["นามสกุล"];

    if (!nationalId && (!firstName || !lastName)) {
        skippedCount++;
        console.warn(`Skipping line due to missing national ID and name: ${line}`);
        return;
    }

    let profileId = nationalId || generateUUID();
    if (!nationalId) {
      console.warn(`Generated UUID for student without national ID: ${firstName} ${lastName}`);
    }

    const newProfileData: StudentProfile = {
        id: profileId,
        schoolCode: rawStudentData["รหัสโรงเรียน"],
        schoolName: rawStudentData["ชื่อโรงเรียน"],
        nationalId: nationalId,
        classNameCSV: studentClassFromCSV, // This is crucial for App.tsx to sort
        roomCSV: rawStudentData["ห้อง"],
        studentSchoolId: rawStudentData["เลขประจำตัวนักเรียน2"],
        gender: rawStudentData["เพศ"],
        title: rawStudentData["คำนำหน้าชื่อ"],
        firstName: firstName,
        lastName: lastName,
        fullName: `${rawStudentData["คำนำหน้าชื่อ"] || ''}${firstName} ${lastName}`.trim(),
        birthDate: rawStudentData["วันเกิด"],
        ageYear: rawStudentData["อายุ(ปี)"],
        weightKg: rawStudentData["น้ำหนัก"],
        heightCm: rawStudentData["ส่วนสูง"],
        bloodGroup: rawStudentData["กลุ่มเลือด"],
        religion: rawStudentData["ศาสนา"],
        ethnicity: rawStudentData["เชื้อชาติ"],
        nationality: rawStudentData["สัญชาติ"],
        address: {
            houseNo: rawStudentData["บ้านเลขที่"],
            moo: rawStudentData["หมู่"],
            streetSoi: rawStudentData["ถนน/ซอย"],
            tambon: rawStudentData["ตำบล"],
            amphoe: rawStudentData["อำเภอ"],
            changwat: rawStudentData["จังหวัด"]
        } as StudentAddress,
        guardianInfo: {
            name: `${rawStudentData["ชื่อผู้ปกครอง"] || ''} ${rawStudentData["นามสกุลผู้ปกครอง"] || ''}`.trim(),
            occupation: rawStudentData["อาชีพของผู้ปกครอง"],
            relationship: rawStudentData["ความเกี่ยวข้องของผู้ปกครองกับนักเรียน"]
        } as PersonInfo & { relationship: string },
        fatherInfo: {
            name: `${rawStudentData["ชื่อบิดา"] || ''} ${rawStudentData["นามสกุลบิดา"] || ''}`.trim(),
            occupation: rawStudentData["อาชีพของบิดา"]
        } as PersonInfo,
        motherInfo: {
            name: `${rawStudentData["ชื่อมารดา"] || ''} ${rawStudentData["นามสกุลมารดา"] || ''}`.trim(),
            occupation: rawStudentData["อาชีพของมารดา"]
        } as PersonInfo,
        disadvantage: rawStudentData["ความด้อยโอกาส"],
        statusNote: rawStudentData["ยังไม่สามารถจำหน่ายได้ (3.1.8)"],
        lastProfileUpdate: new Date().toISOString()
    };
    profiles.push(newProfileData);
  });

  return { profiles, skippedCount };
};
