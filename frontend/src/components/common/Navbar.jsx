import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Menu } from 'lucide-react';

const Navbar = ({ pageTitle = 'Dashboard', onMenuToggle }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger — hidden on desktop */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight truncate max-w-[180px] sm:max-w-none">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {user?.slug && (
          <a
            href={`/${user.slug}`}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg hover:bg-primary-100 transition-colors border border-primary-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
            unfazed.in/{user.slug}
          </a>
        )}

        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
          </div>
          <div className="hidden md:block text-left">
            <span className="block text-xs font-semibold text-slate-800 leading-tight">{user?.name}</span>
            <span className="block text-[10px] text-slate-400 capitalize">{user?.role?.toLowerCase()}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
