import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (val) => {
    if (!val || val.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Za-z]/.test(val) || !/[0-9]/.test(val)) {
      return 'Password must include at least one letter and one number';
    }
    return '';
  };

  const handleBlur = (field) => {
    if (field === 'password') {
      const err = validatePassword(password);
      setErrors((prev) => (err ? { ...prev, password: err } : { ...prev, password: undefined }));
    } else if (field === 'confirmPassword') {
      if (confirmPassword && confirmPassword !== password) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.confirmPassword;
          return next;
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passErr = validatePassword(password);
    const confirmErr = password !== confirmPassword ? 'Passwords do not match' : '';

    if (passErr || confirmErr) {
      setErrors({ password: passErr, confirmPassword: confirmErr });
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cream">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center mx-auto shadow-md mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-[#1C1C1A]">Set New Password</h2>
        <p className="mt-1 text-center text-xs text-[#6B6860]">Enter your new password to regain access to your practice dashboard</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E8E4DC] rounded-2xl sm:px-10">
          {success ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#1C1C1A]">Password Updated!</h3>
              <p className="text-xs text-[#6B6860]">Your password has been changed successfully. Redirecting you to sign in...</p>
              <div className="pt-2">
                <Link to="/login" className="inline-block px-5 py-2 rounded-xl bg-brand-500 text-white font-semibold text-xs shadow-sm hover:bg-brand-600">
                  Sign In Now
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label className="block font-semibold text-[#1C1C1A] mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    onBlur={() => handleBlur('password')}
                    placeholder="Min 8 chars with letter & number"
                    className={`w-full border rounded-xl p-2.5 pr-9 focus:ring-2 outline-none bg-[#FAF8F4] ${
                      errors.password ? 'border-rose-400 focus:ring-rose-300' : 'border-[#E8E4DC] focus:ring-brand-400'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-[#9C9890] hover:text-[#6B6860]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1A] mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Re-enter new password"
                  className={`w-full border rounded-xl p-2.5 focus:ring-2 outline-none bg-[#FAF8F4] ${
                    errors.confirmPassword ? 'border-rose-400 focus:ring-rose-300' : 'border-[#E8E4DC] focus:ring-brand-400'
                  }`}
                />
                {errors.confirmPassword && <p className="text-xs text-rose-600 mt-1">{errors.confirmPassword}</p>}
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full"
                disabled={Boolean(errors.password || errors.confirmPassword)}
              >
                Save New Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
