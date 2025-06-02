import { useMemo, useCallback } from 'react';
import {
    User, AllStudentProfiles, AllScoresData, StudentScore, SubjectData, StudentProfile,
    CustomSubjectDefinition, AllCustomSubjects, SubjectContextForModal
} from '../../types'; // Adjusted path
import { SIMPLE_SUBJECT_NAMES, DEFAULT_MAX_CLASSWORK_SCORE, DEFAULT_MAX_EXAM_SCORE } from '../../constants'; // Adjusted path
import { getSubjectNameWithClassLevel } from '../../utils'; // Adjusted path

interface AppCalculationsProps {
  currentUser: User | null;
  activeAcademicYear: string;
  currentSubjectId: string;
  allStudentProfiles: AllStudentProfiles;
  allScoresData: AllScoresData;
  allCustomSubjects: AllCustomSubjects;
}

export const useAppCalculations = ({
  currentUser,
  activeAcademicYear,
  currentSubjectId,
  allStudentProfiles,
  allScoresData,
  allCustomSubjects,
}: AppCalculationsProps) => {

  const combinedSubjectListForCurrentClass = useMemo((): SubjectContextForModal[] => {
    if (!currentUser?.className || !activeAcademicYear) return [];
    const baseSubjects = SIMPLE_SUBJECT_NAMES.map((name, index) => ({
        id: `S${index + 1}`,
        baseName: name,
        isCustom: false,
        className: currentUser.className!,
        academicYear: activeAcademicYear
    }));
    const customForClass = allCustomSubjects[activeAcademicYear]?.[currentUser.className] || [];
    return [...baseSubjects, ...customForClass.map(cs => ({...cs, baseName: cs.baseName, isCustom: true, className: cs.className, academicYear: cs.academicYear}))];
  }, [currentUser, activeAcademicYear, allCustomSubjects]);

  const currentSubjectData = useMemo((): SubjectData | undefined => {
    if (!currentUser?.className || !activeAcademicYear || !currentSubjectId) return undefined;
    return allScoresData[activeAcademicYear]?.[currentUser.className]?.[currentSubjectId];
  }, [allScoresData, activeAcademicYear, currentUser, currentSubjectId]);

  const studentsInCurrentSubject = useMemo((): StudentScore[] => {
    if (!currentSubjectData || !currentUser?.className) return [];
    const classRosterIds = (allStudentProfiles[currentUser.className] || []).map(p => p.id);
    const studentsFromRoster = (allStudentProfiles[currentUser.className] || [])
        .map(profile => {
            const scoreData = currentSubjectData.students.find(s => s.profileId === profile.id);
            return scoreData || {
                profileId: profile.id,
                name: profile.fullName,
                studentIdNumber: profile.studentSchoolId || profile.nationalId,
                term1ClassworkScore: null, term1ExamScore: null,
                term2ClassworkScore: null, term2ExamScore: null,
            };
        })
        .filter(s => classRosterIds.includes(s.profileId))
        .sort((a,b) => (a.name || "").localeCompare(b.name || "", "th-TH"));
    return studentsFromRoster;
  }, [currentSubjectData, allStudentProfiles, currentUser]);

  const allStudentsInCurrentClassForProfile = useMemo((): StudentProfile[] => {
    if (!currentUser?.className) return [];
    return (allStudentProfiles[currentUser.className] || []).sort((a,b) => (a.fullName || "").localeCompare(b.fullName || "", "th-TH"));
  }, [allStudentProfiles, currentUser]);

  const currentMaxClassworkScore = useMemo(() => currentSubjectData?.maxClassworkScore ?? DEFAULT_MAX_CLASSWORK_SCORE, [currentSubjectData]);
  const currentMaxExamScore = useMemo(() => currentSubjectData?.maxExamScore ?? DEFAULT_MAX_EXAM_SCORE, [currentSubjectData]);

  const isSubjectComplete = useCallback((subjectIdToCheck: string): boolean => {
    if (!currentUser?.className || !activeAcademicYear) return false;
    const classRosterProfiles = allStudentProfiles[currentUser.className] || [];
    if (classRosterProfiles.length === 0) return true;
    const subjectDataForCheck = allScoresData[activeAcademicYear]?.[currentUser.className]?.[subjectIdToCheck];
    if (!subjectDataForCheck) return false;
    
    const studentsInSubjectSet = new Set(subjectDataForCheck.students.map(s => s.profileId));
    for (const profileInRoster of classRosterProfiles) {
        if (!studentsInSubjectSet.has(profileInRoster.id)) return false;
    }

    for (const studentScoreEntry of subjectDataForCheck.students) {
        if (!classRosterProfiles.some(p => p.id === studentScoreEntry.profileId)) continue;
        if (studentScoreEntry.term1ClassworkScore === null || studentScoreEntry.term1ExamScore === null ||
            studentScoreEntry.term2ClassworkScore === null || studentScoreEntry.term2ExamScore === null) {
            return false;
        }
    }
    return true;
  }, [currentUser, activeAcademicYear, allStudentProfiles, allScoresData]);

  const getSubjectCompletionIcon = useCallback((subjectIdToCheck: string): '✔️' | '❌' | '' => {
    if (!currentUser?.className) return '';
    return isSubjectComplete(subjectIdToCheck) ? '✔️' : '❌';
  }, [currentUser, isSubjectComplete]);

  const subjectCompletionStatus = useMemo(() => {
    if (!currentUser?.className || !activeAcademicYear) return { completed: 0, total: combinedSubjectListForCurrentClass.length };
    let completedCount = 0;
    const totalSubjects = combinedSubjectListForCurrentClass.length;
    combinedSubjectListForCurrentClass.forEach((subj) => {
        if (isSubjectComplete(subj.id)) { completedCount++; }
    });
    return { completed: completedCount, total: totalSubjects };
  }, [currentUser, activeAcademicYear, isSubjectComplete, combinedSubjectListForCurrentClass]);
  
  const fullCurrentSubjectNameForModals = useMemo(() => currentSubjectData?.subjectName ||
      getSubjectNameWithClassLevel(combinedSubjectListForCurrentClass.find(s => s.id === currentSubjectId)?.baseName || 'N/A', currentUser?.className || ''),
      [currentSubjectData, combinedSubjectListForCurrentClass, currentSubjectId, currentUser]
  );


  return {
    combinedSubjectListForCurrentClass,
    currentSubjectData,
    studentsInCurrentSubject,
    allStudentsInCurrentClassForProfile,
    currentMaxClassworkScore,
    currentMaxExamScore,
    isSubjectComplete,
    getSubjectCompletionIcon,
    subjectCompletionStatus,
    fullCurrentSubjectNameForModals,
  };
};