-- Add all required columns to homepage_banners table
DO $$ 
BEGIN 
    -- Add video-related columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_banners' AND column_name = 'video_url') THEN
        ALTER TABLE homepage_banners ADD COLUMN video_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_banners' AND column_name = 'mobile_video_url') THEN
        ALTER TABLE homepage_banners ADD COLUMN mobile_video_url TEXT;
    END IF;

    -- Add media type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_banners' AND column_name = 'media_type') THEN
        ALTER TABLE homepage_banners ADD COLUMN media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video'));
    END IF;

    -- Add visibility columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_banners' AND column_name = 'show_title') THEN
        ALTER TABLE homepage_banners ADD COLUMN show_title BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_banners' AND column_name = 'show_subtitle') THEN
        ALTER TABLE homepage_banners ADD COLUMN show_subtitle BOOLEAN DEFAULT true;
    END IF;

    -- Add device targeting column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_banners' AND column_name = 'device_targeting') THEN
        ALTER TABLE homepage_banners ADD COLUMN device_targeting TEXT DEFAULT 'all' CHECK (device_targeting IN ('all', 'desktop', 'mobile', 'tablet'));
    END IF;

    -- Add mobile image column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_banners' AND column_name = 'mobile_image_url') THEN
        ALTER TABLE homepage_banners ADD COLUMN mobile_image_url TEXT;
    END IF;
END $$;

-- Update existing rows with default values
UPDATE homepage_banners
SET media_type = COALESCE(media_type, 'image'),
    show_title = COALESCE(show_title, true),
    show_subtitle = COALESCE(show_subtitle, true),
    device_targeting = COALESCE(device_targeting, 'all')
WHERE media_type IS NULL
   OR show_title IS NULL
   OR show_subtitle IS NULL
   OR device_targeting IS NULL; 