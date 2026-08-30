'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Check, 
  ChevronRight, 
  Globe, 
  Lock, 
  Mail, 
  MessageSquare, 
  Phone, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Zap 
} from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const [activeService, setActiveService] = useState(0);
  const [selectedBudget, setSelectedBudget] = useState('₹25k - ₹50k');
  const [selectedService, setSelectedService] = useState('Website Redesign');
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryContact, setInquiryContact] = useState('');
  const [inquiryNote, setInquiryNote] = useState('');

  const services = [
    {
      num: "01",
      title: "Interactive Prototype & Concept Websites",
      desc: "We engineer a full working, high-fidelity website concept specifically for your clinic or hospital before you commit a single rupee.",
      tags: ["Next.js", "Custom UI", "Tailored Copy"]
    },
    {
      num: "02",
      title: "One-Tap Patient Conversion & WhatsApp Flow",
      desc: "Streamlined appointment booking directly into your clinic WhatsApp or reception phone with zero patient drop-off.",
      tags: ["Conversion Rate Opt", "Direct Routing", "Mobile First"]
    },
    {
      num: "03",
      title: "Doctor Authority & Treatment Showcases",
      desc: "Elevate your credibility with interactive before/after smile galleries, specialist doctor bios, and verified patient reviews.",
      tags: ["Case Galleries", "Google Reviews Sync", "SEO Authority"]
    },
    {
      num: "04",
      title: "Ultra-Fast Serverless Cloud Infrastructure",
      desc: "Sub-second page speeds hosted on global edge networks with 99.99% uptime, enterprise SSL, and zero maintenance headaches.",
      tags: ["Edge CDN", "Zero-Downtime", "Speed Optimized"]
    }
  ];

  const steps = [
    { num: "01", title: "DISCOVERY AUDIT", desc: "We analyze your existing online footprint, local competitors, and patient acquisition bottlenecks." },
    { num: "02", title: "CONCEPT ARCHITECTURE", desc: "We plan custom typography, color harmony, and strategic conversion pathways tailored to your practice." },
    { num: "03", title: "LIVE PRIVATE DEMO", desc: "A fully working, interactive website is built on a private URL for you to test on your own phone." },
    { num: "04", title: "DOCTOR REVIEW", desc: "We refine every treatment section, doctor credential, and imagery asset according to your exact preferences." },
    { num: "05", title: "PRODUCTION LAUNCH", desc: "Instant custom domain connection, Google Search Console indexing, and WhatsApp routing setup." },
    { num: "06", title: "ONGOING GROWTH", desc: "Continuous technical maintenance, analytics tracking, and speed optimization for your practice." }
  ];

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!inquiryName) {
      toast.error("Please enter your name or clinic name.");
      return;
    }
    const message = `Hi Vinit, I'm ${inquiryName}. I'm interested in ${selectedService} with budget ${selectedBudget}. Note: ${inquiryNote || 'None'}. My contact: ${inquiryContact || 'WhatsApp'}`;
    const whatsappUrl = `https://wa.me/916356182998?text=${encodeURIComponent(message)}`;
    toast.success("Opening WhatsApp chat with your project details!");
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#060813] text-slate-100 selection:bg-blue-600 selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* 1. HERO SECTION WITH VIBRANT LUMINOUS SAPPHIRE AURA */}
      <div className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden border-b border-slate-800/80">
        
        {/* Radial Ambient Glows (Like Reference 1 & 2) */}
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-blue-600/40 via-indigo-600/20 to-transparent blur-[130px] pointer-events-none -z-0"></div>
        <div className="absolute top-[15%] right-[-10%] w-[500px] h-[400px] bg-purple-600/20 blur-[140px] pointer-events-none -z-0"></div>
        
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-0"></div>

        {/* Navigation Bar */}
        <header className="relative z-10 max-w-7xl mx-auto px-6 h-20 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30 text-sm">
              ✦
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">Vinit Dharaiya</span>
              <span className="text-xs text-blue-400/80 font-mono hidden sm:inline">/ STUDIO</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-full text-xs font-medium text-slate-300">
            <a href="#services" className="px-4 py-1.5 rounded-full hover:text-white transition-colors">Services</a>
            <a href="#protocol" className="px-4 py-1.5 rounded-full hover:text-white transition-colors">Protocol</a>
            <a href="#contact" className="px-4 py-1.5 rounded-full hover:text-white transition-colors">Inquiry</a>
          </nav>

          <div className="flex items-center gap-3">
            <a 
              href="https://wa.me/916356182998"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-4 py-2 rounded-full bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-md shadow-white/10 flex items-center gap-1.5 active:scale-[0.97]"
            >
              <Phone size={13} className="text-emerald-600" />
              <span>Let&apos;s Talk</span>
            </a>
            <Link 
              href="/login" 
              className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors p-2 border border-slate-800/80 hover:border-slate-700 rounded-full"
              title="Admin Portal"
            >
              <Lock size={13} />
            </Link>
          </div>
        </header>

        {/* Hero Main Copy */}
        <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20 w-full flex-1 flex flex-col justify-center">
          <div className="max-w-4xl space-y-6 text-left">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/70 text-blue-400 text-xs font-mono backdrop-blur-md shadow-sm">
              <Sparkles size={12} />
              <span>DATA-DRIVEN & BESPOKE ARCHITECTURE</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.02]">
              Your Digital<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                Growth Partner
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-300/90 max-w-2xl leading-relaxed pt-2">
              We design and engineer bespoke, high-converting digital platforms specifically tailored for selective healthcare practices, clinics, and modern medical brands.
            </p>

            {/* CTA Group */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-xl shadow-blue-600/30 active:scale-[0.98]"
              >
                <span>Explore Custom Solutions</span>
                <ArrowRight size={16} />
              </a>

              <a
                href="https://wa.me/916356182998?text=Hi%20Vinit,%20I%20would%20like%20to%20see%20a%20concept%20for%20my%20practice."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-medium text-sm transition-all active:scale-[0.98]"
              >
                <MessageSquare size={16} className="text-emerald-400" />
                <span>Instant WhatsApp Consult</span>
              </a>
            </div>

          </div>
        </main>

        {/* Dynamic Ticker / Watermark Banner (Reference 2 style) */}
        <div className="relative z-10 border-t border-slate-800/80 py-4 bg-slate-950/60 backdrop-blur-md overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs font-mono tracking-widest text-slate-400 uppercase">
            <span className="flex items-center gap-2">✦ ZERO TEMPLATES</span>
            <span className="hidden sm:flex items-center gap-2">✦ 100% BESPOKE CODEBASE</span>
            <span className="hidden md:flex items-center gap-2">✦ PRIVATE INTERACTIVE PROTOTYPES</span>
            <span className="flex items-center gap-2">✦ &lt; 0.4S LOAD TIME</span>
          </div>
        </div>

      </div>


      {/* 2. CRISP WHITE EDITORIAL CARD SECTION (Inspired by Reference 1 & 2) */}
      <section className="bg-white text-slate-950 py-24 px-6 relative z-20">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Bold Editorial Headline */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-lg mb-6">
                ✦
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-[1.1]">
                Navigating Success:<br />
                Your Strategic<br />
                Partner
              </h2>
              <p className="text-xs font-mono text-slate-400 pt-6 uppercase tracking-wider">
                Engineering digital dominance for clinics & hospitals
              </p>
            </div>

            {/* Right Column: Mission Statement & Key Numbers */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                We empower forward-thinking medical practices by delivering bespoke, conversion-engineered digital platforms tailored to their unique identity. From doctor authority to effortless mobile patient bookings, every detail is engineered to scale.
              </p>

              {/* High-Contrast Stat Cards (Reference 1 style) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-200">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-mono text-blue-600 font-semibold uppercase tracking-wider">Speed Score</span>
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-1 font-mono">100%</p>
                  <p className="text-xs text-slate-500 mt-1">Google Core Vitals</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-mono text-emerald-600 font-semibold uppercase tracking-wider">Conversion</span>
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-1 font-mono">4.2x</p>
                  <p className="text-xs text-slate-500 mt-1">Patient Inquiries</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-mono text-purple-600 font-semibold uppercase tracking-wider">Delivery</span>
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-1 font-mono">3 Days</p>
                  <p className="text-xs text-slate-500 mt-1">Working Prototype</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* 3. INTERACTIVE SOLUTIONS ACCORDION (Inspired by Reference 1 & 2) */}
      <section id="services" className="py-24 px-6 max-w-7xl mx-auto w-full text-left">
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-mono mb-4">
            <span>WHAT WE DO FOR YOUR PRACTICE</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Our Core Solutions
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            We don&apos;t just make websites look pretty. We engineer revenue-generating digital infrastructure.
          </p>
        </div>

        {/* Stacked Accordion List */}
        <div className="space-y-4">
          {services.map((srv, idx) => {
            const isActive = activeService === idx;
            return (
              <div 
                key={srv.num}
                onClick={() => setActiveService(idx)}
                className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? 'bg-slate-900/90 border-blue-500/60 shadow-2xl shadow-blue-500/10' 
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <span className={`text-sm font-mono font-bold px-2.5 py-1 rounded-md ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}>
                      {srv.num}
                    </span>
                    <h3 className={`text-xl sm:text-2xl font-bold transition-colors ${
                      isActive ? 'text-white' : 'text-slate-300'
                    }`}>
                      {srv.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {srv.tags.map((t, i) => (
                      <span key={i} className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-950 text-slate-400 border border-slate-800/80 hidden md:inline-block">
                        {t}
                      </span>
                    ))}
                    <ChevronRight size={18} className={`transition-transform text-slate-400 ${isActive ? 'rotate-90 text-blue-400' : ''}`} />
                  </div>
                </div>

                {isActive && (
                  <div className="mt-4 pt-4 border-t border-slate-800 text-slate-400 text-sm sm:text-base leading-relaxed animate-in fade-in duration-200">
                    <p>{srv.desc}</p>
                    <div className="mt-4 flex gap-2 md:hidden flex-wrap">
                      {srv.tags.map((t, i) => (
                        <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-blue-400 border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>


      {/* 4. 6-STEP PROTOCOL GRID (Reference 2 style) */}
      <section id="protocol" className="border-t border-slate-800/80 bg-[#070a14] py-24 px-6 text-left">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-mono mb-4">
                <span>SYSTEMATIC EXECUTION</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                Clear Steps. Real Results.
              </h2>
            </div>
            <p className="text-slate-400 text-sm max-w-md">
              We keep things intentional, collaborative, and fast so you always know what is being built and why.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((st) => (
              <div 
                key={st.num}
                className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all hover:bg-slate-900/70 group"
              >
                <span className="text-4xl font-extrabold font-mono text-slate-700 group-hover:text-blue-500 transition-colors">
                  {st.num}
                </span>
                <h3 className="text-base font-bold text-white mt-4 mb-2 tracking-wide uppercase font-mono">
                  {st.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 5. INTERACTIVE INQUIRY CARD CONSOLE (Inspired by Reference 3 - Asia.Agency style) */}
      <section id="contact" className="py-24 px-6 max-w-5xl mx-auto w-full relative">
        
        {/* Glow behind the card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/15 blur-[120px] pointer-events-none -z-0"></div>

        <div className="relative z-10 bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl text-left">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column of Form */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Tell us about<br />your project.
              </h2>
              
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check size={14} /> <span>Direct response within 12 hours</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check size={14} /> <span>Private interactive demo before commitment</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check size={14} /> <span>Zero boilerplate retainers or agency bloat</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/80 space-y-3">
                <p className="text-xs text-slate-400">Direct Contact:</p>
                <a 
                  href="mailto:vinitdharaiya124@gmail.com" 
                  className="block text-sm font-medium text-white hover:text-blue-400 transition-colors"
                >
                  vinitdharaiya124@gmail.com
                </a>
                <a 
                  href="https://wa.me/916356182998" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
                >
                  <Phone size={12} /> WhatsApp: +91 6356 182 998
                </a>
              </div>
            </div>

            {/* Right Column: Interactive Form */}
            <form onSubmit={handleInquirySubmit} className="lg:col-span-7 space-y-6">
              
              {/* Service Selection Chips */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-2 tracking-wider">Service Required</label>
                <div className="flex flex-wrap gap-2">
                  {['Website Redesign', 'New Practice Build', 'WhatsApp Booking System', 'Performance Audit'].map((srv) => (
                    <button
                      type="button"
                      key={srv}
                      onClick={() => setSelectedService(srv)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedService === srv
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {srv}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Selection Chips */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-2 tracking-wider">Estimated Budget</label>
                <div className="flex flex-wrap gap-2">
                  {['< ₹25k', '₹25k - ₹50k', '₹50k - ₹1L', '> ₹1L'].map((b) => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => setSelectedBudget(b)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedBudget === b
                          ? 'bg-white text-slate-950 font-semibold'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 tracking-wider">Your Name / Clinic *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Patel / Apex Dental"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 tracking-wider">Phone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={inquiryContact}
                    onChange={(e) => setInquiryContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 tracking-wider">Project Details (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Tell us about your clinic goals or what you want improved..."
                  value={inquiryNote}
                  onChange={(e) => setInquiryNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Send size={15} />
                <span>Submit Inquiry & Start Chat</span>
              </button>

            </form>

          </div>

        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-slate-900 py-12 bg-[#050711] text-xs text-slate-500 text-left">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-semibold text-white text-sm">Vinit Dharaiya — Studio</p>
            <p className="text-slate-400 mt-1">Bespoke digital architecture for high-performing healthcare practices.</p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="https://wa.me/916356182998" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">WhatsApp</a>
            <a href="mailto:vinitdharaiya124@gmail.com" className="text-slate-400 hover:text-white transition-colors">Email</a>
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors">Admin Portal</Link>
            <span className="text-slate-700">|</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
