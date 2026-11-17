import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { User, Building, Phone, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    agencyName: '',
    phone: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        fullName: formData.fullName,
        agencyName: formData.agencyName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      });
      navigate('/app/today');
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Registration failed. Please verify your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] flex flex-col justify-center items-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <img
            src="/logo-full.png"
            alt="LeadNivesh Logo"
            className="h-14 object-contain mb-2"
          />
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Register Broker Agency
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Empower your team with real-time property inventory & buyer matching
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none transition"
                  placeholder="e.g. Rajesh Sharma"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Agency / Firm Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.agencyName}
                  onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none transition"
                  placeholder="e.g. Sharma Properties Gurugram"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                WhatsApp / Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none transition"
                  placeholder="e.g. 9812345678"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none transition"
                  placeholder="rajesh@sharmaproperties.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none transition"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-primary hover:bg-primary-focus text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition active:scale-[0.98] disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
