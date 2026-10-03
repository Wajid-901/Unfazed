import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { User, Lock, Stethoscope, HeartHandshake, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password, isClient);
      if (data?.user?.role === 'THERAPIST') {
        navigate('/dashboard');
      } else {
        navigate('/client');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
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
            onClick={() => { setIsClient(false); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isClient ? 'bg-white text-[#1C1C1A] shadow-sm' : 'text-[#6B6860] hover:text-[#1C1C1A]'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-brand-500" />
            Therapist Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsClient(true); setError(''); }}
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
          {error && (
            <div className="mb-5 rounded-lg bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isClient ? 'client@example.com' : 'therapist@clinic.com'}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-[#E8E4DC] rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition-colors bg-[#FAF8F4]"
                />
              </div>
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
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-[#E8E4DC] rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition-colors bg-[#FAF8F4]"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2" variant="primary">
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
