import Navbar from '@/components/Navbar';
import { ArrowRight, Code, FileText, Globe, Sparkles, CheckCircle2, BookOpen } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Faculty-Directed Pre-College Research & Strategic Admissions</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Bridging High School Scholarship with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Top-Tier Global Admits</span>.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Move beyond cookie-cutter profiles. We mentor ambitious students through authentic computational research, peer-reviewed preprints, and targeted global university roadmaps.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a 
            href="#fellowship" 
            className="px-6 py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
          >
            Explore Research Fellowship <ArrowRight className="w-4 h-4" />
          </a>
          <a 
            href="#insights" 
            className="px-6 py-3.5 rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-medium text-sm transition"
          >
            Read the Admissions Log
          </a>
        </div>

        {/* Credibility Ribbon */}
        <div className="mt-16 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800">
            <p className="text-2xl font-bold text-white">Carnegie Mellon</p>
            <p className="text-xs text-slate-400 mt-1">CSE Admit (Fall Profile)</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800">
            <p className="text-2xl font-bold text-white">Christ Univ</p>
            <p className="text-xs text-slate-400 mt-1">BBA (Hons) Admit</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800">
            <p className="text-2xl font-bold text-white">1-on-1</p>
            <p className="text-xs text-slate-400 mt-1">Faculty-Led Research Review</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800">
            <p className="text-2xl font-bold text-white">Swaroop Nagar</p>
            <p className="text-xs text-slate-400 mt-1">Kanpur Innovation Hub</p>
          </div>
        </div>
      </section>

      {/* Core Tracks Section */}
      <section id="fellowship" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white">The Three Pillars of Preparation</h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            How we guide students from initial academic discovery to submitted applications.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 mb-6">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">8-Week Research Fellowship</h3>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                Structured computational research tracks in Applied AI, Remote Sensing, and Data Science. Students produce a functional code repository and a structured preprint paper.
              </p>
            </div>
            <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Literature Review Mastery</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Reproducible Python Codebases</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Formal Faculty Evaluation Letter</li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div id="portfolio" className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Spike Portfolio Architecture</h3>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                High school profiles need a unifying narrative. We design multi-year project arcs (Grades 9 to 12) that link coding, community STEM impact, and academic depth.
              </p>
            </div>
            <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Common App 10-Activity Hierarchy</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Technical GitHub Portfolios</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Competition & Science Fair Strategy</li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div id="admissions" className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Selective Admissions Strategy</h3>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                Data-driven university selection across US (Common App), UK (UCAS), and European ecosystems. No commission-driven push, only genuine fit.
              </p>
            </div>
            <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Balanced Reach/Target/Safety lists</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> SOP & Personal Statement Review</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> LOR Framing & Narrative Sync</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Learning Log Section */}
      <section id="insights" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" /> The Admissions Research Log
            </div>
            <h2 className="text-3xl font-bold text-white">Faculty Notes & Analysis</h2>
          </div>
          <p className="text-slate-400 text-sm max-w-md mt-4 md:mt-0">
            Field notes on holistic admissions, profile building, and global curriculum mapping.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition">
            <span className="text-xs font-mono text-indigo-400">Week 1 / Foundations</span>
            <h4 className="text-lg font-bold text-white mt-2">Inside the US Common App: How Top CSE Programs Actually Evaluate Portfolios</h4>
            <p className="text-slate-400 text-sm mt-2">
              Why high GPAs and standard coding certificates fail to move the needle without genuine academic spikes and faculty-supervised projects.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition">
            <span className="text-xs font-mono text-cyan-400">Week 2 / Global Comparisons</span>
            <h4 className="text-lg font-bold text-white mt-2">US Holistic Review vs. UK UCAS: Choosing the Right Application Pathway</h4>
            <p className="text-slate-400 text-sm mt-2">
              A breakdown of subject-specific personal statements versus narrative essays for high school applicants.
            </p>
          </div>
        </div>
      </section>

      {/* Diagnostic Form */}
      <section id="contact" className="py-20 px-6 max-w-4xl mx-auto border-t border-slate-800/60">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Schedule an Academic Profile Diagnostic</h2>
          <p className="text-slate-400 text-sm mt-3 max-w-lg mx-auto">
            Available at our Swaroop Nagar Innovation Center or virtually. We evaluate transcripts, research interests, and multi-year timelines.
          </p>

          <form className="mt-8 grid sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Student Name</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="Student Name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Current Grade / Year</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="Grade 11 (CBSE/ISC)" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Major / Research Field</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. Computer Science, AI, Applied Math" />
            </div>
            <button 
              type="button" 
              className="sm:col-span-2 mt-2 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition shadow-md shadow-indigo-600/20"
            >
              Submit Profile for Review
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-900 text-center text-xs text-slate-500">
        &copy; 2026 Young Researcher Global. Swaroop Nagar, Kanpur. Academic Research & Strategic Admissions Advisory.
      </footer>
    </div>
  );
}