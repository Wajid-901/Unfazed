import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { User, Lock, Mail, Globe, AlertCircle, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', slug: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'name' && (!prev.slug || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))) {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      const serverMsg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message;
      setError(serverMsg || 'Failed to create practice account. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "block w-full pl-9 pr-3 py-2 text-sm border border-[#E8E4DC] rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none bg-[#FAF8F4]";

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
                <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Dr. Ananya Sharma" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Work Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9C9890]">
                  <Mail className="h-4 w-4" />
                </div>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="ananya@therapy.in" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9C9890]">
                  <Lock className="h-4 w-4" />
                </div>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="Min 8 chars (e.g. Therapy@123)" className={inputClass} />
              </div>
              <p className="mt-1 text-[11px] text-[#9C9890]">Must include uppercase, lowercase, number, and special character.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Your Public Clinic URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9C9890]">
                  <Globe className="h-4 w-4" />
                </div>
                <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="dr-sharma" className={inputClass} />
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-accent-500" />
                <span>Preview: <strong>unfazed.in/{formData.slug || 'your-clinic'}</strong></span>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2" variant="primary">
              Create My Digital Clinic
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-[#6B6860]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent-500 hover:text-accent-600 underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
