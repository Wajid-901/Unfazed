import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  User,
  Calendar,
  FileText,
  Clock,
  ShieldCheck,
  ChevronLeft,
  Mail,
  Phone,
  AlertCircle
} from 'lucide-react';

const ClientDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions', 'notes', 'intake'

  useEffect(() => {
    const fetchClientDetail = async () => {
      try {
        const res = await api.get(`/clients/${id}`);
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load client details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetail();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading client profile...</div>;
  }

  if (!data?.client) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-slate-700">Client record not found</p>
        <Link to="/dashboard/clients" className="mt-2 text-xs text-brand-500 underline">
          Return to clients
        </Link>
      </div>
    );
  }

  const { client, sessions = [], notes = [] } = data;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/dashboard/clients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Clients Directory
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-600 font-bold text-xl flex items-center justify-center">
            {client.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">{client.name}</h1>
              <Badge variant={client.status === 'active' ? 'success' : 'neutral'}>
                {client.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {client.email}
              </span>
              {client.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {client.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {client.tags?.map((tag, i) => (
            <Badge key={i} variant="primary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex rounded-xl bg-[#E8E4DC] p-1 border border-[#E8E4DC] w-fit">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'sessions' ? 'bg-white text-[#1C1C1A] shadow-sm' : 'text-[#6B6860] hover:text-[#1C1C1A]'
          }`}
        >
          Session History ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'notes' ? 'bg-white text-[#1C1C1A] shadow-sm' : 'text-[#6B6860] hover:text-[#1C1C1A]'
          }`}
        >
          Clinical Notes ({notes.length})
        </button>
        <button
          onClick={() => setActiveTab('intake')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'intake' ? 'bg-white text-[#1C1C1A] shadow-sm' : 'text-[#6B6860] hover:text-[#1C1C1A]'
          }`}
        >
          Intake & Consent Form
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-4 bg-slate-50/50 font-bold text-xs text-slate-700">
            Appointments & Attendance
          </div>
          {sessions.length > 0 ? (
            sessions.map((s) => (
              <div key={s._id} className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Session on {s.date} at {s.startTime}
                  </h4>
                  <p className="text-xs text-slate-400">Duration: {s.duration} mins • Amount: ₹{s.amount}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.status === 'completed' ? 'success' : 'primary'}>{s.status}</Badge>
                  <Badge variant={s.paymentStatus === 'paid' ? 'success' : 'warning'}>{s.paymentStatus}</Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">No session history yet.</div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-4 bg-slate-50/50 flex items-center justify-between font-bold text-xs text-slate-700">
            <span>Clinical Records</span>
            <Link to="/dashboard/notes" className="text-brand-500 hover:underline">
              Create Note →
            </Link>
          </div>
          {notes.length > 0 ? (
            notes.map((n) => (
              <div key={n._id} className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800">{n.title}</h4>
                  <Badge variant={n.visibility === 'SHARED' ? 'success' : 'neutral'}>
                    {n.visibility}
                  </Badge>
                </div>
                {n.type === 'SOAP' && n.soap ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div><strong>S (Subjective):</strong> <p className="text-slate-600 mt-0.5">{n.soap.subjective || 'N/A'}</p></div>
                    <div><strong>O (Objective):</strong> <p className="text-slate-600 mt-0.5">{n.soap.objective || 'N/A'}</p></div>
                    <div><strong>A (Assessment):</strong> <p className="text-slate-600 mt-0.5">{n.soap.assessment || 'N/A'}</p></div>
                    <div><strong>P (Plan):</strong> <p className="text-slate-600 mt-0.5">{n.soap.plan || 'N/A'}</p></div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600">{n.body || 'No content'}</p>
                )}
                <span className="text-[11px] text-slate-400 block">
                  Logged on {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">No clinical notes recorded yet.</div>
          )}
        </div>
      )}

      {activeTab === 'intake' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Intake Assessment & Legal Consent</h3>
            <p className="text-xs text-slate-500">Confidential medical history and signed therapeutic agreement.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
              <span className="font-bold text-slate-700 block">Presenting Concerns</span>
              <p className="text-slate-600">{client.intakeData?.presentingConcerns || 'Not specified'}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
              <span className="font-bold text-slate-700 block">Medical History</span>
              <p className="text-slate-600">{client.intakeData?.medicalHistory || 'No previous medical history recorded'}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
              <span className="font-bold text-slate-700 block">Emergency Contact</span>
              <p className="text-slate-600">
                {client.intakeData?.emergencyContactName || 'N/A'} (
                {client.intakeData?.emergencyContactPhone || 'No phone'})
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
              <span className="font-bold text-slate-700 block">Consent Agreement Status</span>
              {client.consentSignedAt ? (
                <div className="text-emerald-700 flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Consent Signed ({new Date(client.consentSignedAt).toLocaleDateString()})
                </div>
              ) : (
                <div className="text-amber-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Pending client signature
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetailPage;
