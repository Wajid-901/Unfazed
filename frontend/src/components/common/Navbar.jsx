import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Navbar = ({ pageTitle = 'Dashboard' }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Public Link */}
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

        {/* User Pill */}
        <div className="flex items-center gap-3 pl-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold text-xs flex items-center justify-center">
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
