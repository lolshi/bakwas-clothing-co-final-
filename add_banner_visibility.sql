-- Add show_title and show_subtitle columns to homepage_banners table
ALTER TABLE homepage_banners
ADD COLUMN show_title BOOLEAN DEFAULT true,
ADD COLUMN show_subtitle BOOLEAN DEFAULT true,
ADD COLUMN video_url TEXT,
ADD COLUMN media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video'));

-- Update existing rows to have default values
UPDATE homepage_banners
SET show_title = true,
    show_subtitle = true,
    media_type = 'image'
WHERE show_title IS NULL
   OR show_subtitle IS NULL
   OR media_type IS NULL; 