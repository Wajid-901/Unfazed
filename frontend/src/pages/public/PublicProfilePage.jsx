import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  Calendar,
  Clock,
  Shield,
  Heart,
  Award,
  Globe,
  MapPin,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const PublicProfilePage = () => {
  const { slug } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const { data } = await api.get(`/public/therapist/${slug}`);
        if (data.success && data.therapist) {
          setTherapist(data.therapist);
        }
      } catch (err) {
        console.error('Failed to load clinic:', err);
        setError('Therapist clinic not found. Please check the URL.');
      } finally {
        setLoading(false);
      }
    };

    fetchTherapist();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-400">
        Loading clinic profile...
      </div>
    );
  }

  if (error || !therapist) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 font-bold text-xl">
          ?
        </div>
        <h2 className="text-xl font-bold text-slate-800">Clinic Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          The therapist clinic page <span className="font-mono font-semibold">/{slug}</span> could not be found.
        </p>
        <Link to="/" className="mt-4 text-xs font-semibold text-primary-600 hover:underline">
          Return to Unfazed Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Hero Clinic Header */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10 flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Avatar */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-800 text-white flex items-center justify-center text-4xl font-extrabold shadow-md flex-shrink-0">
          {therapist.name.charAt(0)}
        </div>

        {/* Bio Info */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Verified Mental Health Professional
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {therapist.name}
          </h1>

          <p className="text-sm font-semibold text-primary-700">
            {therapist.title || 'Clinical Psychologist'}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-500" />
              {therapist.experienceYears || 3}+ Years Experience
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4 text-primary-500" />
              {therapist.languages?.join(', ') || 'English, Hindi'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-rose-500" />
              {therapist.clinicAddress || 'Online / Telehealth'}
            </span>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <Link
              to={`/${slug}/book`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-md transition-all hover:shadow-lg"
            >
              <Calendar className="w-4 h-4" /> Book Appointment (₹{therapist.hourlyRate || 1500})
            </Link>
          </div>
        </div>
      </section>

      {/* Specializations & Approach */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">About the Practice</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {therapist.bio ||
              `${therapist.name} is a licensed therapist dedicated to providing evidence-based, compassionate psychological care. Whether you are navigating life transitions, anxiety, relationship difficulties, or stress, sessions are tailored to support your personal growth in a secure, non-judgmental environment.`}
          </p>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Clinical Specializations
            </h3>
            <div className="flex flex-wrap gap-2">
              {therapist.specializations?.map((spec, i) => (
                <Badge key={i} variant="primary" size="md">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Practice Highlights Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <h3 className="text-base font-bold text-slate-900">Session Information</h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-800">Session Duration</strong>
                <span className="text-slate-500">50 minutes per session</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-800">100% Confidential</strong>
                <span className="text-slate-500">Encrypted clinical records & private notes</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Heart className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-800">Direct Communication</strong>
                <span className="text-slate-500">Secure client portal access & notes</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              to={`/${slug}/book`}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-primary-50 text-primary-700 font-bold text-xs hover:bg-primary-100 transition-colors"
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
