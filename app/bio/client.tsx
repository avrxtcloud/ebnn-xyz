"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { Play, Pause, ChevronRight, Zap, Copy, Mail, Instagram, Twitter, Github, Linkedin } from "lucide-react";

const Icon = ({ name, className, style }: { name: string; className?: string; style?: any }) => {
    // @ts-ignore
    const LucideIcon = Icons[name];
    if (!LucideIcon) return <Icons.Link className={className} style={style} />;
    return <LucideIcon className={className} style={style} />;
};

export default function BioClient({ profile, links }: { profile: any, links: any[] }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);
    const [copyFeedback, setCopyFeedback] = useState(false);
    const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [subMsg, setSubMsg] = useState("");

    const themeColor = profile.theme_color || '#3b82f6';
    const fontFamily = profile.font_family || 'Outfit';

    // Apply Font globally to this component wrapper
    const containerStyle = { fontFamily: `${fontFamily}, sans-serif` };

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

    const getYoutubeEmbed = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const id = (match && match[2].length === 11) ? match[2] : null;
        return id ? `https://www.youtube.com/embed/${id}` : null;
    };

    return (
        <div style={containerStyle} className="w-full">
            {/* Social Icons Row */}
            {profile.socials && Object.values(profile.socials).some(v => v) && (
                <div className="flex justify-center gap-4 mb-6 reveal active">
                    {profile.socials.twitter && <a href={profile.socials.twitter} target="_blank" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><Twitter size={20} style={{ color: themeColor }} /></a>}
                    {profile.socials.instagram && <a href={profile.socials.instagram} target="_blank" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><Instagram size={20} style={{ color: themeColor }} /></a>}
                    {profile.socials.github && <a href={profile.socials.github} target="_blank" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><Github size={20} style={{ color: themeColor }} /></a>}
                    {profile.socials.linkedin && <a href={profile.socials.linkedin} target="_blank" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><Linkedin size={20} style={{ color: themeColor }} /></a>}
                </div>
            )}

            <div className="music-card p-4 rounded-[2rem] reveal active relative overflow-hidden mb-4" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 flex-shrink-0">
                        <img src={profile.music_cover_url} className={`w-full h-full object-cover rounded-full border border-white/10 ${isPlaying ? 'rotating' : ''}`} alt="Cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                        <h3 className="text-xs font-bold truncate tracking-wide">{profile.music_title}</h3>
                        <p className="text-[9px] font-mono uppercase mt-0.5" style={{ color: themeColor }}>{profile.music_artist}</p>
                        <div className="mt-2.5 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="progress-bar h-full" style={{ width: `${progress}%`, backgroundColor: themeColor }}></div>
                        </div>
                    </div>
                    <button onClick={toggleMusic} className="w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90" style={{ backgroundColor: themeColor }}>
                        {isPlaying ? <Pause className="text-white fill-white w-4 h-4" /> : <Play className="text-white fill-white w-4 h-4" />}
                    </button>
                </div>
                <audio ref={audioRef} src={profile.music_url} preload="metadata"></audio>
            </div>

            {/* Dynamic Links */}
            {links.map((link, i) => {
                // 1. Header Type
                if (link.type === 'header') {
                    return (
                        <h3 key={link.id} className="text-center font-bold uppercase tracking-[0.2em] text-[10px] text-slate-500 mt-6 mb-3 reveal active">
                            {link.label}
                        </h3>
                    );
                }

                // 2. Video Embed Type
                if (link.type === 'video') {
                    const embedSrc = getYoutubeEmbed(link.url);
                    return embedSrc ? (
                        <div key={link.id} className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 mb-3 reveal active shadow-2xl">
                            <iframe src={embedSrc} className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
                        </div>
                    ) : null;
                }

                // 3. Standard Link Type (Classic)
                return (
                    <a href={link.url} key={link.id} target="_blank" className="link-card flex items-center p-4 rounded-2xl group reveal active mb-3 border border-white/5 hover:border-white/20 transition-all bg-slate-900/40 hover:bg-slate-900/60" style={{ animationDelay: `${0.2 + (i * 0.1)}s` }}>
                        <Icon name={link.icon} className="w-5 h-5" style={{ color: themeColor }} />
                        <span className="ml-4 flex-grow text-sm font-bold uppercase tracking-widest text-slate-200">{link.label}</span>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                    </a>
                );
            })}

            {/* Static Interactions */}
            <div onClick={copyEmail} className="link-card flex items-center p-4 rounded-2xl group reveal active mb-3 bg-slate-900/40 border border-white/5" style={{ animationDelay: '0.6s' }}>
                <Mail className={`w-5 h-5 transition-colors ${copyFeedback ? 'text-green-500' : ''}`} style={{ color: copyFeedback ? undefined : themeColor }} />
                <div className="ml-4 flex-grow text-left">
                    <span className="block text-sm font-bold uppercase tracking-widest text-slate-200">zyo@ebnn.xyz</span>
                    <span className={`text-[8px] font-mono uppercase tracking-widest ${copyFeedback ? 'text-green-500' : 'text-slate-500'}`}>
                        {copyFeedback ? "Copied to clipboard!" : "Click to copy email"}
                    </span>
                </div>
                <Copy className={`w-4 h-4 transition-colors ${copyFeedback ? 'text-green-500' : 'text-slate-600'}`} />
            </div>

            <div className="sub-card p-5 rounded-[2rem] border border-white/10 reveal active bg-slate-900/40 mt-6" style={{ animationDelay: '0.7s', borderColor: `${themeColor}30` }}>
                <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4" style={{ color: themeColor }} />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: themeColor }}>Subscription Uplink</h3>
                </div>
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                    <input type="email" name="email" required className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="name@domain.com" />
                    <button type="submit" disabled={subStatus === 'loading'} className="w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all text-white disabled:opacity-50" style={{ backgroundColor: themeColor }}>
                        {subStatus === 'loading' ? "Transmitting..." : "Connect"}
                    </button>
                </form>
                <p className={`mt-2 text-[9px] font-mono text-center h-2 transition-opacity ${subMsg ? 'opacity-100' : 'opacity-0'} ${subStatus === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                    {subMsg}
                </p>
            </div>
        </div>
    );
}
