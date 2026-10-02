import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Calendar as CalendarIcon, Clock, Plus, Check, AlertCircle, Trash2 } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CalendarPage = () => {
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'availability'
  const [sessions, setSessions] = useState([]);
  const [clients, setClients] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New session modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    duration: 50,
    amount: 1500
  });

  const fetchData = async () => {
    try {
      const [sessRes, availRes, clientRes] = await Promise.all([
        api.get('/sessions'),
        api.get('/therapist/availability'),
        api.get('/clients?limit=100')
      ]);

      if (sessRes.data.success) setSessions(sessRes.data.sessions);
      if (availRes.data.success) setAvailability(availRes.data.availability);
      if (clientRes.data.success) setClients(clientRes.data.clients);
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDayToggle = (dayOfWeek) => {
    const updated = availability.weeklySchedule.map((d) => {
      if (d.dayOfWeek === dayOfWeek) {
        return {
          ...d,
          isActive: !d.isActive,
          slots: !d.isActive && (!d.slots || d.slots.length === 0)
            ? [{ start: '09:00', end: '17:00' }]
            : d.slots
        };
      }
      return d;
    });
    setAvailability({ ...availability, weeklySchedule: updated });
  };

  const handleSlotTimeChange = (dayOfWeek, field, val) => {
    const updated = availability.weeklySchedule.map((d) => {
      if (d.dayOfWeek === dayOfWeek) {
        const slots = [...d.slots];
        if (!slots[0]) slots[0] = { start: '09:00', end: '17:00' };
        slots[0][field] = val;
        return { ...d, slots };
      }
      return d;
    });
    setAvailability({ ...availability, weeklySchedule: updated });
  };

  const handleSaveAvailability = async () => {
    try {
      await api.put('/therapist/availability', availability);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save availability:', err);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sessions', newSession);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book slot');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex rounded-xl bg-slate-200/80 p-1 border border-slate-300/40">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'bookings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Scheduled Appointments ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'availability' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Working Hours & Slots
          </button>
        </div>

        {activeTab === 'bookings' && (
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> Book Client Slot
          </Button>
        )}
      </div>

      {activeTab === 'bookings' ? (
        /* Bookings List */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Upcoming & Past Appointments</h3>
            <span className="text-xs text-slate-500">Sorted by date</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading appointments...</div>
          ) : sessions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {sessions.map((sess) => (
                <div key={sess._id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-700 flex flex-col items-center justify-center font-bold">
                      <span className="text-xs">{sess.date.split('-').slice(1).join('/')}</span>
                      <span className="text-[11px] text-primary-500 font-normal">{sess.startTime}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{sess.clientId?.name || 'Client'}</h4>
                      <p className="text-xs text-slate-400">
                        {sess.clientId?.email} • {sess.clientId?.phone || 'No phone'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={sess.status === 'completed' ? 'success' : 'primary'}>
                      {sess.status}
                    </Badge>
                    <Badge variant={sess.paymentStatus === 'paid' ? 'success' : 'warning'}>
                      ₹{sess.amount} • {sess.paymentStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">No appointments scheduled yet</p>
              <p className="text-xs text-slate-400 mt-1">Use "Book Client Slot" or share your clinic link.</p>
            </div>
          )}
        </div>
      ) : (
        /* Availability Configuration (US-005) */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6 max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Availability Schedule</h3>
              <p className="text-xs text-slate-500">
                Define the recurring hours clients can book on your public profile.
              </p>
            </div>
            {saveSuccess && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 0].map((dayIdx) => {
              const daySchedule = availability?.weeklySchedule?.find((d) => d.dayOfWeek === dayIdx) || {
                dayOfWeek: dayIdx,
                isActive: false,
                slots: [{ start: '09:00', end: '17:00' }]
              };
              const slot = daySchedule.slots?.[0] || { start: '09:00', end: '17:00' };

              return (
                <div
                  key={dayIdx}
                  className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    daySchedule.isActive ? 'bg-white border-slate-200' : 'bg-slate-50/70 border-slate-100 opacity-60'
                  }`}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={daySchedule.isActive}
                      onChange={() => handleDayToggle(dayIdx)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-xs font-bold text-slate-800 w-24">{DAYS[dayIdx]}</span>
                  </label>

                  {daySchedule.isActive ? (
                    <div className="flex items-center gap-2 text-xs">
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => handleSlotTimeChange(dayIdx, 'start', e.target.value)}
                        className="px-2 py-1 border border-slate-300 rounded-md text-slate-700"
                      />
                      <span className="text-slate-400">to</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => handleSlotTimeChange(dayIdx, 'end', e.target.value)}
                        className="px-2 py-1 border border-slate-300 rounded-md text-slate-700"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Day Off / Unavailable</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button onClick={handleSaveAvailability} variant="primary">
              Save Working Hours
            </Button>
          </div>
        </div>
      )}

      {/* Manual Slot Booking Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Session for Client">
        <form onSubmit={handleCreateSession} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Client</label>
            <select
              required
              value={newSession.clientId}
              onChange={(e) => setNewSession({ ...newSession, clientId: e.target.value })}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">-- Choose a client --</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={newSession.date}
                onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={newSession.startTime}
                onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Mins)</label>
              <input
                type="number"
                value={newSession.duration}
                onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Session Fee (₹)</label>
              <input
                type="number"
                value={newSession.amount}
                onChange={(e) => setNewSession({ ...newSession, amount: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm Booking
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CalendarPage;
