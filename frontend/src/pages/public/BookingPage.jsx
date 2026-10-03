import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  Calendar as CalendarIcon, Clock, User, Mail, Phone,
  CheckCircle2, AlertCircle, ChevronLeft, ShieldCheck
} from 'lucide-react';

const BookingPage = () => {
  const { slug } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [clientForm, setClientForm] = useState({ clientName: '', clientEmail: '', clientPhone: '', presentingConcern: '' });
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [payingOnline, setPayingOnline] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    api.get(`/public/therapist/${slug}`).then(({ data }) => { if (data.success) setTherapist(data.therapist); }).catch(console.error);
  }, [slug]);

  useEffect(() => {
    setLoadingSlots(true); setSelectedSlot(null); setError('');
    api.get(`/public/therapist/${slug}/slots?date=${selectedDate}`)
      .then(({ data }) => { if (data.success) setAvailableSlots(data.availableSlots || []); })
      .catch(() => setError('Failed to load time slots for this date.'))
      .finally(() => setLoadingSlots(false));
  }, [slug, selectedDate]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) { setError('Please select an available time slot.'); return; }
    if (!consentAgreed) { setError('Please review and check the informed consent agreement.'); return; }
    setSubmitting(true); setError('');
    try {
      const { data } = await api.post(`/public/therapist/${slug}/book`, {
        ...clientForm, date: selectedDate, startTime: selectedSlot.start,
        consentAgreed: true, consentTimestamp: new Date().toISOString()
      });
      if (data.success) setConfirmedBooking(data.booking);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Slot may already be taken.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayNow = async () => {
    if (!confirmedBooking) return;
    setPayingOnline(true); setPaymentError('');
    try {
      const { data: orderData } = await api.post('/payments/create-order', { sessionId: confirmedBooking.sessionId });
      if (!orderData.success) throw new Error('Failed to initiate order.');
      const isSandboxPlaceholder = orderData.keyId.includes('placeholder');
      if (!isSandboxPlaceholder && window.Razorpay) {
        const options = {
          key: orderData.keyId, amount: orderData.amount * 100, currency: orderData.currency,
          name: therapist?.name || 'Unfazed Practice', description: `Therapy Consultation (${confirmedBooking.date})`,
          order_id: orderData.orderId,
          handler: async (response) => {
            const verifyRes = await api.post('/payments/verify', {
              orderId: response.razorpay_order_id, paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature, paymentRecordId: orderData.paymentRecordId
            });
            if (verifyRes.data.success) setPaymentSuccess(verifyRes.data.payment);
          },
          prefill: { name: confirmedBooking.client.name, email: confirmedBooking.client.email },
          theme: { color: '#c4622d' }
        };
        new window.Razorpay(options).open();
      } else {
        const { data: verifyRes } = await api.post('/payments/verify', {
          orderId: orderData.orderId, paymentId: `pay_mock_${Date.now()}`,
          signature: `mock_sig_${Date.now()}`, paymentRecordId: orderData.paymentRecordId
        });
        if (verifyRes.success) setPaymentSuccess(verifyRes.payment);
      }
    } catch (err) {
      setPaymentError(err.response?.data?.message || err.message || 'Payment initiation failed.');
    } finally {
      setPayingOnline(false);
    }
  };

  const nextDays = Array.from({ length: 10 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return { iso: d.toISOString().split('T')[0], dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), dayNumber: d.getDate(), month: d.toLocaleDateString('en-US', { month: 'short' }) };
  });

  const inputClass = "w-full text-xs border border-[#E8E4DC] rounded-lg p-2.5 focus:ring-2 focus:ring-brand-400 outline-none bg-[#FAF8F4]";

  if (confirmedBooking) return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-[#1C1C1A]">{paymentSuccess ? 'Payment & Appointment Confirmed!' : 'Appointment Reserved!'}</h2>
        <p className="text-xs text-[#6B6860] mt-1">Your therapy session with <strong>{therapist?.name}</strong> is scheduled.</p>
      </div>
      {paymentError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 text-left">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" /><span>{paymentError}</span>
        </div>
      )}
      <div className="bg-white p-6 rounded-2xl border border-[#E8E4DC] shadow-sm text-left space-y-3 text-xs">
        {[
          { label: 'Date & Time', value: `${confirmedBooking.date} at ${confirmedBooking.startTime} (${confirmedBooking.duration} mins)` },
          { label: 'Therapist', value: therapist?.name },
          { label: 'Client', value: confirmedBooking.client.name },
          { label: 'Session Fee', value: `₹${confirmedBooking.amount}` },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between border-b border-[#E8E4DC] pb-2">
            <span className="text-[#9C9890]">{label}:</span>
            <span className="font-semibold text-[#1C1C1A]">{value}</span>
          </div>
        ))}
        <div className="flex justify-between border-b border-[#E8E4DC] pb-2">
          <span className="text-[#9C9890]">Payment Status:</span>
          <Badge variant={paymentSuccess ? 'success' : 'warning'}>{paymentSuccess ? 'Paid Online' : 'Payment Pending'}</Badge>
        </div>
        {paymentSuccess && (
          <div className="flex justify-between bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
            <span className="text-emerald-700 font-semibold">Receipt Number:</span>
            <span className="font-mono font-bold text-emerald-800">{paymentSuccess.invoiceNumber}</span>
          </div>
        )}
      </div>
      {!paymentSuccess && (
        <div className="bg-brand-50 p-5 rounded-2xl border border-brand-100 text-center space-y-3">
          <p className="text-xs text-[#6B6860] font-medium">Would you like to complete payment online now via Razorpay?</p>
          <Button type="button" variant="primary" loading={payingOnline} onClick={handlePayNow} className="w-full sm:w-auto px-8">
            Pay ₹{confirmedBooking.amount} Online Now
          </Button>
          <p className="text-[11px] text-[#9C9890]">Or pay directly to the therapist at the time of consultation.</p>
        </div>
      )}
      <div className="pt-2">
        <Link to={`/${slug}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Back to Therapist Clinic
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Link to={`/${slug}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6860] hover:text-[#1C1C1A]">
        <ChevronLeft className="w-4 h-4" /> Back to {therapist?.name || 'Clinic'} Profile
      </Link>

      <div className="border-b border-[#E8E4DC] pb-4">
        <h1 className="text-2xl font-extrabold text-[#1C1C1A] tracking-tight">Book a Therapy Session</h1>
        <p className="text-xs text-[#6B6860] mt-1">Select a date and available time slot to schedule with <strong>{therapist?.name}</strong>.</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" /><span>{error}</span>
        </div>
      )}

      {/* Date Selector */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-[#1C1C1A] uppercase tracking-wider block">1. Select Date</span>
        <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1">
          {nextDays.map((d) => (
            <button key={d.iso} type="button" onClick={() => setSelectedDate(d.iso)}
              className={`p-3 rounded-xl border flex flex-col items-center min-w-[70px] transition-all ${
                selectedDate === d.iso
                  ? 'bg-accent-500 text-white border-accent-500 shadow-sm scale-105'
                  : 'bg-white text-[#1C1C1A] border-[#E8E4DC] hover:border-brand-300'
              }`}>
              <span className="text-[11px] font-medium opacity-80">{d.dayName}</span>
              <span className="text-base font-bold my-0.5">{d.dayNumber}</span>
              <span className="text-[10px] opacity-70">{d.month}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slot Picker */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-[#1C1C1A] uppercase tracking-wider block">2. Available Time Slots for {selectedDate}</span>
        {loadingSlots ? (
          <div className="py-8 text-center text-xs text-[#9C9890]">Loading available slots...</div>
        ) : availableSlots.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {availableSlots.map((slot, idx) => (
              <button key={idx} type="button" onClick={() => setSelectedSlot(slot)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-all ${
                  selectedSlot?.start === slot.start
                    ? 'bg-accent-500 text-white border-accent-500 shadow-sm'
                    : 'bg-white text-[#1C1C1A] border-[#E8E4DC] hover:border-brand-400 hover:bg-brand-50'
                }`}>
                {slot.start} – {slot.end}
              </button>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-white rounded-xl border border-[#E8E4DC] text-xs text-[#6B6860]">
            No slots available on this date. Please choose another day.
          </div>
        )}
      </div>

      {/* Booking Form */}
      <form onSubmit={handleBooking} className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm p-6 space-y-4">
        <span className="text-xs font-bold text-[#1C1C1A] uppercase tracking-wider block mb-2">3. Your Information</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Your Full Name</label>
            <input type="text" required value={clientForm.clientName} onChange={(e) => setClientForm({ ...clientForm, clientName: e.target.value })} placeholder="e.g. Priya Sharma" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Email Address</label>
            <input type="email" required value={clientForm.clientEmail} onChange={(e) => setClientForm({ ...clientForm, clientEmail: e.target.value })} placeholder="priya@example.com" className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Phone Number</label>
            <input type="tel" required value={clientForm.clientPhone} onChange={(e) => setClientForm({ ...clientForm, clientPhone: e.target.value })} placeholder="+91 9876543210" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">What brings you to therapy? (Optional)</label>
            <input type="text" value={clientForm.presentingConcern} onChange={(e) => setClientForm({ ...clientForm, presentingConcern: e.target.value })} placeholder="e.g. Work stress, sleep issues" className={inputClass} />
          </div>
        </div>

        <div className="bg-brand-50 p-3.5 rounded-xl border border-brand-100">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" required checked={consentAgreed} onChange={(e) => setConsentAgreed(e.target.checked)} className="mt-0.5 rounded border-[#E8E4DC] text-accent-500 focus:ring-accent-400 h-4 w-4" />
            <span className="text-xs text-[#6B6860] leading-relaxed">
              I agree to the{' '}
              <Link to="/terms" target="_blank" className="text-brand-500 font-semibold underline hover:text-brand-600">Informed Consent Agreement</Link>{' '}and{' '}
              <Link to="/privacy" target="_blank" className="text-brand-500 font-semibold underline hover:text-brand-600">Privacy Policy</Link>,
              and acknowledge this is a confidential private therapy consultation.
            </span>
          </label>
        </div>

        <div className="pt-4 border-t border-[#E8E4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-[#6B6860] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Encrypted transmission. Your intake details are strictly confidential.</span>
          </div>
          <Button type="submit" variant="primary" loading={submitting} disabled={!selectedSlot || !consentAgreed} className="sm:w-auto w-full">
            {selectedSlot ? `Confirm Booking for ${selectedSlot.start}` : 'Select a Slot to Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BookingPage;
