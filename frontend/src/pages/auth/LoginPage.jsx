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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-xl bg-primary-600 text-white items-center justify-center font-bold text-2xl shadow-md mb-3">
            U
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to Unfazed</h2>
          <p className="mt-1 text-sm text-slate-500">
            Cloud-based practice management for modern therapists
          </p>
        </div>

        {/* Tab switch for Therapist vs Client */}
        <div className="mt-6 flex rounded-xl bg-slate-200/80 p-1 border border-slate-300/50">
          <button
            type="button"
            onClick={() => { setIsClient(false); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isClient ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-primary-600" />
            Therapist Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsClient(true); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              isClient ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-teal-600" />
            Client Portal
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 rounded-lg bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isClient ? 'client@example.com' : 'therapist@clinic.com'}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              variant={isClient ? 'secondary' : 'primary'}
            >
              Sign In {isClient ? 'to Client Portal' : 'to Practice'}
            </Button>
          </form>

          {!isClient && (
            <div className="mt-6 text-center text-xs text-slate-500">
              Don't have a therapist account yet?{' '}
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 underline">
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
