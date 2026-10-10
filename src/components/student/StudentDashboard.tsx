import React, { useState, useMemo, useRef } from 'react';
import { StudentProfile, CampusEvent, AttendanceRecord, AppNotification } from '../../types';
import { QRCodeCanvas } from '../common/QRCodeCanvas';
import { DEPARTMENTS, COURSES, YEAR_LEVELS } from '../../data/initialData';
import { 
  QrCode, 
  Calendar, 
  Clock, 
  MapPin, 
  Building, 
  CheckCircle2, 
  Bell, 
  User, 
  Lock, 
  Sparkles,
  Maximize2,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Search,
  Filter,
  Layers,
  History,
  ShieldCheck,
  Upload,
  Camera,
  Image as ImageIcon,
  LogOut,
  Check,
  Mail,
  KeyRound
} from 'lucide-react';

interface StudentDashboardProps {
  student: StudentProfile;
  events: CampusEvent[];
  attendance: AttendanceRecord[];
  notifications: AppNotification[];
  onUpdateProfile: (id: string, updates: Partial<StudentProfile>) => void;
  onOpenPassModal: () => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead?: (userId?: string) => void;
  onVerifyEmail?: (email: string, role: 'student') => Promise<boolean>;
  onToggleSaveEvent?: (studentId: string, eventId: string) => void;
  onLogout?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  events,
  attendance,
  notifications,
  onUpdateProfile,
  onOpenPassModal,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onVerifyEmail,
  onToggleSaveEvent,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'pass' | 'events' | 'history' | 'notifications' | 'profile'>('pass');
  
  // Email verification state
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationOtp, setVerificationOtp] = useState('');
  const [expectedOtp, setExpectedOtp] = useState('839214');
  const [otpSent, setOtpSent] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  
  // Events Tab Sub-view
  const [eventsSubTab, setEventsSubTab] = useState<'browse' | 'saved'>('browse');
  const [orgFilter, setOrgFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState<'my-dept' | 'all'>('my-dept');
  const [schoolFilter, setSchoolFilter] = useState<string>('my-school');
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications Filter State (All vs Unread)
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');

  // Profile form state
  const [yearLevel, setYearLevel] = useState(student.yearLevel);
  const [department, setDepartment] = useState(student.department);
  const [course, setCourse] = useState(student.course);
  const [avatarUrl, setAvatarUrl] = useState(student.avatarUrl || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

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

  // Student's real verified attendance records
  const studentAttendance = useMemo(() => {
    return attendance.filter(
      a => a.studentId === student.id || a.studentName.toLowerCase() === student.fullName.toLowerCase()
    );
  }, [attendance, student.id, student.fullName]);

  // Student notifications
  const studentNotifs = useMemo(() => {
    return notifications.filter(
      n => n.targetUserId === 'all_students' || n.targetUserId === student.id || n.targetUserId === 'all'
    );
  }, [notifications, student.id]);

  // Unique organizations currently hosting events
  const availableOrgs = useMemo(() => {
    const orgs = new Set<string>();
    events.forEach(e => {
      if (e.organization) orgs.add(e.organization);
    });
    return Array.from(orgs);
  }, [events]);

  // Filtered Events Directory (Prevents automatically dumping all org events onto student)
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      // School filter: support student's school, USTP-CDO, or any CDO university
      if (schoolFilter === 'my-school') {
        const studentSchoolShort = student.school.toLowerCase().split('–')[0].trim();
        const evSchoolShort = ev.school.toLowerCase().split('–')[0].trim();
        if (!ev.school.toLowerCase().includes(studentSchoolShort) && !student.school.toLowerCase().includes(evSchoolShort)) {
          return false;
        }
      } else if (schoolFilter === 'ustp') {
        if (!ev.school.toLowerCase().includes('ustp')) {
          return false;
        }
      } else if (schoolFilter !== 'all') {
        const selectedShort = schoolFilter.toLowerCase().split('–')[0].trim();
        if (!ev.school.toLowerCase().includes(selectedShort)) {
          return false;
        }
      }

      // Org filter
      if (orgFilter !== 'ALL' && ev.organization !== orgFilter) {
        return false;
      }

      // Department filter
      if (deptFilter === 'my-dept') {
        if (ev.targetFilter.departments.length > 0 && !ev.targetFilter.departments.includes(student.department)) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesOrg = ev.organization.toLowerCase().includes(q);
        const matchesVenue = ev.venue.toLowerCase().includes(q);
        if (!matchesTitle && !matchesOrg && !matchesVenue) return false;
      }

      return true;
    });
  }, [events, student.school, student.department, schoolFilter, orgFilter, deptFilter, searchQuery]);

  // Saved / RSVP'd Events
  const savedEvents = useMemo(() => {
    const savedIds = student.savedEventIds || [];
    return events.filter(e => savedIds.includes(e.id));
  }, [events, student.savedEventIds]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(student.id, {
      yearLevel,
      department,
      course,
      avatarUrl
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const isEventSaved = (eventId: string) => {
    return (student.savedEventIds || []).includes(eventId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner / Student Identity Bar */}
      <div className="p-6 bg-white rounded-2xl border border-blue-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0a1f3d] text-[#fbbf24] flex items-center justify-center font-bold text-xl overflow-hidden border border-blue-900 shrink-0">
            {student.avatarUrl ? (
              <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
            ) : (
              student.fullName.charAt(0)
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {student.fullName}
              </h1>
              <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-200">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                Verified Student
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {student.school} · {student.department} · {student.course} ({student.yearLevel})
            </p>
          </div>
        </div>

        {/* Quick Pass Trigger Button */}
        <button
          onClick={onOpenPassModal}
          className="px-4 py-2.5 text-xs font-extrabold text-blue-950 bg-[#fbbf24] hover:bg-[#f59e0b] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-blue-950" />
          <span>Present Student Pass (QR)</span>
        </button>
      </div>

      {/* Email Verification Banner (If Not Yet Verified) */}
      {!student.emailVerified && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900">
            <Mail className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Email Verification Needed: </span>
              <span className="text-slate-600">Verify <strong>{student.email}</strong> to ensure campus notices and RSVP confirmations reach your account.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsVerifyingEmail(true);
              const code = Math.floor(100000 + Math.random() * 900000).toString();
              setExpectedOtp(code);
              setOtpSent(true);
              setVerificationError('');
            }}
            className="py-1.5 px-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            Verify Email
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-xl max-w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('pass')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'pass'
              ? 'bg-white text-blue-950 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-blue-700" />
          <span>My Student Pass</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'events'
              ? 'bg-white text-blue-950 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-blue-700" />
          <span>Campus Events Directory ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white text-blue-950 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5 text-blue-700" />
          <span>Attendance History ({studentAttendance.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('notifications');
            // Instantly clear unread state and persist to server
            if (onMarkAllNotificationsRead) {
              onMarkAllNotificationsRead(student.id);
            } else {
              studentNotifs.filter(n => !n.read).forEach(n => onMarkNotificationRead(n.id));
            }
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap relative cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-white text-blue-950 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-blue-700" />
          <span>Notifications</span>
          {studentNotifs.filter(n => !n.read).length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-white text-blue-950 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5 text-blue-700" />
          <span>Profile & Settings</span>
        </button>
      </div>

      {/* TAB 1: MY STUDENT PASS */}
      {activeTab === 'pass' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Main QR Card */}
          <div className="md:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">{student.school}</div>
                <div className="text-[11px] text-slate-500">AttendIDto Tokenized QR Pass</div>
              </div>
              <span className="text-[11px] font-mono text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                ACTIVE PASS
              </span>
            </div>

            {/* QR Canvas Display */}
            <div className="relative inline-block p-4 bg-[#07162c] rounded-2xl shadow-inner border border-blue-900">
              <QRCodeCanvas
                value={student.qrCodeToken}
                size={220}
                className="rounded-lg shadow-sm"
              />
              <div className="text-[10px] font-mono text-[#fbbf24] mt-2 tracking-wider font-bold">
                NO STUDENT ID DISPLAYED
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">{student.fullName}</h2>
              <p className="text-xs text-slate-600">
                {student.department} · {student.course} ({student.yearLevel})
              </p>
              <div className="text-[11px] text-slate-400 font-mono pt-1">
                Pass Token: {student.qrCodeToken}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenPassModal}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#0a1f3d] hover:bg-[#07162c] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-blue-900 shadow-xs"
              >
                <Maximize2 className="w-4 h-4 text-[#fbbf24]" />
                <span>Open Fullscreen Kiosk Pass</span>
              </button>
            </div>
          </div>

          {/* Pass Info & Attendance Summary */}
          <div className="md:col-span-6 space-y-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Zero Student ID Number Exposure
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                AttendIDto uses encrypted tokenization for event check-ins. Your sensitive physical student ID number is never printed on badges or exposed to event operators.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-xl font-bold text-slate-900">{studentAttendance.length}</div>
                  <div className="text-[11px] text-slate-500">Events Attended</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-xl font-bold text-blue-700">{(student.savedEventIds || []).length}</div>
                  <div className="text-[11px] text-slate-500">My RSVP'd Events</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#0a1f3d] text-white rounded-3xl border border-blue-900 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-[#fbbf24]" />
                Multi-Organization Safety
              </h3>
              <p className="text-xs text-blue-200/80 leading-relaxed">
                Campus organizations can only verify attendance when you present this QR pass at their official event scan station. Events from other clubs or colleges will never be automatically charged or forced onto your attendance records.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: CAMPUS EVENTS DIRECTORY (NOT DUMPED DIRECTLY) */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          
          {/* Header & Explanation */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">
                Campus Events Directory
              </h2>
              <p className="text-xs text-slate-500">
                Multiple campus organizations post scheduled events here. Browse by organization, filter by your college, or RSVP to save events to your schedule.
              </p>
            </div>

            {/* Sub-Tabs: Browse vs My RSVP'd */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start md:self-auto shrink-0">
              <button
                onClick={() => setEventsSubTab('browse')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  eventsSubTab === 'browse'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Browse All ({filteredEvents.length})
              </button>
              <button
                onClick={() => setEventsSubTab('saved')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  eventsSubTab === 'saved'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My RSVP'd ({savedEvents.length})
              </button>
            </div>
          </div>

          {/* Filtering Bar */}
          {eventsSubTab === 'browse' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
              
              {/* Search Box */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search event or organization..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Organization Filter */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">Org:</span>
                <select
                  value={orgFilter}
                  onChange={(e) => setOrgFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-900"
                >
                  <option value="ALL">All Campus Orgs</option>
                  {availableOrgs.map(org => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">Audience:</span>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value as 'my-dept' | 'all')}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-900"
                >
                  <option value="my-dept">My Department ({student.department.split(' ')[2] || 'Dept'})</option>
                  <option value="all">Open to All Depts</option>
                </select>
              </div>

              {/* School Filter */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">Campus:</span>
                <select
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-900"
                >
                  <option value="my-school">My School ({student.school.split('(')[0].split('–')[0].trim()})</option>
                  <option value="ustp">USTP-CDO</option>
                  <option value="Xavier University">Xavier University (XU)</option>
                  <option value="Liceo de Cagayan">Liceo de Cagayan University (LDCU)</option>
                  <option value="Capitol University">Capitol University (CU)</option>
                  <option value="PHINMA">PHINMA COC</option>
                  <option value="all">All CDO Universities</option>
                </select>
              </div>

            </div>
          )}

          {/* Events Grid */}
          {eventsSubTab === 'browse' ? (
            filteredEvents.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No scheduled events found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No events match your current filter. When organizations publish events for your department or campus, they will appear here.
                </p>
                {(orgFilter !== 'ALL' || deptFilter !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setOrgFilter('ALL');
                      setDeptFilter('all');
                      setSearchQuery('');
                    }}
                    className="py-1.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(evt => {
                  const saved = isEventSaved(evt.id);

                  return (
                    <div
                      key={evt.id}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs overflow-hidden flex flex-col justify-between transition-all"
                    >
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                            {evt.category}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                            {evt.school}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                            {evt.title}
                          </h3>
                          <div className="text-xs font-medium text-indigo-900 flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate">{evt.organization}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {evt.description || 'Campus student activity and general assembly.'}
                        </p>

                        <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{evt.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{evt.startTime} - {evt.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{evt.venue}</span>
                          </div>
                        </div>
                      </div>

                      {/* RSVP Action */}
                      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500">
                          Target: {evt.targetAttendees}
                        </span>

                        <button
                          onClick={() => onToggleSaveEvent?.(student.id, evt.id)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            saved
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          {saved ? (
                            <>
                              <BookmarkCheck className="w-3.5 h-3.5" />
                              <span>RSVP'd ✓</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>RSVP / Save</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            // SAVED EVENTS SUB-VIEW
            savedEvents.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No RSVP'd Events Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You haven't saved any events to your personal schedule. Click "Browse All" to explore upcoming campus events from student organizations.
                </p>
                <button
                  onClick={() => setEventsSubTab('browse')}
                  className="py-2 px-4 text-xs font-bold text-blue-950 bg-[#fbbf24] hover:bg-[#f59e0b] rounded-xl cursor-pointer"
                >
                  Browse Events Directory
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedEvents.map(evt => (
                  <div
                    key={evt.id}
                    className="bg-white rounded-2xl border border-emerald-200 shadow-xs overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          RSVP'd to Attend
                        </span>
                        <span className="text-[10px] text-slate-500">{evt.category}</span>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{evt.title}</h3>
                        <div className="text-xs text-blue-950 font-medium">{evt.organization}</div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{evt.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{evt.startTime} - {evt.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{evt.venue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-700 font-medium">
                        Present QR pass at entrance
                      </span>
                      <button
                        onClick={() => onToggleSaveEvent?.(student.id, evt.id)}
                        className="py-1 px-2.5 text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                      >
                        Cancel RSVP
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

        </div>
      )}

      {/* TAB 3: ATTENDANCE HISTORY (ONLY REAL SCANNED ATTENDANCE) */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Verified Attendance History
              </h2>
              <p className="text-xs text-slate-500">
                Official time-in logs verified by campus event organizers and entrance tap stations.
              </p>
            </div>
            <div className="px-3 py-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 self-start sm:self-auto">
              Total Checked In: {studentAttendance.length}
            </div>
          </div>

          {studentAttendance.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <History className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Attendance Records Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                When you attend an event and present your personal QR pass at the entrance station, your exact time-in and event record will appear here.
              </p>
              <button
                onClick={onOpenPassModal}
                className="py-2 px-4 text-xs font-bold text-blue-950 bg-[#fbbf24] hover:bg-[#f59e0b] rounded-xl cursor-pointer"
              >
                View My Pass
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {studentAttendance.map((rec) => {
                const eventObj = events.find(e => e.id === rec.eventId);

                return (
                  <div
                    key={rec.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {eventObj?.title || 'Campus Event'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          Attended ✓
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 text-indigo-900 font-medium">
                          <Building className="w-3.5 h-3.5 text-indigo-500" />
                          {eventObj?.organization || rec.school}
                        </span>
                        <span>·</span>
                        <span>Station: {rec.stationId}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-slate-900">
                        {rec.timeIn}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {eventObj?.date || new Date(rec.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: NOTIFICATIONS (WITH READ / UNREAD FILTER & NO PERMANENT RED DOT) */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Notifications & Announcements
              </h2>
              <p className="text-xs text-slate-500">
                Official announcements and scan confirmations for your account.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* Filter Tabs: All vs Unread */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setNotifFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    notifFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({studentNotifs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNotifFilter('unread')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    notifFilter === 'unread'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Unread ({studentNotifs.filter(n => !n.read).length})
                </button>
              </div>

              {studentNotifs.some(n => !n.read) && (
                <button
                  type="button"
                  onClick={() => {
                    if (onMarkAllNotificationsRead) {
                      onMarkAllNotificationsRead(student.id);
                    } else {
                      studentNotifs.filter(n => !n.read).forEach(n => onMarkNotificationRead(n.id));
                    }
                  }}
                  className="py-1.5 px-3 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark all as read</span>
                </button>
              )}
            </div>
          </div>

          {studentNotifs.filter(n => notifFilter === 'unread' ? !n.read : true).length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Bell className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">
                {notifFilter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-xs text-slate-400">
                {notifFilter === 'unread' ? 'All your notifications have been marked as read.' : 'You will receive notifications when new events are published.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {studentNotifs
                .filter(n => notifFilter === 'unread' ? !n.read : true)
                .map(n => (
                  <div
                    key={n.id}
                    onClick={() => onMarkNotificationRead(n.id)}
                    className={`p-4 rounded-2xl border text-xs transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      n.read
                        ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/60'
                        : 'bg-blue-50/80 border-blue-200 text-slate-900 shadow-xs ring-1 ring-blue-200/60'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                        )}
                        <span className={`font-bold ${n.read ? 'text-slate-800' : 'text-blue-950 font-extrabold'}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          · {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-slate-600 pl-4">{n.message}</div>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                      n.read ? 'bg-slate-200 text-slate-600' : 'bg-blue-900 text-white font-bold'
                    }`}>
                      {n.read ? 'Read' : 'New'}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PROFILE & SETTINGS (PHOTO EDITING & LOCKED INSTITUTIONAL DATA) */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Student Profile Information</h2>
            <p className="text-xs text-slate-500">
              Update your photo, academic department, and degree program. Full name and school are locked to preserve institutional records.
            </p>
          </div>

          {profileSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            
            {/* Profile Picture Upload Section */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-[#0a1f3d] text-white flex items-center justify-center text-xl font-bold overflow-hidden border-2 border-blue-900 shadow-sm">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-[#fbbf24]" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-[#fbbf24] text-blue-950 rounded-xl shadow-sm hover:scale-105 transition-transform cursor-pointer"
                  title="Upload New Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 flex-1 text-center sm:text-left">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Student Profile Picture</h4>
                  <p className="text-[11px] text-slate-500">
                    Upload a clear photo or select a picture from your device gallery.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-700" />
                    <span>Upload Photo</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="py-1.5 px-2.5 text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFile}
                />
              </div>
            </div>

            {/* Non-Editable Institutional Data (Name, School, Email Locked) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Institutional Identity (Non-Editable)
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verified Identity
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Full Name (Official Record):</span>
                  <input
                    type="text"
                    disabled
                    value={student.fullName}
                    className="w-full mt-1 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">CDO School / University:</span>
                  <input
                    type="text"
                    disabled
                    value={student.school}
                    className="w-full mt-1 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Institutional Email:</span>
                <input
                  type="text"
                  disabled
                  value={student.email}
                  className="w-full mt-1 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-mono text-xs cursor-not-allowed"
                />
              </div>
            </div>

            {/* Editable Academic Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / College
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Degree Program / Course
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                >
                  {COURSES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Year Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {YEAR_LEVELS.map(yr => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setYearLevel(yr)}
                      className={`py-2 text-xs rounded-xl border font-bold transition-all cursor-pointer ${
                        yearLevel === yr
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-extrabold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
            >
              Save Profile Changes
            </button>
          </form>

          {/* Secondary Account Switch (Tucked neatly in profile, like GCash) */}
          {onLogout && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Account session active</span>
              <button
                type="button"
                onClick={onLogout}
                className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch Account</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* Email Verification Modal */}
      {isVerifyingEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Verify Institutional Email</h3>
                  <p className="text-[11px] text-slate-500">{student.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVerifyingEmail(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {verificationSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Email Verified!</h4>
                <p className="text-xs text-emerald-700">Your institutional email is now verified.</p>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (verificationOtp.trim() !== expectedOtp.trim()) {
                    setVerificationError('Invalid verification code. Please check or use auto-fill.');
                    return;
                  }
                  if (onVerifyEmail) {
                    await onVerifyEmail(student.email, 'student');
                  }
                  onUpdateProfile(student.id, { emailVerified: true });
                  setVerificationSuccess(true);
                  setTimeout(() => {
                    setIsVerifyingEmail(false);
                    setVerificationSuccess(false);
                  }, 1200);
                }}
                className="space-y-4"
              >
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                  <div>Enter the 6-digit code sent to your email address:</div>
                  <div className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded inline-block">
                    Verification Code: {expectedOtp}
                  </div>
                </div>

                {verificationError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{verificationError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationOtp}
                    onChange={(e) => setVerificationOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 839214"
                    className="w-full px-3 py-2 text-center text-lg font-mono font-bold tracking-widest bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setVerificationOtp(expectedOtp)}
                    className="py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                  >
                    Auto-Fill Code
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 text-xs font-bold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-xl cursor-pointer transition-colors"
                  >
                    Confirm Verification
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
