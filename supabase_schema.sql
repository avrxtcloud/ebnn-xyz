-- Create table for bio content
CREATE TABLE bio_profile (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    bio TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    music_title TEXT,
    music_artist TEXT,
    music_url TEXT,
    music_cover_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for bio links
CREATE TABLE bio_links (
    id SERIAL PRIMARY KEY,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT NOT NULL, -- "Globe", "Github", "Discord", etc.
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic row security (you can refine this later)
ALTER TABLE bio_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_links ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow public read access on bio_profile" ON bio_profile FOR SELECT USING (true);
CREATE POLICY "Allow public read access on bio_links" ON bio_links FOR SELECT USING (true);

-- Allow write access only to authenticated users (admin logic will be handled in app)
-- For tighter security, you could add checks for specific user IDs here
CREATE POLICY "Allow authenticated update on bio_profile" ON bio_profile FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on bio_links" ON bio_links FOR ALL USING (auth.role() = 'authenticated');

-- Seed Data (Initial Setup)
INSERT INTO bio_profile (name, bio, avatar_url, music_title, music_artist, music_url, music_cover_url)
VALUES (
    'Ebin Sebastian', 
    '// core_links.exe', 
    '/dp-1.jpg',
    'Unnai Kaanadhu Naan',
    'Audio Feed',
    '/song.mp3',
    '/cover.jpeg'
);

INSERT INTO bio_links (label, url, icon, sort_order) VALUES
('Main Website', 'https://ebnn.xyz', 'Globe', 1),
('GitHub', 'https://github.com/Ebnxyz', 'Github', 3),
('Discord', 'https://discord.com/users/1375329068450447451', 'MessageSquare', 4);
