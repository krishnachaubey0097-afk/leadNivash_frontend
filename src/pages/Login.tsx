import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('broker@leadnivesh.com');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app/today');
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Invalid credentials. Please verify your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      navigate('/app/today');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <img
            src="/logo-full.png"
            alt="LeadNivesh Logo"
            className="h-16 object-contain mb-3 drop-shadow-sm"
          />
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Broker Operating System
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sign in to access your inventory, buyer leads & WhatsApp toolkit
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="broker@leadnivesh.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary-focus text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition active:scale-[0.98] disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              One-Click Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('broker@leadnivesh.com', 'Password@123')}
                disabled={loading}
                className="py-2 px-3 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Broker Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('superadmin@leadnivesh.com', 'Admin@123')}
                disabled={loading}
                className="py-2 px-3 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>SuperAdmin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          New Broker?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Register your agency here
          </Link>
        </p>
      </div>
    </div>
  );
};
