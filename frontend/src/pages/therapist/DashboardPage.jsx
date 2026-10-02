import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Users,
  Calendar,
  Clock,
  FileEdit,
  ExternalLink,
  Plus,
  CheckCircle,
  Copy,
  ArrowRight
} from 'lucide-react';
import Badge from '../../components/common/Badge';

const DashboardPage = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const { data } = await api.get('/therapist/dashboard');
        if (data.success) {
          setOverview(data.overview);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const clinicUrl = `${window.location.origin}/${user?.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(clinicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Clinic Share Bar */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-2">
            Practice Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || 'Doctor'}
          </h1>
          <p className="mt-1 text-primary-100 text-sm max-w-xl">
            Here is what's happening in your private practice today.
          </p>
        </div>

        {/* Public Clinic URL widget */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col gap-2 min-w-[280px]">
          <span className="text-xs text-primary-200 font-medium">Your Public Digital Clinic</span>
          <div className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2 text-xs">
            <span className="font-mono text-white truncate max-w-[190px]">{user?.slug ? `/${user.slug}` : 'No slug'}</span>
            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={handleCopyLink}
                title="Copy clinic URL"
                className="p-1 rounded hover:bg-white/10 transition-colors text-white"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={clinicUrl}
                target="_blank"
                rel="noreferrer"
                title="Open clinic website"
                className="p-1 rounded hover:bg-white/10 transition-colors text-white"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Clients</span>
            <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{overview?.totalClients || 0}</span>
            <p className="text-xs text-slate-400 mt-1">In your client directory</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Sessions</span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{overview?.todaySessionsCount || 0}</span>
            <p className="text-xs text-slate-400 mt-1">Scheduled for today</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming Bookings</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{overview?.upcomingSessionsCount || 0}</span>
            <p className="text-xs text-slate-400 mt-1">Upcoming appointments</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Notes</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileEdit className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{overview?.pendingNotesCount || 0}</span>
            <p className="text-xs text-slate-400 mt-1">Awaiting clinical records</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Today's Schedule</h2>
              <p className="text-xs text-slate-500">Your booked therapy sessions for today</p>
            </div>
            <Link
              to="/dashboard/calendar"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Full Calendar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading today's sessions...</div>
          ) : overview?.todaySessions?.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {overview.todaySessions.map((s) => (
                <div key={s._id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 font-bold text-xs flex items-center justify-center">
                      {s.startTime}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{s.clientId?.name || 'Client'}</h4>
                      <p className="text-xs text-slate-400">{s.duration} mins • {s.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.status === 'completed' ? 'success' : 'primary'}>
                      {s.status}
                    </Badge>
                    <Link
                      to="/dashboard/notes"
                      className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded border border-slate-200"
                    >
                      Write Note
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-lg">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">No sessions scheduled for today</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Share your public clinic booking link with clients or manually add an appointment from the calendar.
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions Panel (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <h2 className="text-base font-bold text-slate-900 mb-3">Quick Actions</h2>
            <div className="space-y-2.5">
              <Link
                to="/dashboard/clients"
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50/40 transition-all text-xs font-semibold text-slate-700 hover:text-primary-700"
              >
                <span className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-primary-600" />
                  Add New Client
                </span>
                <span>→</span>
              </Link>

              <Link
                to="/dashboard/notes"
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50/40 transition-all text-xs font-semibold text-slate-700 hover:text-primary-700"
              >
                <span className="flex items-center gap-2.5">
                  <FileEdit className="w-4 h-4 text-primary-600" />
                  New SOAP Note
                </span>
                <span>→</span>
              </Link>

              <Link
                to="/dashboard/calendar"
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50/40 transition-all text-xs font-semibold text-slate-700 hover:text-primary-700"
              >
                <span className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-primary-600" />
                  Set Weekly Availability
                </span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
