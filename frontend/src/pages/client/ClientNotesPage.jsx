import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FileText, Calendar } from 'lucide-react';

const ClientNotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const { data } = await api.get('/notes/shared');
        if (data.success) {
          setNotes(data.notes || []);
        }
      } catch (err) {
        console.error('Failed to load shared notes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-xs p-6 sm:p-8">
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider block mb-1">
          Notes
        </span>
        <h1 className="text-2xl font-bold text-[#1C1C1A]">Shared Session Notes</h1>
        <p className="text-xs text-[#6B6860] mt-1">
          Only clinical summaries explicitly shared by your therapist appear here.
        </p>
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#6B6860]">Loading shared notes...</div>
      ) : notes.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-[#E8E4DC]">
          <FileText className="w-10 h-10 text-[#C8C4BC] mx-auto mb-2" />
          <p className="text-sm font-medium text-[#1C1C1A]">No shared notes yet</p>
          <p className="text-xs text-[#6B6860] mt-1 max-w-sm mx-auto">
            When your therapist creates notes or homework exercises for you, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div
              key={note._id}
              className="bg-white rounded-xl border border-[#E8E4DC] shadow-xs p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1C1C1A]">{note.title}</h3>
                <span className="text-[11px] text-[#6B6860]">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="text-xs text-[#1C1C1A] bg-[#FAF8F4] p-3 rounded-lg border border-[#E8E4DC] whitespace-pre-line leading-relaxed">
                {note.body || 'No summary text provided.'}
              </div>

              {note.sessionId && (
                <div className="text-[11px] text-[#6B6860] flex items-center gap-1.5 pt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Session Date: {note.sessionId.date}
                    {note.sessionId.startTime ? ` (${note.sessionId.startTime})` : ''}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientNotesPage;
