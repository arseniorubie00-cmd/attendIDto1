import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types';
import { UNIVERSITIES, DEPARTMENTS, COURSES, YEAR_LEVELS } from '../../data/initialData';
import { X, Lock, Mail, User, School, Building, ShieldCheck, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  initialRole?: UserRole;
  onClose: () => void;
  onRegisterStudent: (data: {
    fullName: string;
    email: string;
    password?: string;
    school: string;
    yearLevel: string;
    department: string;
    course: string;
    avatarUrl?: string;
  }) => Promise<{ success: boolean; user?: any }> | { success: boolean; user?: any };
  onRegisterAdmin: (data: {
    fullName: string;
    email: string;
    password?: string;
    school: string;
    organization: string;
    position: string;
    department?: string;
    course?: string;
    yearLevel?: string;
  }) => Promise<{ success: boolean; user?: any }> | { success: boolean; user?: any };
  onSwitchToLogin: (role: UserRole) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  initialRole = 'admin',
  onClose,
  onRegisterStudent,
  onRegisterAdmin,
  onSwitchToLogin
}) => {
  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);
  const [step, setStep] = useState<'credentials' | 'profile' | 'verification'>('credentials');

  // Shared Fields
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState(UNIVERSITIES[0]);
  const [customSchool, setCustomSchool] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Student Profile Fields
  const [yearLevel, setYearLevel] = useState(YEAR_LEVELS[1]);
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [course, setCourse] = useState(COURSES[0]);

  // Admin Profile Fields
  const [organization, setOrganization] = useState('');
  const [position, setPosition] = useState('President');

  // Email Verification State
  const [generatedOtp, setGeneratedOtp] = useState('742918');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveRole(initialRole);
      setStep('credentials');
      setErrorMsg('');
      setOtpError('');
      setEnteredOtp('');
    }
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  const resolvedSchool = school === 'Other' ? customSchool : school;

  const handleNextToProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (school === 'Other' && !customSchool.trim()) {
      setErrorMsg('Please specify your CDO school name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid institutional email.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (activeRole === 'admin' && !organization.trim()) {
      setErrorMsg('Please enter your campus organization or council name.');
      return;
    }

    setStep('profile');
  };

  const handleProceedToVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setEnteredOtp('');
    setOtpError('');
    setStep('verification');
  };

  const handleVerifyEmailAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (!enteredOtp.trim()) {
      setOtpError('Please enter the 6-digit code sent to your email.');
      return;
    }

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setOtpError('Invalid code. Please check your verification code or click auto-fill.');
      return;
    }

    setIsVerifying(true);

    try {
      if (activeRole === 'student') {
        const res = await onRegisterStudent({
          fullName: fullName.trim(),
          email: email.trim(),
          password: password.trim(),
          school: resolvedSchool,
          yearLevel,
          department,
          course
        });
        if (res.success) {
          onClose();
        }
      } else {
        const res = await onRegisterAdmin({
          fullName: fullName.trim(),
          email: email.trim(),
          password: password.trim(),
          school: resolvedSchool,
          organization: organization.trim(),
          position: position.trim()
        });
        if (res.success) {
          onClose();
        }
      }
    } catch {
      setOtpError('Failed to complete registration. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#051122]/85 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0a1f3d] text-white rounded-3xl shadow-2xl border border-blue-900/90 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-blue-900/60 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 text-blue-300 hover:text-white rounded-lg hover:bg-blue-900/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-blue-950 bg-[#fbbf24] px-2.5 py-0.5 rounded-full font-extrabold shadow-xs">
              {step === 'credentials' ? 'Step 1 of 3: Credentials' : step === 'profile' ? 'Step 2 of 3: Academic Profile' : 'Step 3 of 3: Email Verification'}
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {step === 'verification' ? 'Verify Institutional Email' : `Sign Up as ${activeRole === 'student' ? 'Student' : 'Campus Organizer'}`}
          </h2>
          <p className="text-xs text-blue-200/80 mt-0.5">
            {step === 'verification'
              ? `Enter the 6-digit code sent to ${email}`
              : `Create your verified account for USTP-CDO and Cagayan de Oro universities.`
            }
          </p>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* STEP 1: CREDENTIALS */}
          {step === 'credentials' && (
            <form onSubmit={handleNextToProfile} className="space-y-4">
              
              {/* Role Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#061426] border border-blue-900/80 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setActiveRole('student')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeRole === 'student'
                      ? 'bg-white text-blue-950 shadow-sm font-extrabold'
                      : 'text-blue-200 hover:text-white'
                  }`}
                >
                  Student Account
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRole('admin')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeRole === 'admin'
                      ? 'bg-[#fbbf24] text-blue-950 shadow-sm font-extrabold'
                      : 'text-blue-200 hover:text-white'
                  }`}
                >
                  Campus Organizer
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-blue-100 mb-1">
                  Full Name (Official Record) *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Juan C. Dela Cruz"
                  className="w-full px-3 py-2 text-xs bg-[#061426] border border-blue-800 rounded-xl text-white placeholder:text-blue-300/50 focus:outline-hidden focus:ring-1 focus:ring-[#fbbf24] focus:border-[#fbbf24]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-100 mb-1">
                  University / College in CDO (USTP-CDO, XU, Liceo, CU, etc.)
                </label>
                <select
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#061426] border border-blue-800 rounded-xl text-white focus:ring-1 focus:ring-[#fbbf24] focus:border-[#fbbf24]"
                >
                  {UNIVERSITIES.map(u => (
                    <option key={u} value={u} className="bg-[#0a1f3d]">{u}</option>
                  ))}
                  <option value="Other" className="bg-[#0a1f3d]">Other CDO College / University</option>
                </select>
              </div>

              {school === 'Other' && (
                <div>
                  <label className="block text-xs font-semibold text-blue-100 mb-1">
                    Enter CDO School Name
                  </label>
                  <input
                    type="text"
                    value={customSchool}
                    onChange={(e) => setCustomSchool(e.target.value)}
                    placeholder="e.g. College Name in CDO"
                    className="w-full px-3 py-2 text-xs bg-[#061426] border border-blue-800 rounded-xl text-white focus:ring-1 focus:ring-[#fbbf24] focus:border-[#fbbf24]"
                    required
                  />
                </div>
              )}

              {activeRole === 'admin' && (
                <div>
                  <label className="block text-xs font-semibold text-blue-100 mb-1">
                    Campus Organization / Council Name *
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Student Council, Computer Science Society"
                    className="w-full px-3 py-2 text-xs bg-[#061426] border border-blue-800 rounded-xl text-white placeholder:text-blue-300/50 focus:ring-1 focus:ring-[#fbbf24] focus:border-[#fbbf24]"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-blue-100 mb-1">
                  Institutional Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. j.delacruz@ustp.edu.ph or @gmail.com"
                  className="w-full px-3 py-2 text-xs bg-[#061426] border border-blue-800 rounded-xl text-white placeholder:text-blue-300/50 focus:ring-1 focus:ring-[#fbbf24] focus:border-[#fbbf24]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-100 mb-1">
                  Password (min. 6 characters) *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs bg-[#061426] border border-blue-800 rounded-xl text-white placeholder:text-blue-300/50 focus:ring-1 focus:ring-[#fbbf24] focus:border-[#fbbf24]"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-extrabold text-blue-950 bg-[#fbbf24] hover:bg-[#f59e0b] rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Next: Academic Profile →
                </button>
              </div>
          {/* STEP 2: PROFILE */}
          {step === 'profile' && (
            <form onSubmit={handleProceedToVerification} className="space-y-4">
              
              <div className="p-3 rounded-2xl bg-[#061426] border border-blue-900/80 text-xs space-y-1">
                <div className="font-bold text-white">{fullName}</div>
                <div className="text-blue-200/80">{resolvedSchool} · {email}</div>
              </div>

              {activeRole === 'student' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-blue-100 mb-1">
                      Academic Department / College
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#061426] border border-blue-800 rounded-xl text-white focus:ring-1 focus:ring-[#fbbf24] focus:border-[#fbbf24]"
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d} value={d} className="bg-[#0a1f3d]">{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-blue-100 mb-1">
                      Degree Program / Course
                    </label>
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#061426] border border-blue-800 rounded-xl text-white focus:ring-1 focus:ring-[#fbbf24] focus:border-[#fbbf24]"
                    >
                      {COURSES.map(c => (
                        <option key={c} value={c} className="bg-[#0a1f3d]">{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-blue-100 mb-1">
                      Year Level
                    </label>
                    <select
                      value={yearLevel}
                      onChange={(e) => setYearLevel(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#061426] border border-blue-800 rounded-xl text-white focus:ring-1 focus:ring-[#fbbf24] focus:border-[#fbbf24]"
                    >
                      {YEAR_LEVELS.map(y => (
                        <option key={y} value={y} className="bg-[#0a1f3d]">{y}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-blue-100 mb-1">
                      Position in Organization
                    </label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="e.g. President, Vice President, Event Lead"
                      className="w-full px-3 py-2 text-xs bg-[#061426] border border-blue-800 rounded-xl text-white placeholder:text-blue-300/50 focus:ring-1 focus:ring-[#fbbf24] focus:border-[#fbbf24]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-blue-100 mb-1">
                      Affiliated Department (Optional)
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#061426] border border-blue-800 rounded-xl text-white focus:ring-1 focus:ring-[#fbbf24] focus:border-[#fbbf24]"
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d} value={d} className="bg-[#0a1f3d]">{d}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="w-1/3 py-2.5 px-3 text-xs font-semibold text-blue-200 bg-[#061426] hover:bg-[#081d38] rounded-xl border border-blue-800 transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 px-4 text-xs font-extrabold text-blue-950 bg-[#fbbf24] hover:bg-[#f59e0b] rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Proceed to Verification</span>
                  <KeyRound className="w-4 h-4 text-blue-950" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: EMAIL VERIFICATION (OTP) */}
          {step === 'verification' && (
            <form onSubmit={handleVerifyEmailAndComplete} className="space-y-4">
              <div className="p-4 bg-[#061426] border border-blue-900/80 rounded-2xl text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#fbbf24]/15 border border-[#fbbf24]/30 text-[#fbbf24] flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Enter Email Verification Code</h4>
                  <p className="text-xs text-blue-200/80 mt-0.5">
                    We sent a 6-digit confirmation code to:
                  </p>
                  <p className="text-xs font-bold text-[#fbbf24] mt-0.5 font-mono">{email}</p>
                </div>
              </div>

              {/* Demo Helper auto-fill button */}
              <div className="p-3 bg-[#061426]/70 border border-blue-900/80 rounded-xl flex items-center justify-between text-xs">
                <span className="text-blue-300/80">Generated Code:</span>
                <button
                  type="button"
                  onClick={() => setEnteredOtp(generatedOtp)}
                  className="font-mono font-bold text-[#fbbf24] hover:underline cursor-pointer bg-blue-950 px-2 py-0.5 rounded border border-blue-800"
                >
                  {generatedOtp} (Click to auto-fill)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-100 mb-1.5">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 bg-[#061426] border border-blue-800 rounded-xl text-white focus:outline-hidden focus:ring-2 focus:ring-[#fbbf24] focus:border-[#fbbf24]"
                  required
                />
              </div>

              {otpError && (
                <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{otpError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('profile')}
                  className="w-1/3 py-2.5 px-3 text-xs font-semibold text-blue-200 bg-[#061426] hover:bg-[#081d38] rounded-xl border border-blue-800 transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-2/3 py-2.5 px-4 text-xs font-extrabold text-blue-950 bg-[#fbbf24] hover:bg-[#f59e0b] rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-blue-950 border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Email...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-blue-950" />
                      <span>Verify Email & Complete Sign Up</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer toggle to Login */}
          <div className="pt-2 text-center text-xs text-blue-200/80 border-t border-blue-900/60">
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={() => onSwitchToLogin(activeRole)}
              className="text-[#fbbf24] hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
            >
              Sign In Here
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
