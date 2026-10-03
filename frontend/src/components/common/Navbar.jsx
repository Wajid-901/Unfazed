import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Menu } from 'lucide-react';

const Navbar = ({ pageTitle = 'Dashboard', onMenuToggle }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-[#E8E4DC] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-md text-[#6B6860] hover:text-[#1C1C1A] hover:bg-brand-50 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base sm:text-xl font-bold text-[#1C1C1A] tracking-tight truncate max-w-[180px] sm:max-w-none">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {user?.slug && (
          <a
            href={`/${user.slug}`}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-600 text-xs font-semibold rounded-lg hover:bg-brand-100 transition-colors border border-brand-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-500" />
            unfazed.in/{user.slug}
          </a>
        )}

        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
          </div>
          <div className="hidden md:block text-left">
            <span className="block text-xs font-semibold text-[#1C1C1A] leading-tight">{user?.name}</span>
            <span className="block text-[10px] text-[#9C9890] capitalize">{user?.role?.toLowerCase()}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
