import Link from 'next/link';
import { ArrowRight, Globe, Sparkles, ShieldCheck, Zap, Phone, Mail } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50 bg-slate-950/70">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-sm tracking-tight text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            Vinit Dharaiya <span className="text-slate-500 font-normal">/ Studio</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <a 
              href="https://wa.me/916356182998" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full"
            >
              <Phone size={12} className="text-emerald-400" /> WhatsApp
            </a>
            <Link 
              href="/login" 
              className="hover:text-white transition-colors text-slate-500 text-[11px]"
            >
              Client Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium mx-auto mb-8">
          <Sparkles size={13} />
          High-Performance Web Design & Engineering
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
          Bespoke digital experiences for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">modern practices</span>.
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          I craft lightning-fast, conversion-focused websites and private client demos tailored specifically for healthcare providers and growing practices.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://wa.me/916356182998"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-950 font-semibold text-sm hover:bg-slate-100 transition-all shadow-lg shadow-white/10"
          >
            Schedule a Discussion <ArrowRight size={15} />
          </a>
          <a
            href="mailto:vinitdharaiya124@gmail.com"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-medium text-sm hover:bg-slate-800 hover:text-white transition-all"
          >
            <Mail size={15} /> Contact via Email
          </a>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 text-left">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-blue-950 flex items-center justify-center text-blue-400 mb-3 border border-blue-800/40">
              <Zap size={16} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Ultra-Fast Performance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Sub-second load times engineered for maximum mobile conversion.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400 mb-3 border border-indigo-800/40">
              <Globe size={16} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Custom Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Zero generic templates. Handcrafted layouts tailored to your brand identity.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 mb-3 border border-emerald-800/40">
              <ShieldCheck size={16} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Conversion Focused</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Strategic call-to-actions, direct WhatsApp booking, and lead tracking.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Vinit Dharaiya. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>+91 6356 182 998</span>
            <span>•</span>
            <span>vinitdharaiya124@gmail.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
