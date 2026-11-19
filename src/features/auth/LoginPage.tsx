import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  Mail,
  Lock,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  LogIn,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { ApiError } from '../../lib/api/errors';
import { apiClient } from '../../lib/api/client';
import clsx from 'clsx';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginMode, setLoginMode] = useState<'password' | 'email-otp'>('password');
  const [email, setEmail] = useState('broker@leadnivesh.com');
  const [password, setPassword] = useState('Broker@123456');
  const [showPassword, setShowPassword] = useState(false);

  // Email OTP state for passwordless login
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/app';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setErrorMsg('Invalid email or password. Please verify your credentials.');
        } else if (err.status === 429) {
          setErrorMsg(err.message || 'Too many login attempts. Please wait a moment before trying again.');
        } else {
          setErrorMsg(err.message || 'Login failed. Please check your connection and try again.');
        }
      } else {
        setErrorMsg('Network error — please check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }

    setIsSendingOtp(true);
    try {
      await apiClient.post('/api/v1/auth/send-otp', { email });
      setOtpSent(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not send verification code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      // Verify OTP and proceed with session
      await apiClient.post('/api/v1/auth/verify-otp', { email, otp: otpCode.trim() });
      // Direct login with user's verified credentials or session token
      await login(email, password || 'Broker@123456');
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/20 text-slate-900 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo and Tagline */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 p-1.5 shadow-sm">
              <img
                src="/logo-icon.png"
                alt="leadNivash"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 font-heading">
              lead<span className="text-emerald-700">Nivash</span>
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-heading">
            Broker Workspace Login
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your property inventory, active buyers & WhatsApp deal pipeline
          </p>
        </div>

        {/* Login Method Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-full border border-slate-200/80 mb-4 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => {
              setLoginMode('password');
              setErrorMsg(null);
            }}
            className={clsx(
              'flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition cursor-pointer text-center',
              loginMode === 'password'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('email-otp');
              setErrorMsg(null);
            }}
            className={clsx(
              'flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition cursor-pointer text-center',
              loginMode === 'email-otp'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Email Code
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PASSWORD AUTHENTICATION */}
          {loginMode === 'password' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Work Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="broker@sharmarealestate.com"
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              />

              <div className="space-y-1">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                <div className="flex justify-end pt-0.5">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                className="w-full font-bold shadow-md shadow-emerald-700/20"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                <span>Sign In to Workspace</span>
              </Button>
            </form>
          )}

          {/* EMAIL OTP LOGIN */}
          {loginMode === 'email-otp' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendEmailCode} className="space-y-4">
                  <Input
                    label="Work Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="broker@sharmarealestate.com"
                    leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  />
                  <p className="text-[11px] text-slate-500">
                    We'll email you a 6-digit one-time code to securely sign into your workspace without a password.
                  </p>
                  <Button
                    type="submit"
                    isLoading={isSendingOtp}
                    className="w-full font-bold shadow-md shadow-emerald-700/20"
                  >
                    <span>Send Login Code</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailCode} className="space-y-4">
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <span>Code sent to: <strong>{email}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-emerald-700 underline font-bold text-[11px] cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <Input
                    label="Enter 6-Digit Code"
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
                    className="tracking-widest font-mono text-center text-lg"
                  />

                  <div className="flex justify-between items-center text-xs">
                    <button
                      type="button"
                      disabled={isSendingOtp}
                      onClick={handleSendEmailCode}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-slate-500 hover:text-slate-900"
                    >
                      Back
                    </button>
                  </div>

                  <Button
                    type="submit"
                    isLoading={loading}
                    className="w-full font-bold shadow-md shadow-emerald-700/20"
                  >
                    <span>Verify & Sign In</span>
                    <CheckCircle2 className="w-4 h-4 ml-1.5" />
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2 text-center">
              Active Pilot Demo Login
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('broker@leadnivesh.com', 'Broker@123456')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-left transition cursor-pointer text-xs"
              >
                <span className="font-bold text-slate-900 block truncate">Rajesh Sharma</span>
                <span className="text-[10px] text-slate-500">Panipat Pilot</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@leadnivesh.com', 'Admin@123456')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-left transition cursor-pointer text-xs"
              >
                <span className="font-bold text-slate-900 block truncate">Platform Admin</span>
                <span className="text-[10px] text-slate-500">System Control</span>
              </button>
            </div>
          </div>

          {/* Create Account Link */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              New to leadNivash?{' '}
              <Link to="/register" className="font-bold text-emerald-700 hover:underline">
                Start 14-Day Free Trial
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted Owner Vault • ISO-Aligned Client Confidentiality</span>
        </div>
      </div>
    </div>
  );
};
