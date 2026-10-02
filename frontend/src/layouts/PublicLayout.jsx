import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield, Heart, HelpCircle, Bug } from 'lucide-react';
import FeedbackModal from '../components/common/FeedbackModal';

const PublicLayout = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('support');

  const openFeedback = (type) => {
    setFeedbackType(type);
    setFeedbackOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Minimal Top Brand Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
              U
            </div>
            <span className="font-bold text-slate-800 tracking-tight text-base">Unfazed</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-600 hover:text-primary-600 px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold bg-primary-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-primary-700 transition-colors shadow-xs"
            >
              For Therapists
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer with Compliance & Support Links */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary-600 text-white flex items-center justify-center font-bold text-xs">
                U
              </div>
              <span className="font-bold text-slate-900">Unfazed Practice Management SaaS</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-slate-600">
              <Link to="/privacy" className="hover:text-primary-600 hover:underline">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-primary-600 hover:underline">
                Terms of Service
              </Link>
              <button
                type="button"
                onClick={() => openFeedback('support')}
                className="hover:text-primary-600 hover:underline inline-flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5 text-primary-500" /> Contact Support
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

          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
            <p>© {new Date().getFullYear()} Unfazed Health Technologies. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-slate-500">
                <Shield className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit TLS Encrypted
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> Dedicated to Mental Health Practitioners
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Feedback & Bug Report Modal */}
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        defaultType={feedbackType}
      />
    </div>
  );
};

export default PublicLayout;

