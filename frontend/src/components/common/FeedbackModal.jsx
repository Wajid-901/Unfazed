import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Bug, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose, defaultType = 'support' }) => {
  const { user } = useAuth();
  const [type, setType] = useState(defaultType); // 'support' or 'bug'
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    category: 'General Inquiry',
    subject: '',
    message: '',
    stepsToReproduce: '',
    severity: 'Medium'
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        type,
        ...formData,
        userAgent: navigator.userAgent,
        pageUrl: window.location.href,
        userId: user?.id || null
      };

      await api.post('/public/feedback', payload);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          category: 'General Inquiry',
          subject: '',
          message: '',
          stepsToReproduce: '',
          severity: 'Medium'
        });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit message. Please email support@unfazed.in directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={type === 'bug' ? 'Report a Bug' : 'Contact Support'} size="md">
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800">
            {type === 'bug' ? 'Bug Report Submitted!' : 'Message Sent!'}
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Thank you for helping us improve Unfazed. Our engineering and support team will review your message.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('support')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                type === 'support' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
              <span>Contact Support</span>
            </button>
            <button
              type="button"
              onClick={() => setType('bug')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                type === 'bug' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bug className="w-3.5 h-3.5 text-rose-500" />
              <span>Report a Bug</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
      <label className="block font-semibold text-[#1C1C1A] mb-1">Your Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Doctor / Client Name"
                className="w-full border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1C1C1A] mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@domain.com"
                className="w-full border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none"
              />
            </div>
          </div>

          {type === 'support' ? (
            <div>
              <label className="block font-semibold text-[#1C1C1A] mb-1">Inquiry Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none bg-white"
              >
                <option>Practice Setup & Digital Clinic</option>
                <option>Booking & Calendar Scheduling</option>
                <option>Billing & Razorpay Payments</option>
                <option>Subscription Plan Assistance</option>
                <option>General Inquiry</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block font-semibold text-[#1C1C1A] mb-1">Bug Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none bg-white"
              >
                <option>Low (Cosmetic or minor text typo)</option>
                <option>Medium (Feature partially malfunctioning)</option>
                <option>High / Critical (Blocking bookings or session notes)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold text-[#1C1C1A] mb-1">Subject</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder={type === 'bug' ? 'Brief summary of the issue' : 'How can we help you?'}
              className="w-full border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1C1C1A] mb-1">
              {type === 'bug' ? 'Description & Observed Behavior' : 'Message'}
            </label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder={
                type === 'bug'
                  ? 'What happened vs. what did you expect to happen?'
                  : 'Please describe your request in detail...'
              }
              className="w-full border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none"
            />
          </div>

          {type === 'bug' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Steps to Reproduce (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.stepsToReproduce}
                onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
                placeholder="1. Go to Calendar&#10;2. Click Add Slot&#10;3. Click Save"
              className="w-full border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none font-mono text-[11px]"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-[#E8E4DC]">
            <span className="text-[11px] text-slate-400">Direct email: support@unfazed.in</span>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                {type === 'bug' ? 'Submit Bug Report' : 'Send Message'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default FeedbackModal;
