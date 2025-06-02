import React, { useState, useEffect, useCallback } from 'react';
import { useAppStateManager } from './hooks/useAppStateManager';
import { useAppCalculations } from './hooks/useAppCalculations';
import * as AppLogic from './services/appLogicService';
import {
    StudentProfile, StudentScore, SubjectData, ModalType, ToastMessage,
    EditableStudentProfileData, ActiveView, SubjectContextForModal, Indicator
} from '../types'; // Adjusted path
import { getSubjectNameWithClassLevel } from '../utils'; // Adjusted path

import ClassSelectionScreen from '../components/ClassSelectionScreen'; // Adjusted path
import Navigation from '../components/Navigation'; // Adjusted path
// Page components
import DashboardPage from '../components/pages/DashboardPage'; // Adjusted path
import StudentInfoPage from '../components/pages/StudentInfoPage'; // Adjusted path
import AttendancePage from '../components/pages/AttendancePage'; // Adjusted path
import ScoresPage from '../components/pages/ScoresPage'; // Adjusted path
import Pp5ReportPage from '../components/pages/Pp5ReportPage'; // Adjusted path
import Pp6ReportPage from '../components/pages/Pp6ReportPage'; // Adjusted path
import ManageSubjectsPage from '../components/pages/ManageSubjectsPage'; // Adjusted path
import SettingsPage from '../components/pages/SettingsPage'; // Adjusted path

// Modals
import LoginPasswordModal from '../components/modals/LoginPasswordModal'; // Adjusted path
import SubjectMaxScoresModal from '../components/modals/SubjectMaxScoresModal'; // Adjusted path
import ConfirmationModal from '../components/modals/ConfirmationModal'; // Adjusted path
import Pp6SelectionModal from '../components/modals/Pp6SelectionModal'; // Adjusted path
import EditStudentProfileModal from '../components/modals/EditStudentProfileModal'; // Adjusted path
import StudyTipsModal from '../components/modals/StudyTipsModal'; // Adjusted path
import Pp5StudentSelectionModal from '../components/modals/Pp5StudentSelectionModal'; // Adjusted path
import AddStudentToClassModal from '../components/modals/AddStudentToClassModal'; // Adjusted path
import AISummaryAttendanceModal from '../components/modals/AISummaryAttendanceModal'; // Adjusted path
import AddCustomSubjectModal from '../components/modals/AddCustomSubjectModal'; // Adjusted path
import ManageIndicatorsModal from '../components/modals/ManageIndicatorsModal'; // Adjusted path
import Toast from '../components/Toast'; // Adjusted path

const App: React.FC = () => {
  const {
    currentUser, setCurrentUser,
    isLoggedIn, setIsLoggedIn,
    activeAcademicYear, setActiveAcademicYear,
    allStudentProfiles, setAllStudentProfiles,
    allScoresData, setAllScoresData,
    allCustomSubjects, setAllCustomSubjects,
    fullDailyAttendance, setFullDailyAttendance,
    allStudentAttendanceSummaries, setAllStudentAttendanceSummaries,
    currentSubjectId, setCurrentSubjectId,
    activeView, setActiveView,
    activeModal, setActiveModal,
    toast, setToast,
    isLoading, setIsLoading,
  } = useAppStateManager();

  const calculations = useAppCalculations({
    currentUser, activeAcademicYear, currentSubjectId, allStudentProfiles, allScoresData, allCustomSubjects
  });

  // UI-specific state for modals that need to hold temporary data
  const [confirmationState, setConfirmationState] = useState<{ message: string, onConfirm: () => void, confirmText?: string } | null>(null);
  const [studentForStudyTips, setStudentForStudyTips] = useState<StudentScore | null>(null);
  const [studyTipsContent, setStudyTipsContent] = useState<string>('');
  const [isStudyTipsLoading, setIsStudyTipsLoading] = useState<boolean>(false);
  const [studyTipsError, setStudyTipsError] = useState<string | null>(null);
  const [editingStudentProfile, setEditingStudentProfile] = useState<StudentProfile | null>(null);
  const [subjectForIndicators, setSubjectForIndicators] = useState<SubjectContextForModal | null>(null);
  const [studentForAISummaryAttendance, setStudentForAISummaryAttendance] = useState<StudentProfile | null>(null);

  const showAppToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    setToast({ id: Date.now().toString(), message, type });
  }, [setToast]);

  // Effect for initializing subject data when relevant dependencies change
  useEffect(() => {
    if (currentUser?.className) {
        AppLogic.initializeSubjectDataForClass(
            currentUser,
            activeAcademicYear,
            currentSubjectId,
            allStudentProfiles,
            calculations.combinedSubjectListForCurrentClass, // Pass calculated list
            setAllScoresData
        );
    }
  }, [currentUser, activeAcademicYear, currentSubjectId, allStudentProfiles, calculations.combinedSubjectListForCurrentClass, setAllScoresData]);


  const handleClassSelected = (selectedClass: string) => {
    setCurrentUser({ className: selectedClass, teacherName: "", isLoggedIn: false });
    setIsLoggedIn(false);
    setActiveView('dashboard');
    setCurrentSubjectId('S1');
  };

  const handleLoginAttempt = (password: string) => {
    if (AppLogic.handleLogin(password, setIsLoggedIn, showAppToast)) {
        setActiveModal(ModalType.None);
    }
  };
  
  const handleLogoutAttempt = () => AppLogic.handleLogout(setIsLoggedIn, showAppToast);

  const handleSaveAcademicYear = (year: string) => {
    AppLogic.saveAcademicYear(year, setActiveAcademicYear, isLoggedIn, showAppToast);
    // Re-trigger initialization by depending on activeAcademicYear in the main useEffect
    if (currentUser?.className) { // Ensure re-initialization logic has context
       AppLogic.initializeSubjectDataForClass(
            currentUser, year, currentSubjectId, allStudentProfiles, 
            calculations.combinedSubjectListForCurrentClass, setAllScoresData
        );
    }
  };
  
  const handleImportStudentProfiles = (parsedProfilesFromFile: StudentProfile[]) => {
    const result = AppLogic.importStudentProfiles(parsedProfilesFromFile, setAllStudentProfiles, isLoggedIn, showAppToast);
    // The useEffect for initializeSubjectDataIfNeeded will pick up allStudentProfiles changes.
    // To ensure immediate reflection IF the current class's roster changed:
    if (currentUser?.className && result.importedCount + result.updatedCount > 0) {
         AppLogic.initializeSubjectDataForClass(
            currentUser, activeAcademicYear, currentSubjectId, allStudentProfiles, 
            calculations.combinedSubjectListForCurrentClass, setAllScoresData
        );
    }
    return result;
  };
  
  const handleScoreChange = (profileId: string, field: keyof Pick<StudentScore, 'term1ClassworkScore' | 'term1ExamScore' | 'term2ClassworkScore' | 'term2ExamScore'>, value: number | null) => {
    AppLogic.saveScoreChange(
        profileId, field, value, calculations.studentsInCurrentSubject, calculations.currentSubjectData,
        activeAcademicYear, currentUser?.className, currentSubjectId, calculations.currentMaxClassworkScore,
        calculations.currentMaxExamScore, setAllScoresData, isLoggedIn, showAppToast
    );
  };

  const handleSaveSubjectMaxScores = (maxClasswork: number, maxExam: number) => {
    if(AppLogic.saveSubjectMaxScores(
        maxClasswork, maxExam, calculations.studentsInCurrentSubject, calculations.currentSubjectData,
        activeAcademicYear, currentUser?.className, currentSubjectId, calculations.currentMaxClassworkScore,
        calculations.currentMaxExamScore, setAllScoresData, isLoggedIn, showAppToast
    )) {
        setActiveModal(ModalType.None);
    }
  };

  const handleRemoveStudentFromClass = (profileIdToRemove: string, studentName: string, actionType: 'delete' | 'transfer') => {
    if (!isLoggedIn) { showAppToast('กรุณาเข้าสู่ระบบเพื่อดำเนินการ', 'warning'); return; }
    if (!currentUser?.className) return;
    
    const message = actionType === 'transfer'
      ? `คุณแน่ใจหรือไม่ว่าต้องการแจ้งย้าย/ลาออกสำหรับนักเรียน '${studentName}' จากชั้นเรียน ${currentUser.className}? นักเรียนจะถูกนำออกจากบัญชีรายชื่อและข้อมูลคะแนนรวมถึงข้อมูลการเข้าเรียนที่เกี่ยวข้องกับชั้นเรียนนี้จะถูกลบ`
      : `คุณแน่ใจหรือไม่ว่าต้องการลบนักเรียน '${studentName}' ออกจากชั้นเรียน ${currentUser.className}? ข้อมูลโปรไฟล์, คะแนน, และข้อมูลการเข้าเรียนทั้งหมดของนักเรียนในชั้นเรียนนี้จะถูกลบถาวร`;
      
    setConfirmationState({
        message: message,
        confirmText: studentName,
        onConfirm: () => {
            AppLogic.removeStudentFromClass(profileIdToRemove, currentUser.className!, activeAcademicYear, setAllStudentProfiles, setAllScoresData, setAllStudentAttendanceSummaries);
            const actionMessage = actionType === 'transfer' ? 'แจ้งย้าย/ลาออก' : 'ลบ';
            showAppToast(`${actionMessage}นักเรียน '${studentName}' ออกจากชั้นเรียน ${currentUser.className} เรียบร้อยแล้ว`, 'success');
            setConfirmationState(null);
            setActiveModal(ModalType.None);
        }
    });
    setActiveModal(ModalType.Confirmation);
  };

  const handleSaveStudentProfile = (updatedProfileData: EditableStudentProfileData) => {
    if (!currentUser?.className) return;
    if(AppLogic.saveStudentProfile(updatedProfileData, currentUser.className, activeAcademicYear, setAllStudentProfiles, setAllScoresData, isLoggedIn, showAppToast)){
        setActiveModal(ModalType.None);
        setEditingStudentProfile(null);
    }
  };
  
  const handleSaveNewStudentToClass = (newStudentData: Omit<StudentProfile, 'id' | 'schoolCode' | 'schoolName' | 'classNameCSV' | 'roomCSV' | 'birthDate' | 'ageYear' | 'weightKg' | 'heightCm' | 'bloodGroup' | 'religion' | 'ethnicity' | 'nationality' | 'address' | 'guardianInfo' | 'fatherInfo' | 'motherInfo' | 'disadvantage' | 'statusNote' | 'lastProfileUpdate' | 'nationalId' | 'fullName'>) => {
    if (!currentUser?.className) return;
    if(AppLogic.saveNewStudentToClass(newStudentData, currentUser.className, setAllStudentProfiles, isLoggedIn, showAppToast)){
        setActiveModal(ModalType.None);
    }
  };

  const handleOpenStudyTipsModal = async (student: StudentScore) => {
    if (!calculations.currentSubjectData) { showAppToast('ไม่สามารถโหลดข้อมูลวิชาปัจจุบันสำหรับสร้างคำแนะนำได้', 'error'); return; }
    setActiveModal(ModalType.StudyTips);
    setIsStudyTipsLoading(true); setStudyTipsContent(''); setStudyTipsError(null);
    setStudentForStudyTips(student);
    const result = await AppLogic.generateStudyTips(student, calculations.currentSubjectData, isLoggedIn, showAppToast);
    setStudyTipsContent(result.tips);
    setStudyTipsError(result.error);
    setIsStudyTipsLoading(false);
  };

  const handleRegenerateStudyTips = async () => {
    if (studentForStudyTips && calculations.currentSubjectData) {
        setIsStudyTipsLoading(true); setStudyTipsContent(''); setStudyTipsError(null);
        const result = await AppLogic.generateStudyTips(studentForStudyTips, calculations.currentSubjectData, isLoggedIn, showAppToast);
        setStudyTipsContent(result.tips);
        setStudyTipsError(result.error);
        setIsStudyTipsLoading(false);
    }
  };

  const handleGeneratePp6 = async (selectedStudentProfileId: string | 'all') => {
    if(await AppLogic.triggerPp6PdfGeneration(
        selectedStudentProfileId, calculations.studentsInCurrentSubject, calculations.allStudentsInCurrentClassForProfile,
        calculations.currentSubjectData, activeAcademicYear, currentUser?.className, isLoggedIn, showAppToast, setIsLoading
    )){
        setActiveModal(ModalType.None);
    }
  };
  
  const handleGeneratePp5 = async (selectedStudentProfileId: string) => {
    const studentAttendanceSummary = allStudentAttendanceSummaries[activeAcademicYear]?.[currentUser!.className!]?.[selectedStudentProfileId];
    if(await AppLogic.triggerPp5PdfGeneration(
        selectedStudentProfileId, calculations.allStudentsInCurrentClassForProfile, 
        allScoresData[activeAcademicYear]?.[currentUser!.className!], 
        calculations.combinedSubjectListForCurrentClass,
        studentAttendanceSummary,
        activeAcademicYear, currentUser?.className, isLoggedIn, showAppToast, setIsLoading
    )){
        setActiveModal(ModalType.None);
    }
  };

  const handleSaveDailyAttendance = (date: string, dailyData: any) => { // DailyAttendanceRecord
    if (!currentUser?.className) return;
    AppLogic.saveDailyAttendance(date, dailyData, activeAcademicYear, currentUser.className, setFullDailyAttendance, isLoggedIn, showAppToast);
  };

  const handleSaveAISummaryAttendance = (studentId: string, summary: any) => { // StudentAttendanceSummary
     if (!currentUser?.className) return;
     if(AppLogic.saveAISummaryAttendance(studentId, summary, activeAcademicYear, currentUser.className, setAllStudentAttendanceSummaries, isLoggedIn, showAppToast)){
        setActiveModal(ModalType.None);
     }
  };
  
  const handleSaveCustomSubject = (subjectName: string) => {
    if (!currentUser?.className) return;
    if(AppLogic.saveCustomSubject(subjectName, activeAcademicYear, currentUser.className, setAllCustomSubjects, setCurrentSubjectId, isLoggedIn, showAppToast)){
        setActiveModal(ModalType.None);
    }
  };

  const handleSaveIndicators = (subjectId: string, newIndicators: Indicator[]) => {
    if (!currentUser?.className) return;
    if(AppLogic.saveIndicatorsForSubject(subjectId, newIndicators, activeAcademicYear, currentUser.className, setAllScoresData, isLoggedIn, showAppToast)){
        setActiveModal(ModalType.None);
    }
  };

  const handleDeleteCustomSubject = (subjectIdToDelete: string) => {
      if (!isLoggedIn || !currentUser?.className) { showAppToast('กรุณาเข้าสู่ระบบเพื่อลบรายวิชา', 'warning'); return; }
      const subjectDefToDelete = (allCustomSubjects[activeAcademicYear]?.[currentUser.className] || []).find(cs => cs.id === subjectIdToDelete);
      setConfirmationState({
          message: `คุณแน่ใจหรือไม่ว่าต้องการลบรายวิชา "${subjectDefToDelete?.baseName || 'ที่เลือก'}"? ข้อมูลคะแนนและตัวชี้วัดทั้งหมดที่เกี่ยวข้องกับรายวิชานี้จะถูกลบอย่างถาวร`,
          confirmText: subjectDefToDelete?.baseName,
          onConfirm: () => {
              AppLogic.deleteCustomSubjectLogic(subjectIdToDelete, activeAcademicYear, currentUser.className!, currentSubjectId, setAllCustomSubjects, setAllScoresData, setCurrentSubjectId, showAppToast);
              setConfirmationState(null);
          }
      });
      setActiveModal(ModalType.Confirmation);
  };

  const renderActiveView = () => {
    if (!currentUser?.className) return null;
    const commonPageProps = { currentUser, showToast: showAppToast, isLoggedIn, activeAcademicYear };

    switch (activeView) {
      case 'dashboard':
        return <DashboardPage
                  {...commonPageProps}
                  subjectCompletionStatus={calculations.subjectCompletionStatus}
                  studentsCount={calculations.allStudentsInCurrentClassForProfile.length}
                />;
      case 'studentInfo':
        return <StudentInfoPage
                  {...commonPageProps}
                  studentsInClass={calculations.allStudentsInCurrentClassForProfile}
                  onRemoveStudentFromClass={handleRemoveStudentFromClass}
                  onEditStudent={(studentProf) => { setEditingStudentProfile(studentProf); setActiveModal(ModalType.EditStudentProfile); }}
                  onOpenAddStudentModal={() => setActiveModal(ModalType.AddStudentToClass)}
               />;
      case 'attendance':
        return <AttendancePage
                  {...commonPageProps}
                  studentsInClass={calculations.allStudentsInCurrentClassForProfile}
                  currentAttendance={fullDailyAttendance[activeAcademicYear]?.[currentUser.className] || {}}
                  onSaveDailyAttendance={handleSaveDailyAttendance}
                  studentSummaries={allStudentAttendanceSummaries[activeAcademicYear]?.[currentUser.className] || {}}
                  onOpenAISummaryModal={(student) => {setStudentForAISummaryAttendance(student); setActiveModal(ModalType.AISummaryAttendance);}}
                />;
      case 'scores':
        return <ScoresPage
                  {...commonPageProps}
                  currentSubjectId={currentSubjectId}
                  onSubjectChange={setCurrentSubjectId}
                  studentsInSubject={calculations.studentsInCurrentSubject}
                  maxClassworkScore={calculations.currentMaxClassworkScore}
                  maxExamScore={calculations.currentMaxExamScore}
                  onScoreChange={handleScoreChange}
                  onSetSubjectScores={() => setActiveModal(ModalType.SubjectMaxScores)}
                  isLoading={isLoading && activeModal !== ModalType.StudyTips}
                  subjectCompletionStatus={calculations.subjectCompletionStatus}
                  getSubjectCompletionIcon={calculations.getSubjectCompletionIcon}
                  allSubjectsForClass={calculations.combinedSubjectListForCurrentClass}
                  showToast={showAppToast}
                  onOpenStudyTips={handleOpenStudyTipsModal}
               />;
      case 'pp5report':
        return <Pp5ReportPage {...commonPageProps} onOpenStudentSelection={() => setActiveModal(ModalType.Pp5StudentSelection)} />;
      case 'pp6report':
        return <Pp6ReportPage
                  {...commonPageProps}
                  onOpenStudentSelection={() => {
                    if (calculations.studentsInCurrentSubject.length === 0 || !calculations.currentSubjectData) {
                        showAppToast('ไม่มีข้อมูลนักเรียนหรือวิชาสำหรับสร้าง ปพ.6', 'error'); return;
                    }
                    setActiveModal(ModalType.Pp6Selection);
                  }}
                  currentSubjectName={calculations.currentSubjectData?.subjectName || getSubjectNameWithClassLevel(calculations.combinedSubjectListForCurrentClass.find(s => s.id === currentSubjectId)?.baseName || 'N/A', currentUser.className)}
                />;
      case 'manageSubjects':
        return <ManageSubjectsPage
                  {...commonPageProps}
                  allSubjectsForClass={calculations.combinedSubjectListForCurrentClass}
                  customSubjectsForClass={allCustomSubjects[activeAcademicYear]?.[currentUser.className] || []}
                  onOpenAddCustomSubjectModal={() => setActiveModal(ModalType.AddCustomSubject)}
                  onOpenManageIndicatorsModal={(subject) => {setSubjectForIndicators(subject); setActiveModal(ModalType.ManageIndicators);}}
                  onDeleteCustomSubject={handleDeleteCustomSubject}
                />;
      case 'settings':
        return <SettingsPage
                  {...commonPageProps}
                  currentAcademicYear={activeAcademicYear}
                  onSaveAcademicYear={handleSaveAcademicYear}
                  onImportStudentProfiles={handleImportStudentProfiles}
                />;
      default:
        setActiveView('dashboard');
        return <DashboardPage {...commonPageProps} subjectCompletionStatus={calculations.subjectCompletionStatus} studentsCount={calculations.allStudentsInCurrentClassForProfile.length} />;
    }
  };

  if (!currentUser?.className) {
    return <ClassSelectionScreen onClassSelected={handleClassSelected} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      <Navigation
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        onLoginClick={() => setActiveModal(ModalType.LoginPassword)}
        onLogout={handleLogoutAttempt}
        currentUser={currentUser}
        isLoggedIn={isLoggedIn}
        activeAcademicYear={activeAcademicYear}
      />
      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-6 overflow-y-auto ml-0 sm:ml-64">
        {renderActiveView()}
      </main>

      <LoginPasswordModal
        isOpen={activeModal === ModalType.LoginPassword}
        onClose={() => setActiveModal(ModalType.None)}
        onLogin={handleLoginAttempt}
      />
      <SubjectMaxScoresModal
        isOpen={activeModal === ModalType.SubjectMaxScores}
        onClose={() => setActiveModal(ModalType.None)}
        currentSubjectName={calculations.fullCurrentSubjectNameForModals}
        initialMaxClasswork={calculations.currentMaxClassworkScore}
        initialMaxExam={calculations.currentMaxExamScore}
        onSave={handleSaveSubjectMaxScores}
        showToast={showAppToast}
        isEditable={isLoggedIn}
      />
       {confirmationState && (
            <ConfirmationModal
                isOpen={activeModal === ModalType.Confirmation}
                onClose={() => { setActiveModal(ModalType.None); setConfirmationState(null); }}
                onConfirm={() => { if (confirmationState.onConfirm) confirmationState.onConfirm(); setConfirmationState(null); }}
                message={confirmationState.message}
                confirmText={confirmationState.confirmText}
            />
        )}
      <Pp6SelectionModal
        isOpen={activeModal === ModalType.Pp6Selection}
        onClose={() => setActiveModal(ModalType.None)}
        studentsInSubject={calculations.studentsInCurrentSubject}
        subjectName={calculations.fullCurrentSubjectNameForModals}
        className={currentUser.className}
        onGenerate={handleGeneratePp6}
        isActionable={isLoggedIn}
      />
      <Pp5StudentSelectionModal
        isOpen={activeModal === ModalType.Pp5StudentSelection}
        onClose={() => setActiveModal(ModalType.None)}
        studentsInClass={calculations.allStudentsInCurrentClassForProfile}
        onGenerate={handleGeneratePp5}
        isActionable={isLoggedIn}
      />
      <EditStudentProfileModal
        isOpen={activeModal === ModalType.EditStudentProfile}
        onClose={() => { setActiveModal(ModalType.None); setEditingStudentProfile(null); }}
        studentProfile={editingStudentProfile}
        onSave={handleSaveStudentProfile}
        showToast={showAppToast}
        isEditable={isLoggedIn}
      />
      <StudyTipsModal
        isOpen={activeModal === ModalType.StudyTips}
        onClose={() => { setActiveModal(ModalType.None); setStudentForStudyTips(null); setStudyTipsContent(''); setStudyTipsError(null); }}
        student={studentForStudyTips}
        subjectName={calculations.fullCurrentSubjectNameForModals}
        maxClassworkScore={calculations.currentMaxClassworkScore} 
        maxExamScore={calculations.currentMaxExamScore}
        tips={studyTipsContent} 
        isLoading={isStudyTipsLoading} 
        error={studyTipsError}
        onRegenerateTips={handleRegenerateStudyTips}
        canGenerate={isLoggedIn && !!AppLogic.ai}
      />
      <AddStudentToClassModal
        isOpen={activeModal === ModalType.AddStudentToClass}
        onClose={() => setActiveModal(ModalType.None)}
        onSave={handleSaveNewStudentToClass}
        showToast={showAppToast}
        isEditable={isLoggedIn}
      />
      <AISummaryAttendanceModal
          isOpen={activeModal === ModalType.AISummaryAttendance}
          onClose={() => {setActiveModal(ModalType.None); setStudentForAISummaryAttendance(null);}}
          student={studentForAISummaryAttendance}
          onSave={handleSaveAISummaryAttendance}
          showToast={showAppToast}
          isEditable={isLoggedIn}
      />
      <AddCustomSubjectModal
          isOpen={activeModal === ModalType.AddCustomSubject}
          onClose={() => setActiveModal(ModalType.None)}
          onSave={handleSaveCustomSubject}
          showToast={showAppToast}
          isEditable={isLoggedIn}
      />
      <ManageIndicatorsModal
          isOpen={activeModal === ModalType.ManageIndicators}
          onClose={() => {setActiveModal(ModalType.None); setSubjectForIndicators(null);}}
          subject={subjectForIndicators}
          currentIndicators={subjectForIndicators ? (allScoresData[activeAcademicYear]?.[currentUser.className]?.[subjectForIndicators.id]?.indicators || []) : []}
          onSave={handleSaveIndicators}
          showToast={showAppToast}
          isEditable={isLoggedIn}
          aiInstance={AppLogic.ai}
      />
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};

export default App;