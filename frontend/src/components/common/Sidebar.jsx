import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, FileText, CreditCard,
  UserCheck, ExternalLink, ShieldCheck, LogOut, Zap, HelpCircle,
  BarChart3, MessageSquare, X, Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FeedbackModal from './FeedbackModal';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar & Bookings', path: '/dashboard/calendar', icon: Calendar },
  { name: 'Clients (CRM)', path: '/dashboard/clients', icon: Users },
  { name: 'Clinical Notes', path: '/dashboard/notes', icon: FileText },
  { name: 'Direct Chat', path: '/dashboard/chat', icon: MessageSquare },
  { name: 'Payments & Billing', path: '/dashboard/payments', icon: CreditCard },
  { name: 'Practice Analytics', path: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Subscription & Plans', path: '/dashboard/subscription', icon: Zap },
  { name: 'Profile & Clinic', path: '/dashboard/profile', icon: UserCheck }
];

// Exported so TherapistLayout can toggle it on mobile
export const useSidebar = () => {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
};

const SidebarContent = ({ user, logout, onClose }) => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="h-16 flex items-center px-6 border-b border-slate-100 justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            U
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Unfazed</span>
            <span className="block text-[10px] uppercase font-semibold text-primary-600 tracking-wider">Therapist SaaS</span>
          </div>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

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

      <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="p-3 rounded-lg bg-white border border-slate-200/80 shadow-xs mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-700">Plan: {user?.subscriptionPlan || 'FREE'}</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Active
            </span>
          </div>
          <NavLink to="/dashboard/subscription" className="text-[11px] text-primary-600 hover:underline font-medium inline-block">
            Manage subscription →
          </NavLink>
        </div>

        <div className="flex items-center justify-between px-2 pt-1 border-t border-slate-200/50 mt-1">
          <div className="truncate pr-2">
            <p className="text-xs font-medium text-slate-900 truncate">{user?.name || 'Therapist'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              title="Help & Bug Report"
              className="text-slate-400 hover:text-primary-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              title="Log Out"
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} defaultType="support" />
    </>
  );
};

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col h-screen fixed left-0 top-0 z-30">
        <SidebarContent user={user} logout={logout} />
      </aside>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 flex flex-col z-50 transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent user={user} logout={logout} onClose={onClose} />
      </aside>
    </>
  );
};

export default Sidebar;
