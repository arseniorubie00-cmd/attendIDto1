import React, { useState, useRef } from 'react';
import { AdminProfile } from '../../types';
import { DEPARTMENTS, COURSES, YEAR_LEVELS } from '../../data/initialData';
import { X, Lock, ShieldCheck, CheckCircle2, User, Upload, Camera, LogOut } from 'lucide-react';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: AdminProfile;
  onUpdateProfile: (id: string, updates: Partial<AdminProfile>) => void;
  onLogout?: () => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  admin,
  onUpdateProfile,
  onLogout
}) => {
  const [position, setPosition] = useState(admin.position);
  const [avatarUrl, setAvatarUrl] = useState(admin.avatarUrl || '');
  const [department, setDepartment] = useState(admin.department || DEPARTMENTS[0]);
  const [course, setCourse] = useState(admin.course || COURSES[0]);
  const [yearLevel, setYearLevel] = useState(admin.yearLevel || YEAR_LEVELS[3]);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setAvatarUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(admin.id, {
      position,
      avatarUrl,
      department,
      course,
      yearLevel
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Organizer Profile & Credentials
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update leadership position and picture. Institutional identity is locked.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {saved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Organizer profile updated successfully!</span>
            </div>
          )}

          {/* Profile Picture Upload Section */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-bold overflow-hidden border-2 border-slate-300 shadow-sm">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={admin.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-[#d0f344]" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 bg-[#d0f344] text-slate-950 rounded-xl shadow-sm hover:scale-105 transition-transform cursor-pointer"
                title="Upload Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 flex-1 text-center sm:text-left">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Organizer Picture</h4>
                <p className="text-[11px] text-slate-500">
                  Upload a photo from your device to represent your organization.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Upload Picture</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="py-1.5 px-2 text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFile}
              />
            </div>
          </div>

          {/* Locked Institutional Block (Non-editable: Name, School, Organization) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                Verified Institutional Identity (Non-Editable)
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Accredited Student Org
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name:</span>
                <span className="font-bold text-slate-900">{admin.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">School / University:</span>
                <span className="font-bold text-slate-900 truncate block">{admin.school}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Campus Organization:</span>
                <span className="font-bold text-slate-900 truncate block">{admin.organization}</span>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Position in Organization
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Year Level
                </label>
                <select
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden"
                >
                  {YEAR_LEVELS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 px-4 text-xs font-bold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save Organizer Profile
              </button>
            </div>
          </form>

          {/* Secondary Account Switch (Tucked in settings, like GCash) */}
          {onLogout && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Organizer session active</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch Account</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
