"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Loader2, ShieldCheck, AlertOctagon, Shield } from "lucide-react";

export default function ContactPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('loading');
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                setStatus('success');
            } else {
                throw new Error('Failed');
            }
        } catch {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <main className="max-w-xl w-full glass p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center text-center fade-in">
                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-white">Transmission Successful</h2>
                    <p className="text-slate-400 text-sm mb-8 max-w-[280px]">Your payload has been securely logged in the EBNN archives. Response pending.</p>
                    <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-white">
                        Send Another Request
                    </button>
                    <div className="mt-10 pt-6 border-t border-white/5 w-full flex justify-center">
                        <Link href="/" className="group text-slate-500 text-[10px] uppercase tracking-widest hover:text-white transition-all flex items-center gap-2">
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Return Home
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <main className="max-w-xl w-full glass p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center text-center fade-in">
                    <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                        <AlertOctagon className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-white">Uplink Failed</h2>
                    <p className="text-slate-400 text-sm mb-8 max-w-[280px]">A system error prevented data delivery. Please check your network connection.</p>
                    <button onClick={() => setStatus('idle')} className="px-8 py-3 bg-red-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 transition-all text-white">
                        Try Re-transmission
                    </button>
                </main>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>

            <main className="max-w-xl w-full glass p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">

                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono font-bold text-blue-400 tracking-widest uppercase mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        Secure Uplink Active
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white uppercase">
                        Initialize <span className="text-blue-500">Contact_</span>
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1">Identifier</label>
                            <input type="text" name="name" required className="contact-input w-full px-5 py-3.5 rounded-2xl outline-none transition-all" placeholder="Your Name" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1">Protocol</label>
                            <input type="email" name="email" required className="contact-input w-full px-5 py-3.5 rounded-2xl outline-none transition-all" placeholder="Email Address" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1">Subject</label>
                        <input type="text" name="subject" required className="contact-input w-full px-5 py-3.5 rounded-2xl outline-none transition-all" placeholder="Subject" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1">Payload</label>
                        <textarea name="message" required rows={3} className="contact-textarea w-full px-5 py-3.5 rounded-2xl outline-none transition-all resize-none" placeholder="Message content..."></textarea>
                    </div>

                    <button type="submit" disabled={status === 'loading'} className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-white text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70">
                        {status === 'loading' ? (
                            <><span>Transmitting...</span> <Loader2 className="w-4 h-4 animate-spin" /></>
                        ) : (
                            <><span>Transmit to Core</span> <ArrowRight className="w-4 h-4" /></>
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Link href="/" className="group text-slate-500 text-[10px] uppercase tracking-widest hover:text-white transition-all flex items-center gap-2">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Return Home
                    </Link>
                    <div className="flex gap-4 opacity-40 text-slate-400">
                        <Shield className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-mono uppercase tracking-widest">v2.6.0_Stable</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
