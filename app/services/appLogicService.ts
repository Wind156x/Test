import { GoogleGenAI } from "@google/genai";
import {
    User, AllStudentProfiles, AllScoresData, StudentProfile, StudentScore, SubjectData,
    ToastMessage, EditableStudentProfileData, CustomSubjectDefinition, AllCustomSubjects, Indicator,
    DailyAttendanceRecord, FullDailyAttendance, StudentAttendanceSummary, AllStudentAttendanceSummaries,
    SubjectContextForModal,
} from '../../types'; // Adjusted path
import { CLASS_LEVELS, DEFAULT_MAX_CLASSWORK_SCORE, DEFAULT_MAX_EXAM_SCORE, SETTINGS_PASSWORD } from '../../constants'; // Adjusted path
import { generatePp6Pdf, generatePp5Pdf } from '../../services/pdfService'; // Adjusted path
import { getSubjectNameWithClassLevel, calculateTermTotal } from '../../utils'; // Adjusted path

const API_KEY = process.env.API_KEY;
export let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("API_KEY for Gemini is not set. AI features will be disabled or limited.");
}

type ShowToastFn = (message: string, type: ToastMessage['type']) => void;

// Initialization logic (was in App.tsx's useEffect and initializeSubjectDataIfNeeded useCallback)
export const initializeSubjectDataForClass = (
    currentUser: User | null,
    activeAcademicYear: string,
    currentSubjectId: string,
    allStudentProfiles: AllStudentProfiles,
    combinedSubjectList: SubjectContextForModal[],
    setAllScoresData: React.Dispatch<React.SetStateAction<AllScoresData>>
) => {
    if (!currentUser?.className || !activeAcademicYear || !currentSubjectId) return;

    const subjectDefinition = combinedSubjectList.find(s => s.id === currentSubjectId);
    if (!subjectDefinition) return;

    setAllScoresData(prevScores => {
        const yearData = prevScores[activeAcademicYear] || {};
        const classDataForYear = yearData[currentUser!.className!] || {};
        const fullSubjectName = getSubjectNameWithClassLevel(subjectDefinition.baseName, currentUser!.className!);
        let existingSubjectStudents = classDataForYear[currentSubjectId]?.students || [];
        const classRosterProfiles = allStudentProfiles[currentUser!.className!] || [];

        existingSubjectStudents = existingSubjectStudents.filter(scoreEntry =>
            classRosterProfiles.some(profile => profile.id === scoreEntry.profileId)
        );

        const updatedStudentScoresForSubject: StudentScore[] = classRosterProfiles.map(profile => {
            const existingScoreEntry = existingSubjectStudents.find(s => s.profileId === profile.id);
            return existingScoreEntry
                ? { ...existingScoreEntry, name: profile.fullName, studentIdNumber: profile.studentSchoolId || profile.nationalId }
                : {
                    profileId: profile.id,
                    name: profile.fullName,
                    studentIdNumber: profile.studentSchoolId || profile.nationalId,
                    term1ClassworkScore: null, term1ExamScore: null,
                    term2ClassworkScore: null, term2ExamScore: null,
                  };
        }).sort((a,b) => (a.name || "").localeCompare(b.name || "", "th-TH"));

        const subjectDataEntry = classDataForYear[currentSubjectId];
        const newOrUpdatedSubjectData: SubjectData = {
            academicYear: activeAcademicYear,
            class: currentUser!.className!,
            subjectId: currentSubjectId,
            subjectName: fullSubjectName,
            maxClassworkScore: subjectDataEntry?.maxClassworkScore ?? DEFAULT_MAX_CLASSWORK_SCORE,
            maxExamScore: subjectDataEntry?.maxExamScore ?? DEFAULT_MAX_EXAM_SCORE,
            students: updatedStudentScoresForSubject,
            lastUpdated: new Date().toISOString(),
            isCustom: subjectDefinition.isCustom,
            indicators: subjectDataEntry?.indicators || [],
        };

        return {
            ...prevScores,
            [activeAcademicYear]: {
                ...yearData,
                [currentUser!.className!]: {
                    ...classDataForYear,
                    [currentSubjectId]: newOrUpdatedSubjectData
                }
            }
        };
    });
};


export const handleLogin = (password: string, setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>, showToast: ShowToastFn) => {
    if (password === SETTINGS_PASSWORD) {
        setIsLoggedIn(true);
        showToast('เข้าสู่ระบบสำเร็จ', 'success');
        return true; // Indicate success
    } else {
        showToast('รหัสผ่านไม่ถูกต้อง', 'error');
        return false; // Indicate failure
    }
};

export const handleLogout = (setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>, showToast: ShowToastFn) => {
    setIsLoggedIn(false);
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
};

export const saveAcademicYear = (year: string, setActiveAcademicYear: React.Dispatch<React.SetStateAction<string>>, isLoggedIn: boolean, showToast: ShowToastFn) => {
    if (!isLoggedIn) { showToast('กรุณาเข้าสู่ระบบเพื่อดำเนินการ', 'warning'); return; }
    setActiveAcademicYear(year);
};

export const importStudentProfiles = (
    parsedProfilesFromFile: StudentProfile[],
    setAllStudentProfiles: React.Dispatch<React.SetStateAction<AllStudentProfiles>>,
    isLoggedIn: boolean,
    showToast: ShowToastFn
): { importedCount: number, updatedCount: number, globalSkippedCount: number } => {
    if (!isLoggedIn) { 
        showToast('กรุณาเข้าสู่ระบบเพื่อดำเนินการ', 'warning'); 
        return { importedCount: 0, updatedCount: 0, globalSkippedCount: parsedProfilesFromFile.length }; 
    }
    let totalImported = 0, totalUpdated = 0, skippedDueToInvalidClass = 0;

    setAllStudentProfiles(prevAllProfiles => {
        const nextAllProfiles = { ...prevAllProfiles };
        parsedProfilesFromFile.forEach(csvProfile => {
            const classKey = csvProfile.classNameCSV;
            if (!CLASS_LEVELS.includes(classKey)) {
                skippedDueToInvalidClass++; return;
            }
            const currentClassProfiles = [...(nextAllProfiles[classKey] || [])];
            const existingIndex = currentClassProfiles.findIndex(p => p.id === csvProfile.id || (p.nationalId && p.nationalId === csvProfile.nationalId && p.nationalId !== ""));
            if (existingIndex > -1) {
                currentClassProfiles[existingIndex] = { ...currentClassProfiles[existingIndex], ...csvProfile, lastProfileUpdate: new Date().toISOString() };
                totalUpdated++;
            } else {
                currentClassProfiles.push(csvProfile);
                totalImported++;
            }
            nextAllProfiles[classKey] = currentClassProfiles.sort((a,b) => (a.fullName || "").localeCompare(b.fullName || "", "th-TH"));
        });
        return nextAllProfiles;
    });
    // Note: The re-initialization of subject data after import will be handled by App.tsx's useEffect watching allStudentProfiles.
    return { importedCount: totalImported, updatedCount: totalUpdated, globalSkippedCount: skippedDueToInvalidClass };
};

const updateScoresData = (
    updatedStudents: StudentScore[],
    newMaxClasswork: number | undefined,
    newMaxExam: number | undefined,
    currentSubjectData: SubjectData,
    activeAcademicYear: string,
    currentClass: string,
    currentSubjectId: string,
    currentMaxClassworkScore: number,
    currentMaxExamScore: number,
    setAllScoresData: React.Dispatch<React.SetStateAction<AllScoresData>>,
    isLoggedIn: boolean,
    showToast: ShowToastFn
) => {
    if (!isLoggedIn) { showToast('กรุณาเข้าสู่ระบบเพื่อบันทึกคะแนน', 'warning'); return; }
    
    const updatedSubjectData: SubjectData = {
      ...currentSubjectData,
      maxClassworkScore: newMaxClasswork ?? currentMaxClassworkScore,
      maxExamScore: newMaxExam ?? currentMaxExamScore,
      students: updatedStudents.sort((a,b) => (a.name || "").localeCompare(b.name || "", "th-TH")),
      lastUpdated: new Date().toISOString(),
    };
    setAllScoresData(prevScores => ({
      ...prevScores,
      [activeAcademicYear]: {
        ...(prevScores[activeAcademicYear] || {}),
        [currentClass]: {
          ...((prevScores[activeAcademicYear] || {})[currentClass] || {}),
          [currentSubjectId]: updatedSubjectData // Removed trailing comma here
        },
      },
    }));
};

export const saveScoreChange = (
    profileId: string,
    field: keyof Pick<StudentScore, 'term1ClassworkScore' | 'term1ExamScore' | 'term2ClassworkScore' | 'term2ExamScore'>,
    value: number | null,
    studentsInCurrentSubject: StudentScore[],
    currentSubjectData: SubjectData | undefined,
    activeAcademicYear: string,
    currentClass: string | undefined,
    currentSubjectId: string,
    currentMaxClassworkScore: number,
    currentMaxExamScore: number,
    setAllScoresData: React.Dispatch<React.SetStateAction<AllScoresData>>,
    isLoggedIn: boolean,
    showToast: ShowToastFn
) => {
    if (!isLoggedIn) { showToast('กรุณาเข้าสู่ระบบเพื่อแก้ไขคะแนน', 'warning'); return; }
    if (!currentSubjectData || !currentClass) return;
    const updatedStudents = studentsInCurrentSubject.map(s => s.profileId === profileId ? { ...s, [field]: value } : s);
    updateScoresData(updatedStudents, undefined, undefined, currentSubjectData, activeAcademicYear, currentClass, currentSubjectId, currentMaxClassworkScore, currentMaxExamScore, setAllScoresData, isLoggedIn, showToast);
};

export const saveSubjectMaxScores = (
    maxClasswork: number,
    maxExam: number,
    studentsInCurrentSubject: StudentScore[],
    currentSubjectData: SubjectData | undefined,
    activeAcademicYear: string,
    currentClass: string | undefined,
    currentSubjectId: string,
    currentMaxClassworkScore: number,
    currentMaxExamScore: number,
    setAllScoresData: React.Dispatch<React.SetStateAction<AllScoresData>>,
    isLoggedIn: boolean,
    showToast: ShowToastFn
) => {
    if (!isLoggedIn) { showToast('กรุณาเข้าสู่ระบบเพื่อตั้งค่าคะแนน', 'warning'); return false; }
    if (!currentSubjectData || !currentClass) return false;
    updateScoresData(studentsInCurrentSubject, maxClasswork, maxExam, currentSubjectData, activeAcademicYear, currentClass, currentSubjectId, currentMaxClassworkScore, currentMaxExamScore, setAllScoresData, isLoggedIn, showToast);
    showToast('บันทึกคะแนนเต็มวิชาเรียบร้อยแล้ว', 'success');
    return true;
};

export const removeStudentFromClass = (
    profileIdToRemove: string,
    currentClass: string,
    activeAcademicYear: string,
    setAllStudentProfiles: React.Dispatch<React.SetStateAction<AllStudentProfiles>>,
    setAllScoresData: React.Dispatch<React.SetStateAction<AllScoresData>>,
    setAllStudentAttendanceSummaries: React.Dispatch<React.SetStateAction<AllStudentAttendanceSummaries>>
) => {
    setAllStudentProfiles(prevProfiles => {
        const updatedClassProfiles = (prevProfiles[currentClass] || []).filter(p => p.id !== profileIdToRemove);
        return { ...prevProfiles, [currentClass]: updatedClassProfiles };
    });
    setAllScoresData(prevScores => {
        const yearData = prevScores[activeAcademicYear];
        if (!yearData || !yearData[currentClass]) return prevScores;
        const classScores = yearData[currentClass];
        const updatedClassScores: Record<string, SubjectData> = {};
        Object.keys(classScores).forEach(subjId => {
            const subjectEntry = classScores[subjId];
            updatedClassScores[subjId] = {
                ...subjectEntry,
                students: subjectEntry.students.filter(s => s.profileId !== profileIdToRemove)
            };
        });
        return { ...prevScores, [activeAcademicYear]: { ...yearData, [currentClass]: updatedClassScores } };
    });
    setAllStudentAttendanceSummaries(prevSummaries => {
        const yearSummaries = prevSummaries[activeAcademicYear];
        if (!yearSummaries || !yearSummaries[currentClass]) return prevSummaries;
        const classSummaries = yearSummaries[currentClass];
        const { [profileIdToRemove]: _, ...restClassSummaries } = classSummaries;
        return { ...prevSummaries, [activeAcademicYear]: { ...yearSummaries, [currentClass]: restClassSummaries }};
    });
};


export const saveStudentProfile = (
    updatedProfileData: EditableStudentProfileData,
    currentClass: string,
    activeAcademicYear: string,
    setAllStudentProfiles: React.Dispatch<React.SetStateAction<AllStudentProfiles>>,
    setAllScoresData: React.Dispatch<React.SetStateAction<AllScoresData>>,
    isLoggedIn: boolean,
    showToast: ShowToastFn
) => {
    if (!isLoggedIn) { showToast('กรุณาเข้าสู่ระบบเพื่อบันทึก', 'warning'); return false; }

    setAllStudentProfiles(prevProfiles => {
        const classProfiles = prevProfiles[currentClass] || [];
        const updatedClassProfiles = classProfiles.map(p => {
            if (p.id === updatedProfileData.id) {
                return {
                    ...p,
                    title: updatedProfileData.title,
                    firstName: updatedProfileData.firstName,
                    lastName: updatedProfileData.lastName,
                    fullName: `${updatedProfileData.title || ''}${updatedProfileData.firstName} ${updatedProfileData.lastName}`.trim(),
                    gender: updatedProfileData.gender,
                    studentSchoolId: updatedProfileData.studentSchoolId,
                    lastProfileUpdate: new Date().toISOString(),
                };
            }
            return p;
        }).sort((a,b) => (a.fullName || "").localeCompare(b.fullName || "", "th-TH"));
        
        // Update names in scores data as well
        setAllScoresData(prevScores => {
            const newScores = {...prevScores};
            if (newScores[activeAcademicYear] && newScores[activeAcademicYear][currentClass]) {
                Object.keys(newScores[activeAcademicYear][currentClass]).forEach(subjId => {
                    const subjectData = newScores[activeAcademicYear][currentClass][subjId];
                    subjectData.students = subjectData.students.map(s =>
                        s.profileId === updatedProfileData.id
                        ? {...s, name: `${updatedProfileData.title || ''}${updatedProfileData.firstName} ${updatedProfileData.lastName}`.trim(), studentIdNumber: updatedProfileData.studentSchoolId}
                        : s
                    ).sort((a,b) => (a.name || "").localeCompare(b.name || "", "th-TH"));
                });
            }
            return newScores;
        });
        return { ...prevProfiles, [currentClass]: updatedClassProfiles };
    });
    showToast('บันทึกข้อมูลนักเรียนเรียบร้อยแล้ว', 'success');
    return true;
};

export const saveNewStudentToClass = (
    newStudentCoreData: Omit<StudentProfile, 'id' | 'schoolCode' | 'schoolName' | 'classNameCSV' | 'roomCSV' | 'birthDate' | 'ageYear' | 'weightKg' | 'heightCm' | 'bloodGroup' | 'religion' | 'ethnicity' | 'nationality' | 'address' | 'guardianInfo' | 'fatherInfo' | 'motherInfo' | 'disadvantage' | 'statusNote' | 'lastProfileUpdate' | 'nationalId' | 'fullName'>,
    currentClass: string,
    setAllStudentProfiles: React.Dispatch<React.SetStateAction<AllStudentProfiles>>,
    isLoggedIn: boolean,
    showToast: ShowToastFn
) => {
    if (!isLoggedIn) { showToast('กรุณาเข้าสู่ระบบเพื่อเพิ่มนักเรียน', 'warning'); return false; }
    
    const newProfileId = `manual_${Date.now()}`;
    const newProfile: StudentProfile = {
        id: newProfileId,
        schoolCode: "", schoolName: "", nationalId: "", classNameCSV: currentClass, roomCSV: "1",
        studentSchoolId: newStudentCoreData.studentSchoolId,
        gender: newStudentCoreData.gender, title: newStudentCoreData.title, firstName: newStudentCoreData.firstName, lastName: newStudentCoreData.lastName,
        fullName: `${newStudentCoreData.title || ''}${newStudentCoreData.firstName} ${newStudentCoreData.lastName}`.trim(),
        birthDate: "", ageYear: "", weightKg: "", heightCm: "", bloodGroup: "", religion: "", ethnicity: "", nationality: "",
        address: { houseNo: "", moo: "", streetSoi: "", tambon: "", amphoe: "", changwat: "" },
        guardianInfo: { name: "", occupation: "", relationship: "" },
        fatherInfo: { name: "", occupation: "" }, motherInfo: { name: "", occupation: "" },
        disadvantage: "", statusNote: "", lastProfileUpdate: new Date().toISOString(),
    };

    setAllStudentProfiles(prev => ({
        ...prev,
        [currentClass]: [...(prev[currentClass] || []), newProfile].sort((a,b) => (a.fullName || "").localeCompare(b.fullName || "", "th-TH"))
    }));
    // The useEffect in App.tsx watching allStudentProfiles will trigger re-initialization.
    showToast(`เพิ่มนักเรียน "${newProfile.fullName}" เข้าชั้นเรียน ${currentClass} เรียบร้อยแล้ว`, 'success');
    return true;
};

export const generateStudyTips = async (
    student: StudentScore,
    subjectDataForTips: SubjectData,
    isLoggedIn: boolean,
    showToast: ShowToastFn
): Promise<{ tips: string, error: string | null }> => {
    if (!isLoggedIn) { showToast('กรุณาเข้าสู่ระบบเพื่อใช้คุณสมบัติ AI', 'warning'); return { tips: '', error: 'User not logged in' }; }
    if (!ai) { showToast("คุณสมบัติ AI ไม่พร้อมใช้งาน", "error"); return { tips: '', error: 'AI not initialized' }; }

    const { subjectName, maxClassworkScore: mcw, maxExamScore: mex } = subjectDataForTips;
    const termTotalMaxForTips = mcw + mex;
    const t1cw = student.term1ClassworkScore !== null ? student.term1ClassworkScore : 'ไม่ได้กรอก';
    const t1ex = student.term1ExamScore !== null ? student.term1ExamScore : 'ไม่ได้กรอก';
    const t1Total = calculateTermTotal(student.term1ClassworkScore, student.term1ExamScore);
    const t1TotalDisplay = t1Total !== null ? t1Total.toFixed(1) : 'ไม่ได้กรอก';
    const t2cw = student.term2ClassworkScore !== null ? student.term2ClassworkScore : 'ไม่ได้กรอก';
    const t2ex = student.term2ExamScore !== null ? student.term2ExamScore : 'ไม่ได้กรอก';
    const t2Total = calculateTermTotal(student.term2ClassworkScore, student.term2ExamScore);
    const t2TotalDisplay = t2Total !== null ? t2Total.toFixed(1) : 'ไม่ได้กรอก';

    const prompt = `นักเรียนชื่อ: ${student.name}\nวิชา: ${subjectName}\nคะแนนเต็มต่อภาคเรียน: เก็บ ${mcw} คะแนน, สอบ ${mex} คะแนน (รวม ${termTotalMaxForTips} คะแนน)\nผลการเรียน:\n- ภาคเรียนที่ 1: คะแนนเก็บ ${t1cw}, คะแนนสอบ ${t1ex}, รวม ${t1TotalDisplay}\n- ภาคเรียนที่ 2: คะแนนเก็บ ${t2cw}, คะแนนสอบ ${t2ex}, รวม ${t2TotalDisplay}\n\nจากข้อมูลผลการเรียนของนักเรียนข้างต้น กรุณาให้คำแนะนำในการเรียนวิชานี้ (เป็นภาษาไทย) โดยเน้นจุดที่ควรปรับปรุง และให้กำลังใจ ควรมีความยาวประมาณ 3-5 ประโยคที่เข้าใจง่ายสำหรับนักเรียนและผู้ปกครอง`;
    try {
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-preview-04-17', contents: prompt });
      return { tips: response.text, error: null };
    } catch (err: any) {
      let errorMessage = "เกิดข้อผิดพลาดในการสร้างคำแนะนำ";
      if (err.message) errorMessage += `: ${err.message}`;
      console.error("Study tips generation error:", err);
      showToast(errorMessage, 'error');
      return { tips: '', error: errorMessage };
    }
};

export const triggerPp6PdfGeneration = async (
    selectedStudentProfileId: string | 'all',
    studentsInCurrentSubject: StudentScore[],
    allStudentsInCurrentClassForProfile: StudentProfile[],
    currentSubjectData: SubjectData | undefined,
    activeAcademicYear: string,
    currentClass: string | undefined,
    isLoggedIn: boolean,
    showToast: ShowToastFn,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
    if (!isLoggedIn) { showToast('กรุณาเข้าสู่ระบบเพื่อสร้าง PDF', 'warning'); return false; }
    if (!currentClass || !currentSubjectData) { showToast('ข้อมูลไม่เพียงพอสำหรับสร้าง ปพ.6', 'error'); return false; }
    
    showToast('กำลังสร้างไฟล์ PDF ปพ.6...', 'info'); setIsLoading(true);
    let studentsToGenerate = studentsInCurrentSubject;
    if (selectedStudentProfileId !== 'all') {
        studentsToGenerate = studentsInCurrentSubject.filter(s => s.profileId === selectedStudentProfileId);
    }
    if (studentsToGenerate.length === 0) { showToast('ไม่พบนักเรียนที่เลือก...', 'warning'); setIsLoading(false); return false; }
    
    try {
        await generatePp6Pdf(studentsToGenerate, allStudentsInCurrentClassForProfile, currentSubjectData, activeAcademicYear, currentClass);
        return true;
    } catch (error: any) { 
        showToast(`เกิดข้อผิดพลาดในการสร้าง PDF ปพ.6: ${error.message || 'Unknown error'}`, 'error'); 
        return false;
    } finally { 
        setIsLoading(false); 
    }
};

export const triggerPp5PdfGeneration = async (
    selectedStudentProfileId: string,
    allStudentsInCurrentClassForProfile: StudentProfile[],
    allScoresDataForClassYear: Record<string, SubjectData> | undefined,
    combinedSubjectListForCurrentClass: SubjectContextForModal[],
    allStudentAttendanceSummariesForClassYearStudent: StudentAttendanceSummary | undefined,
    activeAcademicYear: string,
    currentClass: string | undefined,
    isLoggedIn: boolean,
    showToast: ShowToastFn,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
    if (!isLoggedIn) { showToast('กรุณาเข้าสู่ระบบเพื่อสร้าง PDF', 'warning'); return false; }
    if (!currentClass || !selectedStudentProfileId) { showToast('ข้อมูลไม่เพียงพอสำหรับสร้าง ปพ.5', 'error'); return false; }
    
    const studentProfile = allStudentsInCurrentClassForProfile.find(p => p.id === selectedStudentProfileId);
    if (!studentProfile) { showToast('ไม่พบข้อมูลนักเรียนที่เลือก', 'error'); return false; }

    showToast('กำลังสร้างไฟล์ PDF ปพ.5...', 'info'); setIsLoading(true);
    try {
      await generatePp5Pdf(
        studentProfile,
        allScoresDataForClassYear || {},
        combinedSubjectListForCurrentClass.map(s => ({id: s.id, name: getSubjectNameWithClassLevel(s.baseName, currentClass!)})),
        activeAcademicYear,
        currentClass,
        allStudentAttendanceSummariesForClassYearStudent
      );
      return true;
    } catch (error: any) { 
        showToast(`เกิดข้อผิดพลาดในการสร้าง PDF ปพ.5: ${error.message || 'Unknown error'}`, 'error'); 
        return false;
    } finally { 
        setIsLoading(false); 
    }
};

export const saveDailyAttendance = (
    date: string, 
    dailyData: DailyAttendanceRecord,
    activeAcademicYear: string,
    currentClass: string,
    setFullDailyAttendance: React.Dispatch<React.SetStateAction<FullDailyAttendance>>,
    isLoggedIn: boolean,
    showToast: ShowToastFn
) => {
    if (!isLoggedIn) { showToast('กรุณาเข้าสู่ระบบเพื่อบันทึกการเช็คชื่อ', 'warning'); return; }
    setFullDailyAttendance(prev => ({
        ...prev,
        [activeAcademicYear]: {
            ...(prev[activeAcademicYear] || {}),
            [currentClass]: {
                ...((prev[activeAcademicYear] || {})[currentClass] || {}),
                [date]: dailyData
            }
        }
    }));
    showToast('บันทึกการเช็คชื่อสำหรับวันที่เลือกเรียบร้อยแล้ว', 'success');
};

export const saveAISummaryAttendance = (
    studentId: string, 
    summary: StudentAttendanceSummary,
    activeAcademicYear: string,
    currentClass: string,
    setAllStudentAttendanceSummaries: React.Dispatch<React.SetStateAction<AllStudentAttendanceSummaries>>,
    isLoggedIn: boolean,
    showToast: ShowToastFn
) => {
     if (!isLoggedIn) { showToast('กรุณาเข้าสู่ระบบเพื่อบันทึกข้อมูล', 'warning'); return false; }
     setAllStudentAttendanceSummaries(prev => ({
        ...prev,
        [activeAcademicYear]: {
            ...(prev[activeAcademicYear] || {}),
            [currentClass]: {
                ...((prev[activeAcademicYear] || {})[currentClass] || {}),
                [studentId]: summary
            }
        }
     }));
     showToast('บันทึกสรุปการมาเรียนด้วย AI เรียบร้อยแล้ว', 'success');
     return true;
};

export const saveCustomSubject = (
    subjectName: string,
    activeAcademicYear: string,
    currentClass: string,
    setAllCustomSubjects: React.Dispatch<React.SetStateAction<AllCustomSubjects>>,
    setCurrentSubjectId: React.Dispatch<React.SetStateAction<string>>,
    isLoggedIn: boolean,
    showToast: ShowToastFn
) => {
    if (!isLoggedIn) { showToast('กรุณาเข้าสู่ระบบเพื่อเพิ่มรายวิชา', 'warning'); return false; }
    const newCustomSubjectId = `CUSTOM_S${Date.now()}_${currentClass.replace('ป.','')}`;
    const newSubjectDef: CustomSubjectDefinition = {
        id: newCustomSubjectId,
        baseName: subjectName,
        academicYear: activeAcademicYear,
        className: currentClass,
    };
    setAllCustomSubjects(prev => {
        const yearData = prev[activeAcademicYear] || {};
        const classData = yearData[currentClass] || [];
        return {
            ...prev,
            [activeAcademicYear]: {
                ...yearData,
                [currentClass]: [...classData, newSubjectDef]
            }
        };
    });
    setCurrentSubjectId(newCustomSubjectId);
    showToast(`เพิ่มรายวิชา "${subjectName}" เรียบร้อยแล้ว`, 'success');
    return true;
};

export const saveIndicatorsForSubject = (
    subjectId: string, 
    newIndicators: Indicator[],
    activeAcademicYear: string,
    currentClass: string,
    setAllScoresData: React.Dispatch<React.SetStateAction<AllScoresData>>,
    isLoggedIn: boolean,
    showToast: ShowToastFn
) => {
    if (!isLoggedIn) { showToast('กรุณาเข้าสู่ระบบเพื่อบันทึกตัวชี้วัด', 'warning'); return false; }

    setAllScoresData(prev => {
        const scoresCopy = { ...prev };
        if (scoresCopy[activeAcademicYear]?.[currentClass]?.[subjectId]) {
            scoresCopy[activeAcademicYear][currentClass][subjectId].indicators = newIndicators;
            scoresCopy[activeAcademicYear][currentClass][subjectId].lastUpdated = new Date().toISOString();
        }
        return scoresCopy;
    });
    showToast('บันทึกตัวชี้วัดเรียบร้อยแล้ว', 'success');
    return true;
};

export const deleteCustomSubjectLogic = (
    subjectIdToDelete: string,
    activeAcademicYear: string,
    currentClass: string,
    currentSubjectId: string,
    setAllCustomSubjects: React.Dispatch<React.SetStateAction<AllCustomSubjects>>,
    setAllScoresData: React.Dispatch<React.SetStateAction<AllScoresData>>,
    setCurrentSubjectId: React.Dispatch<React.SetStateAction<string>>,
    showToast: ShowToastFn
) => {
      setAllCustomSubjects(prev => {
          const yearData = { ...(prev[activeAcademicYear] || {}) };
          const classData = (yearData[currentClass] || []).filter(cs => cs.id !== subjectIdToDelete);
          yearData[currentClass] = classData;
          return { ...prev, [activeAcademicYear]: yearData };
      });

      setAllScoresData(prevScores => {
          const scoresCopy = { ...prevScores };
          if (scoresCopy[activeAcademicYear]?.[currentClass]?.[subjectIdToDelete]) {
              delete scoresCopy[activeAcademicYear][currentClass][subjectIdToDelete];
          }
          return scoresCopy;
      });

      if (currentSubjectId === subjectIdToDelete) setCurrentSubjectId('S1');
      showToast('ลบรายวิชาที่กำหนดเองเรียบร้อยแล้ว', 'success');
};