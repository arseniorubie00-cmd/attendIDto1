import React from 'react';
import { AuthUser } from '../types';
import { User, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentUser: AuthUser | null;
  onOpenLogin: (role: 'student' | 'admin') => void;
  onOpenRegister: (role: 'student' | 'admin') => void;
  onLogout: () => void;
  onNavigateSection?: (sectionId: string) => void;
  activeView?: string;
  onSwitchView?: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  onNavigateSection,
  activeView,
  onSwitchView
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a1f3d]/95 backdrop-blur-md border-b border-blue-900/60 text-white shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Institution Indicator */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSwitchView ? onSwitchView('landing') : null;
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-[#07162c] border border-blue-800/80 flex items-center justify-center shadow-xs group-hover:border-blue-600 transition-colors">
              <svg viewBox="0 0 32 32" className="w-5 h-5" aria-hidden="true">
                <path 
                  d="m7 24 9-19 9 19M11 17h10" 
                  fill="none" 
                  stroke="#ffffff" 
                  strokeWidth="2.8" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <circle cx="25" cy="6" r="3" fill="#fbbf24" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white font-sans">
              Attend<span className="text-[#fbbf24]">IDto</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#fbbf24] ml-0.5"></span>
            </span>
          </a>
          
          {currentUser && (
            <div className="hidden sm:flex items-center text-xs font-semibold text-blue-200/80 pl-3 border-l border-blue-800/80 gap-1.5">
              {currentUser.role === 'admin' ? (
                <span className="flex items-center gap-1.5 text-[#fbbf24]">
                  <span className="w-2 h-2 rounded-full bg-[#fbbf24] animate-pulse"></span>
                  <span>{currentUser.organization}</span>
                  <span className="text-blue-300/60 font-normal">({currentUser.school.split('–')[0].split('(')[0].trim()})</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-blue-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#fbbf24]" />
                  <span>{currentUser.school.split('–')[0].split('(')[0].trim()}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* User Identity Chip */}
        <div className="flex items-center gap-3">
          {!currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenLogin('student')}
                className="px-3.5 py-1.5 text-xs font-bold text-white hover:text-blue-200 bg-[#07162c] border border-blue-700/80 rounded-xl transition-colors cursor-pointer"
              >
                Student Sign In
              </button>
              <button
                onClick={() => onOpenLogin('admin')}
                className="px-3.5 py-1.5 text-xs font-bold text-blue-950 bg-[#fbbf24] hover:bg-[#f59e0b] rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Organizer Sign In
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 bg-[#07162c]/90 border border-blue-800/80 rounded-2xl py-1 px-3">
              <div className="w-7 h-7 rounded-xl bg-blue-950 text-blue-100 flex items-center justify-center text-xs overflow-hidden border border-blue-700 shrink-0">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5 text-[#fbbf24]" />
                )}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">
                  {currentUser.fullName}
                </div>
                <div className="text-[10px] text-blue-200/70 leading-none truncate max-w-[130px]">
                  {currentUser.role === 'admin' ? (currentUser.position || 'Event Officer') : currentUser.yearLevel}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
