import React from 'react';
import { UserRole } from '../types';
import { 
  ArrowUpRight, 
  QrCode, 
  ShieldCheck, 
  Smartphone, 
  Printer, 
  Building, 
  CheckCircle2, 
  ScanLine,
  User,
  Users
} from 'lucide-react';

interface LandingHeroProps {
  onOpenLogin: (role: UserRole) => void;
  onOpenRegister: (role: UserRole) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onOpenLogin,
  onOpenRegister
}) => {
  return (
    <div className="bg-[#0c1017] text-white min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      
      {/* Clean, Minimal Hero Section */}
      <section className="relative py-12 lg:py-16 overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#d0f344]/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          
          {/* Header Title - Minimal & Direct */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#d0f344] animate-pulse"></span>
              <span>CAMPUS ATTENDANCE SYSTEM</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Attend<span className="text-[#d0f344]">IDto</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
              Multi-device QR tap scanning, real-time quota tracking, and print-ready rosters for USTP-CDO and universities across Cagayan de Oro.
            </p>
          </div>

          {/* Dual Portal Cards: Direct Student & Organizer Access */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* CARD 1: STUDENT ACCESS */}
            <div className="bg-[#121722] rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white">
                    <User className="w-6 h-6 text-[#d0f344]" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
                    Student Portal
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">Student Access</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Present your personal QR pass and view your attendance records.
                  </p>
                </div>

                <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d0f344] shrink-0" />
                    <span>Personal QR Pass (No Student ID Number displayed)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d0f344] shrink-0" />
                    <span>Explore scheduled campus events & RSVP</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d0f344] shrink-0" />
                    <span>Verified Time-In attendance history</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onOpenLogin('student')}
                  className="w-full py-3 px-4 text-xs font-bold text-slate-950 bg-white hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Student Sign In</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-950" />
                </button>

                <button
                  onClick={() => onOpenRegister('student')}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all cursor-pointer text-center"
                >
                  New Student? Sign Up Here
                </button>
              </div>
            </div>

            {/* CARD 2: ORGANIZER ACCESS */}
            <div className="bg-[#121722] rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white">
                    <Building className="w-6 h-6 text-[#d0f344]" />
                  </div>
                  <span className="text-[11px] font-mono text-[#d0f344] bg-[#d0f344]/10 border border-[#d0f344]/30 px-2.5 py-1 rounded-full font-bold">
                    Organizer Portal
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">Organizer Console</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage events, scan attendance, and track real-time target numbers.
                  </p>
                </div>

                <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d0f344] shrink-0" />
                    <span>Multi-Device Tap Scanning (One Central Database)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d0f344] shrink-0" />
                    <span>Live Quota Monitoring (% and Target progress)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d0f344] shrink-0" />
                    <span>Print-ready rosters sorted by Dept, Course & Year</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onOpenLogin('admin')}
                  className="w-full py-3 px-4 text-xs font-extrabold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Organizer Sign In</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-950" />
                </button>

                <button
                  onClick={() => onOpenRegister('admin')}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all cursor-pointer text-center"
                >
                  New Organization? Sign Up Here
                </button>
              </div>
            </div>

          </div>

          {/* Quick Feature Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-4 text-xs text-slate-400">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#d0f344] shrink-0" />
              <span>Multi-device sync</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#d0f344] shrink-0" />
              <span>Zero ID exposure</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#d0f344] shrink-0" />
              <span>USTP-CDO & CDO Campuses</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
              <Printer className="w-4 h-4 text-[#d0f344] shrink-0" />
              <span>Print-ready sheets</span>
            </div>
          </div>

        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-500">
        AttendIDto · Smart Campus Attendance Platform
      </footer>

    </div>
  );
};
