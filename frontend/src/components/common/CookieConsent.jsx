import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X, ShieldCheck } from 'lucide-react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('unfazed_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('unfazed_cookie_consent', 'accepted_all');
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('unfazed_cookie_consent', 'essential_only');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie preferences"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white/95 backdrop-blur-md border border-[#E8E4DC] shadow-2xl rounded-2xl p-5 text-[#1C1C1A] transition-all animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center flex-shrink-0">
            <Cookie className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-sm text-[#1C1C1A]">Cookie & Privacy Preferences</h2>
        </div>
        <button
          onClick={handleAcceptEssential}
          className="text-[#9C9890] hover:text-[#6B6860] transition-colors p-1"
          aria-label="Close cookie banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-[#6B6860] leading-relaxed mb-4">
        We use essential cookies to keep your session secure and optional analytics to improve clinical workflows. We never sell medical or therapeutic data.{' '}
        <Link to="/privacy" className="text-brand-500 font-semibold underline hover:text-brand-600">
          Learn more in our Privacy Policy
        </Link>
        .
      </p>

      <div className="flex items-center justify-end gap-2 text-xs">
        <button
          type="button"
          onClick={handleAcceptEssential}
          className="px-3 py-1.5 rounded-lg border border-[#E8E4DC] text-[#6B6860] font-semibold hover:bg-brand-50 transition-colors"
        >
          Essential Only
        </button>
        <button
          type="button"
          onClick={handleAcceptAll}
          className="px-4 py-1.5 rounded-lg bg-accent-500 text-white font-semibold hover:bg-accent-600 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Accept All
        </button>
      </div>
    </aside>
  );
};

export default CookieConsent;
