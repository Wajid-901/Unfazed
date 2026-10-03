import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Shield, FileText, CreditCard, Users, MessageSquare,
  Sparkles, ArrowRight, CheckCircle2, Lock
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero */}
      <section className="pt-16 pb-12 text-center px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 border border-brand-200 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-accent-500" />
          <span>Practice Management SaaS for Indian Mental Health Practitioners</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#1C1C1A] tracking-tight leading-[1.15]">
          Manage your therapy practice from{' '}
          <span className="text-accent-500 italic">one seamless app.</span>
        </h1>

        <p className="text-base sm:text-lg text-[#6B6860] max-w-2xl mx-auto leading-relaxed">
          Replace fragmented WhatsApp chats, Google Calendar, Excel sheets, and paper notes.
          Get your own branded digital clinic, instant bookings, automated invoicing, and confidential SOAP notes.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-bold text-sm shadow-md transition-all hover:shadow-lg"
          >
            Start Practice Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white hover:bg-brand-50 text-[#1C1C1A] font-bold text-sm border border-[#E8E4DC] shadow-sm transition-all"
          >
            Therapist Sign In
          </Link>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#6B6860] font-medium">
          {['Branded Clinic Website', 'Anti-Double Booking', 'HIPAA-Inspired SOAP Notes', 'Zero Commission on Free Tier'].map((f) => (
            <span key={f} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {f}
            </span>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1C1A]">
            Everything your private practice needs
          </h2>
          <p className="text-sm text-[#6B6860] mt-2">
            Engineered specifically for clinical psychologists, counselors, and mental health coaches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#1C1C1A]">Digital Clinic & Booking</h3>
            <p className="text-xs text-[#6B6860] leading-relaxed">
              Every therapist gets a custom URL (e.g. <code className="bg-brand-50 px-1 py-0.5 rounded text-brand-600">unfazed.in/dr-sharma</code>) with working hours, real-time available slots, and instant client confirmations.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#1C1C1A]">Integrated Client CRM</h3>
            <p className="text-xs text-[#6B6860] leading-relaxed">
              Track client timelines, intake histories, presenting concerns, and contact records all in one centralized directory.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#1C1C1A]">Confidential SOAP & DAP Notes</h3>
            <p className="text-xs text-[#6B6860] leading-relaxed">
              Strict separation between private therapist clinical notes and client-shared session summaries. Private notes never leak to client endpoints.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#F2EFE9] py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <div>
            <p className="text-xs font-bold text-accent-500 uppercase tracking-widest mb-2">How it works</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1C1A]">Getting support is simple</h2>
            <p className="text-sm text-[#6B6860] mt-2">A few easy steps to start your mental health journey with Unfazed.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { num: '1', title: 'Find your therapist', body: 'Browse licensed professionals and find the right match.' },
              { num: '2', title: 'Book a session', body: 'Choose a time that works for you with live slot availability.' },
              { num: '3', title: 'Have your session', body: 'Meet online or in-person in a secure, confidential space.' },
              { num: '4', title: 'Feel the difference', body: 'Take small steps towards a calmer, brighter you.' },
            ].map((step) => (
              <div key={step.num} className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-sm space-y-2">
                <div className="w-8 h-8 rounded-full bg-accent-500 text-white text-sm font-bold flex items-center justify-center">
                  {step.num}
                </div>
                <h3 className="font-bold text-sm text-[#1C1C1A]">{step.title}</h3>
                <p className="text-xs text-[#6B6860] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-brand-500 rounded-3xl p-10 sm:p-14 text-center text-white space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to simplify your practice?</h2>
          <p className="text-sm text-brand-200 max-w-xl mx-auto">
            Join therapists across India who have moved their entire practice onto Unfazed.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-bold text-sm shadow-lg transition-all"
          >
            Create My Digital Clinic <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
