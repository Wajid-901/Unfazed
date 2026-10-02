import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield, Heart } from 'lucide-react';

const PublicLayout = () => {
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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Unfazed Practice Management SaaS. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit Encrypted
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> Built for Mental Health
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
