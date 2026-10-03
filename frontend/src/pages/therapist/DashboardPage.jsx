import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Users, Calendar, Clock, FileEdit, ExternalLink, Plus, CheckCircle, Copy, ArrowRight } from 'lucide-react';
import Badge from '../../components/common/Badge';

const DashboardPage = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/therapist/dashboard')
      .then(({ data }) => { if (data.success) setOverview(data.overview); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const clinicUrl = `${window.location.origin}/${user?.slug}`;
  const handleCopyLink = () => {
    navigator.clipboard.writeText(clinicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-2">
            Practice Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back, {user?.name || 'Doctor'}</h1>
          <p className="mt-1 text-brand-200 text-sm max-w-xl">Here is what's happening in your private practice today.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col gap-2 w-full md:w-auto md:min-w-[280px]">
          <span className="text-xs text-brand-200 font-medium">Your Public Digital Clinic</span>
          <div className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2 text-xs">
            <span className="font-mono text-white truncate max-w-[190px]">{user?.slug ? `/${user.slug}` : 'No slug'}</span>
            <div className="flex items-center gap-1.5 ml-2">
              <button onClick={handleCopyLink} title="Copy clinic URL" className="p-1 rounded hover:bg-white/10 transition-colors text-white">
                {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a href={clinicUrl} target="_blank" rel="noreferrer" className="p-1 rounded hover:bg-white/10 transition-colors text-white">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Clients', value: overview?.totalClients || 0, sub: 'In your client directory', icon: Users, iconBg: 'bg-brand-50 text-brand-500' },
          { label: "Today's Sessions", value: overview?.todaySessionsCount || 0, sub: 'Scheduled for today', icon: Calendar, iconBg: 'bg-accent-50 text-accent-500' },
          { label: 'Upcoming Bookings', value: overview?.upcomingSessionsCount || 0, sub: 'Upcoming appointments', icon: Clock, iconBg: 'bg-amber-50 text-amber-600' },
          { label: 'Pending Notes', value: overview?.pendingNotesCount || 0, sub: 'Awaiting clinical records', icon: FileEdit, iconBg: 'bg-rose-50 text-rose-500' },
        ].map(({ label, value, sub, icon: Icon, iconBg }) => (
          <div key={label} className="bg-white p-5 rounded-xl border border-[#E8E4DC] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B6860] uppercase tracking-wider">{label}</span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-[#1C1C1A]">{value}</span>
              <p className="text-xs text-[#9C9890] mt-1">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Schedule + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E8E4DC] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#1C1C1A]">Today's Schedule</h2>
              <p className="text-xs text-[#6B6860]">Your booked therapy sessions for today</p>
            </div>
            <Link to="/dashboard/calendar" className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1">
              Full Calendar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="py-12 text-center text-xs text-[#9C9890]">Loading today's sessions...</div>
          ) : overview?.todaySessions?.length > 0 ? (
            <div className="divide-y divide-[#E8E4DC]">
              {overview.todaySessions.map((s) => (
                <div key={s._id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 font-bold text-xs flex items-center justify-center">{s.startTime}</div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1C1C1A]">{s.clientId?.name || 'Client'}</h4>
                      <p className="text-xs text-[#9C9890]">{s.duration} mins • {s.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.status === 'completed' ? 'success' : 'primary'}>{s.status}</Badge>
                    <Link to="/dashboard/notes" className="px-2.5 py-1 text-xs font-medium text-[#6B6860] hover:text-brand-500 hover:bg-brand-50 rounded border border-[#E8E4DC]">
                      Write Note
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-[#E8E4DC] rounded-lg">
              <Calendar className="w-8 h-8 text-[#E8E4DC] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#6B6860]">No sessions scheduled for today</p>
              <p className="text-xs text-[#9C9890] mt-1 max-w-sm mx-auto">Share your public clinic booking link with clients or manually add an appointment.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#E8E4DC] shadow-sm p-6">
          <h2 className="text-base font-bold text-[#1C1C1A] mb-3">Quick Actions</h2>
          <div className="space-y-2.5">
            {[
              { to: '/dashboard/clients', icon: Plus, label: 'Add New Client' },
              { to: '/dashboard/notes', icon: FileEdit, label: 'New SOAP Note' },
              { to: '/dashboard/calendar', icon: Clock, label: 'Set Weekly Availability' },
            ].map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} className="w-full flex items-center justify-between p-3 rounded-lg border border-[#E8E4DC] hover:border-brand-300 hover:bg-brand-50 transition-all text-xs font-semibold text-[#6B6860] hover:text-brand-600">
                <span className="flex items-center gap-2.5"><Icon className="w-4 h-4 text-accent-500" />{label}</span>
                <span>→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
