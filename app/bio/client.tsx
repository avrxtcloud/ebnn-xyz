"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { Play, Pause, ChevronRight, Zap, Copy, Mail } from "lucide-react";

// Helper to render dynamic Lucide icons
const Icon = ({ name, className }: { name: string; className?: string }) => {
    // @ts-ignore
    const LucideIcon = Icons[name];
    if (!LucideIcon) return <Icons.Link className={className} />;
    return <LucideIcon className={className} />;
};

export default function BioClient({ profile, links }: { profile: any, links: any[] }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);
    const [copyFeedback, setCopyFeedback] = useState(false);
    const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [subMsg, setSubMsg] = useState("");

    const toggleMusic = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(() => { });
        }
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("ended", handleEnded);
        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("ended", handleEnded);
        };
    }, []);

    const copyEmail = () => {
        navigator.clipboard.writeText("zyo@ebnn.xyz");
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    };

    const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubStatus('loading');
        const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;

        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                setSubStatus('success');
                setSubMsg("> UPLINK SUCCESSFUL");
                (e.target as HTMLFormElement).reset();
            } else {
                throw new Error('Failed');
            }
        } catch (err) {
            setSubStatus('error');
            setSubMsg("> UPLINK FAILED");
        }
    };

    return (
        <>
            <div className="music-card p-4 rounded-[2rem] reveal active relative overflow-hidden" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 flex-shrink-0">
                        <img src={profile.music_cover_url} className={`w-full h-full object-cover rounded-full border border-blue-500/20 ${isPlaying ? 'rotating' : ''}`} alt="Cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                        <h3 className="text-xs font-bold truncate tracking-wide">{profile.music_title}</h3>
                        <p className="text-[9px] text-blue-400 font-mono uppercase mt-0.5">{profile.music_artist}</p>
                        <div className="mt-2.5 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="progress-bar h-full bg-blue-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <button onClick={toggleMusic} className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-xl hover:bg-blue-500 transition-all active:scale-90">
                        {isPlaying ? <Pause className="text-white fill-white w-4 h-4" /> : <Play className="text-white fill-white w-4 h-4" />}
                    </button>
                </div>
                <audio ref={audioRef} src={profile.music_url} preload="metadata"></audio>
            </div>

            {/* Dynamic Links */}
            {links.map((link, i) => (
                <a href={link.url} key={link.id} target="_blank" className="link-card flex items-center p-4 rounded-2xl group reveal active" style={{ animationDelay: `${0.2 + (i * 0.1)}s` }}>
                    <Icon name={link.icon} className="w-5 h-5 text-blue-400" />
                    <span className="ml-4 flex-grow text-sm font-bold uppercase tracking-widest text-slate-200">{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                </a>
            ))}

            {/* Static Interactions */}
            <div onClick={copyEmail} className="link-card flex items-center p-4 rounded-2xl group reveal active" style={{ animationDelay: '0.6s' }}>
                <Mail className={`w-5 h-5 transition-colors ${copyFeedback ? 'text-green-500' : 'text-blue-400'}`} />
                <div className="ml-4 flex-grow text-left">
                    <span className="block text-sm font-bold uppercase tracking-widest text-slate-200">zyo@ebnn.xyz</span>
                    <span className={`text-[8px] font-mono uppercase tracking-widest ${copyFeedback ? 'text-green-500' : 'text-slate-500'}`}>
                        {copyFeedback ? "Copied to clipboard!" : "Click to copy email"}
                    </span>
                </div>
                <Copy className={`w-4 h-4 transition-colors ${copyFeedback ? 'text-green-500' : 'text-slate-600 group-hover:text-blue-400'}`} />
            </div>

            <div className="sub-card p-5 rounded-[2rem] border border-blue-500/20 reveal active" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Subscription Uplink</h3>
                </div>
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                    <input type="email" name="email" required className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="name@domain.com" />
                    <button type="submit" disabled={subStatus === 'loading'} className="w-full py-3 bg-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 active:scale-95 transition-all text-white disabled:opacity-50">
                        {subStatus === 'loading' ? "Transmitting..." : "Connect"}
                    </button>
                </form>
                <p className={`mt-2 text-[9px] font-mono text-center h-2 transition-opacity ${subMsg ? 'opacity-100' : 'opacity-0'} ${subStatus === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                    {subMsg}
                </p>
            </div>
        </>
    );
}
