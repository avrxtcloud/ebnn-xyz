import { createClient } from "@/utils/supabase/server";
import { Play, Pause, Globe, Mail, Copy, Send, ExternalLink, Zap, ShieldCheck, ChevronRight, MessageSquare, Github } from "lucide-react";
import BioClient from "./client";

export const dynamic = "force-dynamic";

export default async function BioPage() {
    const supabase = await createClient();

    // Fetch Profile
    const { data: profile } = await supabase.from('bio_profile').select('*').single();

    // Fetch Links
    const { data: links } = await supabase.from('bio_links').select('*').eq('is_active', true).order('sort_order', { ascending: true });

    // Default Fallback Data if DB is empty or connection fails
    const safeProfile = profile || {
        name: "Ebin Sebastian",
        bio: "// core_links.exe",
        avatar_url: "/dp-1.jpg",
        music_title: "Unnai Kaanadhu Naan",
        music_artist: "Audio Feed",
        music_url: "/song.mp3",
        music_cover_url: "/cover.jpeg",
        bg_image_url: null,
        show_3d_map: false,
        theme_color: '#3b82f6'
    };

    return (
        <div className="flex flex-col items-center py-10 px-6 min-h-screen relative overflow-hidden" style={{
            backgroundImage: safeProfile.bg_image_url ? `url(${safeProfile.bg_image_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }}>
            {/* Overlay for readability if bg image exist */}
            {safeProfile.bg_image_url && <div className="absolute inset-0 bg-[#020617]/70 backdrop-blur-sm z-0"></div>}

            {/* 3D Map Placeholder (If enabled) */}
            {safeProfile.show_3d_map && (
                <div className="absolute top-0 w-full h-[300px] z-0 opacity-40 pointer-events-none fade-in">
                    <div className="w-[600px] h-[600px] rounded-full border border-blue-500/20 absolute -top-[300px] left-1/2 -translate-x-1/2 animate-[spin_20s_linear_infinite]" style={{ perspective: '1000px' }}>
                        <div className="w-full h-full rounded-full border border-blue-500/10 absolute rotate-45"></div>
                        <div className="w-full h-full rounded-full border border-blue-500/10 absolute -rotate-45"></div>
                    </div>
                </div>
            )}

            {/* Orbs */}
            {!safeProfile.bg_image_url && <><div className="orb orb-1 z-0"></div><div className="orb orb-2 z-0"></div></>}

            <div className="relative z-10 w-full flex flex-col items-center">
                <header className="text-center mb-8 reveal active" style={{ animationDelay: '0.1s' }}>
                    <div className="relative inline-block mb-4">
                        <div className="w-20 h-20 rounded-[1.8rem] overflow-hidden border border-white/20 p-1">
                            <img src={safeProfile.avatar_url} alt={safeProfile.name} className="w-full h-full object-cover rounded-[1.6rem]" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#020617]" style={{ backgroundColor: safeProfile.theme_color || '#3b82f6' }}></div>
                    </div>
                    <h1 className="text-xl font-black tracking-tighter uppercase italic">{safeProfile.name}</h1>
                    <p className="font-mono text-[9px] tracking-[0.3em] uppercase mt-1" style={{ color: safeProfile.theme_color || '#3b82f6' }}>{safeProfile.bio}</p>
                </header>

                <main className="w-full max-w-[400px] space-y-3">
                    <BioClient profile={safeProfile} links={links || []} />
                </main>
            </div>

            <footer className="mt-12 text-center reveal active z-10" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="status-pulse bg-green-500"></div>
                    <span className="text-[10px] font-mono text-green-500 uppercase tracking-[0.2em]">All Systems Online</span>
                </div>
                <p className="text-[8px] text-slate-700 uppercase tracking-[0.4em] font-mono">EBNN.XYZ // CORE v2.8</p>
            </footer>
        </div>
    );
}
