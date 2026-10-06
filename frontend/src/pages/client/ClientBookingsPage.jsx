import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import RazorpayCheckout from '../../components/common/RazorpayCheckout';
import { Calendar, Clock, Video, ExternalLink, XCircle } from 'lucide-react';

const sessionStatusVariant = (status) => {
  if (status === 'completed') return 'success';
  if (status === 'scheduled') return 'warning';
  if (status === 'pending_approval') return 'warning';
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
  const [cancellingId, setCancellingId] = useState(null);

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

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCancelSession = async (sessionId) => {
    const isPendingSession = sessions.find((s) => s._id === sessionId)?.status === 'pending_approval';
    const confirmed = window.confirm(
      isPendingSession
        ? 'Are you sure you want to withdraw this booking request?'
        : 'Are you sure you want to cancel this session?'
    );
    if (!confirmed) return;

    setCancellingId(sessionId);
    try {
      const { data } = await api.patch(`/sessions/${sessionId}/cancel`, {
        reason: isPendingSession ? 'Booking request withdrawn by client' : 'Cancelled by client via portal'
      });
      if (data.success) {
        toast.success(isPendingSession ? 'Booking request withdrawn.' : 'Session cancelled successfully.');
        setSessions((prev) =>
          prev.map((s) => (s._id === sessionId ? { ...s, status: 'cancelled', cancelledBy: 'client' } : s))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel session.');
    } finally {
      setCancellingId(null);
    }
  };

  const handlePaymentSuccess = (payment) => {
    toast.success(`Payment of ₹${payment?.amount || ''} captured! Invoice: ${payment?.invoiceNumber || ''}`);
    fetchSessions();
  };

  const handlePaymentError = (errMsg) => {
    toast.error(errMsg || 'Payment failed or was cancelled.');
  };

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
            const canPay =
              session.paymentStatus === 'pending' && session.status === 'scheduled';
            const canCancel =
              session.status === 'scheduled' || session.status === 'pending_approval';
            const isPending = session.status === 'pending_approval';

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
                    {isPending && (
                      <p className="text-xs text-amber-600 pl-0.5">
                        Awaiting therapist confirmation. You'll receive an activation email once approved.
                      </p>
                    )}
                  </div>

                  {/* Right: Badges & actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={sessionStatusVariant(session.status)}>
                      {session.status?.replace(/_/g, ' ')}
                    </Badge>
                    {session.paymentStatus && (
                      <Badge variant={paymentStatusVariant(session.paymentStatus)}>
                        {session.paymentStatus}
                      </Badge>
                    )}

                    {canPay && (
                      <RazorpayCheckout
                        sessionId={session._id}
                        amount={session.amount}
                        currency={session.currency || 'INR'}
                        clientName={user?.name}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
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

                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => handleCancelSession(session._id)}
                        disabled={cancellingId === session._id}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        {cancellingId === session._id
                          ? (isPending ? 'Withdrawing...' : 'Cancelling...')
                          : (isPending ? 'Withdraw Request' : 'Cancel')}
                      </button>
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
