import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { User, Globe, Check, AlertCircle, Sparkles, ExternalLink, Copy, Share2 } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
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
    clinicAddress: 'Online / Telehealth'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
            clinicAddress: t.clinicAddress || 'Online / Telehealth'
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

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    return <div className="py-20 text-center text-xs text-slate-400">Loading practice profile...</div>;
  }

  // Production URL uses the custom domain if set, else the current origin
  const baseUrl = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
  const clinicUrl = `${baseUrl}/${profile.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(clinicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for browsers that block clipboard
      prompt('Copy your clinic link:', clinicUrl);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Practice Profile & Clinic Details</h2>
          <p className="text-xs text-slate-500">
            This information powers your public booking website and client communications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={clinicUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200 hover:bg-primary-100 transition-colors w-fit"
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
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Clinic URL Slug */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            Your Branded Clinic URL (Slug)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">https://unfazed.in/</span>
            <input
              type="text"
              name="slug"
              required
              value={profile.slug}
              onChange={handleChange}
              className="flex-1 text-xs border border-slate-300 rounded-lg p-2 font-mono text-primary-700 font-semibold focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <span className="text-[11px] text-slate-500 block">
            Clients visit this link to view your profile and book appointments directly.
          </span>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={profile.name}
              onChange={handleChange}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Title</label>
            <input
              type="text"
              name="title"
              value={profile.title}
              onChange={handleChange}
              placeholder="e.g. Clinical Psychologist & Psychotherapist"
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">About & Clinical Bio</label>
          <textarea
            name="bio"
            rows="4"
            value={profile.bio}
            onChange={handleChange}
            placeholder="Tell clients about your background, therapeutic approach, and what they can expect..."
            className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        {/* Qualifications & Rate */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hourly Fee (₹ INR)</label>
            <input
              type="number"
              name="hourlyRate"
              value={profile.hourlyRate}
              onChange={handleChange}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Experience (Years)</label>
            <input
              type="number"
              name="experienceYears"
              value={profile.experienceYears}
              onChange={handleChange}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Degrees / Qualification</label>
            <input
              type="text"
              name="qualification"
              value={profile.qualification}
              onChange={handleChange}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        {/* Languages & Specializations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Languages (Comma-separated)</label>
            <input
              type="text"
              name="languages"
              value={profile.languages}
              onChange={handleChange}
              placeholder="English, Hindi, Bengali"
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Specializations (Comma-separated)</label>
            <input
              type="text"
              name="specializations"
              value={profile.specializations}
              onChange={handleChange}
              placeholder="Anxiety, CBT, Grief Counseling"
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button type="submit" variant="primary" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
