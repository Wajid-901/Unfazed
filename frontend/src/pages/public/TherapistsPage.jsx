import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Search, Filter, Star, MapPin, Clock, Globe2, ChevronDown,
  Heart, ArrowRight, Sparkles, Users, X, Loader2, ShieldCheck
} from 'lucide-react';

const SPECIALIZATIONS = [
  'Anxiety', 'Depression', 'Relationship Counseling', 'Trauma & PTSD',
  'OCD', 'ADHD', 'Grief & Loss', 'Anger Management', 'Self-Esteem',
  'Stress Management', 'Addiction', 'Child Psychology', 'Couples Therapy',
  'Career Counseling', 'Sleep Disorders', 'Eating Disorders'
];

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Urdu'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'rate_low', label: 'Price: Low to High' },
  { value: 'rate_high', label: 'Price: High to Low' },
  { value: 'experience', label: 'Most Experienced' },
  { value: 'name', label: 'Name: A-Z' }
];

const TherapistCard = ({ therapist }) => {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('unfazed_favorites') || '[]');
    if (favs.includes(therapist.slug)) setSaved(true);
  }, [therapist.slug]);

  const toggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const favs = JSON.parse(localStorage.getItem('unfazed_favorites') || '[]');
    const updated = saved ? favs.filter((s) => s !== therapist.slug) : [...favs, therapist.slug];
    localStorage.setItem('unfazed_favorites', JSON.stringify(updated));
    setSaved(!saved);
  };

  return (
    <div className="group bg-white rounded-2xl border border-[#E8E4DC] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
      {/* Header with image */}
      <div className="relative p-5 pb-0">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            {therapist.profileImageUrl ? (
              <img
                src={therapist.profileImageUrl}
                alt={therapist.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-[#E8E4DC] group-hover:border-accent-300 transition-colors"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center border-2 border-[#E8E4DC] group-hover:border-accent-300 transition-colors">
                <span className="text-xl font-bold text-brand-600">
                  {therapist.name?.charAt(0)?.toUpperCase() || 'T'}
                </span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#1C1C1A] text-sm truncate group-hover:text-accent-600 transition-colors">
              {therapist.name}
            </h3>
            <p className="text-xs text-[#6B6860] truncate mt-0.5">{therapist.title || 'Licensed Psychologist'}</p>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1.5">
              {therapist.rating > 0 ? (
                <>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${star <= Math.round(therapist.rating) ? 'text-amber-400 fill-amber-400' : 'text-[#E8E4DC]'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-[#6B6860]">
                    {therapist.rating} ({therapist.reviewsCount})
                  </span>
                </>
              ) : (
                <span className="text-[11px] text-[#9C9890]">New on Unfazed</span>
              )}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={toggleSave}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#FAF8F4] hover:bg-rose-50 flex items-center justify-center transition-colors border border-[#E8E4DC]"
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${saved ? 'text-rose-500 fill-rose-500' : 'text-[#9C9890]'}`} />
          </button>
        </div>
      </div>

      {/* Bio */}
      <div className="px-5 pt-3">
        <p className="text-xs text-[#6B6860] leading-relaxed line-clamp-2">
          {therapist.bio || 'Helping clients navigate life challenges with evidence-based approaches.'}
        </p>
      </div>

      {/* Specializations */}
      <div className="px-5 pt-3">
        <div className="flex flex-wrap gap-1.5">
          {(therapist.specializations || []).slice(0, 3).map((spec) => (
            <span
              key={spec}
              className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-brand-50 text-brand-700 border border-brand-100"
            >
              {spec}
            </span>
          ))}
          {(therapist.specializations || []).length > 3 && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-[#FAF8F4] text-[#9C9890]">
              +{therapist.specializations.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="px-5 pt-3 flex items-center gap-3 text-[11px] text-[#6B6860]">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#9C9890]" />
          {therapist.experienceYears}+ yrs
        </span>
        <span className="flex items-center gap-1">
          <Globe2 className="w-3 h-3 text-[#9C9890]" />
          {(therapist.languages || []).slice(0, 2).join(', ')}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#9C9890]" />
          {therapist.clinicAddress?.substring(0, 15) || 'Online'}
        </span>
      </div>

      {/* Footer */}
      <div className="mt-auto px-5 py-4 flex items-center justify-between border-t border-[#F0EDE6] mt-3">
        <div>
          <span className="text-lg font-bold text-[#1C1C1A]">₹{therapist.hourlyRate?.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-[#9C9890] ml-1">/session</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/${therapist.slug}`}
            className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-[#FAF8F4] hover:bg-brand-50 text-[#6B6860] hover:text-[#1C1C1A] border border-[#E8E4DC] transition-colors"
          >
            View Profile
          </Link>
          <Link
            to={`/${therapist.slug}/book`}
            className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-accent-500 hover:bg-accent-600 text-white transition-colors shadow-sm"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

const TherapistsPage = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [language, setLanguage] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const fetchTherapists = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (specialization) params.set('specialization', specialization);
      if (language) params.set('language', language);
      if (minRate) params.set('minRate', minRate);
      if (maxRate) params.set('maxRate', maxRate);
      if (minExperience) params.set('minExperience', minExperience);
      params.set('sort', sort);
      params.set('page', page);
      params.set('limit', 12);

      const { data } = await api.get(`/public/therapists?${params.toString()}`);
      setTherapists(data.therapists || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Failed to load therapists:', err);
    } finally {
      setLoading(false);
    }
  }, [search, specialization, language, minRate, maxRate, minExperience, sort]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchTherapists(1), 300);
    return () => clearTimeout(debounce);
  }, [fetchTherapists]);

  const clearFilters = () => {
    setSearch('');
    setSpecialization('');
    setLanguage('');
    setMinRate('');
    setMaxRate('');
    setMinExperience('');
    setSort('newest');
  };

  const hasActiveFilters = specialization || language || minRate || maxRate || minExperience;

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="pt-12 pb-8 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-accent-50 text-accent-600 border border-accent-200 shadow-sm mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Find Your Therapist</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1C1C1A] tracking-tight leading-tight">
          Discover Verified Mental Health{' '}
          <span className="text-accent-500 italic">Professionals</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#6B6860] max-w-2xl mx-auto leading-relaxed">
          Browse qualified therapists, counsellors, and psychologists across India.
          Filter by specialization, language, budget, and book your session instantly.
        </p>
      </section>

      {/* Search & Filters */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm p-4 sm:p-5 space-y-4">
          {/* Search Bar Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C9890]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, specialization, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#E8E4DC] rounded-xl bg-[#FAF8F4] focus:ring-2 focus:ring-accent-400 focus:border-accent-400 outline-none transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-2.5 text-xs font-medium border border-[#E8E4DC] rounded-xl bg-[#FAF8F4] focus:ring-2 focus:ring-accent-400 outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl border transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'bg-accent-50 border-accent-300 text-accent-700'
                    : 'bg-[#FAF8F4] border-[#E8E4DC] text-[#6B6860] hover:bg-brand-50'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                Filters
                {hasActiveFilters && (
                  <span className="w-4 h-4 rounded-full bg-accent-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {[specialization, language, minRate, maxRate, minExperience].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="pt-3 border-t border-[#F0EDE6] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#1C1C1A] mb-1">Specialization</label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E8E4DC] rounded-lg bg-[#FAF8F4] outline-none focus:ring-2 focus:ring-accent-400"
                >
                  <option value="">All Specializations</option>
                  {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#1C1C1A] mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E8E4DC] rounded-lg bg-[#FAF8F4] outline-none focus:ring-2 focus:ring-accent-400"
                >
                  <option value="">All Languages</option>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#1C1C1A] mb-1">Budget (₹/session)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minRate}
                    onChange={(e) => setMinRate(e.target.value)}
                    placeholder="Min"
                    className="w-full px-2.5 py-2 text-xs border border-[#E8E4DC] rounded-lg bg-[#FAF8F4] outline-none focus:ring-2 focus:ring-accent-400"
                  />
                  <span className="text-[#9C9890] text-xs">–</span>
                  <input
                    type="number"
                    value={maxRate}
                    onChange={(e) => setMaxRate(e.target.value)}
                    placeholder="Max"
                    className="w-full px-2.5 py-2 text-xs border border-[#E8E4DC] rounded-lg bg-[#FAF8F4] outline-none focus:ring-2 focus:ring-accent-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#1C1C1A] mb-1">Min. Experience</label>
                <select
                  value={minExperience}
                  onChange={(e) => setMinExperience(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E8E4DC] rounded-lg bg-[#FAF8F4] outline-none focus:ring-2 focus:ring-accent-400"
                >
                  <option value="">Any Experience</option>
                  <option value="1">1+ year</option>
                  <option value="3">3+ years</option>
                  <option value="5">5+ years</option>
                  <option value="10">10+ years</option>
                </select>
              </div>

              {hasActiveFilters && (
                <div className="sm:col-span-2 md:col-span-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold"
                  >
                    <X className="w-3 h-3" />
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto mt-6">
        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-[#6B6860]">
            {loading ? 'Searching...' : (
              pagination.total > 0
                ? <><strong className="text-[#1C1C1A]">{pagination.total}</strong> therapist{pagination.total !== 1 ? 's' : ''} found</>
                : 'No therapists found'
            )}
          </p>
          {pagination.pages > 1 && (
            <p className="text-xs text-[#9C9890]">
              Page {pagination.page} of {pagination.pages}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E8E4DC] p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#E8E4DC]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#E8E4DC] rounded w-3/4" />
                    <div className="h-3 bg-[#F0EDE6] rounded w-1/2" />
                    <div className="h-3 bg-[#F0EDE6] rounded w-1/3" />
                  </div>
                </div>
                <div className="mt-4 h-8 bg-[#F0EDE6] rounded-lg" />
                <div className="mt-3 flex gap-2">
                  <div className="h-5 bg-[#F0EDE6] rounded w-16" />
                  <div className="h-5 bg-[#F0EDE6] rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : therapists.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-brand-300" />
            </div>
            <h3 className="text-base font-bold text-[#1C1C1A] mb-1">No therapists found</h3>
            <p className="text-xs text-[#6B6860] max-w-sm mx-auto">
              Try adjusting your search or filters. New therapists join Unfazed every day.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-accent-50 text-accent-600 border border-accent-200 hover:bg-accent-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* Therapist Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {therapists.map((therapist) => (
              <TherapistCard key={therapist._id} therapist={therapist} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter((p) => {
                return p === 1 || p === pagination.pages || Math.abs(p - pagination.page) <= 2;
              })
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="text-xs text-[#9C9890]">...</span>
                  )}
                  <button
                    onClick={() => fetchTherapists(p)}
                    className={`w-9 h-9 rounded-lg text-xs font-semibold transition-colors ${
                      p === pagination.page
                        ? 'bg-accent-500 text-white shadow-sm'
                        : 'bg-white border border-[#E8E4DC] text-[#6B6860] hover:bg-brand-50'
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TherapistsPage;
