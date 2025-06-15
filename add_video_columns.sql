-- Add video-related columns to homepage_banners table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_banners' AND column_name = 'video_url') THEN
        ALTER TABLE homepage_banners ADD COLUMN video_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_banners' AND column_name = 'media_type') THEN
        ALTER TABLE homepage_banners ADD COLUMN media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video'));
    END IF;
END $$;

-- Update existing rows to have default values
UPDATE homepage_banners
SET media_type = 'image'
WHERE media_type IS NULL; 