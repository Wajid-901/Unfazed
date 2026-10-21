import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import api from '../../api/axios';
import {
  Sparkles,
  Menu,
  Bell,
  CheckCheck,
  Calendar,
  CreditCard,
  MessageSquare,
  Info,
  Clock
} from 'lucide-react';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'BOOKING':
      return <Calendar className="w-3.5 h-3.5 text-brand-600" />;
    case 'PAYMENT':
      return <CreditCard className="w-3.5 h-3.5 text-emerald-600" />;
    case 'CHAT':
      return <MessageSquare className="w-3.5 h-3.5 text-accent-500" />;
    default:
      return <Info className="w-3.5 h-3.5 text-blue-500" />;
  }
};

const Navbar = ({ pageTitle = 'Dashboard', onMenuToggle }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Listen for real-time notifications
    const token = localStorage.getItem('unfazed_token');
    const socketUrl = import.meta.env.VITE_API_URL?.startsWith('http')
      ? new URL(import.meta.env.VITE_API_URL).origin
      : 'http://localhost:5000';

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('new_notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Notifications Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 rounded-lg text-[#6B6860] hover:text-[#1C1C1A] hover:bg-brand-50 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-accent-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E8E4DC] shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-4 border-b border-[#E8E4DC] flex items-center justify-between bg-[#FAF8F4]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#1C1C1A]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-semibold bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={loading}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#E8E4DC]">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#6B6860]">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                      className={`p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                        notif.isRead ? 'bg-white hover:bg-brand-50/50' : 'bg-brand-50/40 hover:bg-brand-50'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-white border border-[#E8E4DC] flex-shrink-0 shadow-2xs">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-[#1C1C1A] truncate">
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#6B6860] line-clamp-2 mt-0.5">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-[#9C9890] mt-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
