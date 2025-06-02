import { useState } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage'; // Adjusted path
import {
    User, AllStudentProfiles, AllScoresData, AllCustomSubjects, FullDailyAttendance, AllStudentAttendanceSummaries, ToastMessage, ActiveView, ModalType
} from '../../types'; // Adjusted path

// Corrected initial academic year calculation for Thai calendar (May = start of new academic year)
// Months are 0-indexed, so month 4 is May. If current month is < May (Jan-Apr), it's previous academic year.
const getInitialAcademicYear = () => `${new Date().getFullYear() + 543 - (new Date().getMonth() < 4 ? 1 : 0)}`;


export const useAppStateManager = () => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage<boolean>('isLoggedIn', false);
  const [activeAcademicYear, setActiveAcademicYear] = useLocalStorage<string>('activeAcademicYear', getInitialAcademicYear());

  const [allStudentProfiles, setAllStudentProfiles] = useLocalStorage<AllStudentProfiles>('allStudentProfiles', {});
  const [allScoresData, setAllScoresData] = useLocalStorage<AllScoresData>('allScoresData', {});
  const [allCustomSubjects, setAllCustomSubjects] = useLocalStorage<AllCustomSubjects>('allCustomSubjects', {});
  const [fullDailyAttendance, setFullDailyAttendance] = useLocalStorage<FullDailyAttendance>('fullDailyAttendance', {});
  const [allStudentAttendanceSummaries, setAllStudentAttendanceSummaries] = useLocalStorage<AllStudentAttendanceSummaries>('allStudentAttendanceSummaries', {});

  const [currentSubjectId, setCurrentSubjectId] = useLocalStorage<string>('currentSubjectId', 'S1');
  const [activeView, setActiveView] = useLocalStorage<ActiveView>('activeView', 'dashboard');
  
  // UI specific states that might remain in App.tsx or move here if they are closely tied to data logic
  const [activeModal, setActiveModal] = useState<ModalType>(ModalType.None);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // General loading for PDFs etc.

  return {
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
  };
};