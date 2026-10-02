import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Lock, HeartHandshake, Eye, EyeOff, Check, AlertCircle, ShieldCheck } from 'lucide-react';

const SetupPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect to login if no token in URL
  useEffect(() => {
    if (!token) navigate('/login', { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }
    if (password !== confirm) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/client/setup-password', { token, password });
      if (data.success) {
        // Store credentials and redirect to client portal
        localStorage.setItem('unfazed_token', data.accessToken);
        localStorage.setItem('unfazed_user', JSON.stringify(data.user));
        setSuccess(true);
        setTimeout(() => navigate('/client', { replace: true }), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'This invite link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const strengthLevel = (() => {
    if (password.length === 0) return 0;
    if (password.length < 8) return 1;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return 3;
    return 2;
  })();

  const strengthColors = ['', 'bg-rose-400', 'bg-amber-400', 'bg-emerald-400'];
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center max-w-sm w-full">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">You're all set!</h2>
          <p className="text-sm text-slate-500">Redirecting you to your client portal…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-teal-600 text-white items-center justify-center shadow-md mb-4">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Set Up Your Client Portal</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your therapist has invited you. Create a secure password to access your portal.
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {/* Security badge */}
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg mb-6">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Your password is encrypted end-to-end. Your therapist will never see it.</span>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="block w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          strengthLevel >= level ? strengthColors[strengthLevel] : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[11px] font-medium ${
                    strengthLevel === 3 ? 'text-emerald-600' : strengthLevel === 2 ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {strengthLabels[strengthLevel]}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className={`block w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:ring-2 outline-none transition-colors ${
                    confirm && confirm !== password
                      ? 'border-rose-300 focus:ring-rose-400'
                      : 'border-slate-300 focus:ring-teal-500 focus:border-teal-500'
                  }`}
                />
                {confirm && confirm === password && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Check className="h-4 w-4 text-emerald-500" />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Setting up…
                </>
              ) : (
                'Activate My Portal'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Already set up your password?{' '}
            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline">
              Sign in to Client Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupPasswordPage;
