'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Command, 
  Globe, 
  Lock, 
  Mail, 
  MessageSquare, 
  Phone, 
  Send, 
  Sparkles, 
  Star, 
  Zap 
} from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const [activeService, setActiveService] = useState(1);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const services = [
    {
      id: "01",
      title: "Creating Branding and Clinical Identity",
      desc: "Distinctive, high-authority brand aesthetics crafted specifically for premier clinics, aesthetic centers, and medical practitioners."
    },
    {
      id: "02",
      title: "Design and High-Converting Platforms",
      desc: "Zero generic templates. Handcrafted, bespoke websites engineered for effortless mobile patient bookings and high inquiry volume."
    },
    {
      id: "03",
      title: "Conducting Market Research & Diagnostics",
      desc: "Deep analysis of local healthcare search intent, competitor vulnerabilities, and patient conversion friction."
    },
    {
      id: "04",
      title: "Developing Private Interactive Prototypes",
      desc: "We build a fully functional, live demo of your practice website on a private link before asking for any financial commitment."
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sonal Patel",
      role: "Lead Dermatologist & Founder",
      clinic: "Radiance Skin & Laser Clinic",
      quote: "Working with Vinit transformed our online presence. The private demo approach meant we saw our exact website live before paying. Inquiries increased by over 300% within the first month.",
      avatar: "/img/bg-img-1.png"
    },
    {
      name: "Dr. Ankit Mehta",
      role: "Chief Dental Surgeon",
      clinic: "Apex Dental & Implant Centre",
      quote: "The speed and attention to detail is unmatched. Our patients constantly compliment the easy 1-tap WhatsApp booking flow. It feels like an Apple-grade product.",
      avatar: "/img/bg-img-2.png"
    }
  ];

  const handleCopyContact = () => {
    navigator.clipboard.writeText("vinitdharaiya124@gmail.com");
    toast.success("Copied email to clipboard! (vinitdharaiya124@gmail.com)");
  };

  return (
    <div className="min-h-screen bg-[#050711] text-slate-100 selection:bg-blue-600 selection:text-white font-sans antialiased overflow-x-hidden">

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Matches Reference 1: Supastars with bg-grad-1) */}
      {/* ========================================================================= */}
      <section className="relative min-h-[96vh] flex flex-col justify-between overflow-hidden">
        
        {/* User's Uploaded Background Image */}
        <div className="absolute inset-0 -z-0">
          <Image 
            src="/img/bg-grad-1.png" 
            alt="Hero Background Aura" 
            fill 
            priority
            className="object-cover object-top"
          />
          {/* Subtle bottom fade to blend into the white card */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050711]/60"></div>
        </div>

        {/* Top Navbar (Pill Navigation matching Supastars) */}
        <header className="relative z-20 max-w-7xl mx-auto px-6 h-24 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-white text-sm shadow-sm">
              ✦
            </div>
            <span className="font-extrabold text-base tracking-widest text-white uppercase">
              Vinit Dharaiya
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-2 p-1 bg-black/30 border border-white/10 backdrop-blur-md rounded-full text-[11px] font-semibold tracking-wider uppercase text-slate-300">
            <a href="#services" className="px-4 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all">Services</a>
            <a href="#numbers" className="px-4 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all">Impact</a>
            <a href="#testimonial" className="px-4 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all">Testimonial</a>
            <a href="#contact" className="px-4 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <a 
              href="https://wa.me/916356182998"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-4 py-2 rounded-full bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-lg shadow-white/10 flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Phone size={12} className="text-emerald-600" />
              <span>WhatsApp</span>
            </a>
            <Link 
              href="/login" 
              className="text-xs text-white/60 hover:text-white transition-colors p-2 rounded-full border border-white/10 hover:border-white/30"
              title="Admin Portal"
            >
              <Lock size={12} />
            </Link>
          </div>
        </header>

        {/* Hero Headline & Rotating Badge */}
        <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 w-full flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            
            {/* Left: Huge Display Typography */}
            <div className="lg:col-span-8 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-blue-200 text-xs font-medium backdrop-blur-md">
                <span>✦ Data-Driven And Bespoke</span>
              </div>

              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.02]">
                Your Digital<br />
                Growth<br />
                <span className="text-slate-200">Partner</span>
              </h1>
            </div>

            {/* Right: Rotating Star Badge (Like Reference 1) */}
            <div className="lg:col-span-4 flex lg:justify-end pb-4">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* Rotating SVG circular text */}
                <svg className="w-full h-full animate-[spin_15s_linear_infinite]" viewBox="0 0 100 100">
                  <path
                    id="circlePath"
                    d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    fill="transparent"
                  />
                  <text className="text-[9.5px] font-mono uppercase tracking-[2px] fill-white/80">
                    <textPath href="#circlePath" startOffset="0%">
                      ✦ BESPOKE WEB SYSTEMS ✦ HEALTHCARE DIGITAL ✦
                    </textPath>
                  </text>
                </svg>
                {/* Center Star Icon */}
                <div className="absolute w-12 h-12 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-xl shadow-white/20">
                  <Star size={20} className="fill-slate-950" />
                </div>
              </div>
            </div>

          </div>
        </main>

        <div className="h-8"></div>
      </section>


      {/* ========================================================================= */}
      {/* 2. CRISP WHITE EDITORIAL CARD SECTION (Matches Reference 1) */}
      {/* ========================================================================= */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 -mt-8 pb-16">
        <div className="bg-white text-slate-950 rounded-[32px] p-8 sm:p-14 md:p-16 shadow-2xl border border-slate-100 overflow-hidden relative">
          
          {/* Subtle bottom-right blue glow like Reference 1 */}
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10">
            
            {/* Left Column: Heading + Shortcut */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 text-lg">
                ✦
              </div>

              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-[1.08]">
                Navigating Success:<br />
                Your Strategic<br />
                Partner
              </h2>

              <div className="pt-8">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Hey! feel free to connect with us</span>
                  <button 
                    onClick={handleCopyContact}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-mono text-xs font-semibold transition-all active:scale-[0.95]"
                    title="Click to copy email"
                  >
                    <Command size={12} /> C
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Narrative + Live Stats */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                <p>
                  We empower businesses and healthcare practices by delivering innovative, data-driven strategies tailored to their unique goals. From crafting a strong clinical identity to implementing high-impact digital solutions, our platforms are engineered to dominate search and maximize patient conversions.
                </p>
                <p>
                  With a combination of in-depth medical market research, cutting-edge Next.js engineering, and targeted conversion pathways, we ensure your brand not only stands out but also drives meaningful engagement.
                </p>
              </div>

              {/* Stat Counters with Divider */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200">
                <div>
                  <p className="text-4xl sm:text-5xl font-extrabold text-slate-950 font-mono tracking-tight">100%</p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">Bespoke Architecture & Speed</p>
                </div>
                <div className="border-l border-slate-200 pl-8">
                  <p className="text-4xl sm:text-5xl font-extrabold text-slate-950 font-mono tracking-tight">4.2x</p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">Average Inquiry Expansion</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 3. GLOWING SERVICES SECTION (Matches Reference 1 Right Top Card) */}
      {/* ========================================================================= */}
      <section id="services" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 text-left">
        
        {/* Glow Header Container */}
        <div className="relative rounded-[32px] bg-gradient-to-b from-[#111936] via-[#090d1f] to-[#060813] border border-slate-800/80 p-8 sm:p-14 overflow-hidden shadow-2xl">
          
          {/* Top Radial Glow */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/30 blur-[100px] pointer-events-none"></div>

          <div className="text-center max-w-2xl mx-auto mb-12 relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              What Can We Do<br />For your Practice?
            </h2>
          </div>

          {/* Interactive Stacked Service Rows */}
          <div className="max-w-3xl mx-auto space-y-3 relative z-10">
            {services.map((srv, idx) => {
              const isActive = activeService === idx;
              return (
                <div
                  key={srv.id}
                  onClick={() => setActiveService(idx)}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-center ${
                    isActive 
                      ? 'bg-blue-600/15 border-blue-500/60 shadow-lg shadow-blue-500/10' 
                      : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-slate-500 font-bold">({srv.id})</span>
                      <h3 className={`text-base sm:text-xl font-bold transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}>
                        {srv.title} {isActive ? '❞' : ''}
                      </h3>
                    </div>
                    <span className="text-xs text-blue-400 font-mono">
                      {isActive ? '✦' : ''}
                    </span>
                  </div>

                  {isActive && (
                    <p className="mt-3 pt-3 border-t border-blue-500/20 text-xs sm:text-sm text-slate-300 leading-relaxed animate-in fade-in duration-200">
                      {srv.desc}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Action */}
          <div className="text-center mt-10 relative z-10 flex items-center justify-center gap-3 text-xs text-slate-400">
            <span>Have specific requirements?</span>
            <a 
              href="https://wa.me/916356182998" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-slate-950 font-bold hover:bg-slate-100 transition-all"
            >
              Explore Solutions &rarr;
            </a>
          </div>

        </div>

      </section>


      {/* ========================================================================= */}
      {/* 4. IMPACT METRICS GRID SECTION (Matches Reference 1 Middle Section) */}
      {/* ========================================================================= */}
      <section id="numbers" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Not just any number,<br />
              you can also get it<br />
              even more
            </h2>
            <p className="text-sm text-slate-400 max-w-sm pt-2">
              Every website we build is engineered with obsessive focus on speed, doctor credibility, and patient conversion.
            </p>
            <div className="pt-4">
              <a 
                href="https://wa.me/916356182998"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-all shadow-md"
              >
                Let&apos;s Talk &rarr;
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Speed Metric</span>
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono">&lt; 0.4s</p>
              <p className="text-xs text-slate-400">Average page load on 4G mobile devices</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Conversion</span>
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono">100%</p>
              <p className="text-xs text-slate-400">Direct WhatsApp & reception call integration</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">Turnaround</span>
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono">72 Hrs</p>
              <p className="text-xs text-slate-400">From concept brief to working private demo</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Architecture</span>
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono">Zero</p>
              <p className="text-xs text-slate-400">Templates or slow WordPress dependencies</p>
            </div>
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 5. TESTIMONIAL & CASE SHOWCASE (Matches Reference 1 Bottom Card) */}
      {/* ========================================================================= */}
      <section id="testimonial" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-left">
        <div className="bg-[#0b0f20] border border-slate-800 rounded-[32px] p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-slate-800/80 pb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-serif text-blue-400 font-bold">❝</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                See How We Bring Your Idea Into Reality
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setTestimonialIdx((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-white hover:bg-slate-800 transition-all active:scale-[0.95]"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setTestimonialIdx((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                className="w-10 h-10 rounded-full bg-white text-slate-950 flex items-center justify-center hover:bg-slate-100 transition-all active:scale-[0.95] shadow-md"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden relative shadow-lg">
                <Image 
                  src={testimonials[testimonialIdx].avatar}
                  alt={testimonials[testimonialIdx].name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-white text-base">{testimonials[testimonialIdx].name}</p>
                <p className="text-xs text-blue-400">{testimonials[testimonialIdx].role}</p>
                <p className="text-[11px] text-slate-400">{testimonials[testimonialIdx].clinic}</p>
              </div>
            </div>

            <div className="md:col-span-8">
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed italic">
                &ldquo;{testimonials[testimonialIdx].quote}&rdquo;
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 6. INTERACTIVE CONTACT INQUIRY CONSOLE */}
      {/* ========================================================================= */}
      <section id="contact" className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-[32px] p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-4">
            <span>GET A PRIVATE CONCEPT BUILT</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Ready to elevate your practice?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-8">
            Tell us about your clinic and we will construct a private, interactive prototype website for you to test on your phone with zero upfront commitment.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/916356182998?text=Hi%20Vinit,%20I%20would%20like%20to%20get%20a%20private%20website%20concept%20built%20for%20my%20practice."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-slate-950 font-extrabold text-sm hover:bg-slate-100 transition-all shadow-xl shadow-white/10 active:scale-[0.98]"
            >
              <MessageSquare size={16} className="text-emerald-600" />
              <span>Start on WhatsApp</span>
              <ArrowRight size={15} />
            </a>

            <a
              href="mailto:vinitdharaiya124@gmail.com"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-slate-900 border border-slate-700 text-slate-200 font-semibold text-sm hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98]"
            >
              <Mail size={16} />
              <span>vinitdharaiya124@gmail.com</span>
            </a>
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 7. FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-900 py-12 bg-[#04060e] text-xs text-slate-500 text-left">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-white text-slate-950 flex items-center justify-center font-bold text-xs">
              ✦
            </div>
            <p className="font-semibold text-white">Vinit Dharaiya — Studio</p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="https://wa.me/916356182998" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">WhatsApp (+91 6356 182 998)</a>
            <a href="mailto:vinitdharaiya124@gmail.com" className="text-slate-400 hover:text-white transition-colors">Email</a>
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors">Admin</Link>
            <span className="text-slate-700">|</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
