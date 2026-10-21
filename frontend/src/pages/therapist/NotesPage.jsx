import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import RichTextEditor from '../../components/common/RichTextEditor';
import {
  FileText,
  Lock,
  Eye,
  Plus,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templateType, setTemplateType] = useState('SOAP'); // 'SOAP' or 'DAP' or 'GENERAL'

  // New note form state
  const [form, setForm] = useState({
    clientId: '',
    sessionId: '',
    title: 'Clinical Progress Note',
    visibility: 'PRIVATE',
    soap: { subjective: '', objective: '', assessment: '', plan: '' },
    body: ''
  });

  const fetchData = async () => {
    try {
      const [notesRes, clientsRes, sessionsRes] = await Promise.all([
        api.get('/notes'),
        api.get('/clients?limit=100'),
        api.get('/sessions')
      ]);

      if (notesRes.data.success) setNotes(notesRes.data.notes);
      if (clientsRes.data.success) setClients(clientsRes.data.clients);
      if (sessionsRes.data.success) setSessions(sessionsRes.data.sessions);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notes', {
        ...form,
        type: templateType
      });
      setIsModalOpen(false);
      setForm({
        clientId: '',
        sessionId: '',
        title: 'Clinical Progress Note',
        visibility: 'PRIVATE',
        soap: { subjective: '', objective: '', assessment: '', plan: '' },
        body: ''
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save note');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Session Notes</h2>
          <p className="text-xs text-slate-500">
            Confidential HIPAA-inspired clinical records with SOAP/DAP templates and privacy controls.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> New Clinical Note
        </Button>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 bg-brand-50/60 border border-brand-100 rounded-xl flex items-start gap-3">
        <Lock className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700">
          <strong className="text-slate-900">Privacy Separation Guarantee:</strong> Notes marked as{' '}
          <span className="font-semibold text-rose-600">PRIVATE</span> are encrypted and only accessible in your therapist dashboard. Only notes marked as{' '}
          <span className="font-semibold text-emerald-600">SHARED</span> are visible to clients in their portal.
        </div>
      </div>

      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-xs text-slate-400">Loading notes...</div>
        ) : notes.length > 0 ? (
          notes.map((note) => (
            <div
              key={note._id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{note.title}</h3>
                  <span className="text-xs text-slate-500">Client: {note.clientId?.name || 'Client'}</span>
                </div>
                <Badge variant={note.visibility === 'SHARED' ? 'success' : 'neutral'}>
                  {note.visibility === 'SHARED' ? (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-emerald-600" /> Shared with Client
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500" /> Private Therapist Only
                    </span>
                  )}
                </Badge>
              </div>

              {note.type === 'SOAP' && note.soap && (
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-700 block">S (Subjective):</span>
                    <p className="text-slate-600 line-clamp-2">{note.soap.subjective || '-'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">O (Objective):</span>
                    <p className="text-slate-600 line-clamp-2">{note.soap.objective || '-'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">A (Assessment):</span>
                    <p className="text-slate-600 line-clamp-2">{note.soap.assessment || '-'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">P (Plan):</span>
                    <p className="text-slate-600 line-clamp-2">{note.soap.plan || '-'}</p>
                  </div>
                </div>
              )}

              {note.body && (
                <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {note.body}
                </p>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Logged: {new Date(note.createdAt).toLocaleDateString()}</span>
                <span className="font-mono uppercase text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                  {note.type}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No clinical notes recorded yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Create your first clinical note using the SOAP template.
            </p>
          </div>
        )}
      </div>

      {/* New Note Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Clinical Progress Note"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateNote} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Select Client</label>
              <select
                required
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full text-xs border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none bg-[#FAF8F4]"
              >
                <option value="">-- Choose client --</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Related Session</label>
              <select
                required
                value={form.sessionId}
                onChange={(e) => setForm({ ...form, sessionId: e.target.value })}
                className="w-full text-xs border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none bg-[#FAF8F4]"
              >
                <option value="">-- Choose session --</option>
                {sessions.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.date} ({s.startTime})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Template Format</label>
              <div className="flex gap-2">
                {['SOAP', 'GENERAL'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTemplateType(type)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      templateType === type
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white text-[#6B6860] border-[#E8E4DC] hover:bg-brand-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Visibility Level</label>
              <select
                value={form.visibility}
                onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                className="w-full text-xs border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none bg-[#FAF8F4]"
              >
                <option value="PRIVATE">PRIVATE (Only Therapist)</option>
                <option value="SHARED">SHARED (Client Portal Accessible)</option>
              </select>
            </div>
          </div>

          {templateType === 'SOAP' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">S – Subjective</label>
                <textarea
                  rows="2"
                  value={form.soap.subjective}
                  onChange={(e) => setForm({ ...form, soap: { ...form.soap, subjective: e.target.value } })}
                  placeholder="Client's reported mood, feelings, symptoms, or statements..."
                  className="w-full text-xs border border-[#E8E4DC] rounded-lg p-2 outline-none bg-[#FAF8F4]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">O – Objective</label>
                <textarea
                  rows="2"
                  value={form.soap.objective}
                  onChange={(e) => setForm({ ...form, soap: { ...form.soap, objective: e.target.value } })}
                  placeholder="Therapist's clinical observations, affect, speech, behavior..."
                  className="w-full text-xs border border-[#E8E4DC] rounded-lg p-2 outline-none bg-[#FAF8F4]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">A – Assessment</label>
                <textarea
                  rows="2"
                  value={form.soap.assessment}
                  onChange={(e) => setForm({ ...form, soap: { ...form.soap, assessment: e.target.value } })}
                  placeholder="Clinical evaluation, progress, themes explored..."
                  className="w-full text-xs border border-[#E8E4DC] rounded-lg p-2 outline-none bg-[#FAF8F4]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">P – Plan</label>
                <textarea
                  rows="2"
                  value={form.soap.plan}
                  onChange={(e) => setForm({ ...form, soap: { ...form.soap, plan: e.target.value } })}
                  placeholder="Interventions, homework, goals for next session..."
                  className="w-full text-xs border border-[#E8E4DC] rounded-lg p-2 outline-none bg-[#FAF8F4]"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Session Summary (Rich Text)</label>
              <RichTextEditor
                value={form.body}
                onChange={(html) => setForm({ ...form, body: html })}
                placeholder="Write formatted clinical observations, insights, and takeaways..."
              />
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Clinical Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NotesPage;
