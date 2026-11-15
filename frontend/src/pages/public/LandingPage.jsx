import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Calendar, HeartHandshake, Sparkles, ArrowRight, CheckCircle2
} from 'lucide-react';

const TherapistDirectoryPreview = () => {
  const [therapists, setTherapists] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const { data } = await api.get('/public/therapists?limit=50&page=1&sort=newest');
        setTherapists(data.therapists || []);
        setTotal(data.pagination?.total || 0);
      } catch (err) {
        console.error('Failed to load public therapist directory:', err);
        setError('Therapist profiles are temporarily unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-600">Find your person</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1C1A] mt-2">Meet therapists on Unfazed</h2>
          <p className="text-sm text-[#6B6860] mt-2 max-w-xl">
            Get to know their approach, focus areas, and session details before you reach out.
          </p>
        </div>
        <Link to="/therapists" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700">
          Explore the directory <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-[#6B6860]" role="status">Loading therapist profiles...</p>
      ) : error ? (
        <p className="py-8 text-center text-sm text-rose-700" role="status">{error}</p>
      ) : therapists.length ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {therapists.map((therapist) => (
              <article key={therapist._id || therapist.slug} className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-3">
                  {therapist.profileImageUrl ? (
                    <img src={therapist.profileImageUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center" aria-hidden="true">
                      {therapist.name?.charAt(0)?.toUpperCase() || 'T'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-[#1C1C1A] truncate">{therapist.name}</h3>
                    <p className="text-xs text-[#6B6860] truncate">{therapist.title || 'Therapist'}</p>
                  </div>
                </div>
                {therapist.specializations?.length > 0 && (
                  <p className="text-xs text-[#6B6860] mt-3 line-clamp-2">
                    {therapist.specializations.slice(0, 3).join(' / ')}
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-[#F0EDE6] flex items-center justify-between gap-3">
                  <p className="text-xs text-[#6B6860]">
                    {therapist.hourlyRate ? `From Rs. ${therapist.hourlyRate.toLocaleString('en-IN')} / session` : 'Session details on profile'}
                  </p>
                  <Link to={`/${therapist.slug}`} className="shrink-0 text-xs font-semibold text-brand-600 hover:text-brand-700">
                    View profile <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <p className="text-xs text-[#6B6860] text-center mt-6">
            Showing {therapists.length} of {total} therapist profiles.
          </p>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#D9C9AB] bg-white/70 py-10 text-center">
          <p className="text-sm font-semibold text-[#1C1C1A]">No therapist profiles are published yet.</p>
          <p className="text-xs text-[#6B6860] mt-1">Please check back soon or explore the directory.</p>
          <Link to="/therapists" className="inline-flex mt-3 text-xs font-semibold text-brand-600 hover:underline">
            Browse the therapist directory
          </Link>
        </div>
      )}
    </section>
  );
};

const LandingPage = () => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      <section className="relative overflow-hidden bg-[#E9E4D9]">
        <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-[#D9C9AB]/50 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-36 left-1/4 w-80 h-80 rounded-full bg-white/60 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 lg:py-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/75 border border-white px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-accent-500" />
              A more human way to connect
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1C1C1A] tracking-tight leading-[1.08]">
              Care for the people. Tools for the practice.
            </h1>
            <p className="mt-5 max-w-xl text-base sm:text-lg text-[#5F5C54] leading-relaxed">
              Find a therapist who feels right for you, or make the everyday work of running a therapy practice feel lighter.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/therapists"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 hover:bg-accent-600 px-6 py-3.5 text-sm font-bold text-white shadow-md transition-colors"
              >
                Find a therapist <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-[#FAF8F4] px-6 py-3.5 text-sm font-bold text-brand-700 border border-white shadow-sm transition-colors"
              >
                I am a therapist
              </Link>
            </div>
            <p className="mt-4 text-xs text-[#6B6860]">
              Already have an account? <Link to="/login" className="font-semibold text-brand-700 underline underline-offset-2">Sign in</Link>
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-brand-500/10 rotate-3" aria-hidden="true" />
            <div className="relative rounded-[2rem] bg-brand-600 p-5 sm:p-7 shadow-xl">
              <div className="flex items-center justify-between text-white/75 text-xs">
                <span className="font-semibold tracking-wide">UNFAZED</span>
                <span>One space, two journeys</span>
              </div>
              <div className="mt-6 rounded-2xl bg-[#F8F5EF] p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.16em] font-bold text-accent-600">A good place to begin</p>
                <h2 className="mt-2 text-xl sm:text-2xl font-bold text-[#1C1C1A]">Your next step can be simple.</h2>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-white border border-[#E8E4DC] p-3.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg" aria-hidden="true">01</div>
                    <div>
                      <p className="text-sm font-bold text-[#1C1C1A]">Looking for support?</p>
                      <p className="text-xs text-[#6B6860] mt-0.5">Explore therapist profiles at your pace.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white border border-[#E8E4DC] p-3.5">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center text-lg" aria-hidden="true">02</div>
                    <div>
                      <p className="text-sm font-bold text-[#1C1C1A]">Building your practice?</p>
                      <p className="text-xs text-[#6B6860] mt-0.5">Bring bookings, clients, and payments together.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-[#E8E4DC] flex items-center gap-2 text-xs text-[#6B6860]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Designed for both sides of the therapy journey
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-600">Welcome to Unfazed</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#1C1C1A]">Wherever you are in the journey, start here.</h2>
        </div>
        <div className="mt-8 grid md:grid-cols-2 gap-5">
          <article className="rounded-3xl bg-white border border-[#E8E4DC] p-6 sm:p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center" aria-hidden="true">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-rose-700">For clients</p>
            <h3 className="mt-2 text-xl sm:text-2xl font-bold text-[#1C1C1A]">Find care that feels like a fit.</h3>
            <p className="mt-3 text-sm text-[#6B6860] leading-relaxed">
              Explore therapist profiles, learn about their approach, and choose a time that works for you.
            </p>
            <Link to="/therapists" className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-rose-700 hover:text-rose-800">
              Explore therapists <ArrowRight className="w-4 h-4" />
            </Link>
          </article>
          <article className="rounded-3xl bg-[#F1EEE7] border border-[#E3DED3] p-6 sm:p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center" aria-hidden="true">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-brand-700">For therapists</p>
            <h3 className="mt-2 text-xl sm:text-2xl font-bold text-[#1C1C1A]">Make more room for your work.</h3>
            <p className="mt-3 text-sm text-[#6B6860] leading-relaxed">
              Share your practice, manage appointments and clients, and keep session payments organized.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-brand-700 hover:text-brand-800">
              Create your practice profile <ArrowRight className="w-4 h-4" />
            </Link>
          </article>
        </div>
      </section>

      <TherapistDirectoryPreview />

      <section className="bg-[#F1EEE7] py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-600">A clear next step</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#1C1C1A]">Simple to begin, thoughtful at every step.</h2>
          </div>
          <div className="mt-9 grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white p-6 sm:p-7 border border-[#E8E4DC]">
              <h3 className="text-lg font-bold text-[#1C1C1A]">If you are looking for a therapist</h3>
              <ol className="mt-5 space-y-4">
                {[
                  ['01', 'Explore profiles', 'Get a feel for each therapist and their areas of focus.'],
                  ['02', 'Choose what feels right', 'Review the details and availability on their profile.'],
                  ['03', 'Book a session', 'Select a time and take your next step.']
                ].map(([number, title, description]) => (
                  <li key={number} className="flex gap-3">
                    <span className="text-xs font-bold text-accent-600 pt-0.5">{number}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#1C1C1A]">{title}</p>
                      <p className="text-xs text-[#6B6860] mt-0.5">{description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl bg-brand-600 p-6 sm:p-7 text-white">
              <h3 className="text-lg font-bold">If you are a therapist</h3>
              <ol className="mt-5 space-y-4">
                {[
                  ['01', 'Set up your profile', 'Introduce your practice and the support you offer.'],
                  ['02', 'Set your availability', 'Let clients find appointment times that suit them.'],
                  ['03', 'Manage your practice', 'Keep bookings, client details, and session payments in one place.']
                ].map(([number, title, description]) => (
                  <li key={number} className="flex gap-3">
                    <span className="text-xs font-bold text-[#F4BE9A] pt-0.5">{number}</span>
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="text-xs text-white/70 mt-0.5">{description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-[2rem] bg-[#E9E4D9] p-7 sm:p-10 lg:p-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Your next chapter</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#1C1C1A]">A little support can make a big difference.</h2>
            <p className="mt-2 text-sm text-[#6B6860]">
              Find the path that feels right for you. We will meet you there.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/therapists" className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 hover:bg-accent-600 px-5 py-3 text-sm font-bold text-white transition-colors">
              Find a therapist <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-[#FAF8F4] px-5 py-3 text-sm font-bold text-brand-700 transition-colors">
              Join as a therapist
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
