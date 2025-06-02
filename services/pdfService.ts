import { StudentScore, StudentProfile, SubjectData, StudentAttendanceSummary } from '../types';
import { calculateTermTotal } from '../utils'; // Import from utils

// Helper to get numeric grade (0-4 scale)
const getNumericGrade = (totalScoreOutOf100: number | null): number | string => {
    if (totalScoreOutOf100 === null || isNaN(totalScoreOutOf100) || totalScoreOutOf100 < 0) return '-';
    if (totalScoreOutOf100 > 100) totalScoreOutOf100 = 100; // Cap at 100
    if (totalScoreOutOf100 >= 80) return 4;
    if (totalScoreOutOf100 >= 75) return 3.5;
    if (totalScoreOutOf100 >= 70) return 3;
    if (totalScoreOutOf100 >= 65) return 2.5;
    if (totalScoreOutOf100 >= 60) return 2;
    if (totalScoreOutOf100 >= 55) return 1.5;
    if (totalScoreOutOf100 >= 50) return 1;
    return 0;
};

// calculateTermTotal moved to utils.ts

async function configurePdfMakeFonts() {
  console.log("INFO: กำลังพยายามตั้งค่าฟอนต์สำหรับ pdfMake...");
  if (!window.pdfMake || !window.vfsFonts) {
    console.error("ERROR: ไลบรารี pdfMake หรือ vfsFonts ไม่พร้อมใช้งานบน window object");
    alert("ข้อผิดพลาด: ไลบรารีที่จำเป็นสำหรับการสร้าง PDF (pdfMake หรือ vfsFonts) ไม่ได้โหลดอย่างถูกต้อง");
    return; 
  }
  // Check if Sarabun is already configured to avoid redundant fetches/setup
  if (window.pdfMake.fonts && window.pdfMake.fonts.Sarabun && window.pdfMake.fonts.Sarabun.normal === 'Sarabun-Regular.ttf') {
    // And ensure it's in VFS too
    if (window.pdfMake.vfs && window.pdfMake.vfs['Sarabun-Regular.ttf']) {
        console.log("INFO: ฟอนต์ Sarabun ถูกตั้งค่าไว้แล้วใน pdfMake.fonts และ VFS");
        return; // Already configured
    }
  }

  try {
    // Using a more reliable CDN for the font, or ensure it's hosted appropriately.
    // This GitHub raw link might be unreliable for production.
    const fontUrl = 'https://raw.githubusercontent.com/Wind156x/lhb/main/sarabun-regular-webfont.woff';
    const response = await fetch(fontUrl);
    if (!response.ok) throw new Error(`ไม่สามารถดึงฟอนต์ได้: ${response.statusText}`);
    const fontBlob = await response.blob();
    if (fontBlob.size === 0) throw new Error("ไฟล์ฟอนต์ที่ดึงมามีขนาดเป็นศูนย์");

    const reader = new FileReader();
    const base64Font = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          // reader.result is "data:application/font-woff;base64,..."
          // We need to extract just the base64 part
          const parts = reader.result.split(',');
          if (parts.length === 2) resolve(parts[1]);
          else reject(new Error("รูปแบบข้อมูล Base64 ที่ได้จาก FileReader ไม่ถูกต้อง"));
        } else {
          reject(new Error("ผลลัพธ์จาก FileReader เป็น null หรือไม่ใช่สตริง"));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(fontBlob);
    });

    if (!base64Font || base64Font.length < 100) { // Basic sanity check for base64 string
        throw new Error("สตริงฟอนต์ Base64 ที่สร้างขึ้นดูเหมือนจะไม่ถูกต้อง");
    }

    if (!window.pdfMake.vfs) window.pdfMake.vfs = {}; // Initialize VFS if it doesn't exist
    window.pdfMake.vfs['Sarabun-Regular.ttf'] = base64Font;
    window.pdfMake.fonts = {
      ...window.pdfMake.fonts || {}, // Preserve existing fonts
      Sarabun: {
        normal: 'Sarabun-Regular.ttf',
        // bold: 'Sarabun-Bold.ttf', // Add bold/italics if you have them and load them similarly
        // italics: 'Sarabun-Italic.ttf',
        // bolditalics: 'Sarabun-BoldItalic.ttf'
      }
    };
    console.log("INFO: ฟอนต์ Sarabun ถูกตั้งค่าใน pdfMake.fontsเรียบร้อยแล้ว");
  } catch (error) {
    console.error("ERROR: เกิดข้อผิดพลาดในการโหลด/ตั้งค่าฟอนต์ Sarabun:", error);
    // Avoid alert if possible, use a more integrated UI notification if this were a larger app
    alert(`คำเตือน: ไม่สามารถโหลดฟอนต์ Sarabun สำหรับ PDF ได้ ข้อความภาษาไทยอาจแสดงผลไม่ถูกต้อง สาเหตุ: ${error instanceof Error ? error.message : String(error)}`);
  }
}


export const generatePp6Pdf = async (
    studentsToGenerate: StudentScore[],
    allProfilesForClass: StudentProfile[],
    subjectData: SubjectData,
    currentAcademicYear: string,
    selectedClass: string
) => {
    console.log("INFO: เริ่มกระบวนการสร้าง ปพ.6 PDF...");
    if (!window.pdfMake) { 
        console.error("ERROR: pdfMake library is not loaded.");
        alert("ข้อผิดพลาด: ไลบรารี pdfMake ไม่พร้อมใช้งาน");
        throw new Error('pdfMake not loaded');
    }
    try { await configurePdfMakeFonts(); } catch (fontError: any) { 
        console.warn("WARNING: Font configuration for ปพ.6 failed, proceeding with default fonts if any.", fontError);
    }

    const { maxClassworkScore, maxExamScore, subjectName } = subjectData;
    const currentTermTotalMax = maxClassworkScore + maxExamScore;
    const yearTotalMax = currentTermTotalMax * 2; 

    const tableHeader = [
      [{ text: 'ลำดับ', rowSpan: 2, style: 'tableHeader', alignment: 'center', margin: [0, 5, 0, 5] }, { text: 'เลขประจำตัว', rowSpan: 2, style: 'tableHeader', alignment: 'center', margin: [0, 5, 0, 5] }, { text: 'ชื่อ-นามสกุล', rowSpan: 2, style: 'tableHeader', alignment: 'left', margin: [0, 5, 0, 5] }, { text: `ภาคเรียนที่ 1 (เต็ม ${currentTermTotalMax})`, colSpan: 3, style: 'tableHeader', alignment: 'center' }, {}, {},  { text: `ภาคเรียนที่ 2 (เต็ม ${currentTermTotalMax})`, colSpan: 3, style: 'tableHeader', alignment: 'center' }, {}, {},  { text: `รวม (${yearTotalMax})`, rowSpan: 2, style: 'tableHeader', alignment: 'center', margin: [0, 5, 0, 5] }, { text: 'เกรดปี', rowSpan: 2, style: 'tableHeader', alignment: 'center', margin: [0, 5, 0, 5] }],
      [{}, {}, {}, { text: `เก็บ (${maxClassworkScore})`, style: 'tableHeader', alignment: 'center' }, { text: `สอบ (${maxExamScore})`, style: 'tableHeader', alignment: 'center' }, { text: `รวม`, style: 'tableHeader', alignment: 'center', bold: true }, { text: `เก็บ (${maxClassworkScore})`, style: 'tableHeader', alignment: 'center' }, { text: `สอบ (${maxExamScore})`, style: 'tableHeader', alignment: 'center' }, { text: `รวม`, style: 'tableHeader', alignment: 'center', bold: true }, {}, {}]
    ];
    
    const tableBody = studentsToGenerate.map((student, index) => {
        const profile = allProfilesForClass.find(p => p.id === student.profileId);
        const t1cw = student.term1ClassworkScore, t1ex = student.term1ExamScore, t1Total = calculateTermTotal(t1cw, t1ex);
        const t2cw = student.term2ClassworkScore, t2ex = student.term2ExamScore, t2Total = calculateTermTotal(t2cw, t2ex);
        
        let yearTotalScore: number | null = (t1Total !== null || t2Total !== null) ? (t1Total || 0) + (t2Total || 0) : null;
        
        let yearScoreForGradeCalc = yearTotalScore;
        // If yearTotalMax is not 100, scale the score to be out of 100 for grade calculation
        if (yearTotalMax !== 100 && yearTotalScore !== null && yearTotalMax > 0) {
             yearScoreForGradeCalc = (yearTotalScore / yearTotalMax) * 100;
        }
        const yearGrade = getNumericGrade(yearScoreForGradeCalc);

        const studentIdDisplay = student.studentIdNumber || profile?.studentSchoolId || profile?.nationalId || 'ไม่มีข้อมูล';
        const studentFullNameDisplay = student.name || profile?.fullName || 'ไม่มีข้อมูล';

        return [
            { text: (index + 1).toString(), style: 'tableCell', alignment: 'center' }, 
            { text: studentIdDisplay, style: 'tableCell', alignment: 'center' }, 
            { text: studentFullNameDisplay, style: 'tableCell', alignment: 'left' },
            { text: t1cw !== null ? t1cw.toFixed(1) : '-', style: 'tableCell', alignment: 'center' }, 
            { text: t1ex !== null ? t1ex.toFixed(1) : '-', style: 'tableCell', alignment: 'center' }, 
            { text: t1Total !== null ? t1Total.toFixed(1) : '-', style: 'tableCellBold', alignment: 'center' },
            { text: t2cw !== null ? t2cw.toFixed(1) : '-', style: 'tableCell', alignment: 'center' }, 
            { text: t2ex !== null ? t2ex.toFixed(1) : '-', style: 'tableCell', alignment: 'center' }, 
            { text: t2Total !== null ? t2Total.toFixed(1) : '-', style: 'tableCellBold', alignment: 'center' },
            { text: yearTotalScore !== null ? yearTotalScore.toFixed(1) : '-', style: 'tableCellBold', alignment: 'center' }, 
            { text: yearGrade.toString(), style: 'tableCellBold', alignment: 'center' }
        ];
    });

    const schoolProfile = allProfilesForClass.length > 0 ? allProfilesForClass[0] : null;
    const schoolName = schoolProfile?.schoolName || "โรงเรียน"; // Default school name

    const docDefinition: any = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        content: [
            { text: `แบบรายงานผลการพัฒนาคุณภาพผู้เรียนรายบุคคล (ปพ.๖)`, style: 'mainHeader', alignment: 'center' },
            { text: `ระดับชั้นประถมศึกษา โรงเรียน${schoolName}`, style: 'subHeader', alignment: 'center' },
            { text: `ภาคเรียนที่ ๑ - ๒ ปีการศึกษา ${currentAcademicYear}`, style: 'subHeader', alignment: 'center', margin: [0,0,0,5]},
            { 
              columns: [
                { text: `รายวิชา: ${subjectName}`, style: 'infoField', alignment: 'left'},
                { text: `ชั้น: ${selectedClass}`, style: 'infoField', alignment: 'right'}
              ],
              margin: [0, 0, 0, 10] // Margin for the columns element
            },
            {
              table: {
                headerRows: 2,
                widths: [25, 70, '*', 40, 40, 45, 40, 40, 45, 45, 35], // Adjusted widths
                body: [...tableHeader, ...tableBody]
              },
              layout: {
                fillColor: (rowIndex: number) => (rowIndex < 2) ? '#E0EFFF' : null, // Light blue for header
                hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length || i < 3) ? 0.5 : 0.25, // Thicker lines for header
                vLineWidth: () => 0.5,
                hLineColor: () => '#BFBFBF', // Gray lines
                vLineColor: () => '#BFBFBF',
                paddingTop: (i: number) => (i < 2) ? 4 : 3, // More padding for header
                paddingBottom: (i: number) => (i < 2) ? 4 : 3,
              }
            }
        ],
        defaultStyle: {
            font: 'Sarabun', // Main font for the document
            fontSize: 10,
        },
        styles: {
            mainHeader: { fontSize: 16, bold: true, margin: [0, 0, 0, 2] },
            subHeader: { fontSize: 14, margin: [0, 0, 0, 2] },
            infoField: { fontSize: 12, bold: true },
            tableHeader: { bold: true, fontSize: 9.5, color: '#000000', fillColor: '#E0EFFF', alignment: 'center', margin: [0,2,0,2] },
            tableCell: { fontSize: 9.5, margin: [2, 2, 2, 2] },
            tableCellBold: { fontSize: 9.5, bold: true, margin: [2, 2, 2, 2] }
        }
    };

    const fileName = `ปพ6_${selectedClass}_${subjectName.replace(/[/\s?%*:|"<>]/g, '_')}_ปี${currentAcademicYear}.pdf`;
    try {
        window.pdfMake.createPdf(docDefinition).download(fileName);
        console.log("INFO: ปพ.6 PDF ถูกสร้างและเริ่มดาวน์โหลดแล้ว");
    } catch (pdfError) {
        console.error("ERROR: เกิดข้อผิดพลาดขณะสร้าง PDF ปพ.6:", pdfError);
        alert(`เกิดข้อผิดพลาดในการสร้าง PDF ปพ.6: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}`);
    }
};

export const generatePp5Pdf = async (
    studentProfile: StudentProfile,
    classScoresForYear: Record<string, SubjectData>, // All subject data for the student's class in the given year
    allSubjectDefinitions: { id: string; name: string }[], // All possible subjects for display {id: "S1", name: "ภาษาไทย 1"}
    academicYear: string,
    className: string,
    studentAttendanceSummary?: StudentAttendanceSummary // Added optional attendance summary
) => {
    console.log("INFO: เริ่มกระบวนการสร้าง ปพ.5 PDF...");
    if (!window.pdfMake) { 
        console.error("ERROR: pdfMake library is not loaded.");
        alert("ข้อผิดพลาด: ไลบรารี pdfMake ไม่พร้อมใช้งาน");
        throw new Error('pdfMake not loaded');
    }
    try { await configurePdfMakeFonts(); } catch (fontError: any) { 
        console.warn("WARNING: Font configuration for ปพ.5 failed, proceeding with default fonts if any.", fontError);
    }

    const schoolName = studentProfile.schoolName || "โรงเรียน";

    const getStudentScoresForSubject = (subjectId: string): StudentScore | undefined => {
        const subjectData = classScoresForYear[subjectId];
        return subjectData?.students.find(s => s.profileId === studentProfile.id);
    };

    const academicResultsBody = allSubjectDefinitions.map((subjectDef, index) => {
        const studentScoreData = getStudentScoresForSubject(subjectDef.id);
        // Ensure subjectMaxScores exists, provide defaults if not. This is crucial.
        const subjectMaxScores = classScoresForYear[subjectDef.id] || { maxClassworkScore: 30, maxExamScore: 20 }; 
        const termTotalMax = subjectMaxScores.maxClassworkScore + subjectMaxScores.maxExamScore;
        const yearTotalMaxScore = termTotalMax * 2;

        const t1cw = studentScoreData?.term1ClassworkScore;
        const t1ex = studentScoreData?.term1ExamScore;
        const t1Total = calculateTermTotal(t1cw, t1ex);

        const t2cw = studentScoreData?.term2ClassworkScore;
        const t2ex = studentScoreData?.term2ExamScore;
        const t2Total = calculateTermTotal(t2cw, t2ex);
        
        let yearTotal: number | null = null;
        if (t1Total !== null || t2Total !== null) {
            yearTotal = (t1Total || 0) + (t2Total || 0);
        }

        let yearScoreForGradeCalc = yearTotal;
        if (yearTotalMaxScore !== 100 && yearTotal !== null && yearTotalMaxScore > 0) {
            yearScoreForGradeCalc = (yearTotal / yearTotalMaxScore) * 100;
        }
        const grade = getNumericGrade(yearScoreForGradeCalc);

        return [
            { text: index + 1, style: 'tableCell', alignment: 'center' },
            { text: subjectDef.name, style: 'tableCell', alignment: 'left' },
            { text: t1Total !== null ? t1Total.toFixed(1) : '-', style: 'tableCell', alignment: 'center' },
            { text: t2Total !== null ? t2Total.toFixed(1) : '-', style: 'tableCell', alignment: 'center' },
            { text: yearTotal !== null ? yearTotal.toFixed(1) : '-', style: 'tableCell', alignment: 'center' },
            { text: grade.toString(), style: 'tableCell', alignment: 'center' },
            { text: `เต็ม ${yearTotalMaxScore}`, style: 'tableCellSmall', alignment: 'center' }, 
        ];
    });
    
    const academicResultsHeader = [
        { text: 'ลำดับ', style: 'tableHeaderSm', alignment: 'center' },
        { text: 'รายวิชา', style: 'tableHeaderSm', alignment: 'center' },
        { text: 'ภาคเรียนที่ 1', style: 'tableHeaderSm', alignment: 'center' },
        { text: 'ภาคเรียนที่ 2', style: 'tableHeaderSm', alignment: 'center' },
        { text: 'รวมทั้งปี', style: 'tableHeaderSm', alignment: 'center' },
        { text: 'ระดับผลการเรียน', style: 'tableHeaderSm', alignment: 'center' },
        { text: 'คะแนนเต็มปี', style: 'tableHeaderSm', alignment: 'center' },
    ];

    let attendanceContent: any[] = [
        { text: 'สรุปเวลามาเรียน (ตลอดปีการศึกษา)', style: 'sectionHeaderPp5', margin: [0,15,0,5] },
        { text: '(ส่วนนี้ต้องใช้ข้อมูลการเช็คชื่อ หรือ สรุปการมาเรียนด้วย AI)', style: 'bodyText', italics: true, margin: [0,0,0,15] }
    ];

    if (studentAttendanceSummary) {
        const attendanceRate = studentAttendanceSummary.totalInstructionalDays > 0 
            ? ((studentAttendanceSummary.daysPresent / studentAttendanceSummary.totalInstructionalDays) * 100).toFixed(1) + '%' 
            : '-';
        attendanceContent = [
            { text: 'สรุปเวลามาเรียน (ตลอดปีการศึกษา)', style: 'sectionHeaderPp5', margin: [0,15,0,5] },
            {
                style: 'infoTableSmall',
                table: {
                    widths: ['*', '*', '*', '*', '*'],
                    body: [
                        [
                            {text: 'วันเปิดเรียน:', bold:true}, studentAttendanceSummary.totalInstructionalDays + ' วัน', 
                            {text: 'มาเรียน:', bold:true}, studentAttendanceSummary.daysPresent + ' วัน',
                            {text: 'ร้อยละ:', bold:true}, attendanceRate
                        ],
                        [
                            {text: 'ขาดเรียน:', bold:true}, studentAttendanceSummary.daysAbsent + ' วัน',
                            {text: 'ลาป่วย/ลากิจ:', bold:true}, studentAttendanceSummary.daysExcused + ' วัน', // Assuming daysExcused covers both
                            {text: 'มาสาย:', bold:true}, studentAttendanceSummary.daysLate + ' วัน'
                        ]
                    ]
                },
                layout: 'noBorders',
                margin: [0,0,0,15]
            }
        ];
    }


    const docDefinition: any = {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        content: [
            { text: `สมุดรายงานประจำตัวนักเรียน (ปพ.๕)`, style: 'mainHeaderPp5', alignment: 'center' },
            { text: `โรงเรียน${schoolName}`, style: 'subHeaderPp5', alignment: 'center' },
            { text: `ปีการศึกษา ${academicYear}`, style: 'subHeaderPp5', alignment: 'center', margin: [0,0,0,15] },

            { text: 'ข้อมูลนักเรียน', style: 'sectionHeaderPp5' },
            {
                style: 'infoTable',
                table: {
                    widths: ['auto', '*', 'auto', '*'], // Auto widths for labels, star for values
                    body: [
                        [ {text: 'ชื่อ-นามสกุล:', bold:true}, studentProfile.fullName, {text: 'เลขประจำตัวนักเรียน:', bold:true}, studentProfile.studentSchoolId || '-'],
                        [ {text: 'ชั้นเรียน:', bold:true}, className, {text: 'เลขประจำตัวประชาชน:', bold:true}, studentProfile.nationalId || '-'],
                        [ {text: 'วันเกิด:', bold:true}, studentProfile.birthDate || '-', {text: 'เพศ:', bold:true}, studentProfile.gender || '-'],
                    ]
                },
                layout: 'noBorders' // No borders for this info table
            },
            
            ...attendanceContent,

            { text: 'ผลการประเมินการอ่าน คิดวิเคราะห์ และเขียน', style: 'sectionHeaderPp5', margin: [0,10,0,5] },
            { text: 'ดีเยี่ยม / ดี / ผ่านเกณฑ์ / ไม่ผ่านเกณฑ์ (ส่วนนี้ต้องใช้ข้อมูลการประเมิน)', style: 'bodyText', italics: true, margin: [0,0,0,15] },
            
            { text: 'ผลการประเมินคุณลักษณะอันพึงประสงค์', style: 'sectionHeaderPp5', margin: [0,10,0,5] },
            { text: 'ดีเยี่ยม / ดี / ผ่านเกณฑ์ / ไม่ผ่านเกณฑ์ (ส่วนนี้ต้องใช้ข้อมูลการประเมิน)', style: 'bodyText', italics: true, margin: [0,0,0,15] },

            { text: 'ผลการเรียนรายวิชา', style: 'sectionHeaderPp5', margin: [0,10,0,5] },
            {
                table: {
                    headerRows: 1,
                    widths: [25, '*', 50, 50, 50, 60, 50], //ลำดับ, รายวิชา, ภ1, ภ2, รวม, เกรด, เต็ม
                    body: [academicResultsHeader, ...academicResultsBody]
                },
                layout: {
                    fillColor: (rowIndex: number) => (rowIndex === 0) ? '#EAEAEA' : null,
                    hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 0.5 : 0.25,
                    vLineWidth: () => 0.5, hLineColor: () => '#BFBFBF', vLineColor: () => '#BFBFBF',
                    paddingTop: () => 3, paddingBottom: () => 3,
                }
            },
            
            { text: 'กิจกรรมพัฒนาผู้เรียน', style: 'sectionHeaderPp5', margin: [0,15,0,5] },
            { text: 'สรุปผลการเข้าร่วมกิจกรรม (ผ่าน/ไม่ผ่าน) (ส่วนนี้ต้องใช้ข้อมูลกิจกรรม)', style: 'bodyText', italics: true, margin: [0,0,0,15] },

            // Page break before summary and signatures
            { text: 'สรุปผลการประเมินและข้อเสนอแนะ', style: 'sectionHeaderPp5', pageBreak: 'before', margin: [0,0,0,5]},
            // Add more space for comments using repeated text lines or a large text area if supported
            { text: Array(20).fill('................................................................................................................................................................................................................................................').join('\\n'), style: 'bodyText', margin: [0,0,0,15] },


            {
                // Position signature at the bottom right, typical for Thai documents
                columns: [
                    { text: '', width: '*' }, // Spacer column
                    {
                        width: 'auto', // Auto width for the signature block
                        stack: [ // Stack for vertical alignment
                            { text: 'ลงชื่อ .......................................... ครูประจำชั้น', style: 'signatureLine', margin: [0, 40, 0, 0] }, // Top margin for spacing
                            { text: '(..........................................)', style: 'signatureName', alignment: 'center' }, // Centered name placeholder
                        ],
                        alignment: 'center' // Center the whole stack if needed, or specific elements
                    },
                    { text: '', width: '*' } // Spacer column to push to center/right
                ],
                margin: [0, 20, 0, 0] // Margin for the columns element
            }

        ],
        defaultStyle: { font: 'Sarabun', fontSize: 10 },
        styles: {
            mainHeaderPp5: { fontSize: 16, bold: true, margin: [0, 0, 0, 5] }, // Added bottom margin
            subHeaderPp5: { fontSize: 14, margin: [0, 0, 0, 3] }, // Added bottom margin
            sectionHeaderPp5: { fontSize: 12, bold: true, margin: [0, 10, 0, 3], color: '#333333' }, // Darker color
            infoTable: { margin: [0, 5, 0, 10], fontSize: 9.5 },
            infoTableSmall: { margin: [0, 2, 0, 10], fontSize: 8.5 }, // For attendance summary table
            bodyText: { fontSize: 9.5, lineHeight: 1.3 },
            tableHeaderSm: { bold: true, fontSize: 9, color: '#000000', fillColor: '#EAEAEA', alignment: 'center' }, // Darker header text
            tableCell: { fontSize: 9, margin: [2, 2, 2, 2] },
            tableCellSmall: { fontSize: 8, margin: [2,1,2,1], color: '#555555'},
            signatureLine: { fontSize: 10, margin: [0, 0, 0, 2] }, // For "ลงชื่อ..................."
            signatureName: { fontSize: 10, margin: [0, 0, 0, 20] } // For "(................)"
        }
    };
    const fileName = `ปพ5_${studentProfile.fullName.replace(/[/\s?%*:|"<>]/g, '_')}_ปี${academicYear}.pdf`;
    try { 
        window.pdfMake.createPdf(docDefinition).download(fileName); 
        console.log("INFO: ปพ.5 PDF ถูกสร้างและเริ่มดาวน์โหลดแล้ว");
    } catch (pdfError) {
        console.error("ERROR: เกิดข้อผิดพลาดขณะสร้าง PDF ปพ.5:", pdfError);
        alert(`เกิดข้อผิดพลาดในการสร้าง PDF ปพ.5: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}`);
    }
};