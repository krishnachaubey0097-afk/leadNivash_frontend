import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import {
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo-icon.png" alt="LeadNivesh" className="w-8 h-8 object-contain" />
            <span className="text-lg font-black tracking-tight text-ink font-heading leading-none">
              Lead<span className="text-brand-600">Nivesh</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-text hover:text-ink px-3 py-2 transition"
            >
              Sign In
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4 text-center max-w-4xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Pilot in Panipat & NCR
        </span>

        <h1 className="text-3xl sm:text-5xl font-black text-ink font-heading leading-tight tracking-tight">
          Message paste karo. <span className="text-brand-600">Match mil jayega.</span>
          <br />
          Owner ka number safe.
        </h1>

        <p className="text-sm sm:text-base text-muted mt-4 max-w-2xl mx-auto leading-relaxed">
          The fast, mobile-first operating system built for independent property brokers. Extract deals from WhatsApp messages in seconds, auto-match buyer inquiries, and share branded photo flyers without leaking owner contacts.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Sign In to Existing Account
            </Button>
          </Link>
        </div>
      </section>

      {/* 4-Step How It Works (§5.1) */}
      <section className="py-12 bg-surface border-y border-border px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-xl font-bold text-ink font-heading mb-10">
            How LeadNivesh Works in 60 Seconds
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="p-5 rounded-card bg-bg border border-border text-center space-y-2">
              <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center mx-auto">
                1
              </span>
              <h3 className="text-sm font-bold text-ink">Paste Message</h3>
              <p className="text-xs text-muted">
                Forwarded WhatsApp property description or buyer query paste karein.
              </p>
            </div>

            <div className="p-5 rounded-card bg-bg border border-border text-center space-y-2">
              <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center mx-auto">
                2
              </span>
              <h3 className="text-sm font-bold text-ink">AI Reads Specs</h3>
              <p className="text-xs text-muted">
                BHK, locality, canonical size, and price extracted automatically.
              </p>
            </div>

            <div className="p-5 rounded-card bg-bg border border-border text-center space-y-2">
              <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center mx-auto">
                3
              </span>
              <h3 className="text-sm font-bold text-ink">Instant Match</h3>
              <p className="text-xs text-muted">
                System matches inventory against active buyer leads with score grading.
              </p>
            </div>

            <div className="p-5 rounded-card bg-bg border border-border text-center space-y-2">
              <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center mx-auto">
                4
              </span>
              <h3 className="text-sm font-bold text-ink">Masked Flyer</h3>
              <p className="text-xs text-muted">
                Share client flyer with your agency watermark. Owner contacts stay 100% private.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-border px-4 bg-surface">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© 2026 LeadNivesh Broker OS. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="hover:text-ink">Pricing</Link>
            <Link to="/privacy" className="hover:text-ink">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-ink">Terms of Service</Link>
            <Link to="/contact" className="hover:text-ink">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
