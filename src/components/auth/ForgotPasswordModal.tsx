import React, { useState } from 'react';
import { X, Mail, CheckCircle2, ArrowRight } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose
}) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSent(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051122]/85 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4 border-b border-blue-50 relative bg-[#0a1f3d] text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 text-blue-300 hover:text-white rounded-lg hover:bg-blue-900/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono text-blue-950 bg-[#fbbf24] px-2 py-0.5 rounded font-extrabold">
              USTP CDO
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs text-blue-200/80 mt-1">
            Enter your institutional email and we will send you a verification link.
          </p>
        </div>

        <div className="p-6">
          {sent ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Recovery Link Dispatched
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                We sent a password reset token to <span className="font-semibold text-slate-900">{email}</span>. Please check your inbox or campus spam folder.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-4 py-2 text-xs font-bold text-blue-950 bg-[#fbbf24] hover:bg-[#f59e0b] rounded-xl transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Institutional Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@ustp.edu.ph"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#fbbf24] focus:border-[#fbbf24]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-extrabold text-blue-950 bg-[#fbbf24] hover:bg-[#f59e0b] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Send Password Reset Link</span>
                <ArrowRight className="w-4 h-4 text-blue-950" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
