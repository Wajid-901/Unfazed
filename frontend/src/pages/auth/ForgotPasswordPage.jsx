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
      if (data.resetToken) {
        setDevResetToken(data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-extrabold text-xl mx-auto shadow-md">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Reset Your Password
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Enter your therapist account email to receive reset instructions
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Check Your Inbox</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                If an account matches <strong className="text-slate-700">{email}</strong>, we have sent a secure password reset link.
              </p>

              {devResetToken && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs text-amber-900 space-y-1 mt-4">
                  <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">
                    🛠 Development Mode Testing Token:
                  </span>
                  <Link
                    to={`/reset-password/${devResetToken}`}
                    className="font-mono text-[11px] text-primary-600 underline block break-all font-semibold"
                  >
                    Click to Reset Password Immediately →
                  </Link>
                </div>
              )}

              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@example.com"
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 pl-9 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <Button type="submit" variant="primary" loading={loading} className="w-full">
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
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
