import React, { useMemo } from 'react';
import { CampusEvent, AttendanceRecord } from '../../types';
import { 
  Users, 
  Clock, 
  Sparkles, 
  Smartphone, 
  Printer, 
  FileSpreadsheet, 
  CheckCircle2, 
  Building, 
  Calendar, 
  MapPin,
  TrendingUp,
  Download
} from 'lucide-react';

interface LiveMonitorViewProps {
  activeEvent: CampusEvent;
  allEvents: CampusEvent[];
  attendance: AttendanceRecord[];
  onSelectEvent: (event: CampusEvent) => void;
  onOpenScanner: () => void;
  onOpenPrintModal: () => void;
}

export const LiveMonitorView: React.FC<LiveMonitorViewProps> = ({
  activeEvent,
  allEvents,
  attendance,
  onSelectEvent,
  onOpenScanner,
  onOpenPrintModal
}) => {
  // Filter attendance for this active event
  const eventAttendance = useMemo(() => {
    return attendance.filter(a => a.eventId === activeEvent.id);
  }, [attendance, activeEvent.id]);

  const currentCount = eventAttendance.length;
  const targetCount = activeEvent.targetAttendees || 500;
  const progressPercent = Math.min(100, Math.round((currentCount / targetCount) * 100));

  // Breakdown by Department
  const deptBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    eventAttendance.forEach(a => {
      const dept = a.department || 'Other';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [eventAttendance]);

  // Breakdown by Year Level
  const yearBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    eventAttendance.forEach(a => {
      const yr = a.yearLevel || 'Unspecified';
      counts[yr] = (counts[yr] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  }, [eventAttendance]);

  // Breakdown by Course
  const courseBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    eventAttendance.forEach(a => {
      const c = a.course || 'Other';
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [eventAttendance]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['No', 'Student Name', 'School', 'Department', 'Course', 'Year Level', 'Time In', 'Scan Station', 'Operator'];
    const rows = eventAttendance.map((rec, index) => [
      index + 1,
      `"${rec.studentName}"`,
      `"${rec.school}"`,
      `"${rec.department}"`,
      `"${rec.course}"`,
      `"${rec.yearLevel}"`,
      `"${rec.timeIn}"`,
      `"${rec.stationId}"`,
      `"${rec.verifiedBy}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_${activeEvent.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      
      {/* Event Header & Multi-Event Switcher */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              REAL-TIME MONITOR ACTIVE
            </span>
            <span className="text-xs text-slate-500">
              {activeEvent.category} · {activeEvent.date}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {activeEvent.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              {activeEvent.organization}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {activeEvent.venue}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {activeEvent.startTime} - {activeEvent.endTime}
            </span>
          </div>
        </div>

        {/* Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Switch event selector */}
          {allEvents.length > 1 && (
            <select
              value={activeEvent.id}
              onChange={(e) => {
                const found = allEvents.find(ev => ev.id === e.target.value);
                if (found) onSelectEvent(found);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-3 rounded-xl border border-slate-300 transition-colors"
            >
              {allEvents.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.title.length > 30 ? ev.title.substring(0, 30) + '...' : ev.title}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onOpenScanner}
            className="py-2 px-3.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Launch Tap Station</span>
          </button>

          <button
            onClick={onOpenPrintModal}
            className="py-2 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="py-2 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Gauge Block (Matching user's exact numbers: Target 500, Current 325, Progress 65%) */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
              Centralized Multi-Device Attendance Counter
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Live Attendance Gauge
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Central Sync: 100% Operational</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 space-y-1">
            <div className="text-xs text-slate-400 font-medium">Target Attendees</div>
            <div className="text-4xl font-extrabold font-mono text-white tabular-nums">
              {targetCount}
            </div>
            <div className="text-[11px] text-slate-400">Total auditorium / event quota</div>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-950/70 border border-indigo-700/60 space-y-1">
            <div className="text-xs text-indigo-300 font-medium">Current Attendance</div>
            <div className="text-4xl font-extrabold font-mono text-indigo-300 tabular-nums">
              {currentCount}
            </div>
            <div className="text-[11px] text-indigo-300/80">Verified time-in check-ins</div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-950/70 border border-emerald-700/60 space-y-1">
            <div className="text-xs text-emerald-300 font-medium">Attendance Progress</div>
            <div className="text-4xl font-extrabold font-mono text-emerald-400 tabular-nums">
              {progressPercent}%
            </div>
            <div className="text-[11px] text-emerald-300/80">
              {progressPercent >= 100 ? 'Target Achieved!' : `${targetCount - currentCount} attendees to reach target`}
            </div>
          </div>

        </div>

        {/* Large Visual Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div 
              className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>0 Check-Ins</span>
            <span className="text-emerald-400 font-bold">
              Progress: {currentCount} / {targetCount} ({progressPercent}%)
            </span>
            <span>Target: {targetCount}</span>
          </div>
        </div>
      </div>

      {/* Split Grid: Live Stream + Categorization Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Live Check-In Stream */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recent Check-In Stream
              </h3>
              <p className="text-xs text-slate-500">
                Live stream of students tapping into gates in real time.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
              {eventAttendance.length} Total Logs
            </span>
          </div>

          <div className="overflow-x-auto max-h-[460px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">Department & Course</th>
                  <th className="py-2.5 px-4">Time-In</th>
                  <th className="py-2.5 px-4">Scan Station</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eventAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-xs text-slate-400">
                      <Clock className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                      No attendees checked in yet. Click &quot;Launch Tap Station&quot; to begin scanning student passes.
                    </td>
                  </tr>
                ) : (
                  eventAttendance.slice(0, 15).map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {rec.studentName}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 truncate max-w-[180px]">
                        {rec.course} · {rec.yearLevel}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-semibold text-indigo-700 tabular-nums">
                        {rec.timeIn}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 text-[11px] truncate max-w-[130px]">
                        {rec.stationId}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-500">
            {eventAttendance.length === 0
              ? 'Ready for incoming attendees.'
              : 'Showing latest arrivals. To view full list or generate signatures, use Print Report.'}
          </div>
        </div>

        {/* Right Column: Auto-Categorization (Dept, Year, Course) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Department Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Automatic Department Breakdown</span>
              <span className="text-xs font-normal text-slate-500">Auto-Sorted</span>
            </h3>

            {deptBreakdown.length === 0 ? (
              <div className="text-xs text-slate-400 py-3 text-center">
                Department breakdown will appear as participants tap in.
              </div>
            ) : (
              <div className="space-y-3">
                {deptBreakdown.map(([dept, count]) => {
                  const pct = Math.round((count / (currentCount || 1)) * 100);
                  return (
                    <div key={dept} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700 truncate max-w-[200px]">{dept}</span>
                        <span className="font-mono text-slate-900 font-bold tabular-nums">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Year Level Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Year Level Representation
            </h3>

            {yearBreakdown.length === 0 ? (
              <div className="text-xs text-slate-400 py-3 text-center">
                Year level counts will populate live during event check-in.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {yearBreakdown.map(([yr, count]) => (
                  <div key={yr} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[11px] text-slate-500 font-medium">{yr}</div>
                    <div className="text-xl font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Courses */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Top Enrolled Courses Present
            </h3>
            <div className="space-y-2 text-xs">
              {courseBreakdown.map(([crs, count]) => (
                <div key={crs} className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                  <span className="font-medium text-slate-700 truncate max-w-[220px]">{crs}</span>
                  <span className="font-mono font-bold text-indigo-700 tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
