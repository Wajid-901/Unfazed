import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetToken, setDevResetToken] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (data.resetToken) setDevResetToken(data.resetToken);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cream">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center mx-auto shadow-md mb-4">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-[#1C1C1A]">Reset Your Password</h2>
        <p className="mt-1 text-center text-xs text-[#6B6860]">Enter your therapist account email to receive reset instructions</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E8E4DC] rounded-2xl sm:px-10">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#1C1C1A]">Check Your Inbox</h3>
              <p className="text-xs text-[#6B6860] leading-relaxed">
                If an account matches <strong className="text-[#1C1C1A]">{email}</strong>, we sent a secure password reset link.
              </p>
              {devResetToken && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs text-amber-900 space-y-1 mt-4">
                  <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">🛠 Dev Mode Token:</span>
                  <Link to={`/reset-password/${devResetToken}`} className="font-mono text-[11px] text-brand-500 underline block break-all font-semibold">
                    Click to Reset Password Immediately →
                  </Link>
                </div>
              )}
              <div className="pt-4">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:underline">
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Registered Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@example.com"
                    className="w-full text-xs border border-[#E8E4DC] rounded-xl p-2.5 pl-9 focus:ring-2 focus:ring-brand-400 outline-none bg-[#FAF8F4]"
                  />
                  <Mail className="w-4 h-4 text-[#9C9890] absolute left-3 top-3" />
                </div>
              </div>
              <Button type="submit" variant="primary" loading={loading} className="w-full">Send Reset Link</Button>
              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B6860] hover:text-[#1C1C1A]">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
