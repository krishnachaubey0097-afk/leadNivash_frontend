import React, { useState, useEffect } from 'react';
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
  LogIn,
  KeyRound,
  CheckCircle2,
  Phone,
  Building,
} from 'lucide-react';
import { ApiError } from '../../lib/api/errors';
import { apiClient } from '../../lib/api/client';
import { SEO } from '../../components/SEO';
import { BrandLogoBox } from '../../components/ui/BrandLogo';
import {
  fetchAuthProviders,
  requestGoogleAccessToken,
  type AuthProvidersConfig,
} from '../../lib/googleAuth';
import clsx from 'clsx';

export const LoginPage: React.FC = () => {
  const { login, googleLogin, verifyEmailOtp, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromLocation = (location.state as any)?.from;
  const queryRedirect = new URLSearchParams(location.search).get('redirect');
  const rawFrom =
    queryRedirect ||
    (fromLocation?.pathname ? `${fromLocation.pathname}${fromLocation.search || ''}` : '');
  const from = rawFrom && rawFrom !== '/login' ? rawFrom : '/app';

  // Automatically redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  const [providers, setProviders] = useState<AuthProvidersConfig>({
    googleEnabled: Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID),
    googleClientId: (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim() || null,
    emailOtpEnabled: true,
    smtpConfigured: false,
    passwordEnabled: true,
  });

  useEffect(() => {
    fetchAuthProviders().then(setProviders);
  }, []);

  const [authMethod, setAuthMethod] = useState<'password' | 'google'>('password');
  const [loginMode, setLoginMode] = useState<'password' | 'email-otp' | 'forgot'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email OTP state for passwordless login
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpInfoMsg, setOtpInfoMsg] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [accountNotFoundForOtp, setAccountNotFoundForOtp] = useState(false);

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
  const [resetErrorMsg, setResetErrorMsg] = useState<string | null>(null);

  // Google OAuth Modal / Phone Prompt State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [googleProfile, setGoogleProfile] = useState<{ email: string; name: string } | null>(null);
  const [promptGooglePhone, setPromptGooglePhone] = useState(false);
  const [googleMobileNumber, setGoogleMobileNumber] = useState('');
  const [googleAgencyName, setGoogleAgencyName] = useState('');
  const [googlePhoneError, setGooglePhoneError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const googleClientId = providers.googleClientId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    setLoadingStatus('Verifying credentials...');

    const slowTimer = setTimeout(() => {
      setLoadingStatus('Connecting to secure broker workspace...');
    }, 1800);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setErrorMsg('Invalid email/mobile or password. Please verify your credentials or try Email OTP / Google.');
        } else if (err.status === 429) {
          setErrorMsg(err.message || 'Too many login attempts. Please wait a moment before trying again.');
        } else {
          setErrorMsg(err.message || 'Login failed. Please check your connection and try again.');
        }
      } else {
        setErrorMsg('Connection error or timeout. Please check your network and retry.');
      }
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setLoadingStatus(null);
    }
  };

  const handleSendEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setOtpInfoMsg(null);
    setDevOtpHint(null);
    setAccountNotFoundForOtp(false);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = (await apiClient.post('/auth/send-otp', {
        email: cleanEmail,
        purpose: 'login',
      })) as any;
      setOtpSent(true);
      setOtpInfoMsg(res?.message || `6-digit verification code sent to ${cleanEmail}.`);
      if (res?.devOtp) {
        setDevOtpHint(String(res.devOtp));
      }
    } catch (err: any) {
      if (err instanceof ApiError && (err.status === 404 || err.code === 'ACCOUNT_NOT_FOUND')) {
        setAccountNotFoundForOtp(true);
      }
      setErrorMsg(err?.message || 'Could not send verification code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCode = otpCode.trim();
    if (cleanCode.length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyEmailOtp({
        email: email.trim().toLowerCase(),
        otp: cleanCode,
        purpose: 'login',
      });
      if (res.requiresOnboarding) {
        navigate(`/register?tab=otp&email=${encodeURIComponent(email.trim().toLowerCase())}`);
        return;
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg(null);
    setResetSuccessMsg(null);

    const targetEmail = (forgotEmail || email).trim().toLowerCase();
    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setResetErrorMsg('Please enter a valid work email address.');
      return;
    }

    setIsSendingReset(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: targetEmail });
      setResetSuccessMsg(`Password reset instructions sent to ${targetEmail}`);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setResetErrorMsg(err.message || 'Failed to send password reset instructions.');
      } else {
        setResetErrorMsg('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsSendingReset(false);
    }
  };

  // Real Google OAuth Sign-In Handler
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    if (!googleClientId) {
      setErrorMsg('Google Sign-In is not configured yet. Please sign in with Email OTP or Password.');
      return;
    }

    setIsGoogleLoading(true);
    try {
      const token = await requestGoogleAccessToken(googleClientId);
      setGoogleAccessToken(token);

      const res = await googleLogin({ accessToken: token });
      if (res?.requiresPhone) {
        setGoogleProfile({
          email: res.user?.email || '',
          name: res.user?.name || 'Broker Partner',
        });
        setPromptGooglePhone(true);
        return;
      }

      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google sign-in could not be completed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCompleteGoogleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setGooglePhoneError(null);

    const clean = googleMobileNumber.replace(/\D/g, '');
    if (clean.length !== 10 || !/^[6-9]\d{9}$/.test(clean)) {
      setGooglePhoneError('Please enter a valid 10-digit Indian mobile number (starting with 6-9).');
      return;
    }

    setIsGoogleLoading(true);
    try {
      if (!googleProfile || !googleAccessToken) {
        setGooglePhoneError('Google session expired. Please reconnect your Google account.');
        setPromptGooglePhone(false);
        return;
      }
      await googleLogin({
        accessToken: googleAccessToken,
        phone: `+91${clean}`,
        agencyName: googleAgencyName.trim() || undefined,
        consent: { termsAccepted: true, privacyVersion: '1.0' },
      });
      navigate(from, { replace: true });
    } catch (err: any) {
      setGooglePhoneError(err?.message || 'Could not complete registration with mobile number.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/20 text-slate-900 flex flex-col justify-center items-center px-4 py-8">
      <SEO
        title="Broker Workspace Login"
        description="Sign in to your LeadNivash broker workspace to manage property listings, buyer requirements, and instant matching."
        canonicalPath="/login"
      />
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link to="/" className="flex items-center gap-2.5 mb-3.5">
            <BrandLogoBox className="w-10 h-10 rounded-xl border border-slate-200/90 p-1.5 shadow-sm" />
            <span className="text-2xl font-black tracking-tight text-slate-900 font-heading">
              Lead<span className="text-emerald-700">Nivash</span>
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-heading">
            Broker Workspace Login
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your property inventory, active buyers &amp; WhatsApp deal pipeline
          </p>
        </div>

        {/* Auth Method Selector (Email & Password/OTP vs Google) */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 mb-4 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('password');
              setPromptGooglePhone(false);
              setErrorMsg(null);
            }}
            className={clsx(
              'py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer text-center',
              authMethod === 'password'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Email / OTP &amp; Password
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('google');
              setErrorMsg(null);
            }}
            className={clsx(
              'py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer text-center flex items-center justify-center gap-1.5',
              authMethod === 'google'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google Account</span>
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span>{errorMsg}</span>
                {accountNotFoundForOtp && (
                  <div>
                    <Link
                      to={`/register?tab=otp&email=${encodeURIComponent(email.trim().toLowerCase())}`}
                      className="inline-block font-bold text-emerald-700 underline mt-1"
                    >
                      Create account with this email via OTP &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* METHOD 1: GOOGLE OAUTH */}
          {authMethod === 'google' && !promptGooglePhone && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto shadow-xs">
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Sign in with Google Account</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Already have an account with this email? Signing in with Google automatically opens your existing workspace.
                </p>
              </div>

              {!googleClientId ? (
                <div className="space-y-3 pt-1">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-left text-xs text-amber-900 space-y-1.5">
                    <span className="font-bold flex items-center gap-1.5 text-amber-800">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      Google Client ID Required
                    </span>
                    <p className="text-[11px] text-amber-800/90 leading-relaxed">
                      Add <code className="font-mono">GOOGLE_CLIENT_ID</code> in backend env or <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> in frontend env to enable Google Sign-In popup.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('password');
                        setLoginMode('email-otp');
                      }}
                      className="py-2.5 px-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Use Email OTP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('password');
                        setLoginMode('password');
                      }}
                      className="py-2.5 px-3 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Use Password</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full py-3 px-4 rounded-full bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 shadow-sm hover:shadow transition cursor-pointer disabled:opacity-60"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{isGoogleLoading ? 'Authorizing with Google...' : 'Continue with Google'}</span>
                  </button>
                  <p className="text-[11px] text-slate-400">
                    Verified via Google OAuth • Links automatically to matching email accounts
                  </p>
                </div>
              )}
            </div>
          )}

          {/* METHOD 1.1: GOOGLE MANDATORY MOBILE NUMBER PROMPT (NEW USER VIA LOGIN) */}
          {authMethod === 'google' && promptGooglePhone && (
            <form onSubmit={handleCompleteGoogleRegistration} className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800">
                <p className="font-bold">Google account verified!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Signed in as <strong>{googleProfile?.email}</strong>. Enter your WhatsApp number to create your new broker workspace.
                </p>
              </div>

              {googlePhoneError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {googlePhoneError}
                </div>
              )}

              <Input
                label="Mandatory Mobile Number (+91) *"
                type="tel"
                required
                maxLength={10}
                value={googleMobileNumber}
                onChange={(e) => setGoogleMobileNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              />

              <Input
                label="Agency / Business Name"
                value={googleAgencyName}
                onChange={(e) => setGoogleAgencyName(e.target.value)}
                placeholder="e.g. Sharma Real Estate"
                leftIcon={<Building className="w-4 h-4 text-slate-400" />}
              />

              <Button
                type="submit"
                isLoading={isGoogleLoading}
                className="w-full font-bold justify-center"
              >
                <span>Complete Verification &amp; Enter</span>
              </Button>
            </form>
          )}

          {/* METHOD 2: EMAIL & PASSWORD / EMAIL OTP AUTHENTICATION */}
          {authMethod === 'password' && (
            <div>
              {/* Secondary Sub-Toggle: Password vs Email OTP vs Forgot Password */}
              <div className="flex p-0.5 bg-slate-100 rounded-full border border-slate-200 mb-4 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('password');
                    setErrorMsg(null);
                    setAccountNotFoundForOtp(false);
                    setResetSuccessMsg(null);
                    setResetErrorMsg(null);
                  }}
                  className={clsx(
                    'flex-1 py-1 px-1.5 sm:px-2.5 rounded-full text-[11px] font-bold transition cursor-pointer text-center whitespace-nowrap',
                    loginMode === 'password'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  )}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('email-otp');
                    setErrorMsg(null);
                    setAccountNotFoundForOtp(false);
                    setResetSuccessMsg(null);
                    setResetErrorMsg(null);
                  }}
                  className={clsx(
                    'flex-1 py-1 px-1.5 sm:px-2.5 rounded-full text-[11px] font-bold transition cursor-pointer text-center whitespace-nowrap',
                    loginMode === 'email-otp'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  )}
                >
                  Email OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('forgot');
                    setErrorMsg(null);
                    setAccountNotFoundForOtp(false);
                    if (!forgotEmail && email) setForgotEmail(email);
                    setResetSuccessMsg(null);
                    setResetErrorMsg(null);
                  }}
                  className={clsx(
                    'flex-1 py-1 px-1.5 sm:px-2.5 rounded-full text-[11px] font-bold transition cursor-pointer text-center whitespace-nowrap',
                    loginMode === 'forgot'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  )}
                >
                  Forgot Password
                </button>
              </div>

              {loginMode === 'password' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Work Email or Registered Mobile Number"
                    type="text"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email or 10-digit mobile (e.g. 9876543210)"
                    leftIcon={
                      /^[6-9]\d{2}/.test(email.replace(/[\s+-]/g, '')) ? (
                        <Phone className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Mail className="w-4 h-4 text-slate-400" />
                      )
                    }
                  />

                  <div className="space-y-1">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
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
                    <div className="flex justify-between pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMode('email-otp');
                          setErrorMsg(null);
                        }}
                        className="text-xs font-semibold text-slate-500 hover:text-emerald-700 cursor-pointer"
                      >
                        Login via Email OTP
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMode('forgot');
                          if (!forgotEmail && email) setForgotEmail(email);
                          setErrorMsg(null);
                          setResetSuccessMsg(null);
                          setResetErrorMsg(null);
                        }}
                        className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    isLoading={loading}
                    className="w-full font-bold shadow-md shadow-emerald-700/20 min-h-[44px]"
                  >
                    <LogIn className="w-4 h-4 mr-1.5" />
                    <span>{loadingStatus || 'Sign In to Workspace'}</span>
                  </Button>
                </form>
              )}

              {loginMode === 'email-otp' && (
                <div className="space-y-4">
                  {!otpSent ? (
                    <form onSubmit={handleSendEmailCode} className="space-y-4">
                      <Input
                        label="Registered Work Email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="broker@sharmarealestate.com"
                        leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                      />
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        We&apos;ll send a 6-digit one-time verification code to your email to sign you in without a password.
                      </p>
                      <Button
                        type="submit"
                        isLoading={isSendingOtp}
                        className="w-full font-bold justify-center min-h-[44px]"
                      >
                        <KeyRound className="w-4 h-4 mr-1.5" />
                        <span>Send 6-Digit Login Code</span>
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyEmailCode} className="space-y-4">
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-2">
                        <span className="truncate">
                          {otpInfoMsg || (
                            <>
                              Code sent to: <strong>{email}</strong>
                            </>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpCode('');
                            setDevOtpHint(null);
                          }}
                          className="text-emerald-700 underline font-bold text-[11px] cursor-pointer shrink-0"
                        >
                          Change
                        </button>
                      </div>

                      {devOtpHint && (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center justify-between">
                          <span>Dev Preview OTP:</span>
                          <code className="font-mono font-bold text-sm tracking-widest">{devOtpHint}</code>
                        </div>
                      )}

                      <Input
                        label="Enter 6-Digit Code"
                        type="text"
                        inputMode="numeric"
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
                          className="text-emerald-700 font-bold hover:underline cursor-pointer disabled:opacity-50"
                        >
                          {isSendingOtp ? 'Sending...' : 'Resend Code'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpCode('');
                          }}
                          className="text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          Back
                        </button>
                      </div>

                      <Button
                        type="submit"
                        isLoading={loading}
                        className="w-full font-bold shadow-md shadow-emerald-700/20 min-h-[44px]"
                      >
                        <span>Verify &amp; Sign In</span>
                        <CheckCircle2 className="w-4 h-4 ml-1.5" />
                      </Button>
                    </form>
                  )}
                </div>
              )}

              {/* Forgot Password Mode directly on Login Card */}
              {loginMode === 'forgot' && (
                <div className="space-y-4">
                  {resetSuccessMsg ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-emerald-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Reset Link Sent!</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          Password reset instructions have been sent to <strong>{forgotEmail || email}</strong>. Please check your inbox and spam folder.
                        </p>
                        <p className="text-[11px] text-slate-500">
                          The secure reset link is valid for 30 minutes.
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 pt-1">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setLoginMode('password');
                            setResetSuccessMsg(null);
                          }}
                          className="w-full font-bold"
                        >
                          <span>Back to Password Sign In</span>
                        </Button>
                        <button
                          type="button"
                          onClick={() => setResetSuccessMsg(null)}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-900 text-center py-1 cursor-pointer"
                        >
                          Send to a different email
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSendPasswordReset} className="space-y-4">
                      {resetErrorMsg && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <span>{resetErrorMsg}</span>
                        </div>
                      )}

                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                        <p className="font-bold text-slate-900">Forgot your broker workspace password?</p>
                        <p className="text-[11px] text-slate-500">
                          Enter your registered work email address below. We&apos;ll send you a secure link to choose a new password.
                        </p>
                      </div>

                      <Input
                        label="Registered Work Email Address"
                        type="email"
                        required
                        value={forgotEmail || email}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          setEmail(e.target.value);
                        }}
                        placeholder="broker@sharmarealestate.com"
                        leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                      />

                      <Button
                        type="submit"
                        isLoading={isSendingReset}
                        className="w-full font-bold justify-center"
                      >
                        <span>Send Password Reset Link</span>
                      </Button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setLoginMode('password');
                            setErrorMsg(null);
                            setResetErrorMsg(null);
                          }}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          Remember your password? Sign in
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Create Account Link */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              New to LeadNivash?{' '}
              <Link to="/register" className="font-bold text-emerald-700 hover:underline">
                Create Account (14-Day Free Trial)
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
    </main>
  );
};
