import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../../types';
import { QRCodeCanvas } from '../common/QRCodeCanvas';
import { X, ShieldCheck, Download, Smartphone, Lock, School, Sparkles } from 'lucide-react';

interface StudentPassModalProps {
  student: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentPassModal: React.FC<StudentPassModalProps> = ({
  student,
  isOpen,
  onClose
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulse(p => !p);
    }, 2000);
    return () => clearInterval(pulseInterval);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Card */}
        <div className="bg-[#0a1f3d] p-6 text-white text-center relative border-b border-blue-900">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-blue-300 hover:text-white rounded-full bg-blue-950/60 hover:bg-blue-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbbf24] text-blue-950 text-[11px] font-extrabold tracking-wide uppercase mb-2 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-950" />
            Official USTP AttendIDto Pass
          </div>

          <h3 className="text-xl font-extrabold tracking-tight text-white">
            {student.fullName}
          </h3>
          <div className="text-xs text-blue-200/90 flex items-center justify-center gap-1 mt-1">
            <School className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>{student.school}</span>
          </div>
        </div>

        {/* Dynamic Security Pulse Ticker */}
        <div className="bg-[#07172c] px-4 py-2 flex items-center justify-between text-[11px] font-mono text-blue-200 border-y border-blue-900/60">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${pulse ? 'bg-[#fbbf24] ring-2 ring-[#fbbf24]/40' : 'bg-[#f59e0b]'} transition-all`} />
            <span className="text-[#fbbf24] font-semibold">LIVE SECURITY WATERMARK</span>
          </div>
          <div className="tabular-nums text-white font-semibold font-mono">
            {currentTime}
          </div>
        </div>

        {/* QR Code Presentation Box */}
        <div className="p-6 text-center space-y-4 bg-white">
          
          <div className="relative inline-block mx-auto">
            {/* High-contrast QR canvas */}
            <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-blue-200">
              <QRCodeCanvas value={student.qrCodeToken} size={220} />
            </div>

            {/* Corner security accents */}
            <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-[#fbbf24]"></div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-[#fbbf24]"></div>
            <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-[#fbbf24]"></div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-[#fbbf24]"></div>
          </div>

          {/* Student Academic Metadata */}
          <div className="p-3 rounded-xl bg-blue-50/40 border border-blue-100 text-left text-xs space-y-1.5 shadow-2xs">
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Department:</span>
              <span className="font-semibold text-slate-900 text-right truncate max-w-[190px]">{student.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Course & Year:</span>
              <span className="font-semibold text-slate-900">{student.course} · {student.yearLevel}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-blue-100">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3 text-blue-700" />
                Student ID No:
              </span>
              <span className="font-mono text-[11px] text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded font-semibold">
                Protected (Zero-Leakage)
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-1 flex gap-2">
            <button
              type="button"
              onClick={() => {
                window.print();
              }}
              className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Print / Save</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 text-xs font-extrabold text-blue-950 bg-[#fbbf24] hover:bg-[#f59e0b] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-950" />
              <span>Ready to Tap</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
