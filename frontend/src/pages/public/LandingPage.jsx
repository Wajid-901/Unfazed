import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Shield,
  FileText,
  CreditCard,
  Users,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="pt-16 pb-12 text-center px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-primary-600" />
          <span>Practice Management SaaS for Indian Mental Health Practitioners</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Manage your therapy practice from <span className="text-primary-600">one seamless app.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Replace fragmented WhatsApp chats, Google Calendar, Excel sheets, and paper notes.
          Get your own branded digital clinic, instant bookings, automated invoicing, and confidential SOAP notes.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-md transition-all hover:shadow-lg"
          >
            Start Practice Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-300 shadow-2xs transition-all"
          >
            Therapist Sign In
          </Link>
        </div>

        {/* Feature Checkmarks */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Branded Clinic Website
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Anti-Double Booking
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> HIPAA-Inspired SOAP Notes
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero Commission on Free Tier
          </span>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Everything your private practice needs
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Engineered specifically for clinical psychologists, counselors, and mental health coaches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Digital Clinic & Booking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every therapist gets a custom URL (e.g. <code>unfazed.in/dr-sharma</code>) with working hours, real-time available slots, and instant client confirmations.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Integrated Client CRM</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track client timelines, intake histories, presenting concerns, and contact records all in one centralized directory.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Confidential SOAP & DAP Notes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict separation between private therapist clinical notes and client-shared session summaries. Private notes never leak to client endpoints.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
