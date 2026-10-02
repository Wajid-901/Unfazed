import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ShieldCheck
} from 'lucide-react';

const BookingPage = () => {
  const { slug } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Client booking form
  const [clientForm, setClientForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    presentingConcern: ''
  });

  // Fetch therapist info
  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const { data } = await api.get(`/public/therapist/${slug}`);
        if (data.success) {
          setTherapist(data.therapist);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTherapist();
  }, [slug]);

  // Fetch available slots when date changes
  useEffect(() => {
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot(null);
      setError('');
      try {
        const { data } = await api.get(`/public/therapist/${slug}/slots?date=${selectedDate}`);
        if (data.success) {
          setAvailableSlots(data.availableSlots || []);
        }
      } catch (err) {
        console.error('Failed to load slots:', err);
        setError('Failed to load time slots for this date.');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [slug, selectedDate]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select an available time slot.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...clientForm,
        date: selectedDate,
        startTime: selectedSlot.start
      };

      const { data } = await api.post(`/public/therapist/${slug}/book`, payload);
      if (data.success) {
        setConfirmedBooking(data.booking);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Slot may already be taken.');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate next 10 days for fast date pill selection
  const nextDays = Array.from({ length: 10 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' })
    };
  });

  if (confirmedBooking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">Appointment Confirmed!</h2>
          <p className="text-xs text-slate-500 mt-1">
            Your therapy session with <strong>{therapist?.name}</strong> has been scheduled.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-left space-y-3 text-xs">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-400">Date & Time:</span>
            <span className="font-semibold text-slate-800">
              {confirmedBooking.date} at {confirmedBooking.startTime} ({confirmedBooking.duration} mins)
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-400">Therapist:</span>
            <span className="font-semibold text-slate-800">{therapist?.name}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-400">Client:</span>
            <span className="font-semibold text-slate-800">{confirmedBooking.client.name}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-400">Fee:</span>
            <span className="font-semibold text-slate-800">₹{confirmedBooking.amount} (Payment on confirmation)</span>
          </div>

          <div className="flex justify-between pt-1">
            <span className="text-slate-400">Clinic Address / Mode:</span>
            <span className="font-semibold text-slate-800">{therapist?.clinicAddress || 'Telehealth Online'}</span>
          </div>
        </div>

        <div className="pt-2">
          <Link
            to={`/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:underline"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Therapist Clinic
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to={`/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to {therapist?.name || 'Clinic'} Profile
        </Link>
      </div>

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Book a Therapy Session</h1>
        <p className="text-xs text-slate-500 mt-1">
          Select a date and available time slot to schedule with <strong>{therapist?.name}</strong>.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Date Selector Pills */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          1. Select Date
        </span>
        <div className="flex gap-2.5 overflow-x-auto pb-2">
          {nextDays.map((d) => (
            <button
              key={d.iso}
              type="button"
              onClick={() => setSelectedDate(d.iso)}
              className={`p-3 rounded-xl border flex flex-col items-center min-w-[70px] transition-all ${
                selectedDate === d.iso
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm scale-105'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-[11px] font-medium opacity-80">{d.dayName}</span>
              <span className="text-base font-bold my-0.5">{d.dayNumber}</span>
              <span className="text-[10px] opacity-70">{d.month}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Slot Picker */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          2. Available Time Slots for {selectedDate}
        </span>

        {loadingSlots ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading available slots...</div>
        ) : availableSlots.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {availableSlots.map((slot, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-all ${
                  selectedSlot?.start === slot.start
                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-primary-400 hover:bg-primary-50/50'
                }`}
              >
                {slot.start} – {slot.end}
              </button>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
            No slots available on this date. Please choose another day from the calendar above.
          </div>
        )}
      </div>

      {/* 3. Client Information & Booking Form */}
      <form onSubmit={handleBooking} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
          3. Your Information
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
            <input
              type="text"
              required
              value={clientForm.clientName}
              onChange={(e) => setClientForm({ ...clientForm, clientName: e.target.value })}
              placeholder="e.g. Priya Sharma"
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={clientForm.clientEmail}
              onChange={(e) => setClientForm({ ...clientForm, clientEmail: e.target.value })}
              placeholder="priya@example.com"
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={clientForm.clientPhone}
              onChange={(e) => setClientForm({ ...clientForm, clientPhone: e.target.value })}
              placeholder="+91 9876543210"
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              What brings you to therapy? (Optional)
            </label>
            <input
              type="text"
              value={clientForm.presentingConcern}
              onChange={(e) => setClientForm({ ...clientForm, presentingConcern: e.target.value })}
              placeholder="e.g. Work stress, sleep issues, grief"
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Encrypted transmission. Your intake details are kept strictly confidential.</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            disabled={!selectedSlot}
            className="sm:w-auto w-full"
          >
            {selectedSlot ? `Confirm Booking for ${selectedSlot.start}` : 'Select a Slot to Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BookingPage;
