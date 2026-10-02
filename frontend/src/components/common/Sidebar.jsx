import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  CreditCard,
  UserCheck,
  ExternalLink,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendar & Bookings', path: '/dashboard/calendar', icon: Calendar },
    { name: 'Clients (CRM)', path: '/dashboard/clients', icon: Users },
    { name: 'Clinical Notes', path: '/dashboard/notes', icon: FileText },
    { name: 'Subscription & Plans', path: '/dashboard/subscription', icon: CreditCard },
    { name: 'Profile & Clinic', path: '/dashboard/profile', icon: UserCheck }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            U
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Unfazed</span>
            <span className="block text-[10px] uppercase font-semibold text-primary-600 tracking-wider">Therapist SaaS</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        {/* Public Clinic Page Direct Link */}
        {user?.slug && (
          <div className="pt-4 mt-4 border-t border-slate-100">
            <a
              href={`/${user.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-primary-600 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-primary-500" />
                View Public Clinic
              </span>
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Live</span>
            </a>
          </div>
        )}
      </nav>

      {/* Subscription Tier & User Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 rounded-lg bg-white border border-slate-200/80 shadow-xs mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-700">Plan: {user?.subscriptionPlan || 'FREE'}</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Active
            </span>
          </div>
          <NavLink
            to="/dashboard/subscription"
            className="text-[11px] text-primary-600 hover:underline font-medium inline-block"
          >
            Manage subscription →
          </NavLink>
        </div>

        <div className="flex items-center justify-between px-2 pt-1">
          <div className="truncate pr-2">
            <p className="text-xs font-medium text-slate-900 truncate">{user?.name || 'Therapist'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
