"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut, Loader2, Plus, Trash2, Edit } from "lucide-react";

export default function AdminPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    // Data States
    const [profile, setProfile] = useState<any>(null);
    const [links, setLinks] = useState<any[]>([]);

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        setUser(user);

        if (user && session?.provider_token) {
            try {
                // Verify Discord Role
                const res = await fetch('/api/auth/discord-role', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accessToken: session.provider_token })
                });
                const data = await res.json();

                if (data.authorized) {
                    setAuthorized(true);
                    fetchData();
                } else {
                    alert("Access Denied: You do not have the required Discord Role.");
                }
            } catch (err) {
                console.error("Auth Check Failed", err);
            }
        } else if (user) {
            console.warn("No provider token found. Re-login may be required.");
        }
        setLoading(false);
    }

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
                scopes: 'identify guild.members.read' // Scopes needed for role checking later
            },
        });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        setUser(null);
        setAuthorized(false);
    };

    async function fetchData() {
        const { data: profileData } = await supabase.from('bio_profile').select('*').single();
        if (profileData) setProfile(profileData);

        const { data: linksData } = await supabase.from('bio_links').select('*').order('sort_order', { ascending: true });
        if (linksData) setLinks(linksData);
    }

    // --- CRUD Handlers ---

    async function updateProfile(e: React.FormEvent) {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const updates = Object.fromEntries(formData);

        const { error } = await supabase.from('bio_profile').update(updates).eq('id', profile.id);
        if (!error) alert("Profile Updated!");
    }

    async function addLink() {
        const newLink = {
            label: "New Link",
            url: "https://",
            icon: "Globe",
            sort_order: links.length + 1
        };
        const { data, error } = await supabase.from('bio_links').insert(newLink).select();
        if (data) setLinks([...links, data[0]]);
    }

    async function deleteLink(id: number) {
        if (!confirm("Are you sure?")) return;
        await supabase.from('bio_links').delete().eq('id', id);
        setLinks(links.filter(l => l.id !== id));
    }

    async function updateLink(id: number, field: string, value: string) {
        const { error } = await supabase.from('bio_links').update({ [field]: value }).eq('id', id);
        if (!error) {
            setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="glass p-10 rounded-[2.5rem] text-center">
                    <h1 className="text-2xl font-bold text-white mb-6">Bio Uplink // Admin</h1>
                    <button onClick={handleLogin} className="px-8 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-bold transition-all flex items-center gap-2">
                        <i className="fa-brands fa-discord"></i> Login with Discord
                    </button>
                </div>
            </div>
        );
    }

    if (!authorized) {
        return <div className="text-center text-white pt-20">Access Denied. Missing required privileges.</div>;
    }

    return (
        <div className="min-h-screen p-8 max-w-5xl mx-auto">
            <header className="flex justify-between items-center mb-10 pb-4 border-b border-white/10">
                <h1 className="text-3xl font-black text-white italic uppercase">Bio_Control_Center</h1>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-white text-sm font-bold">{user.user_metadata.full_name}</p>
                        <p className="text-slate-500 text-xs">{user.email}</p>
                    </div>
                    <button onClick={handleLogout} className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"><LogOut size={20} /></button>
                </div>
            </header>

            <div className="grid lg:grid-cols-2 gap-8">

                {/* Profile Section */}
                <section className="glass p-8 rounded-[2rem]">
                    <h2 className="text-xl font-bold text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2"><ShieldCheck size={20} /> Profile Config</h2>
                    {profile && (
                        <form onSubmit={updateProfile} className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Display Name</label>
                                <input name="name" defaultValue={profile.name} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Tagline / Bio</label>
                                <input name="bio" defaultValue={profile.bio} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold">Avatar URL</label>
                                    <input name="avatar_url" defaultValue={profile.avatar_url} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold">Cover URL</label>
                                    <input name="music_cover_url" defaultValue={profile.music_cover_url} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white" />
                                </div>
                            </div>
                            <div className="border-t border-white/5 pt-4 mt-2">
                                <label className="text-xs text-blue-400 uppercase font-bold mb-2 block">Music Configuration</label>
                                <div className="space-y-3">
                                    <input name="music_title" placeholder="Song Title" defaultValue={profile.music_title} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm" />
                                    <input name="music_artist" placeholder="Artist" defaultValue={profile.music_artist} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm" />
                                    <input name="music_url" placeholder="Audio File URL (MP3)" defaultValue={profile.music_url} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm" />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-4">Save Profile Changes</button>
                        </form>
                    )}
                </section>

                {/* Links Section */}
                <section className="glass p-8 rounded-[2rem]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2"><Edit size={20} /> Link Manager</h2>
                        <button onClick={addLink} className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-all"><Plus size={18} /></button>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {links.map((link) => (
                            <div key={link.id} className="bg-slate-900/40 border border-white/5 p-4 rounded-xl flex flex-col gap-3 group hover:border-blue-500/30 transition-all">
                                <div className="flex gap-2">
                                    <input
                                        value={link.label}
                                        onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                                        className="flex-grow bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-white font-bold"
                                        placeholder="Label"
                                    />
                                    <input
                                        value={link.icon}
                                        onChange={(e) => updateLink(link.id, 'icon', e.target.value)}
                                        className="w-24 bg-transparent border-b border-transparent focus:border-slate-500 outline-none text-slate-400 text-xs text-right"
                                        placeholder="Icon (Lucide)"
                                    />
                                </div>
                                <input
                                    value={link.url}
                                    onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                                    className="w-full bg-transparent text-xs text-slate-500 focus:text-blue-400 outline-none"
                                    placeholder="https://..."
                                />
                                <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-1">
                                    <span className="text-[10px] text-slate-600 uppercase font-mono">ID: {link.id}</span>
                                    <button onClick={() => deleteLink(link.id)} className="text-red-900 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                        {links.length === 0 && <p className="text-slate-500 text-center italic text-sm">No links active.</p>}
                    </div>
                </section>

            </div>
        </div>
    );
}
