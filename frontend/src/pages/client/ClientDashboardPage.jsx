import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import {
  Calendar,
  MessageSquare,
  FileText,
  ChevronRight,
  HeartHandshake
} from 'lucide-react';

const statusVariant = (status) => {
  if (status === 'completed') return 'success';
  if (status === 'scheduled') return 'warning';
  if (status === 'cancelled') return 'danger';
  if (status === 'no_show') return 'danger';
  return 'neutral';
};

const ClientDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, notesRes] = await Promise.all([
          api.get('/sessions/mine'),
          api.get('/notes/shared')
        ]);
        if (sessionsRes.data.success) {
          setSessions(sessionsRes.data.sessions || []);
        }
        if (notesRes.data.success) {
          setNotes(notesRes.data.notes || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const recentSessions = sessions.slice(0, 3);
  const recentNotes = notes.slice(0, 2);
  const therapist = user?.therapist || user?.therapistId;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider block mb-1">
            Dashboard
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
          {therapist?.name && (
            <p className="text-xs text-slate-500 mt-1">
              Therapy with <span className="font-semibold text-slate-700">{therapist.name}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
          <HeartHandshake className="w-4 h-4 text-emerald-600" />
          <span>Your wellness journey continues</span>
        </div>
      </div>

      {/* Therapist Card */}
      {therapist?.name && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Your Therapist</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-600 to-teal-800 text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
              {therapist.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">{therapist.name}</p>
              {therapist.title && (
                <p className="text-xs text-teal-600 font-semibold">{therapist.title}</p>
              )}
            </div>
            <button
              onClick={() => navigate('/client/chat')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Message Therapist
            </button>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Sessions</h2>
            <p className="text-xs text-slate-500">Your latest therapy sessions</p>
          </div>
          <Link
            to="/client/bookings"
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading...</div>
        ) : recentSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentSessions.map((session) => (
              <div
                key={session._id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium">{session.date}</span>
                  </div>
                  <Badge variant={statusVariant(session.status)}>
                    {session.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {session.startTime}
                  {session.endTime ? ` – ${session.endTime}` : ''}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No sessions yet</p>
          </div>
        )}
      </div>

      {/* Recent Shared Notes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Shared Notes</h2>
            <p className="text-xs text-slate-500">Latest session summaries from your therapist</p>
          </div>
          <Link
            to="/client/notes"
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading...</div>
        ) : recentNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentNotes.map((note) => (
              <div
                key={note._id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">{note.title}</h3>
                  <span className="text-[11px] text-slate-400">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line leading-relaxed line-clamp-3">
                  {note.body || 'No summary text provided.'}
                </div>
                {note.sessionId && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Session: {note.sessionId.date}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No shared notes yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboardPage;
