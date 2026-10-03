import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import { Calendar, Clock, Video, ExternalLink } from 'lucide-react';

const sessionStatusVariant = (status) => {
  if (status === 'completed') return 'success';
  if (status === 'scheduled') return 'warning';
  if (status === 'cancelled') return 'danger';
  if (status === 'no_show') return 'danger';
  return 'neutral';
};

const paymentStatusVariant = (status) => {
  if (status === 'paid') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'failed') return 'danger';
  if (status === 'refunded') return 'neutral';
  return 'neutral';
};

const ClientBookingsPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data } = await api.get('/sessions/mine');
        if (data.success) {
          const sorted = (data.sessions || []).sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          setSessions(sorted);
        }
      } catch (err) {
        console.error('Failed to load sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-xs p-6 sm:p-8">
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider block mb-1">
          Sessions
        </span>
        <h1 className="text-2xl font-bold text-[#1C1C1A]">Your Bookings</h1>
        <p className="text-xs text-[#6B6860] mt-1">
          All your scheduled and past therapy sessions
        </p>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#6B6860]">Loading your sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E8E4DC]">
          <Calendar className="w-10 h-10 text-[#C8C4BC] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#1C1C1A]">No sessions found</p>
          <p className="text-xs text-[#6B6860] mt-1">
            Your booked sessions will appear here once scheduled.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const therapistName =
              session.therapistId?.name || session.therapistName || 'Therapist';
            const canJoin =
              session.meetingLink && session.status === 'scheduled';

            return (
              <div
                key={session._id}
                className="bg-white rounded-xl border border-[#E8E4DC] shadow-xs p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Date & time */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#1C1C1A]">
                      <Calendar className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#6B6860]">
                      <Clock className="w-3.5 h-3.5 text-[#6B6860] flex-shrink-0" />
                      <span>
                        {session.startTime}
                        {session.endTime ? ` – ${session.endTime}` : ''}
                        {session.duration ? ` · ${session.duration} min` : ''}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6860] pl-0.5">
                      Therapist:{' '}
                      <span className="font-semibold text-[#1C1C1A]">{therapistName}</span>
                    </p>
                  </div>

                  {/* Right: Badges & action */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={sessionStatusVariant(session.status)}>
                      {session.status?.replace('_', ' ')}
                    </Badge>
                    {session.paymentStatus && (
                      <Badge variant={paymentStatusVariant(session.paymentStatus)}>
                        {session.paymentStatus}
                      </Badge>
                    )}
                    {canJoin && (
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-accent-500 text-white px-3 py-1.5 rounded-lg hover:bg-accent-600 transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Session
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientBookingsPage;
