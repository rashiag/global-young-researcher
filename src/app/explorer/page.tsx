'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { UNIVERSITIES, University } from '@/data/universities';

export default function ExplorerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');
  const [selectedPortfolio, setSelectedPortfolio] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const countries = ['All', 'USA', 'UK', 'Europe', 'Canada', 'Singapore', 'Australia', 'New Zealand', 'Asia'];
  const tiers = ['All', 'Pinnacle / Ivy+', 'Global Top 30', 'High-ROI STEM', 'Selective Direct-Admit'];
  const portfolioTypes = [
    'All',
    'SlideRoom Maker',
    'Research Preprint',
    'AIF / Technical Form',
    'UCAS Technical Narrative',
    'Direct Video/Paper'
  ];

  const filteredUniversities = useMemo(() => {
    return UNIVERSITIES.filter((uni: University) => {
      const matchesSearch =
        uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.recommendedSpike.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCountry = selectedCountry === 'All' || uni.country === selectedCountry;
      const matchesTier = selectedTier === 'All' || uni.tier === selectedTier;
      const matchesPortfolio = selectedPortfolio === 'All' || uni.portfolioType === selectedPortfolio;

      return matchesSearch && matchesCountry && matchesTier && matchesPortfolio;
    });
  }, [searchQuery, selectedCountry, selectedTier, selectedPortfolio]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 antialiased">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Young Researcher <span className="text-slate-400 font-light text-sm">Global</span>
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Overview
            </Link>
            <Link
              href="/#assessment"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all"
            >
              Schedule Assessment
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Hero */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-4">
            <span>🏛️ Admissions & Portfolio Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Global STEM University Directory
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Analyze exact portfolio evaluation mechanisms, departmental faculty review policies, and research spikes required across 70+ top-tier global institutions (US, UK, Europe, Italy, Germany, Canada, Australia & New Zealand).
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 sm:p-8 mb-10 shadow-2xl">
          {/* Search Box */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search by university, city, country (e.g. Italy, New Zealand, Germany), or topic (e.g. AI, Robotics, TOLC-I)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#030712] border border-slate-700/80 rounded-xl px-4 py-3.5 pl-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <span className="absolute left-4 top-3.5 text-slate-500 text-sm">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="space-y-4 text-xs">
            {/* Region */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-slate-400 font-semibold w-20 shrink-0">Region:</span>
              <div className="flex flex-wrap gap-1.5">
                {countries.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCountry(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedCountry === c
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-[#030712] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Selectivity */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-slate-400 font-semibold w-20 shrink-0">Selectivity:</span>
              <div className="flex flex-wrap gap-1.5">
                {tiers.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTier(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedTier === t
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30'
                        : 'bg-[#030712] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Portfolio Mechanism */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-slate-400 font-semibold w-20 shrink-0">Portfolio:</span>
              <div className="flex flex-wrap gap-1.5">
                {portfolioTypes.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPortfolio(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedPortfolio === p
                        ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30'
                        : 'bg-[#030712] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Counter and Reset */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-xs text-slate-400">
            Displaying <span className="font-bold text-white">{filteredUniversities.length}</span> curated programs
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
              Reset Filters
            </button>
          )}
        </div>

        {/* Universities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniversities.map((uni) => {
            const isExpanded = expandedId === uni.id;

            return (
              <div
                key={uni.id}
                className="bg-[#0B1120] border border-slate-800/90 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl group"
              >
                <div>
                  {/* Top Metadata */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                      {uni.country}
                    </span>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300">
                      {uni.tier}
                    </span>
                  </div>

                  {/* Program Title */}
                  <h3 className="text-lg font-bold text-white mb-1 leading-snug group-hover:text-indigo-200 transition-colors">
                    {uni.name}
                  </h3>
                  <p className="text-xs text-slate-400 mb-5">{uni.location}</p>

                  {/* Metrics Box */}
                  <div className="grid grid-cols-2 gap-2 bg-[#030712] p-3.5 rounded-xl border border-slate-800/80 mb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Selectivity</span>
                      <span className="text-xs font-semibold text-emerald-400">{uni.acceptanceRate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Faculty Review</span>
                      <span className={`text-xs font-semibold ${uni.facultyReview ? 'text-amber-300' : 'text-slate-400'}`}>
                        {uni.facultyReview ? 'Yes (Department)' : 'Admissions Board'}
                      </span>
                    </div>
                  </div>

                  {/* Portfolio Badge */}
                  <div className="mb-4">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">Portfolio Submission:</span>
                    <span className="inline-block bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs px-2.5 py-1 rounded-lg">
                      {uni.portfolioType}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-5">
                    {uni.description}
                  </p>

                  {/* Expandable Technical Details */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-800/80 space-y-3.5 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block text-[11px] mb-1.5">
                          🎯 Recommended Research Spike:
                        </span>
                        <div className="text-slate-200 bg-[#030712] p-3 rounded-lg border border-slate-800 leading-relaxed">
                          {uni.recommendedSpike}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 pt-1 text-slate-300">
                        <div>
                          <span className="text-slate-500 font-semibold block text-[10px] uppercase">Portal</span>
                          <span className="text-xs">{uni.primaryPortal}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block text-[10px] uppercase">Deadlines</span>
                          <span className="text-xs">{uni.keyDeadlines}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-5 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : uni.id)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {isExpanded ? 'Hide Strategy ↑' : 'View Research Strategy ↓'}
                  </button>

                  <Link
                    href="/#assessment"
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium px-3.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
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
