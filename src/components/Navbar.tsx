import React from 'react';
import { AuthUser } from '../types';
import { LogOut, User, ArrowUpRight, CheckCircle2 } from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full bg-[#0c1017]/95 backdrop-blur-md border-b border-slate-800 text-white shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Authentic AttendIDto Logo */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSwitchView ? onSwitchView('landing') : null;
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            {/* Netlify authentic SVG logo mark */}
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center shadow-xs group-hover:border-slate-500 transition-colors">
              <svg viewBox="0 0 32 32" className="w-5 h-5" aria-hidden="true">
                <path 
                  d="m7 24 9-19 9 19M11 17h10" 
                  fill="none" 
                  stroke="#ffffff" 
                  strokeWidth="2.8" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <circle cx="25" cy="6" r="3" fill="#d0f344" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white font-sans">
              Attend<span className="text-[#d0f344]">IDto</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d0f344] ml-0.5"></span>
            </span>
          </a>
          
          {currentUser && (
            <span className="hidden sm:inline-flex items-center text-xs font-semibold text-slate-400 pl-3 border-l border-slate-800">
              {currentUser.role === 'admin' ? (
                <span className="flex items-center gap-1.5 text-[#d0f344]">
                  <span className="w-2 h-2 rounded-full bg-[#d0f344] animate-pulse"></span>
                  Organizer Console (CDO)
                </span>
              ) : (
                'Student Portal'
              )}
            </span>
          )}
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          {!currentUser ? (
            <>
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSection?.('features');
                }}
                className="hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSection?.('how-it-works');
                }}
                className="hover:text-white transition-colors"
              >
                How it works
              </a>
              <a
                href="#organizers"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSection?.('organizers');
                }}
                className="hover:text-[#d0f344] transition-colors flex items-center gap-1"
              >
                <span>For organizers</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#d0f344]" />
              </a>
            </>
          ) : currentUser.role === 'admin' ? (
            <>
              <button
                onClick={() => onSwitchView?.('live-monitor')}
                className={`transition-colors flex items-center gap-1.5 ${
                  activeView === 'live-monitor' ? 'text-[#d0f344] font-bold' : 'hover:text-white'
                }`}
              >
                Live Monitor (65%)
              </button>
              <button
                onClick={() => onSwitchView?.('scanner')}
                className={`transition-colors ${
                  activeView === 'scanner' ? 'text-[#d0f344] font-bold' : 'hover:text-white'
                }`}
              >
                Tap Station
              </button>
              <button
                onClick={() => onSwitchView?.('reports')}
                className={`transition-colors ${
                  activeView === 'reports' ? 'text-[#d0f344] font-bold' : 'hover:text-white'
                }`}
              >
                Print Roster
              </button>
              <button
                onClick={() => onSwitchView?.('create-event')}
                className={`transition-colors ${
                  activeView === 'create-event' ? 'text-[#d0f344] font-bold' : 'hover:text-white'
                }`}
              >
                + New Event
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onSwitchView?.('my-pass')}
                className={`transition-colors ${
                  activeView === 'my-pass' ? 'text-[#d0f344] font-bold' : 'hover:text-white'
                }`}
              >
                My Pass (QR)
              </button>
              <button
                onClick={() => onSwitchView?.('upcoming-events')}
                className={`transition-colors ${
                  activeView === 'upcoming-events' ? 'text-[#d0f344] font-bold' : 'hover:text-white'
                }`}
              >
                Campus Events
              </button>
              <button
                onClick={() => onSwitchView?.('history')}
                className={`transition-colors ${
                  activeView === 'history' ? 'text-[#d0f344] font-bold' : 'hover:text-white'
                }`}
              >
                Attendance History
              </button>
              <button
                onClick={() => onSwitchView?.('profile')}
                className={`transition-colors ${
                  activeView === 'profile' ? 'text-[#d0f344] font-bold' : 'hover:text-white'
                }`}
              >
                Profile
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5">
          {!currentUser ? (
            <>
              <button
                onClick={() => onOpenLogin('student')}
                className="px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-900 border border-slate-700/80 hover:border-slate-500 rounded-lg transition-colors cursor-pointer"
              >
                Student Login
              </button>
              <button
                onClick={() => onOpenLogin('admin')}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Organizer Login</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-950" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-right">
                <div>
                  <div className="text-xs font-bold text-white leading-tight">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                    {currentUser.role === 'admin' ? currentUser.organization : currentUser.course}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 font-semibold flex items-center justify-center text-xs overflow-hidden border border-slate-700">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-[#d0f344]" />
                  )}
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Log Out"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
