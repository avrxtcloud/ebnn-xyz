"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ShieldCheck, LogOut, Loader2, Plus, Trash2, Edit,
    Upload, Music, Image as ImageIcon, CheckCircle,
    Eye, EyeOff, Palette, Map, Youtube, GripVertical,
    Layout, Type, Globe
} from "lucide-react";

export default function AdminPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'appearance' | 'settings'>('profile');

    const supabase = createClient();
    const router = useRouter();

    // Data States
    const [profile, setProfile] = useState<any>(null);
    const [links, setLinks] = useState<any[]>([]);

    useEffect(() => { checkUser(); }, []);

    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        setUser(user);

        if (user && session?.provider_token) {
            try {
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
                    alert("Access Denied: Missing Admin Privileges.");
                }
            } catch (err) { console.error(err); }
        } else if (user) {
            console.warn("Soft auth check.");
            setAuthorized(true);
            fetchData();
        }
        setLoading(false);
    }

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: { redirectTo: `${location.origin}/auth/callback`, scopes: 'identify guilds' },
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

    async function uploadFile(file: File): Promise<string | null> {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error } = await supabase.storage.from('uploads').upload(filePath, file);
        if (error) { alert("Upload Failed: " + error.message); return null; }
        const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
        return data.publicUrl;
    }

    // --- Profile & Appearance Updates ---
    async function updateProfile(e: React.FormEvent) {
        e.preventDefault();
        setUploading(true);
        const formData = new FormData(e.target as HTMLFormElement);

        const avatarFile = (formData.get('avatar_file') as File);
        const coverFile = (formData.get('cover_file') as File);
        const musicFile = (formData.get('music_file') as File);
        const bgFile = (formData.get('bg_file') as File);

        let updates: any = {
            name: formData.get('name'),
            bio: formData.get('bio'),
            music_title: formData.get('music_title'),
            music_artist: formData.get('music_artist'),
            theme_color: formData.get('theme_color'),
            font_family: formData.get('font_family'),
            show_3d_map: formData.get('show_3d_map') === 'on',
            map_lat: parseFloat(formData.get('map_lat') as string) || 0,
            map_lng: parseFloat(formData.get('map_lng') as string) || 0,
            socials: {
                twitter: formData.get('social_twitter'),
                instagram: formData.get('social_instagram'),
                github: formData.get('social_github'),
                linkedin: formData.get('social_linkedin')
            }
        };

        if (avatarFile.size > 0) updates.avatar_url = await uploadFile(avatarFile);
        if (coverFile.size > 0) updates.music_cover_url = await uploadFile(coverFile);
        if (musicFile.size > 0) updates.music_url = await uploadFile(musicFile);
        if (bgFile.size > 0) updates.bg_image_url = await uploadFile(bgFile);

        const { error } = await supabase.from('bio_profile').update(updates).eq('id', profile.id);
        if (!error) {
            alert("Changes Saved!");
            // Refresh profile data completely to ensure nested JSON is up to date
            const { data: refreshed } = await supabase.from('bio_profile').select('*').single();
            setProfile(refreshed);
        }
        setUploading(false);
    }

    // --- Link Operations ---
    async function addLink(type: string = 'classic') {
        const newLink = {
            label: type === 'header' ? "New Header" : "New Link",
            url: type === 'header' ? "" : "https://",
            icon: type === 'header' ? "" : "Globe",
            type: type,
            sort_order: links.length + 1,
            is_active: true
        };
        const { data } = await supabase.from('bio_links').insert(newLink).select();
        if (data) setLinks([...links, data[0]]);
    }

    async function deleteLink(id: number) {
        if (!confirm("Delete this item?")) return;
        await supabase.from('bio_links').delete().eq('id', id);
        setLinks(links.filter(l => l.id !== id));
    }

    async function updateLink(id: number, field: string, value: any) {
        const updatedLinks = links.map(l => l.id === id ? { ...l, [field]: value } : l);
        setLinks(updatedLinks);
        await supabase.from('bio_links').update({ [field]: value }).eq('id', id);
    }

    async function moveLink(index: number, direction: 'up' | 'down') {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === links.length - 1) return;

        const newLinks = [...links];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        const tempOrder = newLinks[index].sort_order;
        newLinks[index].sort_order = newLinks[swapIndex].sort_order;
        newLinks[swapIndex].sort_order = tempOrder;

        [newLinks[index], newLinks[swapIndex]] = [newLinks[swapIndex], newLinks[index]];
        setLinks(newLinks);

        await Promise.all([
            supabase.from('bio_links').update({ sort_order: newLinks[index].sort_order }).eq('id', newLinks[index].id),
            supabase.from('bio_links').update({ sort_order: newLinks[swapIndex].sort_order }).eq('id', newLinks[swapIndex].id)
        ]);
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;
    if (!user) return <div className="min-h-screen flex items-center justify-center p-4"><button onClick={handleLogin} className="px-8 py-3 bg-[#5865F2] text-white rounded-xl font-bold">Login with Discord</button></div>;
    if (!authorized) return <div className="text-center text-white pt-20">Access Denied.</div>;

    return (
        <div className="min-h-screen bg-[#020617] text-white pb-20 sm:pb-8">
            {/* Mobile Header */}
            <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
                <h1 className="text-lg font-black italic uppercase tracking-tighter">Bio_Admin</h1>
                <button onClick={handleLogout} className="text-red-400 hover:text-white"><LogOut size={20} /></button>
            </header>

            {/* Main Content Area */}
            <main className="max-w-4xl mx-auto p-4">
                {profile && (
                    <form onSubmit={updateProfile} id="mainForm">

                        {/* TAB: PROFILE */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <section className="glass p-6 rounded-2xl space-y-4">
                                    <h2 className="text-blue-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2"><ShieldCheck size={16} /> Identity</h2>
                                    <div className="grid gap-4">
                                        <input name="name" defaultValue={profile.name} placeholder="Display Name" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white font-bold" />
                                        <textarea name="bio" defaultValue={profile.bio} placeholder="Bio / Tagline" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm" rows={2} />
                                    </div>
                                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                        <div className="w-16 h-16 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                                            <img src={profile.avatar_url} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="grow">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Profile Picture</label>
                                            <input type="file" name="avatar_file" accept="image/*" className="w-full text-xs text-slate-400" />
                                        </div>
                                    </div>
                                </section>

                                <section className="glass p-6 rounded-2xl space-y-4">
                                    <h2 className="text-blue-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2"><Globe size={16} /> Social Icons</h2>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input name="social_twitter" defaultValue={profile.socials?.twitter} placeholder="X (Twitter) URL" className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs" />
                                        <input name="social_instagram" defaultValue={profile.socials?.instagram} placeholder="Instagram URL" className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs" />
                                        <input name="social_github" defaultValue={profile.socials?.github} placeholder="GitHub URL" className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs" />
                                        <input name="social_linkedin" defaultValue={profile.socials?.linkedin} placeholder="LinkedIn URL" className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs" />
                                    </div>
                                </section>

                                <section className="glass p-6 rounded-2xl space-y-4">
                                    <h2 className="text-blue-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2"><Music size={16} /> Audio Player</h2>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input name="music_title" defaultValue={profile.music_title} placeholder="Song Title" className="bg-slate-900/50 border-white/10 rounded-lg px-3 py-2 text-xs" />
                                        <input name="music_artist" defaultValue={profile.music_artist} placeholder="Artist" className="bg-slate-900/50 border-white/10 rounded-lg px-3 py-2 text-xs" />
                                    </div>
                                    <div className="pt-2">
                                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Audio File (MP3)</label>
                                        <input type="file" name="music_file" accept="audio/*" className="w-full text-xs text-slate-400" />
                                    </div>
                                    <div className="pt-2">
                                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Cover Art</label>
                                        <input type="file" name="cover_file" accept="image/*" className="w-full text-xs text-slate-400" />
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* TAB: LINKS */}
                        {activeTab === 'links' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    <button type="button" onClick={() => addLink('classic')} className="px-4 py-2 bg-blue-600 rounded-lg text-xs font-bold whitespace-nowrap">+ Link</button>
                                    <button type="button" onClick={() => addLink('video')} className="px-4 py-2 bg-red-600 rounded-lg text-xs font-bold whitespace-nowrap">+ Video Embed</button>
                                    <button type="button" onClick={() => addLink('header')} className="px-4 py-2 bg-slate-700 rounded-lg text-xs font-bold whitespace-nowrap">+ Header</button>
                                </div>

                                <div className="space-y-3">
                                    {links.map((link, idx) => (
                                        <div key={link.id} className={`p-4 rounded-xl border flex flex-col gap-3 ${link.is_active ? 'bg-slate-900/60 border-white/5' : 'bg-red-900/10 border-red-500/20'}`}>
                                            <div className="flex gap-3 items-center">
                                                <div className="flex flex-col gap-1">
                                                    <button type="button" onClick={() => moveLink(idx, 'up')} className="text-slate-500 hover:text-white" disabled={idx === 0}>▲</button>
                                                    <button type="button" onClick={() => moveLink(idx, 'down')} className="text-slate-500 hover:text-white" disabled={idx === links.length - 1}>▼</button>
                                                </div>
                                                <div className="flex-grow space-y-2">
                                                    <div className="flex gap-2">
                                                        <input value={link.label} onChange={e => updateLink(link.id, 'label', e.target.value)} className="bg-transparent border-b border-white/10 focus:border-blue-500 w-full font-bold text-sm outline-none transition-colors" placeholder="Label" />
                                                        {link.type !== 'header' && (
                                                            <input value={link.icon} onChange={e => updateLink(link.id, 'icon', e.target.value)} className="bg-transparent border-b border-white/10 focus:border-blue-500 w-20 text-xs text-right outline-none transition-colors" placeholder="Icon" />
                                                        )}
                                                    </div>
                                                    {link.type !== 'header' && (
                                                        <input value={link.url} onChange={e => updateLink(link.id, 'url', e.target.value)} className="bg-transparent border-none w-full text-xs text-slate-500 focus:text-blue-400 outline-none font-mono" placeholder={link.type === 'video' ? "YouTube URL" : "https://..."} />
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <button type="button" onClick={() => updateLink(link.id, 'is_active', !link.is_active)} className={link.is_active ? 'text-green-400' : 'text-slate-600'}><Eye size={18} /></button>
                                                    <button type="button" onClick={() => deleteLink(link.id)} className="text-red-900 hover:text-red-500"><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                            {link.type === 'video' && <div className="text-[10px] text-red-400 font-mono uppercase tracking-widest bg-red-900/10 p-1 rounded text-center">Video Embed</div>}
                                            {link.type === 'header' && <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest bg-slate-800 p-1 rounded text-center">Section Header</div>}
                                        </div>
                                    ))}
                                    {links.length === 0 && <div className="text-center text-slate-500 py-10 font-mono text-xs">No active modules.</div>}
                                </div>
                            </div>
                        )}

                        {/* TAB: APPEARANCE */}
                        {activeTab === 'appearance' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <section className="glass p-6 rounded-2xl space-y-4">
                                    <h2 className="text-blue-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2"><Palette size={16} /> Theme Engine</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Primary Accent Color</label>
                                            <div className="flex gap-3">
                                                <input type="color" name="theme_color" defaultValue={profile.theme_color || '#3b82f6'} className="w-12 h-12 rounded-lg bg-transparent cursor-pointer" />
                                                <div className="flex-grow pt-3 text-xs text-slate-400 font-mono">{profile.theme_color || '#3b82f6'}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Font Family</label>
                                            <select name="font_family" defaultValue={profile.font_family} className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-xs text-white">
                                                <option value="Outfit">Modern (Outfit)</option>
                                                <option value="Inter">Clean (Inter)</option>
                                                <option value="Space Mono">Cyber (Space Mono)</option>
                                                <option value="Playfair Display">Elegant (Playfair)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Wallpaper</label>
                                            {profile.bg_image_url && <img src={profile.bg_image_url} className="w-full h-32 object-cover rounded-lg mb-2 border border-blue-500/20" />}
                                            <input type="file" name="bg_file" accept="image/*" className="w-full text-xs text-slate-400" />
                                        </div>
                                    </div>
                                </section>

                                <section className="glass p-6 rounded-2xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-blue-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2"><Map size={16} /> 3D Geo-Location</h2>
                                        <input type="checkbox" name="show_3d_map" defaultChecked={profile.show_3d_map} className="accent-blue-500 w-5 h-5" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input name="map_lat" type="number" step="any" defaultValue={profile.map_lat} placeholder="Latitude" className="bg-slate-900/50 border-white/10 rounded-lg px-3 py-2 text-xs" />
                                        <input name="map_lng" type="number" step="any" defaultValue={profile.map_lng} placeholder="Longitude" className="bg-slate-900/50 border-white/10 rounded-lg px-3 py-2 text-xs" />
                                    </div>
                                    <p className="text-[9px] text-slate-500">Enable to show a 3D Cyber-Globe on your bio page.</p>
                                </section>
                            </div>
                        )}

                        {/* Floating Save Button */}
                        <div className="fixed bottom-20 left-4 right-4 z-40 sm:static sm:mt-8">
                            <button type="submit" disabled={uploading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 flex justify-center items-center gap-2 transition-all active:scale-95 border border-white/10">
                                {uploading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />} {uploading ? 'Uplinking...' : 'Deploy Changes'}
                            </button>
                        </div>
                    </form>
                )}
            </main>

            {/* Mobile Tab Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-[#020617]/90 backdrop-blur-xl border-t border-white/5 pb-safe z-50 flex justify-around p-2">
                <button onClick={() => setActiveTab('profile')} className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-blue-400 bg-blue-900/10' : 'text-slate-500'}`}>
                    <ShieldCheck size={20} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Profile</span>
                </button>
                <button onClick={() => setActiveTab('links')} className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-colors ${activeTab === 'links' ? 'text-blue-400 bg-blue-900/10' : 'text-slate-500'}`}>
                    <Layout size={20} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Links</span>
                </button>
                <button onClick={() => setActiveTab('appearance')} className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-colors ${activeTab === 'appearance' ? 'text-blue-400 bg-blue-900/10' : 'text-slate-500'}`}>
                    <Palette size={20} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Theme</span>
                </button>
            </nav>
        </div>
    );
}
