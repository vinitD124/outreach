'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowUpRight, 
  Check, 
  ExternalLink, 
  Globe, 
  Laptop, 
  Layers, 
  Lock, 
  Mail, 
  MessageSquare, 
  Phone, 
  Shield, 
  Sparkles, 
  Zap 
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dental');

  const previews = {
    dental: {
      tag: "Dental & Implantology",
      title: "Apex Dental Care",
      subtitle: "Ahmedabad, Gujarat",
      stat: "< 0.4s load time",
      image: "/img/header-1.png",
      features: ["One-tap WhatsApp Booking", "Interactive Smile Gallery", "Real Google Reviews Sync"]
    },
    derma: {
      tag: "Dermatology & Cosmetology",
      title: "Radiance Skin & Laser Clinic",
      subtitle: "Navrangpura, Ahmedabad",
      stat: "4.2x inquiry rate",
      image: "/img/bg-img-1.png",
      features: ["Visual Treatment Breakdown", "Doctor Credentials Showcase", "Mobile-first booking flow"]
    },
    surgical: {
      tag: "Orthopedics & Surgical",
      title: "Vanguard Specialty Hospital",
      subtitle: "Bespoke Architecture",
      stat: "100% Mobile Optimized",
      image: "/img/bg-img-2.png",
      features: ["Emergency Call Fast-track", "OPD Schedule Finder", "Location & Maps Integration"]
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans antialiased">
      
      {/* Top Announcement Bar */}
      <div className="border-b border-slate-800/60 bg-blue-950/30 text-xs py-2 px-4 text-center text-slate-300 flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-medium border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Q3 OPEN FOR COMMISSIONS
        </span>
        <span className="hidden sm:inline text-slate-400">Accepting bespoke web development projects for selective healthcare practices.</span>
      </div>

      {/* Navigation */}
      <header className="border-b border-slate-800/80 backdrop-blur-xl sticky top-0 z-50 bg-[#090d16]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 text-sm">
              V
            </div>
            <div>
              <div className="font-semibold text-sm tracking-tight text-white flex items-center gap-2">
                Vinit Dharaiya
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Independent Web Engineer</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://wa.me/916356182998" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-medium text-slate-200 hover:text-white transition-all flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 px-3.5 py-1.5 rounded-lg shadow-sm"
            >
              <Phone size={13} className="text-emerald-400" /> 
              <span>+91 6356 182 998</span>
            </a>

            <Link 
              href="/login" 
              className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 border border-transparent hover:border-slate-800 px-2.5 py-1.5 rounded-lg"
            >
              <Lock size={12} className="text-slate-500" /> Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Asymmetric Split */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Value Prop */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
              <Sparkles size={12} className="text-blue-400" />
              <span>PRIVATE DEMO-FIRST METHODOLOGY</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              I don&apos;t send proposals.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
                I build your live website first.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
              Tailor-made, high-converting digital presence engineered specifically for premier dental clinics, aesthetic centers, and medical practitioners. Zero generic templates.
            </p>

            {/* Direct Contact CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href="https://wa.me/916356182998?text=Hi%20Vinit,%20I%20saw%20your%20portfolio%20and%20would%20like%20to%20discuss%20a%20website."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 active:scale-[0.98]"
              >
                <MessageSquare size={16} /> Chat on WhatsApp <ArrowUpRight size={15} />
              </a>
              
              <a
                href="mailto:vinitdharaiya124@gmail.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium text-sm hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98]"
              >
                <Mail size={16} /> Send Email Brief
              </a>
            </div>

            {/* Micro Trust Stats */}
            <div className="pt-8 border-t border-slate-900 grid grid-cols-3 gap-4 text-left">
              <div>
                <p className="text-2xl font-bold text-white font-mono">100%</p>
                <p className="text-xs text-slate-400 mt-0.5">Custom Codebase</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white font-mono">&lt; 0.5s</p>
                <p className="text-xs text-slate-400 mt-0.5">Next.js Speed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white font-mono">Direct</p>
                <p className="text-xs text-slate-400 mt-0.5">Engineer Access</p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Mockup Widget */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl shadow-black/80 relative overflow-hidden backdrop-blur-sm">
              
              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800/80 rounded-xl mb-4 text-xs">
                {Object.keys(previews).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all capitalize ${
                      activeTab === key 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* Browser Window Mockup */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                {/* Browser bar */}
                <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 tracking-wider">
                    {previews[activeTab].tag.toUpperCase()}
                  </span>
                  <div className="w-8"></div>
                </div>

                {/* Preview Image / Visual */}
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <Image 
                    src={previews[activeTab].image}
                    alt={previews[activeTab].title}
                    fill
                    className="object-cover object-top opacity-90 transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                  
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <div>
                      <p className="text-xs font-bold text-white">{previews[activeTab].title}</p>
                      <p className="text-[11px] text-slate-300">{previews[activeTab].subtitle}</p>
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {previews[activeTab].stat}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="p-4 bg-slate-950/90 space-y-2 border-t border-slate-900">
                  <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">Engineered Features:</p>
                  {previews[activeTab].features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check size={13} className="text-blue-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Globe size={13} className="text-blue-400" /> Private deployment preview
                </span>
                <a 
                  href="https://wa.me/916356182998?text=Hi%20Vinit,%20I%20want%20to%20see%20a%20demo%20for%20my%20clinic." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                >
                  Request yours &rarr;
                </a>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3-Step Execution Philosophy */}
      <section className="border-t border-slate-900 bg-[#060910] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              The anti-agency execution model.
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Most agencies charge hefty retainers before writing a single line of code. We take a different route.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <span className="text-xs font-mono text-blue-400 font-bold">01 / RESEARCH</span>
              <h3 className="text-base font-semibold text-white mt-3 mb-2">Practice Diagnostics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We analyze your local market, existing online presence, doctor credentials, and patient booking friction points.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <span className="text-xs font-mono text-indigo-400 font-bold">02 / PROTOTYPE</span>
              <h3 className="text-base font-semibold text-white mt-3 mb-2">Full Working Demo</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We engineer a complete, interactive website demo under a private link before asking for any financial commitment.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <span className="text-xs font-mono text-emerald-400 font-bold">03 / SHIP</span>
              <h3 className="text-base font-semibold text-white mt-3 mb-2">Launch & Scale</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant domain connection, zero-downtime serverless hosting, Google Analytics integration, and 1-tap WhatsApp routing.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-10 bg-[#090d16]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Vinit Dharaiya</p>
            <p className="text-xs text-slate-400 mt-0.5">Independent Web Engineer for Modern Healthcare Practices</p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <a href="https://wa.me/916356182998" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <Phone size={12} className="text-emerald-400" /> +91 6356 182 998
            </a>
            <a href="mailto:vinitdharaiya124@gmail.com" className="hover:text-white transition-colors flex items-center gap-1">
              <Mail size={12} className="text-blue-400" /> vinitdharaiya124@gmail.com
            </a>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">© {new Date().getFullYear()} All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
