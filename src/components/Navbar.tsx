import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <GraduationCap className="w-6 h-6 text-indigo-400" />
          <span>Young Researcher <span className="text-indigo-400 font-normal">Global</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#fellowship" className="hover:text-white transition">Research Fellowship</Link>
          <Link href="#portfolio" className="hover:text-white transition">Spike Portfolios</Link>
          <Link href="#admissions" className="hover:text-white transition">Global Admissions</Link>
          <Link href="#insights" className="hover:text-white transition">Learning Log</Link>
        </nav>
        <div className="flex items-center gap-4">
          <a 
            href="https://youngresearcher.in" 
            target="_blank" 
            rel="noreferrer"
            className="text-xs border border-slate-700 px-3 py-1.5 rounded-md text-slate-400 hover:text-white transition"
          >
            ? Main Hub
          </a>
          <a 
            href="#contact" 
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-md transition shadow-sm"
          >
            Schedule Assessment
          </a>
        </div>
      </div>
    </header>
  );
}
