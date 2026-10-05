import React, { useState, useEffect, useRef } from 'react';
import { CampusEvent, AttendanceRecord, StudentProfile } from '../../types';
import { QRScannerView } from '../common/QRScannerView';
import { 
  X, 
  Smartphone, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Building, 
  Users, 
  Volume2, 
  VolumeX,
  Search,
  ScanLine
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScanStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CampusEvent;
  students: StudentProfile[];
  attendance: AttendanceRecord[];
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

export const ScanStationModal: React.FC<ScanStationModalProps> = ({
  isOpen,
  onClose,
  event,
  students,
  attendance,
  onScanStudent
}) => {
  const [stationName, setStationName] = useState('Station 1 - Main North Gate');
  const [operatorName, setOperatorName] = useState('Entrance Officer A');
  const [manualCode, setManualCode] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScanResult, setLastScanResult] = useState<{
    status: 'success' | 'duplicate' | 'error' | null;
    message: string;
    student?: StudentProfile;
    record?: AttendanceRecord;
  }>({ status: null, message: '' });

  const [cameraActive, setCameraActive] = useState(true);

  // Synthesize sound via Web Audio API
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
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.setValueAtTime(220, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  };

  if (!isOpen) return null;

  const handleExecuteScan = (identifier: string) => {
    if (!identifier.trim()) return;

    const res = onScanStudent(event.id, identifier, stationName, operatorName);

    if (res.success && res.student && res.record) {
      playBeep('success');
      setLastScanResult({
        status: 'success',
        message: `Verified! Checked in at ${res.record.timeIn}`,
        student: res.student,
        record: res.record
      });
      // Fire confetti burst for celebration
      try {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.7 }
        });
      } catch (e) {
        console.warn(e);
      }
    } else if (res.alreadyCheckedIn && res.student && res.record) {
      playBeep('error');
      setLastScanResult({
        status: 'duplicate',
        message: `Already checked in at ${res.record.timeIn} via ${res.record.stationId}!`,
        student: res.student,
        record: res.record
      });
    } else {
      playBeep('error');
      setLastScanResult({
        status: 'error',
        message: res.message || 'Invalid QR code.'
      });
    }

    setManualCode('');
  };

  // Filter students for fast simulator
  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.course.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.department.toLowerCase().includes(searchStudent.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden max-h-[95vh] flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Kiosk Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Multi-Device Attendance Kiosk
                </h2>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE CENTRAL SYNC
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {event.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Station Setup Bar */}
        <div className="p-3 sm:px-6 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Select Station / Gate:</span>
            <select
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Station 1 - Main North Gate">Station 1 - Main North Gate</option>
              <option value="Station 2 - Lobby Scanner Tablet">Station 2 - Lobby Scanner Tablet</option>
              <option value="Station 3 - Fast Tap Mobile">Station 3 - Fast Tap Mobile</option>
              <option value="Station 4 - South Entrance">Station 4 - South Entrance</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Operator:</span>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white w-36"
            />
          </div>
        </div>

        {/* Main Split View: Scanner + Tap Simulator */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Live Scan View & Instant Verification Card */}
          <div className="md:col-span-6 space-y-4">
            
            {/* Camera Viewport with Real QR Decoding */}
            <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800">
              <QRScannerView
                active={cameraActive}
                onScan={handleExecuteScan}
                lastFeedback={{
                  status: lastScanResult.status,
                  message: lastScanResult.message,
                  studentName: lastScanResult.student?.fullName || lastScanResult.record?.studentName,
                  timeIn: lastScanResult.record?.timeIn
                }}
              />
            </div>

            {/* Manual QR / Token Input */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteScan(manualCode);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Or paste QR Token (e.g. ATTENDIDTO:STU_...)"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shrink-0"
              >
                Scan Token
              </button>
            </form>

            {/* Live Feedback Card */}
            {lastScanResult.status && (
              <div className={`p-4 rounded-2xl border transition-all ${
                lastScanResult.status === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100'
                  : lastScanResult.status === 'duplicate'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-100'
                  : 'bg-rose-950/60 border-rose-500 text-rose-100'
              }`}>
                <div className="flex items-start gap-3">
                  {lastScanResult.status === 'success' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 flex-1">
                    <div className="font-bold text-sm">
                      {lastScanResult.status === 'success' ? 'Attendance Recorded!' : lastScanResult.status === 'duplicate' ? 'Duplicate Tap Warning' : 'Scan Failed'}
                    </div>
                    <div className="text-xs opacity-90">
                      {lastScanResult.message}
                    </div>

                    {lastScanResult.student && (
                      <div className="mt-2 pt-2 border-t border-white/10 text-xs space-y-0.5 font-medium">
                        <div className="text-white font-bold text-sm">{lastScanResult.student.fullName}</div>
                        <div className="text-slate-300">{lastScanResult.student.department}</div>
                        <div className="text-slate-400">{lastScanResult.student.course} · {lastScanResult.student.yearLevel}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Direct Student Check-In Roster */}
          <div className="md:col-span-6 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Student Directory & Fast Tap</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {students.length} Registered Students
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Scan via camera, paste QR token, or tap a registered student to record attendance:
              </p>

              {/* Search filter */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  placeholder="Filter student by name or course..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500"
                />
              </div>

              {/* Student Tap List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {filteredStudents.map(s => {
                  const isCheckedIn = attendance.some(a => a.studentId === s.id && a.eventId === event.id);
                  const record = attendance.find(a => a.studentId === s.id && a.eventId === event.id);

                  return (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="truncate">
                        <div className="font-semibold text-xs text-white truncate">{s.fullName}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {s.course} · {s.yearLevel}
                        </div>
                      </div>

                      {isCheckedIn ? (
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                            In: {record?.timeIn}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleExecuteScan(s.qrCodeToken)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-200 bg-indigo-900/60 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>Check In</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>All taps instantly stream to the main organizer monitor.</span>
              <span className="text-emerald-400 font-mono font-bold">100% Sync</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
