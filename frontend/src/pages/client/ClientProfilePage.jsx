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
  const [errors, setErrors] = useState({});
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

  const validateField = (name, value) => {
    let err = '';
    if (name === 'name') {
      if (!value || value.trim().length < 2) err = 'Name must be at least 2 characters';
      else if (value.trim().length > 100) err = 'Name cannot exceed 100 characters';
    } else if (name === 'phone' || name === 'emergencyContactPhone') {
      if (value && !/^[6-9]\d{9}$/.test(value.replace(/[\s-]/g, ''))) {
        err = 'Enter a valid 10-digit mobile number';
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
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formErrors = {};
    ['name', 'phone', 'emergencyContactPhone'].forEach((key) => {
      const err = validateField(key, form[key]);
      if (err) formErrors[key] = err;
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

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
      <div className="py-20 text-center text-xs text-[#6B6860]">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-xs p-6 sm:p-8">
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider block mb-1">
          Profile
        </span>
        <h1 className="text-2xl font-bold text-[#1C1C1A]">Your Profile</h1>
        <p className="text-xs text-[#6B6860] mt-1">
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
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#E8E4DC] shadow-xs p-6 space-y-6">
        {/* Personal Info */}
        <div>
          <h2 className="text-sm font-bold text-[#1C1C1A] mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            Personal Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1C1A] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Your full name"
                className={`w-full text-sm border rounded-xl px-4 py-2.5 outline-none focus:ring-2 bg-[#FAF8F4] placeholder:text-[#6B6860] ${
                  errors.name ? 'border-rose-400 focus:ring-rose-300' : 'border-[#E8E4DC] focus:ring-brand-400'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1C1C1A] mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#6B6860] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="9876543210"
                  className={`w-full text-sm border rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 bg-[#FAF8F4] placeholder:text-[#6B6860] ${
                    errors.phone ? 'border-rose-400 focus:ring-rose-300' : 'border-[#E8E4DC] focus:ring-brand-400'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h2 className="text-sm font-bold text-[#1C1C1A] mb-4 flex items-center gap-2">
            <UserCircle className="w-4 h-4 text-brand-600" />
            Emergency Contact
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1C1A] mb-1.5">
                Contact Name
              </label>
              <input
                type="text"
                name="emergencyContactName"
                value={form.emergencyContactName}
                onChange={handleChange}
                placeholder="Emergency contact's full name"
                className="w-full text-sm border border-[#E8E4DC] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-400 bg-[#FAF8F4] placeholder:text-[#6B6860]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1C1C1A] mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#6B6860] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="emergencyContactPhone"
                  value={form.emergencyContactPhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="9876543210"
                  className={`w-full text-sm border rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 bg-[#FAF8F4] placeholder:text-[#6B6860] ${
                    errors.emergencyContactPhone ? 'border-rose-400 focus:ring-rose-300' : 'border-[#E8E4DC] focus:ring-brand-400'
                  }`}
                />
              </div>
              {errors.emergencyContactPhone && <p className="text-xs text-rose-600 mt-1">{errors.emergencyContactPhone}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1C1C1A] mb-1.5">
                Relationship
              </label>
              <input
                type="text"
                name="emergencyContactRelation"
                value={form.emergencyContactRelation}
                onChange={handleChange}
                placeholder="e.g. Parent, Spouse, Friend"
                className="w-full text-sm border border-[#E8E4DC] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-400 bg-[#FAF8F4] placeholder:text-[#6B6860]"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving || Object.keys(errors).length > 0}
            className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Therapist Info (read-only) */}
      {therapistInfo && (
        <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-xs p-6">
          <h2 className="text-sm font-bold text-[#1C1C1A] mb-4 flex items-center gap-2">
            <UserCircle className="w-4 h-4 text-brand-600" />
            Your Therapist
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 to-brand-800 text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
              {therapistInfo.name?.charAt(0).toUpperCase() || 'T'}
            </div>
            <div>
              <p className="text-sm font-bold text-[#1C1C1A]">{therapistInfo.name}</p>
              {therapistInfo.title && (
                <p className="text-xs text-brand-600 font-semibold">{therapistInfo.title}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Password Change Note */}
      <div className="bg-[#FAF8F4] rounded-xl border border-[#E8E4DC] p-4 flex items-start gap-3">
        <Shield className="w-4 h-4 text-[#6B6860] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-[#6B6860]">
          To change your password, use the{' '}
          <span className="font-semibold text-[#1C1C1A]">Forgot Password</span> link on the login page.
        </p>
      </div>
    </div>
  );
};

export default ClientProfilePage;
