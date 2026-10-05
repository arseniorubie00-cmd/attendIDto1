import React, { useState } from 'react';
import { AdminProfile, CampusEvent, EventTargetFilter } from '../../types';
import { DEPARTMENTS, YEAR_LEVELS } from '../../data/initialData';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EventCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: AdminProfile;
  onCreateEvent: (
    payload: Omit<CampusEvent, 'id' | 'isLaunched' | 'createdAt'>
  ) => void;
}

export const EventCreationModal: React.FC<EventCreationModalProps> = ({
  isOpen,
  onClose,
  admin,
  onCreateEvent
}) => {
  const [step, setStep] = useState<'details' | 'targeting' | 'success'>('details');

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CampusEvent['category']>('General Assembly');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-10-25');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('16:00');
  const [venue, setVenue] = useState('Main Campus Gymnasium & Hall');
  const [targetAttendees, setTargetAttendees] = useState(300);

  // Audience Targeting
  const [targetAllDepts, setTargetAllDepts] = useState(true);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleNextToTargeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter an event title.');
      return;
    }
    setErrorMsg('');
    setStep('targeting');
  };

  const handlePublish = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);

      const targetFilter: EventTargetFilter = {
        departments: targetAllDepts ? [] : selectedDepts,
        yearLevels: selectedYears,
        courses: []
      };

      onCreateEvent({
        organizerId: admin.id,
        organizerName: admin.fullName,
        organization: admin.organization,
        school: admin.school,
        title: title.trim(),
        description: description.trim(),
        category,
        date,
        startTime,
        endTime,
        venue: venue.trim(),
        targetAttendees: Number(targetAttendees) || 300,
        targetFilter,
        status: 'upcoming'
      });

      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.warn(e);
      }

      setStep('success');
    }, 400);
  };

  const toggleDept = (dept: string) => {
    setSelectedDepts(prev => 
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const toggleYear = (yr: string) => {
    setSelectedYears(prev =>
      prev.includes(yr) ? prev.filter(y => y !== yr) : [...prev, yr]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Create Campus Event
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{admin.organization}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-indigo-600">
                {step === 'details' && 'Step 1: Event Details'}
                {step === 'targeting' && 'Step 2: Target Audience'}
                {step === 'success' && 'Event Published'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: EVENT DETAILS */}
          {step === 'details' && (
            <form onSubmit={handleNextToTargeting} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual General Assembly & Technology Summit"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CampusEvent['category'])}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900"
                  >
                    <option value="General Assembly">General Assembly</option>
                    <option value="Academic">Academic</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Organization">Organization</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Attendees (Quota)
                  </label>
                  <input
                    type="number"
                    value={targetAttendees}
                    onChange={(e) => setTargetAttendees(Math.max(10, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 font-mono"
                    min="10"
                    max="5000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Event agenda and objectives..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Venue / Location / Hall
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. University Grand Ballroom, Engineering Hall"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Next: Target Audience Filters →</span>
              </button>
            </form>
          )}

          {/* STEP 2: AUDIENCE TARGETING */}
          {step === 'targeting' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900">
                    Target Departments
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetAllDepts(!targetAllDepts);
                      setSelectedDepts([]);
                    }}
                    className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
                      targetAllDepts ? 'text-indigo-700 bg-indigo-50' : 'text-slate-500'
                    }`}
                  >
                    {targetAllDepts ? '✓ All Campus Departments' : 'Select Specific Departments'}
                  </button>
                </div>

                {!targetAllDepts && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {DEPARTMENTS.map(d => (
                      <label 
                        key={d} 
                        className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                          selectedDepts.includes(d) ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDepts.includes(d)}
                          onChange={() => toggleDept(d)}
                          className="rounded text-indigo-600"
                        />
                        <span className="truncate">{d}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-900">
                  Target Year Levels
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {YEAR_LEVELS.map(yr => (
                    <label
                      key={yr}
                      className={`p-2 rounded-xl border text-xs text-center cursor-pointer transition-colors ${
                        selectedYears.includes(yr) ? 'bg-indigo-600 text-white font-semibold border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedYears.includes(yr)}
                        onChange={() => toggleYear(yr)}
                        className="hidden"
                      />
                      <span>{yr}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-1/3 py-2.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePublish}
                  className="w-2/3 py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish & Activate Event</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Event Published!
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                <strong className="text-slate-900">{title}</strong> is now live. Tap stations and live attendance monitoring are ready.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
              >
                Go to Live Event Monitor
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
