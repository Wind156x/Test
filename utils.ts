// utils.ts

export const getSubjectNameWithClassLevel = (baseSubjectName: string, className: string): string => {
    if (!className || !baseSubjectName) return baseSubjectName || 'N/A';
    const classLevelNumber = className.replace('ป.', '').trim(); 
    return `${baseSubjectName} ${classLevelNumber}`;
};

export const calculateTermTotal = (classwork: number | null, exam: number | null): number | null => {
    if (classwork === null && exam === null) return null;
    return (classwork || 0) + (exam || 0);
};
