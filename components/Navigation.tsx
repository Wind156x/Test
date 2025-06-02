
import React from 'react';
import { ActiveView, User } from '../types';

interface NavigationProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onLoginClick: () => void;
  onLogout: () => void;
  currentUser: User; // Can have className: null initially
  isLoggedIn: boolean;
  activeAcademicYear: string;
}

const NavItem: React.FC<{
  view: ActiveView;
  label: string;
  icon: JSX.Element;
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  isDisabled?: boolean;
}> = ({ view, label, icon, activeView, onNavigate, isDisabled = false }) => (
  <li className="mb-1">
    <button
      onClick={() => onNavigate(view)}
      disabled={isDisabled}
      className={`w-full flex items-center py-2.5 px-4 rounded-md text-sm transition-colors duration-150 ease-in-out
                  ${isDisabled 
                    ? 'text-gray-500 cursor-not-allowed' 
                    : activeView === view 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-300 hover:bg-blue-700 hover:text-white'
                  }`}
      aria-current={activeView === view ? 'page' : undefined}
    >
      {React.cloneElement(icon, { className: "w-5 h-5 mr-3 flex-shrink-0" })}
      <span className="truncate">{label}</span>
    </button>
  </li>
);

const Navigation: React.FC<NavigationProps> = ({ 
    activeView, 
    onNavigate, 
    onLoginClick, 
    onLogout, 
    currentUser, 
    isLoggedIn,
    activeAcademicYear 
}) => {
  const menuItems: Array<{ view: ActiveView; label: string; icon: JSX.Element }> = [
    { view: 'dashboard', label: 'หน้าหลัก', icon: <HomeIcon /> },
    { view: 'studentInfo', label: 'ข้อมูลนักเรียน', icon: <UsersIcon /> },
    { view: 'attendance', label: 'เช็คชื่อนักเรียน', icon: <ClipboardCheckIcon /> },
    { view: 'scores', label: 'กรอกคะแนน', icon: <PencilAltIcon /> },
    { view: 'pp5report', label: 'พิมพ์ ปพ.5', icon: <PrinterIcon /> },
    { view: 'pp6report', label: 'พิมพ์ ปพ.6', icon: <DocumentReportIcon /> },
    { view: 'manageSubjects', label: 'จัดการรายวิชา', icon: <CollectionIcon /> },
    // 'manageIndicators' is now part of 'manageSubjects' flow via modal
    { view: 'settings', label: 'ตั้งค่าระบบ', icon: <CogIcon /> },
  ];
  
  const displayAcademicYear = activeAcademicYear || "N/A";

  return (
    <aside className="w-64 bg-blue-800 text-white p-3 flex flex-col shadow-lg h-full fixed left-0 top-0 z-[1500] print:hidden">
      <div className="text-center mb-4 mt-2">
        <h1 className="text-xl font-semibold">ระบบบันทึกผลการเรียน</h1>
        {currentUser.className && (
            <p className="text-xs text-blue-300 mt-1">
                ชั้น {currentUser.className} ปีการศึกษา {displayAcademicYear}
            </p>
        )}
      </div>
      <nav className="flex-grow overflow-y-auto">
        <ul>
          {menuItems.map(item => (
            <NavItem 
                key={item.view} 
                {...item} 
                activeView={activeView} 
                onNavigate={onNavigate} 
                isDisabled={!currentUser.className && item.view !== 'settings'} // Disable most if no class selected, except settings
            />
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-3 border-t border-blue-700">
        {isLoggedIn ? (
          <button
            onClick={onLogout}
            className="w-full flex items-center py-2.5 px-4 rounded-md text-sm bg-red-500 hover:bg-red-600 text-white transition-colors duration-150 ease-in-out"
          >
            <LogoutIcon className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="truncate">ออกจากระบบ</span>
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            disabled={!currentUser.className} // Can only login if a class context is set
            className={`w-full flex items-center py-2.5 px-4 rounded-md text-sm text-white transition-colors duration-150 ease-in-out
                        ${!currentUser.className ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
          >
            <LoginIcon className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="truncate">เข้าสู่ระบบ</span>
          </button>
        )}
      </div>
    </aside>
  );
};

// Icons (ensure these are defined or imported correctly)
const HomeIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const UsersIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>;
const ClipboardCheckIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm10.293 5.293a1 1 0 00-1.414 0L9 14.586l-1.879-1.88a1 1 0 10-1.414 1.414l2.5 2.5a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd" /></svg>;
const PencilAltIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const PrinterIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h1v-4a1 1 0 011-1h10a1 1 0 011 1v4h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>;
const DocumentReportIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" /></svg>;
const CollectionIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>;
const ChartBarIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a1 1 0 001 1h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 12.414l2.293 2.293a1 1 0 001.414-1.414L12.414 10H15a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2.586l-1.293-1.293a1 1 0 00-1.414 0L6.586 7.586 5 6V3z" clipRule="evenodd" /></svg>; // Placeholder, Chartbar might be better
const CogIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.566.379-1.566 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.835 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.566 2.6 1.566 2.978 0a1.533 1.533 0 012.287-.947c1.372.835 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.566-.379 1.566-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.835-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const LoginIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const LogoutIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>;

export default Navigation;
