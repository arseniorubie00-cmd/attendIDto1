import React, { useState } from 'react';
import { AdminProfile, CampusEvent, EventTargetFilter } from '../../types';
import { DEPARTMENTS, YEAR_LEVELS } from '../../data/initialData';
import { QRCodeCanvas } from '../common/QRCodeCanvas';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Receipt,
  QrCode,
  Building,
  Check
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

type PaymentMethod = 'GCash' | 'Maya' | 'GoTyme' | 'GrabPay';

export const EventCreationModal: React.FC<EventCreationModalProps> = ({
  isOpen,
  onClose,
  admin,
  onCreateEvent
}) => {
  const [step, setStep] = useState<'details' | 'targeting' | 'payment' | 'success'>('details');

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
  
  // Paywall & Payment State (₱250 per event)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('GCash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [completedRef, setCompletedRef] = useState('');

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

  const handleNextToPayment = () => {
    // Generate a default authentic-looking reference number for convenience
    const generatedRef = `${paymentMethod.toUpperCase()}-${Math.floor(100000000 + Math.random() * 900000000)}`;
    setReferenceNumber(generatedRef);
    setPaymentError('');
    setStep('payment');
  };

  const handleVerifyPaymentAndPublish = () => {
    if (!referenceNumber.trim()) {
      setPaymentError('Please enter or generate a payment transaction reference number.');
      return;
    }

    setPaymentError('');
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      const finalRef = referenceNumber.trim();
      setCompletedRef(finalRef);

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
        status: 'upcoming',
        isPaid: true,
        paymentMethod,
        referenceNumber: finalRef,
        amountPaid: 250
      });

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.warn(e);
      }

      setStep('success');
    }, 700);
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
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                {step === 'details' ? 'Step 1 of 3: Event Setup' : step === 'targeting' ? 'Step 2 of 3: Audience' : step === 'payment' ? 'Step 3 of 3: Activation Paywall' : 'Event Published'}
              </span>
              <span className="text-xs text-slate-400">· {admin.organization}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              {step === 'details' && 'Create Campus Event'}
              {step === 'targeting' && 'Audience Targeting'}
              {step === 'payment' && 'Publishing Paywall (₱250)'}
              {step === 'success' && 'Event Published & Paid!'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: DETAILS */}
          {step === 'details' && (
            <form onSubmit={handleNextToTargeting} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual IT General Assembly & Tech Showcase 2026"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden"
                  >
                    <option value="General Assembly">General Assembly</option>
                    <option value="Academic">Academic Seminar</option>
                    <option value="Organization">Organization Meeting</option>
                    <option value="Workshop">Hands-on Workshop</option>
                    <option value="Sports">Sports & Intramurals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Campus Venue / Location
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. University Gymnasium & Cultural Center"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expected Attendance Quota
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={targetAttendees}
                    onChange={(e) => setTargetAttendees(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Host Organization
                  </label>
                  <input
                    type="text"
                    disabled
                    value={admin.organization}
                    className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Brief / Purpose (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the event for attendee verification and announcements..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Next: Audience Targeting →
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: AUDIENCE TARGETING */}
          {step === 'targeting' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-slate-900">{title}</div>
                <div className="text-slate-500">{date} · {venue} · Target: {targetAttendees} attendees</div>
              </div>

              {/* Department Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Target College / Departments</label>
                  <button
                    type="button"
                    onClick={() => setTargetAllDepts(!targetAllDepts)}
                    className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
                  >
                    {targetAllDepts ? 'Select Specific Colleges' : 'Open to All Colleges'}
                  </button>
                </div>

                {targetAllDepts ? (
                  <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900">
                    Open to all colleges and academic departments in {admin.school}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {DEPARTMENTS.map(dept => {
                      const isSelected = selectedDepts.includes(dept);
                      return (
                        <button
                          key={dept}
                          type="button"
                          onClick={() => toggleDept(dept)}
                          className={`p-2.5 text-left text-xs rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 font-medium'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate pr-2">{dept}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#d0f344] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Year Level Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">Applicable Year Levels</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {YEAR_LEVELS.map(yr => {
                    const isSelected = selectedYears.includes(yr);
                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => toggleYear(yr)}
                        className={`p-2 text-center text-xs rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {yr}
                      </button>
                    );
                  })}
                </div>
                <div className="text-[11px] text-slate-500">
                  {selectedYears.length === 0 ? 'All year levels eligible by default' : `Targeting: ${selectedYears.join(', ')}`}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-1/3 py-2.5 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleNextToPayment}
                  className="w-2/3 py-2.5 px-4 text-xs font-bold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Continue to Activation (₱250)</span>
                  <CreditCard className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYWALL (₱250 PER EVENT) */}
          {step === 'payment' && (
            <div className="space-y-5">
              
              {/* Fee Notice Banner */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#d0f344]" />
                    <span className="text-xs font-bold">Event Publishing Fee</span>
                  </div>
                  <span className="text-xl font-extrabold text-[#d0f344] font-mono">₱250.00</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Activation fee for {admin.organization}. Enables multi-device QR entrance scanning, real-time quota tracking, server synchronization, and certified printable attendance reports.
                </p>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">Choose Payment Method</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  
                  {/* GCash */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('GCash');
                      setReferenceNumber(`GCASH-${Math.floor(100000000 + Math.random() * 900000000)}`);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'GCash'
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold ring-2 ring-blue-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <span className="text-xs">GCash</span>
                    <span className="text-[9px] text-blue-700 font-mono">0991 671 0660</span>
                  </button>

                  {/* Maya */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('Maya');
                      setReferenceNumber(`MAYA-${Math.floor(100000000 + Math.random() * 900000000)}`);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'Maya'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold ring-2 ring-emerald-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs">Maya (PayMaya)</span>
                    <span className="text-[9px] text-emerald-700 font-mono">0991 671 0660</span>
                  </button>

                  {/* GoTyme */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('GoTyme');
                      setReferenceNumber(`GOTYME-${Math.floor(100000000 + Math.random() * 900000000)}`);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'GoTyme'
                        ? 'bg-cyan-50 border-cyan-600 text-cyan-900 font-bold ring-2 ring-cyan-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-5 h-5 text-cyan-600" />
                    <span className="text-xs">GoTyme Bank</span>
                    <span className="text-[9px] text-cyan-700 font-mono">Bank App</span>
                  </button>

                  {/* GrabPay */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('GrabPay');
                      setReferenceNumber(`GRAB-${Math.floor(100000000 + Math.random() * 900000000)}`);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'GrabPay'
                        ? 'bg-green-50 border-green-600 text-green-900 font-bold ring-2 ring-green-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <span className="text-xs">GrabPay</span>
                    <span className="text-[9px] text-green-700 font-mono">E-Wallet</span>
                  </button>

                </div>
              </div>

              {/* Payment Details Container */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-xs">
                
                {/* QR Code Container */}
                <div className="shrink-0 text-center">
                  <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200 inline-block">
                    <QRCodeCanvas
                      value={`00020101021226540015ph.com.paymaya0111099167106605204601653036085406250.005802PH5917ATTENDIDTO CDO6014CAGAYAN DE ORO62230119AIDT-EVT-ACTIVATION6304`}
                      size={110}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">Scan via {paymentMethod}</div>
                </div>

                {/* Account Credentials */}
                <div className="space-y-1.5 flex-1 w-full">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="text-slate-500 text-[11px]">Payee Account Name:</span>
                    <span className="font-bold text-slate-900">ATTENDIDTO / ARSENIO R.</span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="text-slate-500 text-[11px]">{paymentMethod} Mobile Number:</span>
                    <span className="font-mono font-bold text-slate-900 select-all">0991 671 0660</span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="text-slate-500 text-[11px]">Total Due:</span>
                    <span className="font-mono font-extrabold text-slate-900">₱250.00</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-0.5">
                    Send ₱250.00 via {paymentMethod} app or QR PH scan, then enter your transaction reference number below.
                  </div>
                </div>

              </div>

              {/* Reference Number Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Transaction Reference Number *
                  </label>
                  <button
                    type="button"
                    onClick={() => setReferenceNumber(`${paymentMethod.toUpperCase()}-${Math.floor(100000000 + Math.random() * 900000000)}`)}
                    className="text-[11px] text-indigo-600 font-medium hover:underline cursor-pointer"
                  >
                    Generate Test Ref #
                  </button>
                </div>

                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. 982348102931 or GCASH-83920194"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />

                {paymentError && (
                  <p className="text-xs text-rose-600 font-medium">{paymentError}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('targeting')}
                  className="w-1/3 py-2.5 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleVerifyPaymentAndPublish}
                  className="w-2/3 py-2.5 px-4 text-xs font-bold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Verifying ₱250 Payment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Verify ₱250 & Activate Event</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* STEP 4: SUCCESS RECEIPT */}
          {step === 'success' && (
            <div className="py-4 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900">Event Activated & Paid</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your event has been recorded in the central database. Entrance stations can now scan student QR passes in real time.
                </p>
              </div>

              {/* Official Receipt Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-slate-600" />
                    Official Payment Voucher
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    PAID ₱250.00
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Event Name:</span>
                    <span className="font-bold text-slate-900">{title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Host Org:</span>
                    <span className="font-semibold text-slate-800">{admin.organization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Method:</span>
                    <span className="font-semibold text-slate-800">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Ref Number:</span>
                    <span className="font-bold text-slate-900">{completedRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date Activated:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-8 text-xs font-bold text-slate-950 bg-[#d0f344] hover:bg-[#bde532] rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Go to Event Dashboard
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
