import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import { User, Lock, Stethoscope, HeartHandshake, AlertCircle, CheckCircle, Mail, Info, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const redirectTo = location.state?.redirectTo;
  const redirectMessage = location.state?.message;

  const [isClient, setIsClient] = useState(redirectTo?.startsWith('/client') ? true : false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);

  useEffect(() => {
    const token = searchParams.get('verifyToken');
    if (token) {
      api.get(`/auth/verify-email/${token}`)
        .then(() => {
          setSuccess('Email address verified successfully! You can now log in to your practice.');
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'Verification token is invalid or has expired.');
        });
    }
  }, [searchParams]);

  const validateEmail = (val) => {
    if (!val || !val.trim()) return 'Email address is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleBlur = (field) => {
    if (field === 'email') {
      const err = validateEmail(email);
      setErrors((prev) => (err ? { ...prev, email: err } : { ...prev, email: undefined }));
    } else if (field === 'password') {
      if (!password) {
        setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.password;
          return next;
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsUnverified(false);

    const emailErr = validateEmail(email);
    const passErr = !password ? 'Password is required' : '';

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return;
    }

    setLoading(true);

    try {
      const data = await login(email, password, isClient);
      if (data?.user?.role === 'THERAPIST') {
        navigate('/dashboard');
      } else {
        navigate(redirectTo || '/client');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
      if (err.response?.status === 403 || msg.toLowerCase().includes('verify your email')) {
        setIsUnverified(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please provide your email address to resend verification.');
      return;
    }
    setResending(true);
    try {
      const { data } = await api.post('/auth/resend-verification', { email });
      setSuccess(data.message || 'Verification email has been resent. Please check your inbox.');
      setIsUnverified(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-xl bg-brand-500 text-white items-center justify-center font-bold text-2xl shadow-md mb-3">
            U
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1C1C1A]">Sign in to Unfazed</h2>
          <p className="mt-1 text-sm text-[#6B6860]">
            Cloud-based practice management for modern therapists
          </p>
        </div>

        {/* Tab switch */}
        <div className="mt-6 flex rounded-xl bg-[#E8E4DC] p-1">
          <button
            type="button"
            onClick={() => { setIsClient(false); setError(''); setSuccess(''); setIsUnverified(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isClient ? 'bg-white text-[#1C1C1A] shadow-sm' : 'text-[#6B6860] hover:text-[#1C1C1A]'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-brand-500" />
            Therapist Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsClient(true); setError(''); setSuccess(''); setIsUnverified(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              isClient ? 'bg-white text-[#1C1C1A] shadow-sm' : 'text-[#6B6860] hover:text-[#1C1C1A]'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-accent-500" />
            Client Portal
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E8E4DC] sm:rounded-2xl sm:px-10">
          {/* Redirect message from booking page */}
          {redirectMessage && (
            <div className="mb-5 rounded-lg bg-brand-50 border border-brand-200 p-3.5 flex items-start gap-2.5 text-xs text-brand-800">
              <Info className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
              <span>{redirectMessage}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-lg bg-rose-50 border border-rose-200 p-3.5 flex flex-col gap-2 text-xs text-rose-800">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              {isUnverified && !isClient && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="mt-1 text-xs font-semibold text-brand-700 hover:text-brand-800 underline text-left flex items-center gap-1 disabled:opacity-50"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {resending ? 'Sending verification email...' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9C9890]">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  onBlur={() => handleBlur('email')}
                  placeholder={isClient ? 'client@example.com' : 'therapist@clinic.com'}
                  className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 outline-none transition-colors bg-[#FAF8F4] ${
                    errors.email
                      ? 'border-rose-400 focus:ring-rose-300'
                      : 'border-[#E8E4DC] focus:ring-brand-400 focus:border-brand-400'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#1C1C1A]">Password</label>
                {!isClient && (
                  <Link to="/forgot-password" className="text-[11px] font-semibold text-brand-500 hover:text-brand-600 hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9C9890]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`block w-full pl-9 pr-10 py-2 text-sm border rounded-lg focus:ring-2 outline-none transition-colors bg-[#FAF8F4] ${
                    errors.password
                      ? 'border-rose-400 focus:ring-rose-300'
                      : 'border-[#E8E4DC] focus:ring-brand-400 focus:border-brand-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9C9890] hover:text-[#6B6860] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              variant="primary"
              disabled={Boolean(errors.email || errors.password)}
            >
              Sign In {isClient ? 'to Client Portal' : 'to Practice'}
            </Button>
          </form>

          {!isClient && (
            <div className="mt-6 text-center text-xs text-[#6B6860]">
              Don't have a therapist account yet?{' '}
              <Link to="/register" className="font-semibold text-accent-500 hover:text-accent-600 underline">
                Create your practice
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
