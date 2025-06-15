-- Add new columns to homepage_banners table
ALTER TABLE homepage_banners
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS mobile_video_url TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
ADD COLUMN IF NOT EXISTS show_title BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_subtitle BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS device_targeting TEXT DEFAULT 'all' CHECK (device_targeting IN ('all', 'desktop', 'mobile', 'tablet')),
ADD COLUMN IF NOT EXISTS mobile_image_url TEXT;

-- Update existing rows
UPDATE homepage_banners
SET media_type = 'image',
    show_title = true,
    show_subtitle = true,
    device_targeting = 'all'
WHERE media_type IS NULL; 