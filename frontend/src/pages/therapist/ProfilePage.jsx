import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { User, Globe, Check, AlertCircle, Sparkles, ExternalLink, Copy, Camera, Loader2 } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    slug: '',
    bio: '',
    phone: '',
    hourlyRate: 1500,
    languages: 'English, Hindi',
    specializations: 'Anxiety, Depression, Trauma, Relationships',
    experienceYears: 4,
    qualification: 'M.Sc. in Clinical Psychology',
    clinicAddress: 'Online / Telehealth',
    profileImageUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/therapist/profile');
        if (data.success && data.therapist) {
          const t = data.therapist;
          setProfile({
            name: t.name || '',
            title: t.title || '',
            slug: t.slug || '',
            bio: t.bio || '',
            phone: t.phone || '',
            hourlyRate: t.hourlyRate || 1500,
            languages: Array.isArray(t.languages) ? t.languages.join(', ') : t.languages || '',
            specializations: Array.isArray(t.specializations) ? t.specializations.join(', ') : t.specializations || '',
            experienceYears: t.experienceYears || 3,
            qualification: t.qualification || '',
            clinicAddress: t.clinicAddress || 'Online / Telehealth',
            profileImageUrl: t.profileImageUrl || ''
          });
        }
      } catch (err) {
        console.error('Failed to load therapist profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const validateField = (name, value) => {
    let err = '';
    if (name === 'name') {
      if (!value || value.trim().length < 2) err = 'Name must be at least 2 characters';
      else if (value.trim().length > 100) err = 'Name cannot exceed 100 characters';
    } else if (name === 'slug') {
      if (!value || !/^[a-z0-9-]{3,50}$/.test(value)) {
        err = 'Slug must be 3-50 lowercase letters, numbers, or hyphens';
      }
    } else if (name === 'phone') {
      if (value && !/^[6-9]\d{9}$/.test(value.replace(/[\s-]/g, ''))) {
        err = 'Enter a valid 10-digit mobile number';
      }
    } else if (name === 'hourlyRate') {
      const num = Number(value);
      if (isNaN(num) || num < 100 || num > 50000) {
        err = 'Hourly rate must be between ₹100 and ₹50,000';
      }
    } else if (name === 'experienceYears') {
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 60) {
        err = 'Experience years must be between 0 and 60';
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
    setProfile((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validations
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please choose a valid JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    setError('');
    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const { data } = await api.post('/therapist/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success && data.profileImageUrl) {
        setProfile((prev) => ({ ...prev, profileImageUrl: data.profileImageUrl }));
        if (updateUser && user) {
          updateUser({ ...user, profileImageUrl: data.profileImageUrl });
        }
        setMessage('Profile photo updated successfully!');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload profile photo');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const formErrors = {};
    ['name', 'slug', 'phone', 'hourlyRate', 'experienceYears'].forEach((key) => {
      const err = validateField(key, profile[key]);
      if (err) formErrors[key] = err;
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setError('Please correct the errors in the form before saving.');
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        ...profile,
        languages: profile.languages.split(',').map((l) => l.trim()).filter(Boolean),
        specializations: profile.specializations.split(',').map((s) => s.trim()).filter(Boolean)
      };

      const { data } = await api.put('/therapist/profile', payload);
      if (data.success) {
        updateUser(data.therapist);
        setMessage('Practice profile updated successfully!');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-[#6B6860]">Loading practice profile...</div>;
  }

  const baseUrl = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
  const clinicUrl = `${baseUrl}/${profile.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(clinicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      prompt('Copy your clinic link:', clinicUrl);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1C1C1A] tracking-tight">Practice Profile &amp; Clinic Details</h2>
          <p className="text-xs text-[#6B6860]">
            This information powers your public booking website and client communications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={clinicUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200 hover:bg-brand-100 transition-colors w-fit"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Preview Live Clinic
          </a>
          <button
            type="button"
            onClick={handleCopyLink}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors w-fit ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-[#FAF8F4] text-[#1C1C1A] border-[#E8E4DC] hover:bg-[#F0EDE6]'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Link Copied!' : 'Copy Clinic Link'}
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E8E4DC] shadow-xs p-6 space-y-6">
        {/* Avatar Upload Section */}
        <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E8E4DC] flex flex-col sm:flex-row items-center gap-5">
          <div className="relative group">
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-brand-500 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-brand-500 text-white font-bold text-2xl flex items-center justify-center border-2 border-brand-600 shadow-sm">
                {profile.name?.charAt(0) || 'T'}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Upload photo"
            >
              <Camera className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <h3 className="text-xs font-bold text-[#1C1C1A]">Profile Photo</h3>
            <p className="text-[11px] text-[#6B6860]">
              Upload a professional portrait for your clinic public page. JPEG, PNG, or WebP up to 5MB.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarFileSelect}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-white border border-[#E8E4DC] px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors disabled:opacity-50"
            >
              {uploadingAvatar ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading to Cloud...</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  <span>{profile.profileImageUrl ? 'Change Photo' : 'Upload Photo'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Clinic URL Slug */}
        <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E8E4DC] space-y-2">
          <label className="block text-xs font-bold text-[#1C1C1A]">
            Your Branded Clinic URL (Slug)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B6860] font-mono hidden sm:inline">https://unfazed.in/</span>
            <input
              type="text"
              name="slug"
              required
              value={profile.slug}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`flex-1 text-xs border rounded-lg p-2 font-mono text-brand-700 font-semibold focus:ring-2 outline-none bg-white ${
                errors.slug ? 'border-rose-400 focus:ring-rose-300' : 'border-[#E8E4DC] focus:ring-brand-400'
              }`}
            />
          </div>
          {errors.slug && <p className="text-xs text-rose-600 mt-0.5">{errors.slug}</p>}
          <span className="text-[11px] text-[#6B6860] block">
            Clients visit this link to view your profile and book appointments directly.
          </span>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={profile.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full text-xs border rounded-lg p-2 focus:ring-2 outline-none bg-[#FAF8F4] ${
                errors.name ? 'border-rose-400 focus:ring-rose-300' : 'border-[#E8E4DC] focus:ring-brand-400'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-600 mt-0.5">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Professional Title</label>
            <input
              type="text"
              name="title"
              value={profile.title}
              onChange={handleChange}
              placeholder="e.g. Clinical Psychologist &amp; Psychotherapist"
              className="w-full text-xs border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none bg-[#FAF8F4]"
            />
          </div>
        </div>

        {/* Phone & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Phone Number (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 9876543210"
              className={`w-full text-xs border rounded-lg p-2 focus:ring-2 outline-none bg-[#FAF8F4] ${
                errors.phone ? 'border-rose-400 focus:ring-rose-300' : 'border-[#E8E4DC] focus:ring-brand-400'
              }`}
            />
            {errors.phone && <p className="text-xs text-rose-600 mt-0.5">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Clinic Location / Telehealth</label>
            <input
              type="text"
              name="clinicAddress"
              value={profile.clinicAddress}
              onChange={handleChange}
              placeholder="Online / Telehealth or Clinic Address"
              className="w-full text-xs border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none bg-[#FAF8F4]"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">About &amp; Clinical Bio</label>
          <textarea
            name="bio"
            rows="4"
            value={profile.bio}
            onChange={handleChange}
            placeholder="Tell clients about your background, therapeutic approach, and what they can expect..."
            className="w-full text-xs border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none bg-[#FAF8F4]"
          />
        </div>

        {/* Qualifications & Rate */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Hourly Fee (₹ INR)</label>
            <input
              type="number"
              name="hourlyRate"
              value={profile.hourlyRate}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full text-xs border rounded-lg p-2 focus:ring-2 outline-none bg-[#FAF8F4] ${
                errors.hourlyRate ? 'border-rose-400 focus:ring-rose-300' : 'border-[#E8E4DC] focus:ring-brand-400'
              }`}
            />
            {errors.hourlyRate && <p className="text-xs text-rose-600 mt-0.5">{errors.hourlyRate}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Experience (Years)</label>
            <input
              type="number"
              name="experienceYears"
              value={profile.experienceYears}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full text-xs border rounded-lg p-2 focus:ring-2 outline-none bg-[#FAF8F4] ${
                errors.experienceYears ? 'border-rose-400 focus:ring-rose-300' : 'border-[#E8E4DC] focus:ring-brand-400'
              }`}
            />
            {errors.experienceYears && <p className="text-xs text-rose-600 mt-0.5">{errors.experienceYears}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Degrees / Qualification</label>
            <input
              type="text"
              name="qualification"
              value={profile.qualification}
              onChange={handleChange}
              className="w-full text-xs border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none bg-[#FAF8F4]"
            />
          </div>
        </div>

        {/* Languages & Specializations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Languages (Comma-separated)</label>
            <input
              type="text"
              name="languages"
              value={profile.languages}
              onChange={handleChange}
              placeholder="English, Hindi, Bengali"
              className="w-full text-xs border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none bg-[#FAF8F4]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C1A] mb-1">Specializations (Comma-separated)</label>
            <input
              type="text"
              name="specializations"
              value={profile.specializations}
              onChange={handleChange}
              placeholder="Anxiety, CBT, Grief Counseling"
              className="w-full text-xs border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none bg-[#FAF8F4]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#E8E4DC] flex justify-end">
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            disabled={Object.keys(errors).length > 0}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
