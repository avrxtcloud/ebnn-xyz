-- Add new columns to bio_profile for deep customization
ALTER TABLE bio_profile 
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS bg_image_url TEXT,
ADD COLUMN IF NOT EXISTS favicon_url TEXT,
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Outfit',
ADD COLUMN IF NOT EXISTS show_3d_map BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS map_lat FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS map_lng FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS socials JSONB DEFAULT '{}'::jsonb;

-- Add type column to bio_links for supporting Embeds/Headers
ALTER TABLE bio_links 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'classic'; -- 'classic', 'video', 'header'

-- Update existing rows to have default values if null
UPDATE bio_profile SET theme_color = '#3b82f6', font_family = 'Outfit' WHERE theme_color IS NULL;
UPDATE bio_links SET type = 'classic' WHERE type IS NULL;
