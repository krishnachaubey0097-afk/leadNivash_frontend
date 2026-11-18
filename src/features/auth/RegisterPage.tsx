import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PhoneInput } from '../../components/ui/PhoneInput';
import { User as UserIcon, Mail, Lock, Building, MapPin, AlertCircle } from 'lucide-react';
import { ApiError } from '../../lib/api/errors';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    agencyName: '',
    city: 'Gurugram',
    termsAccepted: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    if (!formData.termsAccepted) {
      setErrorMsg('Aapko register karne ke liye Terms aur Privacy Policy accept karni hogi.');
      return;
    }

    if (formData.password.length < 8) {
      setFieldErrors({ password: 'Password kam se kam 8 characters ka hona chahiye.' });
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        agencyName: formData.agencyName,
        city: formData.city,
      });
      navigate('/app', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setErrorMsg('Is email ke saath account pehle se maujood hai.');
        } else if (err.status === 429) {
          setErrorMsg(err.message || 'Thodi der baad dobara koshish karein.');
        } else if (err.fields) {
          const mapped: Record<string, string> = {};
          Object.entries(err.fields).forEach(([k, v]) => {
            mapped[k] = Array.isArray(v) ? v[0] : String(v);
          });
          setFieldErrors(mapped);
        } else {
          setErrorMsg(err.message || 'Registration failed. Kripya details check karein.');
        }
      } else {
        setErrorMsg('Network error. Kripya apna internet connection check karein.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <img
            src="/logo-full.png"
            alt="LeadNivesh Logo"
            className="h-14 object-contain mb-2 drop-shadow-sm"
          />
          <h1 className="text-xl font-bold tracking-tight text-ink font-heading">
            Register Broker Agency
          </h1>
          <p className="text-xs text-muted mt-1">
            Free 14-day trial • Full access to inventory & matching engine
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-card p-6 sm:p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-input bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-danger text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Full Name *"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rajesh Sharma"
              error={fieldErrors['name']}
              leftIcon={<UserIcon className="w-4 h-4" />}
            />

            <Input
              label="Work Email *"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="rajesh@sharmaproperties.com"
              error={fieldErrors['email']}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <PhoneInput
              label="WhatsApp Mobile Number *"
              required
              value={formData.phone}
              onChange={(val) => setFormData({ ...formData, phone: val })}
              error={fieldErrors['phone']}
            />

            <Input
              label="Password (min 8 chars) *"
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••••••"
              error={fieldErrors['password']}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="grid grid-cols-2 gap-2.5">
              <Input
                label="Agency Name"
                value={formData.agencyName}
                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                placeholder="Sharma Properties"
                leftIcon={<Building className="w-4 h-4" />}
              />

              <Input
                label="City / Market"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Gurugram"
                leftIcon={<MapPin className="w-4 h-4" />}
              />
            </div>

            {/* Terms and Privacy Consent Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-brand-700 border-border focus:ring-brand-600 cursor-pointer"
                />
                <span className="text-xs text-muted leading-snug">
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-brand-700 underline font-semibold">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" target="_blank" className="text-brand-700 underline font-semibold">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            <Button type="submit" isLoading={loading} className="w-full mt-2">
              Create Broker Account
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted mt-5">
          Already registered?{' '}
          <Link to="/login" className="text-brand-700 font-bold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
