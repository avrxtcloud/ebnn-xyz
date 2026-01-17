"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, ShieldCheck, Sprout, Layout, Lock, Database, Terminal, ScrollText, ArrowRight, Github, Instagram } from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(2025);

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (typeof window !== 'undefined') {
      document.body.style.overflow = !mobileMenuOpen ? 'hidden' : 'auto';
    }
  };

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());

    const revealCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    const handleScroll = () => {
      const scrolled = window.scrollY;
      document.querySelectorAll<HTMLElement>('.bg-aura').forEach((aura, index) => {
        const speed = (index + 1) * 0.1;
        aura.style.transform = `translateY(${scrolled * speed}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      revealObserver.disconnect();
    };
  }, []);

  return (
    <>
      <div className="bg-aura top-[-10%] left-[-10%] bg-blue-600/20"></div>
      <div className="bg-aura bottom-[-10%] right-[-10%] bg-purple-600/10"></div>

      <nav className="fixed w-full z-[100] bg-slate-950/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="#" className="active:scale-95 transition-transform">
            <img src="/logo.png" alt="EBNN" className="logo-nav" />
          </Link>

          <div className="hidden md:flex items-center space-x-10 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Link href="#who-i-am" className="hover:text-blue-400 transition-colors">/about</Link>
            <Link href="#stack" className="hover:text-blue-400 transition-colors">/stack</Link>
            <Link href="#subscribe" className="hover:text-blue-400 transition-colors">/news</Link>
            <Link href="/contact" className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5">/contact_</Link>
          </div>

          <button className="md:hidden p-2 text-white" onClick={toggleMenu} aria-label="Toggle Menu">
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </nav>

      <div id="mobile-menu" className={`fixed inset-0 z-[110] bg-slate-950 flex flex-col justify-center items-center text-center p-10 md:hidden ${mobileMenuOpen ? 'active' : ''}`}>
        <button className="absolute top-8 right-8 p-2" onClick={toggleMenu}><X className="w-10 h-10 text-white" /></button>
        <div className="flex flex-col space-y-10 text-4xl font-black italic tracking-tighter text-white">
          <Link href="#who-i-am" onClick={toggleMenu}>ABOUT</Link>
          <Link href="#stack" onClick={toggleMenu}>STACK</Link>
          <Link href="#subscribe" onClick={toggleMenu}>SUBSCRIBE</Link>
          <Link href="/contact" className="text-blue-500">CONTACT_</Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 overflow-hidden">

        <section className="pt-48 pb-20 min-h-[90vh] flex flex-col justify-center">
          <div className="reveal">
            <p className="text-blue-500 font-mono-tech mb-6 text-xs md:text-sm tracking-widest flex items-center gap-3">
              <span className="w-8 h-[1px] bg-blue-500"></span> INITIALIZING PROTOCOL
            </p>
            <div className="text-5xl md:text-9xl font-black leading-[0.9] tracking-tighter mb-8 text-white">
              <h1>Welcome To The</h1>
              <span className="animated-gradient-text italic">EBNN Core.</span>
            </div>
            <p className="text-lg md:text-2xl text-slate-400 max-w-2xl leading-relaxed mb-12">
              Building <span className="text-white">Scalable & Beautiful</span> digital solutions. Transitioning dreams into functional deployments with raw passion.
            </p>
            <div className="flex flex-wrap gap-5">
              <Link href="#who-i-am" className="w-full sm:w-auto px-10 py-5 bg-blue-600 rounded-full text-center font-bold text-white hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/30 active:scale-95">Explore About</Link>
              <Link href="/contact" className="w-full sm:w-auto px-10 py-5 border border-white/10 rounded-full text-center font-bold text-white hover:bg-white/5 transition-all active:scale-95">Start Project</Link>
            </div>
          </div>
        </section>

        <section id="who-i-am" className="py-24 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-10 reveal">
              <div>
                <h2 className="text-4xl md:text-6xl font-black mb-6">Who I Am</h2>
                <div className="h-1.5 w-24 bg-blue-600 rounded-full"></div>
              </div>

              <div className="space-y-6 text-slate-300 text-lg md:text-xl leading-relaxed">
                <p>I am <span className="text-white font-bold underline decoration-blue-500 underline-offset-8">Ebin Sebastian</span>.</p>
                <p className="text-slate-400"><strong>I am not an expert; I just started my journey.</strong> But I build with a level of passion that seasoned professionals often forget.</p>
                <p>I focus my energy on <span className="text-blue-400">small deployments</span>. By keeping projects manageable, I ensure every pixel and every line of code gets my full attention.</p>

                <div className="p-8 rounded-3xl bg-blue-950/20 border border-blue-500/20 space-y-4">
                  <div className="flex items-center gap-3 text-blue-400 font-bold uppercase text-xs tracking-[0.2em]">
                    <ShieldCheck className="w-5 h-5" />
                    Professional Integrity
                  </div>
                  <p className="text-slate-400 italic text-sm md:text-base">
                    &quot;Your savings represent your hard work. For enterprise-scale deployments, I recommend industry experts. I am here for your <strong>personal projects and small business starts</strong>.&quot;
                  </p>
                </div>
              </div>
            </div>

            <div className="sticky top-28 space-y-8 reveal" style={{ transitionDelay: '200ms' }}>
              <div className="bento-card p-3 rounded-[3rem] overflow-hidden float-anim">
                <img src="/dp-1.jpg" alt="Ebin Sebastian" className="w-full aspect-[4/5] object-cover rounded-[2.5rem] grayscale hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-100" />
              </div>

              <div className="bento-card p-10 rounded-[3rem] text-center group">
                <div className="w-20 h-20 rounded-2xl bg-blue-600/10 flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform">
                  <Sprout className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">Beginner Spirit</h3>
                <p className="text-slate-500 font-mono-tech uppercase text-xs tracking-widest italic">Ebinn // Constant Evolution</p>
              </div>
            </div>
          </div>
        </section>

        <section id="stack" className="py-24">
          <h2 className="text-4xl md:text-5xl font-black mb-16 reveal text-center md:text-left uppercase italic">Tech Arsenal</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            <div className="bento-card p-10 rounded-[2.5rem] reveal" style={{ transitionDelay: '100ms' }}>
              <Layout className="text-blue-500 mb-6 w-8 h-8" />
              <h4 className="font-mono-tech text-blue-400 text-xs mb-4 uppercase tracking-tighter">_Frontend</h4>
              <ul className="space-y-4 text-xl font-bold text-white">
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> HTML / CSS</li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Tailwind CSS</li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> TypeScript</li>
              </ul>
            </div>

            <div className="bento-card p-10 rounded-[2.5rem] reveal" style={{ transitionDelay: '200ms' }}>
              <Lock className="text-blue-500 mb-6 w-8 h-8" />
              <h4 className="font-mono-tech text-blue-400 text-xs mb-4 uppercase tracking-tighter">_Backend & Security</h4>
              <ul className="space-y-4 text-xl font-bold text-white">
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Proxy Config</li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Cloudflare</li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Firewalls</li>
              </ul>
            </div>

            <div className="bento-card p-10 rounded-[2.5rem] reveal" style={{ transitionDelay: '300ms' }}>
              <Database className="text-blue-500 mb-6 w-8 h-8" />
              <h4 className="font-mono-tech text-blue-400 text-xs mb-4 uppercase tracking-tighter">_Data</h4>
              <ul className="space-y-4 text-xl font-bold text-white">
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> SQL / MySQL</li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Supabase</li>
              </ul>
            </div>

            <div className="bento-card p-10 rounded-[2.5rem] md:col-span-2 lg:col-span-3 reveal">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="max-w-md">
                  <h4 className="text-blue-500 font-mono-tech text-xs mb-4 uppercase tracking-tighter">_Mail Systems</h4>
                  <p className="text-slate-400">Configuring enterprise-grade communication for your startup or brand.</p>
                </div>
                <div className="flex flex-wrap gap-3 text-white">
                  <span className="px-5 py-2.5 bg-slate-900 border border-white/5 rounded-full text-xs font-bold hover:border-blue-500 transition-colors">Google Workspace</span>
                  <span className="px-5 py-2.5 bg-slate-900 border border-white/5 rounded-full text-xs font-bold hover:border-blue-500 transition-colors">Zoho Mail</span>
                  <span className="px-5 py-2.5 bg-slate-900 border border-white/5 rounded-full text-xs font-bold hover:border-blue-500 transition-colors">Resend</span>
                </div>
              </div>
            </div>

            <div id="subscribe" className="md:col-span-2 lg:col-span-3 reveal pt-12">
              <div className="bento-card p-10 rounded-[3rem] border border-blue-500/10">
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
                  <div className="max-w-xl">
                    <h3 className="text-3xl font-black mb-4">Subscribe to Core News</h3>
                    <p className="text-slate-400 text-lg leading-relaxed">Join the inner circle. Get early updates on my journey, experimental project deployments, and technical insights.</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Link href="/subscribe" className="group relative inline-flex items-center gap-3 px-10 py-5 bg-blue-600 rounded-full font-bold text-lg text-white hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/30">
                      Join Core Newsletter
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3 reveal pt-12 pb-6">
              <div className="relative group p-8 md:p-12 rounded-[3rem] border border-amber-500/10 bg-gradient-to-br from-amber-500/5 to-transparent overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Terminal className="w-24 h-24 text-amber-500" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <ScrollText className="w-8 h-8 text-amber-500" />
                  </div>

                  <div className="text-center md:text-left">
                    <h5 className="text-amber-500 font-mono-tech text-xs uppercase tracking-[0.3em] mb-3">Developer_Note.exe</h5>
                    <p className="text-xl md:text-3xl font-light leading-relaxed text-slate-200 italic">
                      &quot;Everything happens for a reason. If you see this note, please remember <span className="text-amber-400 font-medium">you are on the right track</span> 🍂&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      <footer className="mt-32 py-16 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-white mb-12">
            <img src="/logo.png" alt="EBNN" className="h-12 w-auto opacity-50 grayscale hover:grayscale-0 transition-all" />

            <div className="flex gap-10">
              <a href="https://github.com/Ebnxyz" target="_blank" className="p-4 bg-white/5 rounded-full hover:text-blue-400 transition-all active:scale-90"><Github /></a>
              <a href="https://www.instagram.com/eb_nnn_?igsh=MTJhMm5lNW53cjlndw==" target="_blank" className="p-4 bg-white/5 rounded-full hover:text-pink-500 transition-all active:scale-90"><Instagram /></a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/5 pt-12 gap-6">
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <Link href="/privacy" className="hover:text-blue-500 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-blue-500 transition-colors">Terms & Conditions</Link>
            </div>

            <p className="text-slate-600 text-xs font-mono-tech uppercase tracking-[0.3em] text-center md:text-right">
              &copy; <span id="year">{currentYear}</span> EBNN.XYZ CORE <br />
              <span className="text-[10px] opacity-40 uppercase">Built with Beginner Passion</span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
