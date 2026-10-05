import React, { useState } from 'react';
import { useAppStore } from './data/store';
import { UserRole } from './types';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentPassModal } from './components/student/StudentPassModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ShieldCheck, Lock, QrCode, Heart } from 'lucide-react';

export default function App() {
  const {
    currentUser,
    login,
    logout,
    students,
    events,
    attendance,
    notifications,
    registerStudent,
    registerAdmin,
    updateStudentProfile,
    updateAdminProfile,
    createEvent,
    recordAttendance,
    markNotificationRead,
    toggleSaveEvent
  } = useAppStore();

  // Auth Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [authRole, setAuthRole] = useState<UserRole>('student');

  // Student Pass Modal
  const [isStudentPassOpen, setIsStudentPassOpen] = useState(false);

  // Active view
  const [activeView, setActiveView] = useState('live-monitor');

  // Open login modal with specific role pre-selected
  const handleOpenLogin = (role: UserRole) => {
    setAuthRole(role);
    setIsLoginOpen(true);
    setIsRegisterOpen(false);
  };

  // Open register modal with specific role pre-selected
  const handleOpenRegister = (role: UserRole) => {
    setAuthRole(role);
    setIsRegisterOpen(true);
    setIsLoginOpen(false);
  };

  // Navigate to landing sections
  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-[#d0f344] selection:text-slate-950 ${!currentUser ? 'bg-[#0c1017] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Bar Header */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
        onLogout={logout}
        onNavigateSection={handleNavigateSection}
        activeView={activeView}
        onSwitchView={setActiveView}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {!currentUser ? (
          <LandingHero
            onOpenLogin={handleOpenLogin}
            onOpenRegister={handleOpenRegister}
          />
        ) : currentUser.role === 'student' ? (
          <StudentDashboard
            student={currentUser}
            events={events}
            attendance={attendance}
            notifications={notifications}
            onUpdateProfile={updateStudentProfile}
            onOpenPassModal={() => setIsStudentPassOpen(true)}
            onMarkNotificationRead={markNotificationRead}
            onToggleSaveEvent={toggleSaveEvent}
          />
        ) : (
          <AdminDashboard
            admin={currentUser}
            events={events}
            attendance={attendance}
            students={students}
            onUpdateProfile={updateAdminProfile}
            onCreateEvent={createEvent}
            onScanStudent={recordAttendance}
          />
        )}
      </main>

      {/* Authentic AttendIDto Footer */}
      <footer className="bg-[#080b10] border-t border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-3.5 h-3.5" aria-hidden="true">
                <path d="m7 24 9-19 9 19M11 17h10" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="25" cy="6" r="3" fill="#d0f344" />
              </svg>
            </div>
            <span className="font-extrabold text-white">
              Attend<span className="text-[#d0f344]">IDto</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">A little less admin. A lot more campus.</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <span className="text-[#d0f344] font-mono tracking-wider text-[11px]">
              YOUR CAMPUS. YOUR PASS.
            </span>
          </div>
        </div>
      </footer>

      {/* Authentication & Pass Modals */}
      <LoginModal
        key={`login-${authRole}-${isLoginOpen}`}
        isOpen={isLoginOpen}
        initialRole={authRole}
        onClose={() => setIsLoginOpen(false)}
        onLogin={login}
        onSwitchToRegister={(role) => handleOpenRegister(role)}
        onOpenForgotPassword={() => {
          setIsLoginOpen(false);
          setIsForgotOpen(true);
        }}
      />

      <RegisterModal
        key={`register-${authRole}-${isRegisterOpen}`}
        isOpen={isRegisterOpen}
        initialRole={authRole}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterStudent={registerStudent}
        onRegisterAdmin={registerAdmin}
        onSwitchToLogin={(role) => handleOpenLogin(role)}
      />

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />

      {currentUser && currentUser.role === 'student' && (
        <StudentPassModal
          student={currentUser}
          isOpen={isStudentPassOpen}
          onClose={() => setIsStudentPassOpen(false)}
        />
      )}
    </div>
  );
}
