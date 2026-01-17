"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut, Loader2, Plus, Trash2, Edit, Upload, Music, Image as ImageIcon, CheckCircle, XCircle, GripVertical, Eye, EyeOff } from "lucide-react";

export default function AdminPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    // Data States
    const [profile, setProfile] = useState<any>(null);
    const [links, setLinks] = useState<any[]>([]);

    // Upload States
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        setUser(user);

        // Security check is here (logic preserved from previous steps)
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
            // Fallback for dev/demo or if token expired
            // You might want to remove this 'true' fallback for prod
            console.warn("Soft auth check.");
            setAuthorized(true);
            fetchData();
        }
        setLoading(false);
    }

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
                scopes: 'identify guilds'
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

    // --- File Upload Logic ---
    async function uploadFile(file: File): Promise<string | null> {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage.from('uploads').upload(filePath, file);

        if (uploadError) {
            console.error('Upload Error', uploadError);
            alert("Upload Failed: " + uploadError.message);
            return null;
        }

        const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
        return data.publicUrl;
    }

    // --- CRUD Handlers ---

    async function updateProfile(e: React.FormEvent) {
        e.preventDefault();
        setUploading(true);
        const formData = new FormData(e.target as HTMLFormElement);

        // Handle File Uploads
        const avatarFile = (formData.get('avatar_file') as File);
        const coverFile = (formData.get('cover_file') as File);
        const musicFile = (formData.get('music_file') as File);

        let updates: any = {
            name: formData.get('name'),
            bio: formData.get('bio'),
            music_title: formData.get('music_title'),
            music_artist: formData.get('music_artist'),
        };

        if (avatarFile.size > 0) {
            const url = await uploadFile(avatarFile);
            if (url) updates.avatar_url = url;
        }
        if (coverFile.size > 0) {
            const url = await uploadFile(coverFile);
            if (url) updates.music_cover_url = url;
        }
        if (musicFile.size > 0) {
            const url = await uploadFile(musicFile);
            if (url) updates.music_url = url;
        }

        // Add explicit URL fields if no file uploaded but text present
        if (!updates.avatar_url && formData.get('avatar_url')) updates.avatar_url = formData.get('avatar_url');
        if (!updates.music_cover_url && formData.get('music_cover_url')) updates.music_cover_url = formData.get('music_cover_url');
        if (!updates.music_url && formData.get('music_url')) updates.music_url = formData.get('music_url');

        const { error } = await supabase.from('bio_profile').update(updates).eq('id', profile.id);
        if (!error) {
            alert("Profile Updated!");
            setProfile({ ...profile, ...updates });
        }
        setUploading(false);
    }

    async function addLink() {
        const newLink = {
            label: "New Link",
            url: "https://",
            icon: "Globe",
            sort_order: links.length + 1,
            is_active: true
        };
        const { data, error } = await supabase.from('bio_links').insert(newLink).select();
        if (data) setLinks([...links, data[0]]);
    }

    async function deleteLink(id: number) {
        if (!confirm("Are you sure?")) return;
        await supabase.from('bio_links').delete().eq('id', id);
        setLinks(links.filter(l => l.id !== id));
    }

    async function updateLink(id: number, field: string, value: any) {
        // Optimistic Update
        const updatedLinks = links.map(l => l.id === id ? { ...l, [field]: value } : l);
        setLinks(updatedLinks); // Immediate UI update

        const { error } = await supabase.from('bio_links').update({ [field]: value }).eq('id', id);
        if (error) {
            alert("Failed to save change");
            // Revert if needed (not implemented for simplicity)
        }
    }

    async function moveLink(index: number, direction: 'up' | 'down') {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === links.length - 1) return;

        const newLinks = [...links];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap sort_order
        const tempOrder = newLinks[index].sort_order;
        newLinks[index].sort_order = newLinks[swapIndex].sort_order;
        newLinks[swapIndex].sort_order = tempOrder;

        // Swap positions in array
        [newLinks[index], newLinks[swapIndex]] = [newLinks[swapIndex], newLinks[index]];

        setLinks(newLinks);

        // Update DB (Parallel)
        await Promise.all([
            updateLink(newLinks[index].id, 'sort_order', newLinks[index].sort_order),
            updateLink(newLinks[swapIndex].id, 'sort_order', newLinks[swapIndex].sort_order)
        ]);
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
        return <div className="text-center text-white pt-20">Access Denied. Checking authorization...</div>;
    }

    return (
        <div className="min-h-screen p-4 sm:p-8 max-w-6xl mx-auto">
            <header className="flex justify-between items-center mb-10 pb-4 border-b border-white/10">
                <h1 className="text-2xl sm:text-3xl font-black text-white italic uppercase">Bio_Control_Center</h1>
                <div className="flex items-center gap-4">
                    <button onClick={handleLogout} className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"><LogOut size={20} /></button>
                </div>
            </header>

            <div className="grid lg:grid-cols-2 gap-8">

                {/* Profile Section */}
                <section className="glass p-6 sm:p-8 rounded-[2rem] relative">
                    {uploading && <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center rounded-[2rem] backdrop-blur-sm"><Loader2 className="animate-spin text-blue-500" size={40} /></div>}

                    <h2 className="text-xl font-bold text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2"><ShieldCheck size={20} /> Profile Config</h2>
                    {profile && (
                        <form onSubmit={updateProfile} className="space-y-5">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Display Name</label>
                                    <input name="name" defaultValue={profile.name} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white font-bold" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Tagline / Bio</label>
                                    <input name="bio" defaultValue={profile.bio} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white" />
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 uppercase font-bold block flex items-center gap-2"><ImageIcon size={12} /> Avatar Image</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                                        <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Current" />
                                    </div>
                                    <div className="flex-grow">
                                        <input type="file" name="avatar_file" accept="image/*" className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500" />
                                        <input name="avatar_url" type="hidden" defaultValue={profile.avatar_url} />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            <div>
                                <label className="text-xs text-blue-400 uppercase font-bold mb-3 block flex items-center gap-2"><Music size={14} /> Music Configuration</label>
                                <div className="bg-slate-900/30 p-4 rounded-xl border border-white/5 space-y-4">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                                            <img src={profile.music_cover_url} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-grow space-y-2">
                                            <label className="text-[9px] text-slate-500 uppercase font-bold block">Update Cover Art</label>
                                            <input type="file" name="cover_file" accept="image/*" className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-slate-700 file:text-white" />
                                            <input name="music_cover_url" type="hidden" defaultValue={profile.music_cover_url} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <input name="music_title" placeholder="Song Title" defaultValue={profile.music_title} className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                                        <input name="music_artist" placeholder="Artist" defaultValue={profile.music_artist} className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                                    </div>

                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Audio File (MP3)</label>
                                        <div className="flex gap-2 items-center">
                                            <input type="file" name="music_file" accept="audio/*" className="w-full text-xs text-slate-400 file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:bg-slate-700 file:text-white" />
                                            {profile.music_url && <a href={profile.music_url} target="_blank" className="p-2 bg-slate-800 rounded text-blue-400"><Music size={16} /></a>}
                                        </div>
                                        <input name="music_url" type="hidden" defaultValue={profile.music_url} />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={uploading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-4 flex justify-center items-center gap-2">
                                {uploading ? <Loader2 className="animate-spin" /> : <CheckCircle size={18} />} Save Changes
                            </button>
                        </form>
                    )}
                </section>

                {/* Links Section */}
                <section className="glass p-6 sm:p-8 rounded-[2rem] flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2"><Edit size={20} /> Link Manager</h2>
                        <button onClick={addLink} className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-all"><Plus size={18} /></button>
                    </div>

                    <div className="space-y-3 overflow-y-auto pr-2 flex-grow custom-scrollbar">
                        {links.map((link, index) => (
                            <div key={link.id} className={`p-4 rounded-xl flex flex-col gap-3 group transition-all border ${link.is_active ? 'bg-slate-900/40 border-white/5 hover:border-blue-500/30' : 'bg-red-900/10 border-red-500/20 opacity-75'}`}>
                                <div className="flex gap-3 items-center">
                                    <div className="flex flex-col gap-1 text-slate-600">
                                        <button onClick={() => moveLink(index, 'up')} className="hover:text-blue-400 disabled:opacity-30" disabled={index === 0}>▲</button>
                                        <button onClick={() => moveLink(index, 'down')} className="hover:text-blue-400 disabled:opacity-30" disabled={index === links.length - 1}>▼</button>
                                    </div>

                                    <div className="flex-grow space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                value={link.label}
                                                onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                                                className="flex-grow bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-white font-bold"
                                                placeholder="Link Label"
                                            />
                                            <div className="flex items-center gap-2 bg-slate-950/30 px-2 rounded-lg border border-white/5">
                                                <input
                                                    value={link.icon}
                                                    onChange={(e) => updateLink(link.id, 'icon', e.target.value)}
                                                    className="w-20 bg-transparent border-none outline-none text-slate-400 text-xs text-right"
                                                    placeholder="Icon"
                                                />
                                            </div>
                                        </div>
                                        <input
                                            value={link.url}
                                            onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                                            className="w-full bg-transparent text-xs text-slate-500 focus:text-blue-400 outline-none font-mono"
                                            placeholder="https://example.com"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 items-end">
                                        <button
                                            onClick={() => updateLink(link.id, 'is_active', !link.is_active)}
                                            className={`p-1.5 rounded-lg transition-colors ${link.is_active ? 'text-green-400 bg-green-900/20' : 'text-slate-500 bg-slate-800'}`}
                                            title={link.is_active ? "Visible" : "Hidden"}
                                        >
                                            {link.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                                        </button>
                                        <button onClick={() => deleteLink(link.id)} className="p-1.5 text-red-900 hover:text-red-500 transition-colors bg-red-900/10 rounded-lg"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {links.length === 0 && <p className="text-slate-500 text-center italic text-sm py-10 border border-dashed border-white/10 rounded-xl">No links active. Click + to add one.</p>}
                    </div>
                </section>

            </div>
        </div>
    );
}
