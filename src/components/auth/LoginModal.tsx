import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types';
import { X, Lock, Mail, Eye, EyeOff, ShieldCheck, User, CheckCircle2, AlertCircle, ArrowUpRight, UserPlus } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  initialRole?: UserRole;
  onClose: () => void;
  onLogin: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; message: string; user?: any }> | { success: boolean; message: string; user?: any };
  onSwitchToRegister: (role: UserRole) => void;
  onOpenForgotPassword: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  initialRole = 'admin',
  onClose,
  onLogin,
  onSwitchToRegister,
  onOpenForgotPassword
}) => {
  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Keep activeRole strictly synced with initialRole whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveRole(initialRole);
      setErrorMsg('');
      setSuccessMsg('');
      setEmail('');
      setPassword('');
    }
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your institutional email.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    try {
      const res = await onLogin(email, password, activeRole);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onClose();
        }, 300);
      }
    } catch {
      setErrorMsg('Connection error. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#121722] text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800/80 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-4 h-4" aria-hidden="true">
                <path d="m7 24 9-19 9 19M11 17h10" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="25" cy="6" r="3" fill="#d0f344" />
              </svg>
            </div>
            <span className="text-base font-extrabold text-white">
              Attend<span className="text-[#d0f344]">IDto</span>
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {activeRole === 'admin' ? 'Organizer Sign In' : 'Student Sign In'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {activeRole === 'admin'
              ? 'Campus student councils, organizations & event managers in CDO.'
              : 'Sign in to access your student attendance profile and pass.'}
          </p>

          {/* Role Segment Toggle */}
          <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl gap-1 mt-4 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveRole('admin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRole === 'admin'
                  ? 'bg-[#d0f344] text-slate-950 shadow-xs font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Organizer Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole('student');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRole === 'student'
                  ? 'bg-[#d0f344] text-slate-950 shadow-xs font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Student Sign In</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 pt-5 space-y-4">
          
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl space-y-2 text-xs text-rose-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
                {errorMsg.toLowerCase().includes('sign up') && (
                  <button
                    type="button"
                    onClick={() => onSwitchToRegister(activeRole)}
                    className="w-full py-1.5 px-3 bg-[#d0f344] text-slate-950 font-bold rounded-lg text-xs hover:bg-[#bde532] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up as {activeRole === 'admin' ? 'Organizer' : 'Student'} Now</span>
                  </button>
                )}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {activeRole === 'admin' ? 'Organizer Institutional Email' : 'Student Institutional Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeRole === 'admin' ? 'organizer@ustp.edu.ph / xu.edu.ph' : 'student@xu.edu.ph / ustp.edu.ph'}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-[#d0f344] focus:border-[#d0f344] placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onOpenForgotPassword}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-[#d0f344] focus:border-[#d0f344] placeholder:text-slate-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-extrabold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <span>Sign In as {activeRole === 'admin' ? 'Organizer' : 'Student'}</span>
              <ArrowUpRight className="w-4 h-4 text-slate-950" />
            </button>
          </form>

          {/* Switch to Register / Sign Up */}
          <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => onSwitchToRegister(activeRole)}
              className="text-[#d0f344] hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
            >
              <span>Sign Up as {activeRole === 'admin' ? 'Organizer' : 'Student'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
