import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { UserCircle, Phone, User, Shield, Save } from 'lucide-react';

const ClientProfilePage = () => {
  const { updateUser } = useAuth();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  });
  const [therapistInfo, setTherapistInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);
  const [error, setError] = useState('');

  const bannerTimerRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/clients/profile');
        if (data.success) {
          const profile = data.client || data.profile || data;
          const intake = profile.intakeData || {};
          setForm({
            name: profile.name || '',
            phone: profile.phone || '',
            emergencyContactName: intake.emergencyContactName || '',
            emergencyContactPhone: intake.emergencyContactPhone || '',
            emergencyContactRelation: intake.emergencyContactRelation || ''
          });
          if (profile.therapistId) {
            setTherapistInfo(profile.therapistId);
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load your profile. Please refresh and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put('/clients/profile', {
        name: form.name,
        phone: form.phone,
        intakeData: {
          emergencyContactName: form.emergencyContactName,
          emergencyContactPhone: form.emergencyContactPhone,
          emergencyContactRelation: form.emergencyContactRelation
        }
      });

      if (data.success) {
        updateUser({ name: form.name, phone: form.phone });
        setSuccessBanner(true);
        if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
        bannerTimerRef.current = setTimeout(() => setSuccessBanner(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError(
        err?.response?.data?.message || 'Failed to save profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider block mb-1">
          Profile
        </span>
        <h1 className="text-2xl font-bold text-slate-900">Your Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details and emergency contact information.
        </p>
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-3 rounded-xl">
          <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          Profile updated successfully
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Personal Info */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            Personal Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full text-sm border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full text-sm border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <UserCircle className="w-4 h-4 text-teal-600" />
            Emergency Contact
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contact Name
              </label>
              <input
                type="text"
                name="emergencyContactName"
                value={form.emergencyContactName}
                onChange={handleChange}
                placeholder="Emergency contact's full name"
                className="w-full text-sm border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="emergencyContactPhone"
                  value={form.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full text-sm border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 placeholder:text-slate-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Relationship
              </label>
              <input
                type="text"
                name="emergencyContactRelation"
                value={form.emergencyContactRelation}
                onChange={handleChange}
                placeholder="e.g. Parent, Spouse, Friend"
                className="w-full text-sm border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Therapist Info (read-only) */}
      {therapistInfo && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <UserCircle className="w-4 h-4 text-teal-600" />
            Your Therapist
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-600 to-teal-800 text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
              {therapistInfo.name?.charAt(0).toUpperCase() || 'T'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{therapistInfo.name}</p>
              {therapistInfo.title && (
                <p className="text-xs text-teal-600 font-semibold">{therapistInfo.title}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Password Change Note */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-start gap-3">
        <Shield className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-500">
          To change your password, use the{' '}
          <span className="font-semibold text-slate-700">Forgot Password</span> link on the login page.
        </p>
      </div>
    </div>
  );
};

export default ClientProfilePage;
