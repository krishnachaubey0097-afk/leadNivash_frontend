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
  ShieldCheck,
} from 'lucide-react';
import { ApiError } from '../../lib/api/errors';
import { normalizeToE164 } from '../../lib/phone';
import clsx from 'clsx';

export const RegisterPage: React.FC = () => {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Registration Mode: 'google' | 'direct'
  const [activeTab, setActiveTab] = useState<'google' | 'direct'>('google');

  // Google OAuth Flow State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleStep, setGoogleStep] = useState<1 | 2>(1); // 1: Connect Google, 2: Enter mandatory phone
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googlePhone, setGooglePhone] = useState('');
  const [googleAgency, setGoogleAgency] = useState('');
  const [googleCity, setGoogleCity] = useState('Panipat');

  // Common Form Data for Direct Registration
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agencyName: '',
    city: 'Panipat',
    termsAccepted: false,
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

  // Google Sign-Up Handler
  const handleGoogleStart = () => {
    setErrorMsg(null);
    setFieldErrors({});
    setIsGoogleLoading(true);

    try {
      const simulatedEmail = googleEmail || 'broker.new@leadnivesh.com';
      const simulatedName = googleName || (googleEmail ? googleEmail.split('@')[0] : 'Broker Partner');
      setGoogleEmail(simulatedEmail);
      setGoogleName(simulatedName);
      setGoogleStep(2); // Immediately advance to mandatory phone collection
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google authentication failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    const phoneErr = validatePhone(googlePhone);
    if (phoneErr) {
      setFieldErrors({ googlePhone: phoneErr });
      return;
    }

    setIsGoogleLoading(true);
    try {
      const cleanPhone = googlePhone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12
        ? `+${cleanPhone}`
        : `+91${cleanPhone.slice(-10)}`;

      await googleLogin({
        email: googleEmail,
        name: googleName || 'Verified Broker',
        phone: formattedPhone,
        agencyName: googleAgency || 'Sharma Real Estate Agency',
        city: googleCity || 'Panipat',
      });

      navigate('/app', { replace: true });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not complete Google registration.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Direct Manual Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    const emailToUse = formData.email;

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
              setActiveTab('google');
              setErrorMsg(null);
            }}
            className={clsx(
              'flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition cursor-pointer text-center flex items-center justify-center gap-1.5',
              activeTab === 'google'
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
            Create Manually
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
          {/* OPTION 1: SIGN UP USING GOOGLE ACCOUNT                  */}
          {/* ======================================================== */}
          {activeTab === 'google' && (
            <div>
              {googleStep === 1 && (
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
                    <h3 className="text-sm font-bold text-slate-900">Sign Up with Google</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Instantly connect your Google workspace account. You'll enter your verified mobile number next.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Input
                      label="Your Work / Google Email"
                      type="email"
                      required
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="e.g. sharma.broker@gmail.com"
                      leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                    />

                    <button
                      type="button"
                      onClick={handleGoogleStart}
                      disabled={isGoogleLoading || !googleEmail.trim()}
                      className="w-full py-3 px-4 rounded-full bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 shadow-sm hover:shadow transition cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </div>
                </div>
              )}

              {googleStep === 2 && (
                <form onSubmit={handleGoogleComplete} className="space-y-3.5">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800">
                    <p className="font-bold">Google account linked ({googleEmail})</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Please enter your mandatory WhatsApp mobile number to complete your broker registration.
                    </p>
                  </div>

                  <Input
                    label="Broker Full Name *"
                    required
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
                  />

                  <Input
                    label="Mandatory Mobile Number (+91) *"
                    type="tel"
                    required
                    maxLength={10}
                    value={googlePhone}
                    onChange={(e) => setGooglePhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    error={fieldErrors['googlePhone']}
                    leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                  />
                  <p className="text-[11px] text-slate-500">10-digit Indian WhatsApp mobile number for client inquiry routing</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Agency / Firm Name"
                      value={googleAgency}
                      onChange={(e) => setGoogleAgency(e.target.value)}
                      placeholder="e.g. Sharma Real Estate"
                      leftIcon={<Building className="w-4 h-4 text-slate-400" />}
                    />
                    <Input
                      label="City / Hub"
                      value={googleCity}
                      onChange={(e) => setGoogleCity(e.target.value)}
                      placeholder="Panipat"
                      leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                    />
                  </div>

                  <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-600">
                    <input
                      type="checkbox"
                      id="terms-google"
                      required
                      className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="terms-google">
                      I agree to the{' '}
                      <Link to="/terms" className="text-emerald-700 underline font-semibold">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-emerald-700 underline font-semibold">
                        Privacy Policy
                      </Link>
                      , and confirm that I am 18 years of age or older.
                    </label>
                  </div>

                  <Button
                    type="submit"
                    isLoading={isGoogleLoading}
                    className="w-full font-bold shadow-md shadow-emerald-700/20"
                  >
                    <span>Complete Registration & Enter Workspace</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </form>
              )}
            </div>
          )}

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
                  , and confirm that I am 18 years of age or older.
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
