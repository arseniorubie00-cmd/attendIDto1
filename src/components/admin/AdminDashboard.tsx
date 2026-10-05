import React, { useState, useEffect, useRef } from 'react';
import { AdminProfile, CampusEvent, AttendanceRecord, StudentProfile } from '../../types';
import { LiveMonitorView } from './LiveMonitorView';
import { ScanStationModal } from './ScanStationModal';
import { EventCreationModal } from './EventCreationModal';
import { PrintableReportModal } from './PrintableReportModal';
import { AdminProfileModal } from './AdminProfileModal';
import { QRScannerView } from '../common/QRScannerView';
import { 
  PlusCircle, 
  ScanLine, 
  Printer, 
  UserCheck, 
  Calendar, 
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Smartphone,
  History,
  BarChart3,
  Camera,
  AlertCircle,
  Volume2,
  VolumeX,
  FileSpreadsheet,
  Download,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminDashboardProps {
  admin: AdminProfile;
  events: CampusEvent[];
  attendance: AttendanceRecord[];
  students: StudentProfile[];
  onUpdateProfile: (id: string, updates: Partial<AdminProfile>) => void;
  onCreateEvent: (
    payload: Omit<CampusEvent, 'id' | 'isLaunched' | 'createdAt'>
  ) => void;
  onScanStudent: (
    eventId: string,
    studentIdentifier: string,
    stationId: string,
    operatorLabel: string
  ) => {
    success: boolean;
    record?: AttendanceRecord;
    student?: StudentProfile;
    message: string;
    alreadyCheckedIn?: boolean;
  };
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  admin,
  events,
  attendance,
  students,
  onUpdateProfile,
  onCreateEvent,
  onScanStudent
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(() => events[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'monitor' | 'scanner' | 'reports' | 'history'>('monitor');
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Embedded Scanner State
  const [cameraActive, setCameraActive] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [stationName, setStationName] = useState('Gate 1 - Main Entrance (Device 1)');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanFeedback, setScanFeedback] = useState<{
    status: 'success' | 'duplicate' | 'error' | null;
    message: string;
    student?: StudentProfile;
    record?: AttendanceRecord;
  }>({ status: null, message: '' });

  // Active event
  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];

  // Keep selectedEventId synced when events change
  useEffect(() => {
    if (events.length > 0 && (!selectedEventId || !events.some(e => e.id === selectedEventId))) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  // Audio synthesize function for scanner beep
  const playBeep = (type: 'success' | 'error') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  };

  // Execute Scan
  const handlePerformScan = (ident: string) => {
    if (!activeEvent) return;
    if (!ident.trim()) return;

    const res = onScanStudent(activeEvent.id, ident.trim(), stationName, admin.fullName);
    if (res.success && res.record) {
      playBeep('success');
      setScanFeedback({
        status: 'success',
        message: res.message,
        student: res.student,
        record: res.record
      });
      setManualCode('');
      try {
        confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
      } catch (e) {
        console.warn(e);
      }
    } else if (res.alreadyCheckedIn) {
      playBeep('error');
      setScanFeedback({
        status: 'duplicate',
        message: res.message,
        student: res.student,
        record: res.record
      });
    } else {
      playBeep('error');
      setScanFeedback({
        status: 'error',
        message: res.message
      });
    }
  };

  // 1-Click Fast CDO Campus Event Creation
  const handleQuickCreateEvent = () => {
    onCreateEvent({
      organizerId: admin.id,
      organizerName: admin.fullName,
      organization: admin.organization || 'USTP Student Organization',
      school: admin.school || 'USTP-CDO (University of Science and Technology of Southern Philippines)',
      title: 'USTP-CDO Campus Tech Summit & General Assembly 2026',
      description: 'Annual gathering of students and campus leaders in Cagayan de Oro. Real-time attendance monitoring, zero student ID exposure, and multi-device entrance scanning.',
      category: 'General Assembly',
      date: new Date().toISOString().split('T')[0],
      startTime: '08:30 AM',
      endTime: '04:30 PM',
      venue: 'Main Campus Gymnasium & Audio-Visual Theater',
      targetAttendees: 500,
      targetFilter: { departments: [], yearLevels: [], courses: [] },
      status: 'upcoming'
    });
  };

  // Attendance for active event
  const eventAttendance = activeEvent ? attendance.filter(a => a.eventId === activeEvent.id) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Organizer Context Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#121722] text-[#d0f344] flex items-center justify-center font-bold text-xl overflow-hidden shadow-xs shrink-0 border border-slate-700">
            {admin.avatarUrl ? (
              <img src={admin.avatarUrl} alt={admin.fullName} className="w-full h-full object-cover" />
            ) : (
              <Building className="w-7 h-7" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {admin.organization}
              </h1>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified CDO Campus Org
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {admin.fullName} · {admin.position} · {admin.school}
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              if (activeEvent) {
                setActiveTab('scanner');
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            className="py-2.5 px-4 text-xs font-extrabold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <ScanLine className="w-4 h-4 text-slate-950" />
            <span>Scan Attendance</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create Event</span>
          </button>
          
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="py-2.5 px-3.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-slate-500" />
            <span>Org Profile</span>
          </button>
        </div>
      </div>

      {/* Active Event Selector (When events exist) */}
      {events.length > 0 && (
        <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Active Campus Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-900 shadow-xs focus:ring-1 focus:ring-slate-900"
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.date}) — Target: {ev.targetAttendees}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 font-medium text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {activeEvent?.date}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {activeEvent?.venue}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              {eventAttendance.length} Checked In
            </span>
          </div>
        </div>
      )}

      {/* Dashboard Sub-Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-xl max-w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'monitor'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Real-Time Monitor & Live Target</span>
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'scanner'
              ? 'bg-[#d0f344] text-slate-950 shadow-xs'
              : 'text-slate-700 hover:text-slate-900 bg-white/60'
          }`}
        >
          <ScanLine className="w-3.5 h-3.5" />
          <span>Scan Attendance (Live Station)</span>
        </button>

        <button
          onClick={() => {
            if (activeEvent) {
              setIsPrintModalOpen(true);
            } else {
              setIsCreateModalOpen(true);
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap text-slate-700 hover:text-slate-900 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Attendance Roster</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Event History & Management ({events.length})</span>
        </button>
      </div>

      {/* VIEW 1: REAL-TIME MONITOR VIEW */}
      {activeTab === 'monitor' && (
        activeEvent ? (
          <LiveMonitorView
            activeEvent={activeEvent}
            allEvents={events}
            attendance={attendance}
            onSelectEvent={(ev) => setSelectedEventId(ev.id)}
            onOpenScanner={() => setActiveTab('scanner')}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        ) : (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Ready to Launch Your First Campus Event</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Create an event to activate live quota monitoring, multi-device tap scanning, and auto-sorted print rosters.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="py-2.5 px-5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Custom Event</span>
              </button>
              <button
                onClick={handleQuickCreateEvent}
                className="py-2.5 px-5 text-xs font-extrabold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>1-Click Launch CDO Campus Summit</span>
              </button>
            </div>
          </div>
        )
      )}

      {/* VIEW 2: DEDICATED EMBEDDED SCAN ATTENDANCE STATION */}
      {activeTab === 'scanner' && (
        activeEvent ? (
          <div className="space-y-6">
            
            {/* Station Header */}
            <div className="bg-[#121722] text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d0f344] animate-pulse"></span>
                  <span className="text-xs font-mono font-bold text-[#d0f344] uppercase tracking-wider">
                    MULTI-DEVICE TAP ATTENDANCE STATION
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {activeEvent.title}
                </h2>
                <p className="text-xs text-slate-400">
                  Multiple devices feed into one central database. Instant auto-categorization by Dept, Course & Year Level.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    soundEnabled
                      ? 'bg-slate-800 text-slate-200 border-slate-700'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                  title={soundEnabled ? 'Sound On' : 'Muted'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-[#d0f344]" /> : <VolumeX className="w-4 h-4" />}
                  <span>{soundEnabled ? 'Sound FX On' : 'Muted'}</span>
                </button>

                <button
                  onClick={() => setIsScannerModalOpen(true)}
                  className="py-2 px-3 text-xs font-bold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Fullscreen Kiosk Pass</span>
                </button>
              </div>
            </div>

            {/* Scanner Controls Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Direct Camera & Input Box */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Station Config Banner */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold text-slate-700">Station Identity:</span>
                  </div>
                  <input
                    type="text"
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white"
                  />
                </div>

                {/* Real Camera & Image QR Scanner Box */}
                <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-2 text-slate-300">
                      <Camera className="w-4 h-4 text-[#d0f344]" />
                      Live QR Camera Scanner & Photo Decoder
                    </span>
                    <button
                      onClick={() => setCameraActive(!cameraActive)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        cameraActive
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-[#d0f344] text-slate-950 font-extrabold'
                      }`}
                    >
                      {cameraActive ? 'Stop Camera' : 'Start Camera Scanner'}
                    </button>
                  </div>

                  <QRScannerView
                    active={cameraActive}
                    onScan={handlePerformScan}
                    lastFeedback={{
                      status: scanFeedback.status,
                      message: scanFeedback.message,
                      studentName: scanFeedback.student?.fullName || scanFeedback.record?.studentName,
                      timeIn: scanFeedback.record?.timeIn
                    }}
                  />
                </div>

                {/* Instant Input & Tap Check-in Form */}
                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ScanLine className="w-4 h-4 text-indigo-600" />
                    Direct Scan / Token / Student Input
                  </h3>
                  <p className="text-xs text-slate-500">
                    Type or paste student QR code token, student email, or name to record attendance immediately:
                  </p>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handlePerformScan(manualCode);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="e.g. ATTENDIDTO:STU_9F12B or student name"
                      className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 text-slate-900"
                    />
                    <button
                      type="submit"
                      className="py-2.5 px-5 text-xs font-extrabold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
                    >
                      Record Time-In
                    </button>
                  </form>

                  {/* Quick Student Tap Simulation List */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                      Tap-to-Test Multi-Device Check-In:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Camille Reyes (BSIT 3rd Year)',
                        'Joshua Santos (BSCS 2nd Year)',
                        'Bea Alonzo (BSCpE 4th Year)',
                        'Rafael Cruz (BSA 1st Year)',
                        'Maria Clara (BSN 3rd Year)'
                      ].map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => handlePerformScan(name.split(' (')[0])}
                          className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors font-medium"
                        >
                          + Tap {name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Live Scan Result & Live Stream */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Result Card */}
                {scanFeedback.status && (
                  <div
                    className={`p-6 rounded-3xl border shadow-lg animate-in zoom-in-95 duration-150 ${
                      scanFeedback.status === 'success'
                        ? 'bg-emerald-950/90 text-emerald-100 border-emerald-800'
                        : scanFeedback.status === 'duplicate'
                        ? 'bg-amber-950/90 text-amber-100 border-amber-800'
                        : 'bg-rose-950/90 text-rose-100 border-rose-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {scanFeedback.status === 'success' && (
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                      )}
                      {scanFeedback.status === 'duplicate' && (
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                      )}
                      {scanFeedback.status === 'error' && (
                        <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                      )}

                      <div>
                        <div className="text-sm font-extrabold">
                          {scanFeedback.status === 'success' ? 'Attendance Recorded' : scanFeedback.status === 'duplicate' ? 'Already Checked In' : 'Scan Notice'}
                        </div>
                        <div className="text-xs opacity-80">{scanFeedback.message}</div>
                      </div>
                    </div>

                    {scanFeedback.record && (
                      <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] opacity-60 block">Student:</span>
                          <span className="font-bold">{scanFeedback.record.studentName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] opacity-60 block">Exact Time-In:</span>
                          <span className="font-mono font-bold text-[#d0f344]">{scanFeedback.record.timeIn}</span>
                        </div>
                        <div>
                          <span className="text-[10px] opacity-60 block">Department & Course:</span>
                          <span>{scanFeedback.record.department} ({scanFeedback.record.course})</span>
                        </div>
                        <div>
                          <span className="text-[10px] opacity-60 block">Station:</span>
                          <span>{scanFeedback.record.stationId}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Live Stream of Checked In Students */}
                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      Live Event Check-In Stream ({eventAttendance.length})
                    </h3>
                    <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      LIVE SYNC
                    </span>
                  </div>

                  {eventAttendance.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      <ScanLine className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-pulse" />
                      No attendees checked in yet. Start scanning above.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {eventAttendance.map((rec) => (
                        <div
                          key={rec.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{rec.studentName}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {rec.department} · {rec.course} ({rec.yearLevel})
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-mono font-bold text-slate-900 text-xs">
                              {rec.timeIn}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {rec.stationId}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        ) : (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <ScanLine className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Event Selected for Scanning</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please create an event first before activating the attendance scanner.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="py-2 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
            >
              + Create Event First
            </button>
          </div>
        )
      )}

      {/* VIEW 3: EVENT HISTORY & MANAGEMENT */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Attendance / Event History
              </h2>
              <p className="text-xs text-slate-500">
                Access records of previously conducted events, target quotas, and generate reports.
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="py-2 px-3.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Event</span>
            </button>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              No events in history. Create an event to begin tracking attendance.
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(ev => {
                const count = attendance.filter(a => a.eventId === ev.id).length;
                const pct = Math.min(100, Math.round((count / (ev.targetAttendees || 1)) * 100));

                return (
                  <div
                    key={ev.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {ev.title}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                          {ev.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {ev.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {ev.startTime} - {ev.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {ev.venue}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                          {count} / {ev.targetAttendees} ({pct}%)
                        </div>
                        <div className="text-[10px] text-slate-400">Total Checked In</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedEventId(ev.id);
                            setActiveTab('scanner');
                          }}
                          className="py-1.5 px-3 text-xs font-bold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <ScanLine className="w-3.5 h-3.5" />
                          <span>Scan</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEventId(ev.id);
                            setIsPrintModalOpen(true);
                          }}
                          className="py-1.5 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span>Report</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Scan Station Modal */}
      {activeEvent && (
        <ScanStationModal
          isOpen={isScannerModalOpen}
          onClose={() => setIsScannerModalOpen(false)}
          event={activeEvent}
          students={students}
          attendance={attendance}
          onScanStudent={onScanStudent}
        />
      )}

      {/* Event Creation Modal */}
      <EventCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        admin={admin}
        onCreateEvent={onCreateEvent}
      />

      {/* Print Official Attendance Roster Modal */}
      {activeEvent && (
        <PrintableReportModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          event={activeEvent}
          admin={admin}
          attendance={attendance}
        />
      )}

      {/* Organizer Profile Editor */}
      <AdminProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        admin={admin}
        onUpdateProfile={onUpdateProfile}
      />

    </div>
  );
};
