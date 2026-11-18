import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } catch {
      // Intentionally suppress errors to prevent email enumeration attacks
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-border rounded-card p-6 sm:p-8 shadow-sm">
          <div className="mb-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition mb-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
            <h1 className="text-xl font-bold text-ink font-heading">Reset Password</h1>
            <p className="text-xs text-muted mt-1">
              Enter your registered work email to receive password reset instructions.
            </p>
          </div>

          {submitted ? (
            <div className="p-4 bg-brand-50 border border-brand-600/30 rounded-input space-y-2">
              <div className="flex items-center gap-2 text-brand-700 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Request Received</span>
              </div>
              <p className="text-xs text-text leading-relaxed">
                If an account exists with this email address, a password reset link has been sent. Please check your inbox and spam folder.
              </p>
              <div className="pt-2">
                <Link to="/login" className="text-xs font-bold text-brand-700 hover:underline">
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="broker@leadnivesh.com"
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Button type="submit" isLoading={loading} className="w-full">
                Send Reset Link
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
