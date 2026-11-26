import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { ApiError } from '../../lib/api/errors';
import { SEO } from '../../components/SEO';
import { BrandLogoBox } from '../../components/ui/BrandLogo';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read token from URL and immediately strip it from address bar to prevent leaking via history or referrer
  const [token, setToken] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const rawToken = searchParams.get('token');
    if (rawToken) {
      setToken(rawToken);
      // Clean address bar immediately
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanToken = token.trim();
    if (!cleanToken) {
      setErrorMsg('The password reset token is missing or expired. Please request a new link.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        token: cleanToken,
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message || 'The password reset link has expired. Please request a new one.');
      } else {
        setErrorMsg('Unable to reset password. Please check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/20 text-slate-900 flex flex-col justify-center items-center px-4 py-8">
      <SEO
        noindex
        title="Choose a New Password"
        description="Set a new password for your LeadNivash broker workspace."
        canonicalPath="/reset-password"
      />
      <div className="w-full max-w-md">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link to="/" className="flex items-center gap-2.5 mb-3.5">
            <BrandLogoBox className="w-10 h-10 rounded-xl border border-slate-200/90 p-1.5 shadow-sm" />
            <span className="text-2xl font-black tracking-tight text-slate-900 font-heading">
              Lead<span className="text-emerald-700">Nivash</span>
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-heading">
            Choose a New Password
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create a secure password with at least 8 characters for your broker workspace
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password Successfully Updated!</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your workspace password has been securely updated. All previous sessions have been invalidated.
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold">
                Redirecting you to the sign-in page...
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center py-2 px-4 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm text-center"
                >
                  Sign In Now
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!token && (
                <Input
                  label="Reset Token"
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your 64-character reset token"
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                />
              )}

              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
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

              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <Button
                type="submit"
                isLoading={loading}
                className="w-full font-bold shadow-md shadow-emerald-700/20"
              >
                <span>Save New Password & Sign In</span>
              </Button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-semibold text-slate-500 hover:text-slate-900">
                  Cancel and return to Login
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Security badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted Vault • Bcrypt Salted Password Hashing</span>
        </div>
      </div>
    </main>
  );
};
