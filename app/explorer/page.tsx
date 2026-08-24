'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { UNIVERSITIES } from '@/data/universities';

export default function ExplorerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');
  const [selectedPortfolio, setSelectedPortfolio] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const countries = ['All', 'USA', 'UK', 'Canada', 'Singapore', 'Europe'];
  const tiers = ['All', 'Pinnacle / Ivy+', 'Global Top 30', 'High-ROI STEM'];
  const portfolioTypes = ['All', 'SlideRoom Maker', 'Research Preprint', 'AIF / Technical Form', 'UCAS Technical Narrative', 'Direct Video/Paper'];

  const filteredUniversities = useMemo(() => {
    return UNIVERSITIES.filter((uni) => {
      const matchesSearch =
        uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.recommendedSpike.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCountry = selectedCountry === 'All' || uni.country === selectedCountry;
      const matchesTier = selectedTier === 'All' || uni.tier === selectedTier;
      const matchesPortfolio = selectedPortfolio === 'All' || uni.portfolioType === selectedPortfolio;

      return matchesSearch && matchesCountry && matchesTier && matchesPortfolio;
    });
  }, [searchQuery, selectedCountry, selectedTier, selectedPortfolio]);

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 font-sans pb-24">
      {/* Header */}
      <div className="border-b border-slate-800/80 bg-[#0B1120]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Young Researcher <span className="text-slate-400 font-light text-base">Global</span>
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
              ← Back to Hub
            </Link>
            <Link
              href="/#assessment"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
            >
              Schedule Diagnostic
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-12">
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium mb-4">
            <span>🏛️ Global Admissions & Portfolio Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Top STEM Universities & Portfolio Requirements
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Explore how the world’s elite engineering and computer science programs evaluate maker portfolios, published preprints, and technical supplements.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-6 mb-10 shadow-xl">
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by university name, location, or research keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#070B14] border border-slate-700/80 rounded-xl px-4 py-3.5 pl-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <span className="absolute left-4 top-3.5 text-slate-500">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-semibold w-24">Country:</span>
              <div className="flex flex-wrap gap-1.5">
                {countries.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCountry(c)}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${
                      selectedCountry === c
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-[#070B14] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-semibold w-24">Tier:</span>
              <div className="flex flex-wrap gap-1.5">
                {tiers.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTier(t)}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${
                      selectedTier === t
                        ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                        : 'bg-[#070B14] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-semibold w-24">Portfolio:</span>
              <div className="flex flex-wrap gap-1.5">
                {portfolioTypes.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPortfolio(p)}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${
                      selectedPortfolio === p
                        ? 'bg-purple-600 border-purple-500 text-white shadow-sm'
                        : 'bg-[#070B14] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Counter */}
        <div className="flex justify-between items-center mb-6 px-1">
          <p className="text-xs text-slate-400">
            Showing <span className="font-bold text-white">{filteredUniversities.length}</span> top programs
          </p>
          {(selectedCountry !== 'All' || selectedTier !== 'All' || selectedPortfolio !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCountry('All');
                setSelectedTier('All');
                setSelectedPortfolio('All');
                setSearchQuery('');
              }}
              className="text-xs text-indigo-400 hover:underline"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniversities.map((uni) => {
            const isExpanded = expandedId === uni.id;

            return (
              <div
                key={uni.id}
                className="bg-[#0D1527] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/50 transition-all duration-300 shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                      {uni.country}
                    </span>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300">
                      {uni.tier}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 leading-snug">
                    {uni.name}
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">{uni.location}</p>

                  <div className="grid grid-cols-2 gap-2 bg-[#070B14] p-3 rounded-xl border border-slate-800/80 mb-4 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Selectivity</span>
                      <span className="font-semibold text-emerald-400">{uni.acceptanceRate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Faculty Review</span>
                      <span className={`font-semibold ${uni.facultyReview ? 'text-amber-300' : 'text-slate-400'}`}>
                        {uni.facultyReview ? 'Yes (Department)' : 'Admissions Board'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-[11px] text-slate-400 block mb-1 font-semibold">Portfolio Mechanism:</span>
                    <span className="inline-block bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs px-2.5 py-1 rounded-lg">
                      {uni.portfolioType}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {uni.description}
                  </p>

                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block text-[11px] mb-1">
                          🎯 Recommended Research Spike:
                        </span>
                        <p className="text-slate-300 bg-[#070B14] p-3 rounded-lg border border-slate-800 leading-relaxed">
                          {uni.recommendedSpike}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-2 pt-1">
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">Application Portal</span>
                          <span className="text-slate-300 text-xs">{uni.primaryPortal}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">Key Deadlines</span>
                          <span className="text-slate-300 text-xs">{uni.keyDeadlines}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : uni.id)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {isExpanded ? 'Hide Details ↑' : 'View Portfolio Strategy ↓'}
                  </button>

                  <Link
                    href="/#assessment"
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                  >
                    Assess Fit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
