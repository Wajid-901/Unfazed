import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Calendar, Clock, Shield, Heart, Award, Globe, MapPin, CheckCircle, ArrowRight } from 'lucide-react';

const RESERVED_SLUGS = ['login', 'register', 'forgot-password', 'reset-password', 'client', 'privacy', 'terms', 'dashboard', 'api'];

const PublicProfilePage = () => {
  const { slug } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  if (slug && RESERVED_SLUGS.includes(slug.toLowerCase())) {
    return <Navigate to={`/${slug}`} replace />;
  }

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const { data } = await api.get(`/public/therapist/${slug}`);
        if (data.success && data.therapist) setTherapist(data.therapist);
      } catch {
        setError('Therapist clinic not found. Please check the URL.');
      } finally {
        setLoading(false);
      }
    };
    fetchTherapist();
  }, [slug]);

  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center text-xs text-[#9C9890]">
      Loading clinic profile...
    </div>
  );

  if (error || !therapist) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-400 mb-3 font-bold text-xl">?</div>
      <h2 className="text-xl font-bold text-[#1C1C1A]">Clinic Not Found</h2>
      <p className="text-xs text-[#6B6860] mt-1 max-w-sm">
        The therapist clinic page <span className="font-mono font-semibold">/{slug}</span> could not be found.
      </p>
      <Link to="/" className="mt-4 text-xs font-semibold text-brand-500 hover:underline">Return to Unfazed Home</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Hero */}
      <section className="bg-white rounded-3xl border border-[#E8E4DC] shadow-sm p-8 sm:p-10 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-brand-500 to-brand-700 text-white flex items-center justify-center text-4xl font-extrabold shadow-md flex-shrink-0">
          {therapist.name.charAt(0)}
        </div>
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Verified Mental Health Professional
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1A] tracking-tight">{therapist.name}</h1>
          <p className="text-sm font-semibold text-brand-500">{therapist.title || 'Clinical Psychologist'}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-[#6B6860] pt-1">
            <span className="flex items-center gap-1"><Award className="w-4 h-4 text-amber-500" />{therapist.experienceYears || 3}+ Years Experience</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Globe className="w-4 h-4 text-brand-400" />{therapist.languages?.join(', ') || 'English, Hindi'}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-rose-500" />{therapist.clinicAddress || 'Online / Telehealth'}</span>
          </div>
          <div className="pt-4">
            <Link
              to={`/${slug}/book`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-bold text-sm shadow-md transition-all w-full sm:w-auto"
            >
              <Calendar className="w-4 h-4" /> Book Appointment (₹{therapist.hourlyRate || 1500})
            </Link>
          </div>
        </div>
      </section>

      {/* About + Session Info */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-[#E8E4DC] shadow-sm p-8 space-y-4">
          <h2 className="text-lg font-bold text-[#1C1C1A]">About the Practice</h2>
          <p className="text-sm text-[#6B6860] leading-relaxed whitespace-pre-line">
            {therapist.bio || `${therapist.name} is a licensed therapist dedicated to providing evidence-based, compassionate psychological care. Sessions are tailored to support your personal growth in a secure, non-judgmental environment.`}
          </p>
          <div className="pt-4 border-t border-[#E8E4DC]">
            <h3 className="text-xs font-bold text-[#1C1C1A] uppercase tracking-wider mb-2">Clinical Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {therapist.specializations?.map((spec, i) => (
                <Badge key={i} variant="primary" size="md">{spec}</Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm p-6 space-y-5">
          <h3 className="text-base font-bold text-[#1C1C1A]">Session Information</h3>
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
              <div><strong className="block text-[#1C1C1A]">Session Duration</strong><span className="text-[#6B6860]">50 minutes per session</span></div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div><strong className="block text-[#1C1C1A]">100% Confidential</strong><span className="text-[#6B6860]">Encrypted clinical records & private notes</span></div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <div><strong className="block text-[#1C1C1A]">Direct Communication</strong><span className="text-[#6B6860]">Secure client portal access & notes</span></div>
            </div>
          </div>
          <div className="pt-4 border-t border-[#E8E4DC]">
            <Link
              to={`/${slug}/book`}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-50 text-brand-600 font-bold text-xs hover:bg-brand-100 transition-colors"
            >
              <span>View Available Slots</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicProfilePage;
