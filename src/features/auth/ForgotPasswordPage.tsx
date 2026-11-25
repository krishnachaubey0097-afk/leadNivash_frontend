import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, CheckCircle2, ArrowLeft, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { ApiError } from '../../lib/api/errors';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: targetEmail });
      setSubmitted(true);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message || 'Failed to send password reset instructions.');
      } else {
        setErrorMsg('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/20 text-slate-900 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 p-1.5 shadow-sm">
              <img
                src="/logo-icon.png"
                alt="LeadNivash"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 font-heading">
              Lead<span className="text-emerald-700">Nivash</span>
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-heading">
            Reset Your Password
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your registered broker work email to receive password reset instructions
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          <div className="mb-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition mb-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {submitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Reset Instructions Dispatched</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                If an account exists for <strong>{email}</strong>, a secure password reset link has been dispatched to your inbox.
              </p>
              <p className="text-[11px] text-slate-500">
                Please check both your inbox and spam folder. The link will remain active for 30 minutes.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center py-2 px-4 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm text-center"
                >
                  Return to Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 text-center py-1 cursor-pointer"
                >
                  Send to a different email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Work Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="broker@sharmarealestate.com"
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              />

              <Button
                type="submit"
                isLoading={loading}
                className="w-full font-bold shadow-md shadow-emerald-700/20"
              >
                <span>Send Password Reset Link</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          )}

          {/* Bottom link */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Remember your password?{' '}
              <Link to="/login" className="font-bold text-emerald-700 hover:underline">
                Sign In to Workspace
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted Owner Vault • Single-Use 30-Minute Reset Token</span>
        </div>
      </div>
    </div>
  );
};
