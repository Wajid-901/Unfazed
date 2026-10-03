import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, FileText, CreditCard,
  UserCheck, ExternalLink, ShieldCheck, LogOut, Zap, HelpCircle,
  BarChart3, MessageSquare, X
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

export const useSidebar = () => {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
};

const SidebarContent = ({ user, logout, onClose }) => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="h-16 flex items-center px-6 border-b border-[#E8E4DC] justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            U
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#1C1C1A]">Unfazed</span>
            <span className="block text-[10px] uppercase font-semibold text-brand-500 tracking-wider">Therapist SaaS</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-md text-[#9C9890] hover:text-[#1C1C1A] hover:bg-brand-50">
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
                    ? 'bg-brand-50 text-brand-600 font-semibold border-l-2 border-accent-500'
                    : 'text-[#6B6860] hover:bg-[#F2EFE9] hover:text-[#1C1C1A]'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        {user?.slug && (
          <div className="pt-4 mt-4 border-t border-[#E8E4DC]">
            <a
              href={`/${user.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#9C9890] hover:bg-brand-50 hover:text-brand-500 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
                View Public Clinic
              </span>
              <span className="text-[10px] bg-[#F2EFE9] px-1.5 py-0.5 rounded text-[#6B6860]">Live</span>
            </a>
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-[#E8E4DC] bg-[#F2EFE9]/50 flex-shrink-0">
        <div className="p-3 rounded-lg bg-white border border-[#E8E4DC] shadow-sm mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#1C1C1A]">Plan: {user?.subscriptionPlan || 'FREE'}</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Active
            </span>
          </div>
          <NavLink to="/dashboard/subscription" className="text-[11px] text-accent-500 hover:underline font-medium inline-block">
            Manage subscription →
          </NavLink>
        </div>

        <div className="flex items-center justify-between px-2 pt-1 border-t border-[#E8E4DC]/50 mt-1">
          <div className="truncate pr-2">
            <p className="text-xs font-medium text-[#1C1C1A] truncate">{user?.name || 'Therapist'}</p>
            <p className="text-[11px] text-[#9C9890] truncate">{user?.email}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              title="Help & Bug Report"
              className="text-[#9C9890] hover:text-brand-500 p-1.5 rounded-md hover:bg-brand-50 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              title="Log Out"
              className="text-[#9C9890] hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
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
      <aside className="hidden lg:flex w-64 bg-white border-r border-[#E8E4DC] flex-col h-screen fixed left-0 top-0 z-30">
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
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white border-r border-[#E8E4DC] flex flex-col z-50 transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent user={user} logout={logout} onClose={onClose} />
      </aside>
    </>
  );
};

export default Sidebar;
