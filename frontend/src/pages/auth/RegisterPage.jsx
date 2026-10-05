import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { User, Lock, Mail, Globe, AlertCircle, CheckCircle2, CheckCircle, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', slug: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const validateField = (name, value) => {
    let err = '';
    if (name === 'name') {
      if (!value || value.trim().length < 2) err = 'Name must be at least 2 characters';
      else if (value.trim().length > 100) err = 'Name cannot exceed 100 characters';
    } else if (name === 'email') {
      if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        err = 'Please enter a valid email address';
      }
    } else if (name === 'password') {
      if (!value || value.length < 8) {
        err = 'Password must be at least 8 characters';
      } else if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
        err = 'Password must include at least one letter and one number';
      }
    } else if (name === 'slug') {
      if (value && !/^[a-z0-9-]{3,50}$/.test(value)) {
        err = 'Slug must be 3-50 lowercase letters, numbers, or hyphens';
      }
    }
    return err;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const err = validateField(name, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next[name] = err;
      else delete next[name];
      return next;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'name' && (!prev.slug || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))) {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }
      return next;
    });

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formErrors = {};
    ['name', 'email', 'password', 'slug'].forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) formErrors[key] = err;
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      setRegisteredSuccess(true);
    } catch (err) {
      const serverMsg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message;
      setError(serverMsg || 'Failed to create practice account. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-xl bg-brand-500 text-white items-center justify-center font-bold text-2xl shadow-md mb-3">
          U
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#1C1C1A]">
          Create Your Practice on Unfazed
        </h2>
        <p className="mt-1 text-sm text-[#6B6860]">
          Launch your digital clinic, accept bookings, and manage clients in minutes.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E8E4DC] sm:rounded-2xl sm:px-10">
          {registeredSuccess ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#1C1C1A]">Check Your Inbox!</h3>
              <p className="text-xs text-[#6B6860] leading-relaxed">
                We've sent a verification link to <strong>{formData.email}</strong>. Please verify your email address to sign in and activate your clinic.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-block px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition-colors"
                >
                  Proceed to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 rounded-lg bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Full Name / Professional Title</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9C9890]">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Dr. Ananya Sharma"
                      className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 outline-none bg-[#FAF8F4] ${
                        errors.name ? 'border-rose-400 focus:ring-rose-300' : 'border-[#E8E4DC] focus:ring-brand-400'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Work Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9C9890]">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="ananya@therapy.in"
                      className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 outline-none bg-[#FAF8F4] ${
                        errors.email ? 'border-rose-400 focus:ring-rose-300' : 'border-[#E8E4DC] focus:ring-brand-400'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9C9890]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Min 8 chars with letter & number"
                      className={`block w-full pl-9 pr-10 py-2 text-sm border rounded-lg focus:ring-2 outline-none bg-[#FAF8F4] ${
                        errors.password ? 'border-rose-400 focus:ring-rose-300' : 'border-[#E8E4DC] focus:ring-brand-400'
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
                  {errors.password ? (
                    <p className="text-xs text-rose-600 mt-1">{errors.password}</p>
                  ) : (
                    <p className="mt-1 text-[11px] text-[#9C9890]">Must be at least 8 characters with at least one letter and number.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Your Public Clinic URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9C9890]">
                      <Globe className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="dr-sharma"
                      className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 outline-none bg-[#FAF8F4] ${
                        errors.slug ? 'border-rose-400 focus:ring-rose-300' : 'border-[#E8E4DC] focus:ring-brand-400'
                      }`}
                    />
                  </div>
                  {errors.slug && <p className="text-xs text-rose-600 mt-1">{errors.slug}</p>}
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-accent-500" />
                    <span>Preview: <strong>unfazed.in/{formData.slug || 'your-clinic'}</strong></span>
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full mt-2"
                  variant="primary"
                  disabled={Object.keys(errors).length > 0}
                >
                  Create My Digital Clinic
                </Button>
              </form>

              <div className="mt-6 text-center text-xs text-[#6B6860]">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-accent-500 hover:text-accent-600 underline">
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
