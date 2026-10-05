import React, { useState, useMemo } from 'react';
import { CampusEvent, AttendanceRecord, AdminProfile } from '../../types';
import { DEPARTMENTS, YEAR_LEVELS } from '../../data/initialData';
import { X, Printer, Download, Search, CheckCircle2, School } from 'lucide-react';

interface PrintableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CampusEvent;
  admin: AdminProfile;
  attendance: AttendanceRecord[];
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({
  isOpen,
  onClose,
  event,
  admin,
  attendance
}) => {
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Attendance for this event
  const eventAttendance = useMemo(() => {
    return attendance.filter(a => a.eventId === event.id);
  }, [attendance, event.id]);

  // Filtered attendance
  const filteredList = useMemo(() => {
    return eventAttendance.filter(rec => {
      if (deptFilter !== 'ALL' && rec.department !== deptFilter) return false;
      if (yearFilter !== 'ALL' && rec.yearLevel !== yearFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          rec.studentName.toLowerCase().includes(q) ||
          rec.course.toLowerCase().includes(q) ||
          rec.stationId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [eventAttendance, deptFilter, yearFilter, searchQuery]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[96vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Action Header (Hidden in Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-slate-50 no-print">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Official Institutional Attendance Roster
            </h2>
            <p className="text-xs text-slate-500">
              Filter by Department or Year Level and click Print to export a certified university template.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-2 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer allow-print"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar (Hidden in Print) */}
        <div className="p-3 sm:px-6 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center gap-3 text-xs no-print">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900"
            >
              <option value="ALL">All Departments ({eventAttendance.length})</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Year Level:</span>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900"
            >
              <option value="ALL">All Year Levels</option>
              {YEAR_LEVELS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student name..."
              className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-900"
            />
          </div>

          <span className="font-mono text-xs font-semibold text-slate-600 ml-auto">
            Showing {filteredList.length} of {eventAttendance.length} records
          </span>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 print:p-0 print:space-y-4 print:overflow-visible">
          
          {/* Institutional Letterhead */}
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <div className="flex items-center justify-center gap-2 text-slate-900">
              <School className="w-6 h-6 text-indigo-700" />
              <div className="text-lg font-extrabold uppercase tracking-wide">
                {event.school}
              </div>
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              {admin.organization}
            </div>
            <div className="text-[11px] text-slate-500">
              Official Event Attendance Roster & Certification Sheet
            </div>
          </div>

          {/* Event Metadata Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Event Title:</span>
              <span className="font-bold text-slate-900">{event.title}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Date & Time:</span>
              <span className="font-semibold text-slate-800">{event.date} · {event.startTime} - {event.endTime}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Venue:</span>
              <span className="font-semibold text-slate-800">{event.venue}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Attendance:</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {eventAttendance.length} / {event.targetAttendees} ({Math.round((eventAttendance.length / (event.targetAttendees || 1)) * 100)}%)
              </span>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2 px-3 border-r border-slate-300 w-12 text-center">No.</th>
                  <th className="py-2 px-3 border-r border-slate-300">Student Name</th>
                  <th className="py-2 px-3 border-r border-slate-300">Department</th>
                  <th className="py-2 px-3 border-r border-slate-300">Course & Year</th>
                  <th className="py-2 px-3 border-r border-slate-300 font-mono">Time-In</th>
                  <th className="py-2 px-3 border-r border-slate-300">Scan Station</th>
                  <th className="py-2 px-3 w-28 text-center">Verification Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredList.map((rec, index) => (
                  <tr key={rec.id} className="print-break-inside-avoid">
                    <td className="py-1.5 px-3 border-r border-slate-200 text-center font-mono text-slate-500">
                      {index + 1}
                    </td>
                    <td className="py-1.5 px-3 border-r border-slate-200 font-bold text-slate-900">
                      {rec.studentName}
                    </td>
                    <td className="py-1.5 px-3 border-r border-slate-200 text-slate-700">
                      {rec.department}
                    </td>
                    <td className="py-1.5 px-3 border-r border-slate-200 text-slate-700">
                      {rec.course} · {rec.yearLevel}
                    </td>
                    <td className="py-1.5 px-3 border-r border-slate-200 font-mono font-semibold text-slate-900 tabular-nums">
                      {rec.timeIn}
                    </td>
                    <td className="py-1.5 px-3 border-r border-slate-200 text-slate-600 text-[11px]">
                      {rec.stationId}
                    </td>
                    <td className="py-1.5 px-3 text-center">
                      <span className="inline-block border-b border-slate-400 w-20 text-[10px] text-slate-400">
                        [Verified]
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Institutional Signature & Endorsement Blocks */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs print-break-inside-avoid">
            <div className="space-y-8">
              <div className="text-slate-500 font-medium">Prepared By:</div>
              <div className="border-t border-slate-900 pt-1.5">
                <div className="font-bold text-slate-900">{admin.fullName}</div>
                <div className="text-[11px] text-slate-500">{admin.position}</div>
                <div className="text-[10px] text-slate-400">{admin.organization}</div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="text-slate-500 font-medium">Noted By:</div>
              <div className="border-t border-slate-900 pt-1.5">
                <div className="font-bold text-slate-900">Faculty Organization Adviser</div>
                <div className="text-[11px] text-slate-500">Student Affairs Committee</div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="text-slate-500 font-medium">Approved & Certified By:</div>
              <div className="border-t border-slate-900 pt-1.5">
                <div className="font-bold text-slate-900">Office of Student Affairs (OSA)</div>
                <div className="text-[11px] text-slate-500">{event.school}</div>
              </div>
            </div>
          </div>

          {/* Document Footer */}
          <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">
            Generated via AttendIDto Centralized QR Attendance Engine · Institutional Verification Code: AIDT-{event.id.toUpperCase()}-CERT
          </div>

        </div>
      </div>
    </div>
  );
};
