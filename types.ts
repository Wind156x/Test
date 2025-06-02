
export interface StudentAddress {
    houseNo: string;
    moo: string;
    streetSoi: string;
    tambon: string;
    amphoe: string;
    changwat: string;
}

export interface PersonInfo {
    name: string;
    occupation: string;
}

export interface StudentProfile {
    id: string; 
    schoolCode: string;
    schoolName: string;
    nationalId: string; 
    classNameCSV: string; 
    roomCSV: string; 
    studentSchoolId: string; 
    gender: string;
    title: string;
    firstName: string;
    lastName: string;
    fullName: string;
    birthDate: string;
    ageYear: string;
    weightKg: string;
    heightCm: string;
    bloodGroup: string;
    religion: string;
    ethnicity: string;
    nationality: string;
    address: StudentAddress;
    guardianInfo: PersonInfo & { relationship: string };
    fatherInfo: PersonInfo;
    motherInfo: PersonInfo;
    disadvantage: string;
    statusNote: string; 
    lastProfileUpdate: string; 
}

export interface StudentScore {
    profileId: string; 
    name: string; 
    studentIdNumber: string; 
    term1ClassworkScore: number | null;
    term1ExamScore: number | null;
    term2ClassworkScore: number | null;
    term2ExamScore: number | null;
}

export interface Indicator {
    id: string;
    text: string;
    source?: 'ai' | 'manual';
}

export interface SubjectData {
    academicYear: string;
    class: string;
    subjectId: string; // This is the S1, S2, CUSTOM_ID, etc.
    subjectName: string; // Full name like "ภาษาไทย ป.1"
    maxClassworkScore: number; 
    maxExamScore: number;    
    students: StudentScore[];
    lastUpdated: string; 
    isCustom?: boolean; // Flag for custom subjects
    indicators?: Indicator[]; // For storing subject-specific indicators
}

export interface CustomSubjectDefinition {
    id: string; // e.g., CUSTOM_S1_2567_P1
    baseName: string; // User-defined name like "ดนตรี-นาฏศิลป์"
    academicYear: string;
    className: string;
}

// This type represents the consistent structure passed to modals like ManageIndicatorsModal
export interface SubjectContextForModal {
    id: string; // S1, S2, CUSTOM_ID etc.
    baseName: string; // Base name like "ภาษาไทย", "ดนตรี-นาฏศิลป์"
    isCustom: boolean; // Changed from isCustom?: boolean
    className: string;
    academicYear: string;
}


export type AllStudentProfiles = Record<string, StudentProfile[]>; 

export type AllScoresData = Record<string, // Academic Year 
    Record<string, // Class Name 
        Record<string, SubjectData> // Subject ID (S1, S2, CUSTOM_ID, etc.)
    >
>;

export type AllCustomSubjects = Record<string, // Academic Year
    Record<string, // Class Name
        CustomSubjectDefinition[]
    >
>;

export interface User {
    className: string | null; // Can be null initially before class selection
    teacherName: string; // Kept for potential future use, but currently empty
    isLoggedIn: boolean; // New flag for edit/write access
}

export enum ModalType {
    LoginPassword = 'loginPassword', // For general login to enable write actions
    SettingsPassword = 'settingsPassword', // For accessing settings page (if needed, or settings page just respects isLoggedIn)
    SubjectMaxScores = 'subjectMaxScores',
    Confirmation = 'confirmation',
    Pp6Selection = 'pp6Selection',
    StudyTips = 'studyTips', 
    EditStudentProfile = 'editStudentProfile',
    Pp5StudentSelection = 'pp5StudentSelection',
    AddStudentToClass = 'addStudentToClass',
    AISummaryAttendance = 'aiSummaryAttendance',
    AddCustomSubject = 'addCustomSubject',
    ManageIndicators = 'manageIndicators',
    None = 'none'
}

export type ActiveView = 
  | 'dashboard' 
  | 'studentInfo' 
  | 'attendance' 
  | 'scores' 
  | 'pp5report' 
  | 'pp6report' 
  | 'manageSubjects'
  // | 'manageIndicators' // View removed, modal used instead
  | 'settings';

export interface ToastMessage {
    id: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
}

export interface EditableStudentProfileData {
    id: string;
    title: string;
    firstName: string;
    lastName: string;
    gender: string;
    studentSchoolId: string;
}

export interface Pp5ReportParams {
    studentProfileId: string; 
    academicYear: string;
    className: string;
    studentAttendanceSummary?: StudentAttendanceSummary; // Added for passing summary to PDF
}

// Attendance Types
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | null;
export type DailyAttendanceRecord = Record<string, /* studentId */ AttendanceStatus>; // studentId -> status for a single day

// Stores all daily attendance: Year -> Class -> DateISO -> StudentId -> Status
export type FullDailyAttendance = Record<string, /* academicYear */
    Record<string, /* className */
        Record<string, /* dateISOString */
            DailyAttendanceRecord
        >
    >
>;

// Summary for a student for a period (e.g., year or term)
export interface StudentAttendanceSummary {
    totalInstructionalDays: number;
    daysPresent: number;
    daysAbsent: number;
    daysLate: number;
    daysExcused: number;
}
// Stores summaries for all students: Year -> Class -> StudentId -> Summary
export type AllStudentAttendanceSummaries = Record<string, /* academicYear */
    Record<string, /* className */
        Record<string, /* studentId */
            StudentAttendanceSummary
        >
    >
>;

declare global {
    interface Window {
        pdfMake: any; 
        vfsFonts: any; 
    }
}