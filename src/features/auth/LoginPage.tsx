import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { ApiError } from '../../lib/api/errors';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('broker@leadnivesh.com');
  const [password, setPassword] = useState('Broker@123456');
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
          setErrorMsg('Invalid email or password. Please try again.');
        } else if (err.status === 429) {
          setErrorMsg(err.message || 'Too many login attempts. Please wait a moment before trying again.');
        } else {
          setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
        }
      } else {
        setErrorMsg('Network error — please check your internet connection.');
      }
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
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo and Tagline */}
        <div className="flex flex-col items-center mb-6 text-center">
          <img
            src="/logo-full.png"
            alt="LeadNivesh Logo"
            className="h-14 object-contain mb-2 drop-shadow-sm"
          />
          <h1 className="text-xl font-bold tracking-tight text-ink font-heading">
            Broker Operating System
          </h1>
          <p className="text-xs text-muted mt-1">
            Sign in to manage inventory, match buyers & share masked flyers
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface border border-border rounded-card p-6 sm:p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-input bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-danger text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="broker@leadnivesh.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
              />
              <div className="flex justify-end pt-0.5">
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-brand-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" isLoading={loading} className="w-full">
              Sign In
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-border">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-2 text-center">
              Quick Test Credentials
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('broker@leadnivesh.com', 'Broker@123456')}
                className="py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-ink flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                <span>Broker</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@leadnivesh.com', 'Admin@123456')}
                className="py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-ink flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-gold-text" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Link to Register */}
        <p className="text-center text-xs text-muted mt-5">
          New Broker?{' '}
          <Link to="/register" className="text-brand-700 font-bold hover:underline">
            Register your agency here
          </Link>
        </p>
      </div>
    </div>
  );
};
