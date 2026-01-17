import { createClient } from "@/utils/supabase/server";
import { Play, Pause, Globe, Mail, Copy, Send, ExternalLink, Zap, ShieldCheck, ChevronRight, MessageSquare, Github } from "lucide-react";
import BioClient from "./client";

export const dynamic = "force-dynamic";

export default async function BioPage() {
    const supabase = await createClient();

    // Fetch Profile
    const { data: profile } = await supabase.from('bio_profile').select('*').single();

    // Fetch Links
    const { data: links } = await supabase.from('bio_links').select('*').order('sort_order', { ascending: true });

    // Default Fallback Data if DB is empty or connection fails
    const safeProfile = profile || {
        name: "Ebin Sebastian",
        bio: "// core_links.exe",
        avatar_url: "/dp-1.jpg",
        music_title: "Unnai Kaanadhu Naan",
        music_artist: "Audio Feed",
        music_url: "/song.mp3",
        music_cover_url: "/cover.jpeg"
    };

    return (
        <div className="flex flex-col items-center py-10 px-6 min-h-screen">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>

            <header className="text-center mb-8 reveal active" style={{ animationDelay: '0.1s' }}>
                <div className="relative inline-block mb-4">
                    <div className="w-20 h-20 rounded-[1.8rem] overflow-hidden border border-blue-500/30 p-1">
                        <img src={safeProfile.avatar_url} alt={safeProfile.name} className="w-full h-full object-cover rounded-[1.6rem]" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full border-4 border-[#020617]"></div>
                </div>
                <h1 className="text-xl font-black tracking-tighter uppercase italic">{safeProfile.name}</h1>
                <p className="text-blue-500 font-mono text-[9px] tracking-[0.3em] uppercase mt-1">{safeProfile.bio}</p>
            </header>

            <main className="w-full max-w-[400px] space-y-3">
                <BioClient profile={safeProfile} links={links || []} />
            </main>

            <footer className="mt-12 text-center reveal active" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="status-pulse"></div>
                    <span className="text-[10px] font-mono text-green-500 uppercase tracking-[0.2em]">All Systems Online</span>
                </div>
                <p className="text-[8px] text-slate-700 uppercase tracking-[0.4em] font-mono">EBNN.XYZ // CORE v2.6</p>
            </footer>
        </div>
    );
}
