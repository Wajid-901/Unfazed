import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield, Heart, HelpCircle, Bug, Menu, X } from 'lucide-react';
import FeedbackModal from '../components/common/FeedbackModal';

const PublicLayout = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('support');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const openFeedback = (type) => {
    setFeedbackType(type);
    setFeedbackOpen(true);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top Nav */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-[#E8E4DC] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
              U
            </div>
            <span className="font-bold text-[#1C1C1A] tracking-tight text-base">Unfazed</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/therapists"
              className="text-xs font-semibold text-[#6B6860] hover:text-accent-500 px-3 py-1.5 transition-colors"
            >
              Find a Therapist
            </Link>
            <Link
              to="/login"
              className="text-xs font-semibold text-[#6B6860] hover:text-brand-500 px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold bg-accent-500 text-white px-3.5 py-1.5 rounded-lg hover:bg-accent-600 transition-colors shadow-sm"
            >
              For Therapists
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 rounded-md text-[#6B6860] hover:bg-brand-50"
            onClick={() => setMobileNavOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile nav drawer */}
        {mobileNavOpen && (
          <div className="md:hidden bg-white border-t border-[#E8E4DC] px-4 py-4 flex flex-col gap-3">
            <Link
              to="/therapists"
              className="text-sm font-semibold text-accent-600 hover:text-accent-700 py-2 border-b border-[#E8E4DC]"
              onClick={() => setMobileNavOpen(false)}
            >
              Find a Therapist
            </Link>
            <Link
              to="/login"
              className="text-sm font-semibold text-[#6B6860] hover:text-brand-500 py-2 border-b border-[#E8E4DC]"
              onClick={() => setMobileNavOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 text-center"
              onClick={() => setMobileNavOpen(false)}
            >
              For Therapists
            </Link>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8E4DC] py-8 text-xs text-[#9C9890]">
        <div className="max-w-6xl mx-auto px-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-brand-500 text-white flex items-center justify-center font-bold text-xs">
                U
              </div>
              <span className="font-bold text-[#1C1C1A]">Unfazed Practice Management SaaS</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-[#6B6860]">
              <Link to="/privacy" className="hover:text-brand-500 hover:underline">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-brand-500 hover:underline">
                Terms of Service
              </Link>
              <button
                type="button"
                onClick={() => openFeedback('support')}
                className="hover:text-brand-500 hover:underline inline-flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5 text-brand-400" /> Contact Support
              </button>
              <button
                type="button"
                onClick={() => openFeedback('bug')}
                className="hover:text-rose-600 hover:underline inline-flex items-center gap-1"
              >
                <Bug className="w-3.5 h-3.5 text-rose-500" /> Report a Bug
              </button>
            </div>
          </div>

          <div className="border-t border-[#E8E4DC] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#9C9890]">
            <p>© {new Date().getFullYear()} Unfazed Health Technologies. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-[#6B6860]">
                <Shield className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit TLS Encrypted
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#6B6860]">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> Dedicated to Mental Health Practitioners
              </span>
            </div>
          </div>
        </div>
      </footer>

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        defaultType={feedbackType}
      />
    </div>
  );
};

export default PublicLayout;
