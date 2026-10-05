import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types';
import { UNIVERSITIES, DEPARTMENTS, COURSES, YEAR_LEVELS } from '../../data/initialData';
import { X, Lock, Mail, User, School, Building, ShieldCheck, AlertCircle } from 'lucide-react';

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
  const [step, setStep] = useState<'credentials' | 'profile'>('credentials');

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

  useEffect(() => {
    if (isOpen) {
      setActiveRole(initialRole);
      setStep('credentials');
      setErrorMsg('');
    }
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  const resolvedSchool = school === 'Other' ? customSchool : school;

  const handleNextStep = (e: React.FormEvent) => {
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

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

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
      setErrorMsg('Failed to complete registration. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#121722] text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800/80 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {activeRole === 'admin' ? 'Organizer Registration' : 'Student Registration'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {step === 'credentials'
              ? 'Institutional credentials for CDO campuses'
              : 'Complete profile information'}
          </p>

          {step === 'credentials' && (
            <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl gap-1 mt-3 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setActiveRole('admin');
                  setErrorMsg('');
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRole === 'admin'
                    ? 'bg-[#d0f344] text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Organizer</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveRole('student');
                  setErrorMsg('');
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRole === 'student'
                    ? 'bg-[#d0f344] text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'credentials' ? (
            <form onSubmit={handleNextStep} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-[#d0f344]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  University / College in CDO (USTP-CDO, XU, Liceo, CU, etc.)
                </label>
                <select
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-[#d0f344]"
                >
                  {UNIVERSITIES.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                  <option value="Other">Other CDO College / University</option>
                </select>
              </div>

              {school === 'Other' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Enter CDO School Name
                  </label>
                  <input
                    type="text"
                    value={customSchool}
                    onChange={(e) => setCustomSchool(e.target.value)}
                    placeholder="e.g. College Name in CDO"
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white"
                    required
                  />
                </div>
              )}

              {activeRole === 'admin' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Campus Student Organization Name
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. USTP CS Guild / XU Central Student Government"
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-[#d0f344]"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Institutional Email (for verification)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@school.edu.ph"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-[#d0f344]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-[#d0f344]"
                  required
                  minLength={6}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Continue to Profile Details →
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-300">Registered Info (Permanent):</div>
                <div className="text-slate-400">Name: <span className="text-white font-medium">{fullName}</span></div>
                <div className="text-slate-400">School: <span className="text-white font-medium">{resolvedSchool}</span></div>
                {activeRole === 'admin' && (
                  <div className="text-slate-400">Organization: <span className="text-white font-medium">{organization}</span></div>
                )}
                <div className="text-[11px] text-[#d0f344] pt-1">
                  ✓ Note: Name and School are permanently locked to preserve official record authenticity.
                </div>
              </div>

              {activeRole === 'student' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Department / College
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white"
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Degree Program / Course
                    </label>
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white"
                    >
                      {COURSES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Current Year Level
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {YEAR_LEVELS.map(yr => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setYearLevel(yr)}
                          className={`py-2 text-xs rounded-xl border font-bold transition-all cursor-pointer ${
                            yearLevel === yr
                              ? 'bg-[#d0f344] text-slate-950 border-[#d0f344]'
                              : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Position in Organization
                    </label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="e.g. President, Vice President, Event Head, Auditor"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-[#d0f344]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Organization Category
                    </label>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
                      Standard CDO University Recognized Student Organization (USG / CSG / Guild).
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="w-1/3 py-2.5 px-3 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 px-4 text-xs font-extrabold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Complete Registration & Launch Pass
                </button>
              </div>
            </form>
          )}

          {/* Switch to Login */}
          <div className="pt-2 border-t border-slate-800 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onSwitchToLogin(activeRole)}
              className="text-[#d0f344] hover:underline font-bold cursor-pointer"
            >
              Sign In to {activeRole === 'admin' ? 'Organizer' : 'Student'} Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
