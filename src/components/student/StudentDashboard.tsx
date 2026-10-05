import React, { useState, useMemo } from 'react';
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
  ShieldCheck
} from 'lucide-react';

interface StudentDashboardProps {
  student: StudentProfile;
  events: CampusEvent[];
  attendance: AttendanceRecord[];
  notifications: AppNotification[];
  onUpdateProfile: (id: string, updates: Partial<StudentProfile>) => void;
  onOpenPassModal: () => void;
  onMarkNotificationRead: (id: string) => void;
  onToggleSaveEvent?: (studentId: string, eventId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  events,
  attendance,
  notifications,
  onUpdateProfile,
  onOpenPassModal,
  onMarkNotificationRead,
  onToggleSaveEvent
}) => {
  const [activeTab, setActiveTab] = useState<'pass' | 'events' | 'history' | 'notifications' | 'profile'>('pass');
  
  // Events Tab Sub-view
  const [eventsSubTab, setEventsSubTab] = useState<'browse' | 'saved'>('browse');
  const [orgFilter, setOrgFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState<'my-dept' | 'all'>('my-dept');
  const [schoolFilter, setSchoolFilter] = useState<string>('my-school');
  const [searchQuery, setSearchQuery] = useState('');

  // Profile form state
  const [yearLevel, setYearLevel] = useState(student.yearLevel);
  const [department, setDepartment] = useState(student.department);
  const [course, setCourse] = useState(student.course);
  const [avatarUrl, setAvatarUrl] = useState(student.avatarUrl || '');
  const [profileSaved, setProfileSaved] = useState(false);

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
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl overflow-hidden border border-indigo-200 shrink-0">
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
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
          className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-slate-950" />
          <span>Present Student Pass (QR)</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-xl max-w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('pass')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'pass'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-indigo-600" />
          <span>My Student Pass</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'events'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>Campus Events Directory ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5 text-indigo-600" />
          <span>Attendance History ({studentAttendance.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap relative cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-indigo-600" />
          <span>Notifications</span>
          {studentNotifs.filter(n => !n.read).length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5 text-indigo-600" />
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
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ACTIVE PASS
              </span>
            </div>

            {/* QR Canvas Display */}
            <div className="relative inline-block p-4 bg-slate-950 rounded-2xl shadow-inner border border-slate-800">
              <QRCodeCanvas
                value={student.qrCodeToken}
                size={220}
                className="rounded-lg shadow-sm"
              />
              <div className="text-[10px] font-mono text-[#d0f344] mt-2 tracking-wider">
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
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Maximize2 className="w-4 h-4 text-[#d0f344]" />
                <span>Open Fullscreen Kiosk Pass</span>
              </button>
            </div>
          </div>

          {/* Pass Info & Attendance Summary */}
          <div className="md:col-span-6 space-y-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
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
                  <div className="text-xl font-bold text-indigo-600">{(student.savedEventIds || []).length}</div>
                  <div className="text-[11px] text-slate-500">My RSVP'd Events</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-[#d0f344]" />
                Multi-Organization Safety
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
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
                  className="py-2 px-4 text-xs font-bold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-xl cursor-pointer"
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
                        <div className="text-xs text-indigo-900 font-medium">{evt.organization}</div>
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
                className="py-2 px-4 text-xs font-bold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-xl cursor-pointer"
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

      {/* TAB 4: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Notifications & Announcements
          </h2>

          {studentNotifs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No notifications yet.
            </div>
          ) : (
            <div className="space-y-2">
              {studentNotifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => onMarkNotificationRead(n.id)}
                  className={`p-4 rounded-2xl border text-xs transition-colors cursor-pointer ${
                    n.read
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : 'bg-indigo-50/70 border-indigo-200 text-slate-900 font-medium'
                  }`}
                >
                  <div className="font-bold mb-0.5">{n.title}</div>
                  <div className="text-slate-600">{n.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PROFILE & SETTINGS */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Student Profile Information</h2>
            <p className="text-xs text-slate-500">
              Update your department, degree program, and year level. Full name and school are locked to preserve attendance authenticity.
            </p>
          </div>

          {profileSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Non-Editable Institutional Data:</span>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">Full Name:</span>
                  <span className="font-bold text-slate-900">{student.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">CDO School / University:</span>
                  <span className="font-bold text-slate-900">{student.school}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department / College
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900"
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
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900"
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

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-extrabold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
