import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { ApiError } from '../../lib/api/errors';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read token from URL and immediately strip it from address bar to prevent leaking via history or referrer
  const [token, setToken] = useState<string>('');

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

    if (!token) {
      setErrorMsg('The password reset token is invalid or missing. Please request a new link.');
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
        token,
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
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-border rounded-card p-6 sm:p-8 shadow-sm">
          <h1 className="text-xl font-bold text-ink font-heading mb-1">Set New Password</h1>
          <p className="text-xs text-muted mb-4">
            Create a secure password with at least 8 characters.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-input bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-danger text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success ? (
            <div className="p-4 bg-brand-50 border border-brand-600/30 rounded-input space-y-2">
              <div className="flex items-center gap-2 text-brand-700 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Password Successfully Updated!</span>
              </div>
              <p className="text-xs text-text">
                Aapka password reset ho gaya hai. Aapko login page par redirect kiya ja raha hai...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Input
                label="Confirm Password"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Button type="submit" isLoading={loading} className="w-full">
                Save New Password
              </Button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-semibold text-muted hover:text-ink">
                  Cancel and return to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
