import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, MessageSquare, CreditCard,
  FileText, UserCircle, LogOut, HeartHandshake, X, Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard',  path: '/client',           icon: LayoutDashboard, end: true },
  { name: 'Bookings',   path: '/client/bookings',  icon: Calendar },
  { name: 'Chat',       path: '/client/chat',      icon: MessageSquare },
  { name: 'Payments',   path: '/client/payments',  icon: CreditCard },
  { name: 'Notes',      path: '/client/notes',     icon: FileText },
  { name: 'Profile',    path: '/client/profile',   icon: UserCircle },
];

const SidebarContent = ({ user, logout, onClose }) => {
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Logo / portal title */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-sm">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Unfazed</span>
            <span className="block text-[10px] uppercase font-semibold text-teal-600 tracking-wider">Client Portal</span>
          </div>
        </div>

        {/* X button — mobile drawer only */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2 min-w-0">
            {/* Avatar: first letter */}
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-900 truncate">{user?.name || 'Client'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};

const ClientLayout = () => {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col h-screen fixed left-0 top-0 z-30">
        <SidebarContent user={user} logout={logout} />
      </aside>

      {/* ── Mobile overlay backdrop ──────────────────────────── */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer ───────────────────────────────────── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 flex flex-col z-50 transform transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent
          user={user}
          logout={logout}
          onClose={() => setDrawerOpen(false)}
        />
      </aside>

      {/* ── Main content area ───────────────────────────────── */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile sticky header with hamburger */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center px-4 gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Client Portal</span>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
