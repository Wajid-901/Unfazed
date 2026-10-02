import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import {
  Calendar,
  Clock,
  FileText,
  ShieldCheck,
  CreditCard,
  HeartHandshake,
  Lock
} from 'lucide-react';

const ClientPortalPage = () => {
  const { user } = useAuth();
  const [sharedNotes, setSharedNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        const { data } = await api.get('/notes/shared');
        if (data.success) {
          setSharedNotes(data.notes || []);
        }
      } catch (err) {
        console.error('Failed to load shared portal notes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider block mb-1">
            Client Portal
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your therapy session summaries, care plan, and resources shared by your therapist.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Confidential & HIPAA-Aligned Portal</span>
        </div>
      </div>

      {/* Shared Notes & Summaries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Shared Session Notes & Takeaways</h2>
            <p className="text-xs text-slate-500">
              Only clinical summaries explicitly shared by your therapist appear here.
            </p>
          </div>
          <Badge variant="success">Client Shared Only</Badge>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading shared records...</div>
        ) : sharedNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sharedNotes.map((note) => (
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

                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line leading-relaxed">
                  {note.body || 'No summary text provided.'}
                </div>

                {note.sessionId && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Session Date: {note.sessionId.date} ({note.sessionId.startTime})</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No shared notes yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              When your therapist creates notes or homework exercises for you, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPortalPage;
