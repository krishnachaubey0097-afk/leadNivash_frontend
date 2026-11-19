import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  User as UserIcon,
  Mail,
  Lock,
  Building,
  MapPin,
  AlertCircle,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { ApiError } from '../../lib/api/errors';
import { normalizeToE164 } from '../../lib/phone';
import { apiClient } from '../../lib/api/client';
import clsx from 'clsx';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Registration Mode: 'email-otp' | 'direct'
  const [activeTab, setActiveTab] = useState<'email-otp' | 'direct'>('email-otp');

  // OTP flow steps: 1: enter-email, 2: verify-otp, 3: account-details
  const [otpStep, setOtpStep] = useState<1 | 2 | 3>(1);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Common Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agencyName: '',
    city: 'Panipat',
    termsAccepted: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Validate Indian Phone Number
  const validatePhone = (phoneStr: string): string | null => {
    const digits = phoneStr.replace(/\D/g, '');
    if (!digits) return 'Mobile number is required for broker verification.';
    if (digits.length === 10) {
      if (!/^[6-9]\d{9}$/.test(digits)) {
        return 'Please enter a valid 10-digit Indian mobile number (starting with 6-9).';
      }
      return null;
    }
    if (digits.length === 12 && digits.startsWith('91')) {
      const actual = digits.slice(2);
      if (!/^[6-9]\d{9}$/.test(actual)) {
        return 'Please enter a valid 10-digit Indian mobile number.';
      }
      return null;
    }
    return 'Please enter a valid 10-digit mobile number.';
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    if (!otpEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpEmail)) {
      setFieldErrors({ otpEmail: 'Please enter a valid work email address.' });
      return;
    }

    setIsSendingOtp(true);
    try {
      await apiClient.post('/api/v1/auth/send-otp', { email: otpEmail });
      setFormData((prev) => ({ ...prev, email: otpEmail }));
      setOtpStep(2);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not send verification code. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    if (!otpCode || otpCode.trim().length !== 6) {
      setFieldErrors({ otpCode: 'Please enter the 6-digit verification code.' });
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await apiClient.post('/api/v1/auth/verify-otp', {
        email: otpEmail,
        otp: otpCode.trim(),
      });
      setOtpStep(3);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid or expired verification code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Step 3 / Direct Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    const emailToUse = activeTab === 'email-otp' ? otpEmail : formData.email;

    if (!formData.termsAccepted) {
      setErrorMsg('Please accept the Terms of Service and Privacy Policy to create your account.');
      return;
    }

    // Mandatory mobile number check
    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) {
      setFieldErrors((prev) => ({ ...prev, phone: phoneErr }));
      return;
    }

    if (formData.password.length < 8) {
      setFieldErrors((prev) => ({ ...prev, password: 'Password must be at least 8 characters long.' }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      return;
    }

    setLoading(true);
    try {
      const normalizedPhone = normalizeToE164(formData.phone);

      await register({
        name: formData.name,
        email: emailToUse,
        password: formData.password,
        phone: normalizedPhone,
        agencyName: formData.agencyName || 'Direct Broker Agency',
        city: formData.city || 'Panipat',
      });
      navigate('/app', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setErrorMsg('An account with this email address already exists. Please sign in instead.');
        } else if (err.status === 429) {
          setErrorMsg(err.message || 'Too many attempts. Please try again in a few moments.');
        } else if (err.fields) {
          const mapped: Record<string, string> = {};
          Object.entries(err.fields).forEach(([k, v]) => {
            mapped[k] = Array.isArray(v) ? v[0] : String(v);
          });
          setFieldErrors(mapped);
        } else {
          setErrorMsg(err.message || 'Registration failed. Please check your details and try again.');
        }
      } else {
        setErrorMsg('Network error. Please check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/20 text-slate-900 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
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
            Create Your Broker Account
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Free 14-day trial • Full access to inventory, matching engine & WhatsApp flyer generator
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1 bg-slate-100 rounded-full border border-slate-200/80 mb-4 max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('email-otp');
              setErrorMsg(null);
            }}
            className={clsx(
              'flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition cursor-pointer text-center',
              activeTab === 'email-otp'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Continue with Email
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('direct');
              setErrorMsg(null);
            }}
            className={clsx(
              'flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition cursor-pointer text-center',
              activeTab === 'direct'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Create Account
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* OPTION 1: CONTINUE WITH EMAIL (OTP FLOW)                */}
          {/* ======================================================== */}
          {activeTab === 'email-otp' && (
            <div>
              {/* Step 1: Enter Email */}
              {otpStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Work Email Address
                    </label>
                    <Input
                      type="email"
                      required
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      placeholder="broker@sharmarealestate.com"
                      error={fieldErrors['otpEmail']}
                      leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500">
                    We'll email you a 6-digit verification code to confirm ownership.
                  </p>

                  <Button
                    type="submit"
                    isLoading={isSendingOtp}
                    className="w-full font-bold shadow-md shadow-emerald-700/20"
                  >
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </form>
              )}

              {/* Step 2: Verify 6-digit Code */}
              {otpStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <span className="font-semibold">Code sent to: {otpEmail}</span>
                    <button
                      type="button"
                      onClick={() => setOtpStep(1)}
                      className="text-emerald-700 underline font-bold text-[11px] cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Enter 6-Digit Code
                    </label>
                    <Input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 123456"
                      error={fieldErrors['otpCode']}
                      leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
                      className="tracking-widest font-mono text-center text-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      disabled={isSendingOtp}
                      onClick={handleSendOtp}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpStep(1)}
                      className="text-slate-500 hover:text-slate-900"
                    >
                      Back
                    </button>
                  </div>

                  <Button
                    type="submit"
                    isLoading={isVerifyingOtp}
                    className="w-full font-bold shadow-md shadow-emerald-700/20"
                  >
                    <span>Verify Email</span>
                    <CheckCircle2 className="w-4 h-4 ml-1.5" />
                  </Button>
                </form>
              )}

              {/* Step 3: Account Details with MANDATORY MOBILE NUMBER */}
              {otpStep === 3 && (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Email verified: <strong>{otpEmail}</strong></span>
                  </div>

                  <Input
                    label="Full Name *"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    error={fieldErrors['name']}
                    leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
                  />

                  {/* Mandatory Phone Input with +91 default */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Mobile Number * <span className="text-emerald-700 font-semibold">(Mandatory)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-600 font-bold text-xs pointer-events-none">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>+91</span>
                        <span className="text-slate-300">|</span>
                      </div>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value.replace(/[^\d\s]/g, '') })
                        }
                        placeholder="98765 43210"
                        className={clsx(
                          'w-full bg-slate-50 border rounded-2xl py-2.5 pl-20 pr-4 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition',
                          fieldErrors['phone'] ? 'border-rose-400' : 'border-slate-200'
                        )}
                      />
                    </div>
                    {fieldErrors['phone'] && (
                      <p className="text-xs text-rose-600 font-semibold mt-0.5">{fieldErrors['phone']}</p>
                    )}
                    <p className="text-[10px] text-slate-500">
                      Required for secure broker account verification and client masking.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Agency / Firm Name"
                      value={formData.agencyName}
                      onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                      placeholder="e.g. Sharma Properties"
                      leftIcon={<Building className="w-4 h-4 text-slate-400" />}
                    />
                    <Input
                      label="Primary City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Panipat, Gurugram"
                      leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Set Password *"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 8 characters"
                      error={fieldErrors['password']}
                      leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />

                    <Input
                      label="Confirm Password *"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Re-type password"
                      error={fieldErrors['confirmPassword']}
                      leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </div>

                  <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-600">
                    <input
                      type="checkbox"
                      id="terms-otp"
                      checked={formData.termsAccepted}
                      onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="terms-otp">
                      I agree to the{' '}
                      <Link to="/terms" className="text-emerald-700 underline font-semibold">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-emerald-700 underline font-semibold">
                        Privacy Policy
                      </Link>
                      .
                    </label>
                  </div>

                  <Button
                    type="submit"
                    isLoading={loading}
                    className="w-full font-bold shadow-md shadow-emerald-700/20"
                  >
                    <span>Create My Broker Account</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* OPTION 2: CREATE ACCOUNT (DIRECT REGISTRATION FORM)     */}
          {/* ======================================================== */}
          {activeTab === 'direct' && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <Input
                label="Full Name *"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rajesh Sharma"
                error={fieldErrors['name']}
                leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
              />

              <Input
                label="Work Email *"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="broker@sharmarealestate.com"
                error={fieldErrors['email']}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              />

              {/* Mandatory Phone Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Mobile Number * <span className="text-emerald-700 font-semibold">(Mandatory)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-600 font-bold text-xs pointer-events-none">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+91</span>
                    <span className="text-slate-300">|</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value.replace(/[^\d\s]/g, '') })
                    }
                    placeholder="98765 43210"
                    className={clsx(
                      'w-full bg-slate-50 border rounded-2xl py-2.5 pl-20 pr-4 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition',
                      fieldErrors['phone'] ? 'border-rose-400' : 'border-slate-200'
                    )}
                  />
                </div>
                {fieldErrors['phone'] && (
                  <p className="text-xs text-rose-600 font-semibold mt-0.5">{fieldErrors['phone']}</p>
                )}
                <p className="text-[10px] text-slate-500">
                  Required for secure broker account verification and client masking.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Agency / Business Name"
                  value={formData.agencyName}
                  onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                  placeholder="e.g. Sharma Properties"
                  leftIcon={<Building className="w-4 h-4 text-slate-400" />}
                />

                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Panipat, Gurugram"
                  leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Password *"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 8 characters"
                  error={fieldErrors['password']}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                <Input
                  label="Confirm Password *"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-type password"
                  error={fieldErrors['confirmPassword']}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>

              <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-600">
                <input
                  type="checkbox"
                  id="terms-direct"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="terms-direct">
                  I agree to the{' '}
                  <Link to="/terms" className="text-emerald-700 underline font-semibold">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-emerald-700 underline font-semibold">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                className="w-full font-bold shadow-md shadow-emerald-700/20"
              >
                <span>Create Broker Account</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          )}

          {/* Bottom Login Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already registered with leadNivash?{' '}
              <Link to="/login" className="font-bold text-emerald-700 hover:underline">
                Sign In to Workspace
              </Link>
            </p>
          </div>
        </div>

        {/* Security guarantee */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted Owner Vault • 100% Client Contact Privacy</span>
        </div>
      </div>
    </div>
  );
};
