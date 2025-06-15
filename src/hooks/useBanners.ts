import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Banner } from '@/types/banner';

interface RawBanner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  mobile_image_url: string | null;
  video_url: string | null;
  mobile_video_url: string | null;
  link_url: string | null;
  is_active: boolean | null;
  sort_order: number | null;
  media_type: 'image' | 'video' | null;
  show_title: boolean | null;
  show_subtitle: boolean | null;
  device_targeting: 'all' | 'desktop' | 'mobile' | 'tablet' | null;
  created_at: string | null;
  start_date: string | null;
  end_date: string | null;
}

// Test banner for debugging
const TEST_BANNER: Banner = {
  id: 'test-1',
  title: 'Test Video Banner',
  subtitle: 'Testing video playback',
  image_url: '/lovable-uploads/b687c006-4250-445a-9bac-26f34cf86b87.png',
  mobile_image_url: '/lovable-uploads/b687c006-4250-445a-9bac-26f34cf86b87.png',
  video_url: '/images-videos-logo/1000113803.mp4',
  mobile_video_url: '/images-videos-logo/1000113803.mp4',
  link_url: '/shop',
  is_active: true,
  sort_order: 0,
  media_type: 'video',
  show_title: true,
  show_subtitle: true,
  device_targeting: 'all',
  created_at: new Date().toISOString(),
  start_date: null,
  end_date: null
};

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('useBanners hook initialized');
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      console.log('Fetching banners...');
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('homepage_banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        throw fetchError;
      }

      console.log('Raw banner data from Supabase:', data);

      // If no banners found, use test banner
      if (!data || data.length === 0) {
        console.log('No banners found, using test banner');
        setBanners([TEST_BANNER]);
        setLoading(false);
        return;
      }

      // Transform the data to ensure all required fields are present
      const transformedBanners = (data as RawBanner[] || []).map(banner => {
        const transformed = {
        id: banner.id,
        title: banner.title || '',
        subtitle: banner.subtitle,
        image_url: banner.image_url,
          mobile_image_url: banner.mobile_image_url || banner.image_url, // Fallback to desktop image
        video_url: banner.video_url || null,
          mobile_video_url: banner.mobile_video_url || banner.video_url, // Fallback to desktop video
        link_url: banner.link_url,
        is_active: banner.is_active ?? true,
        sort_order: banner.sort_order ?? 0,
        media_type: banner.media_type || 'image',
        show_title: banner.show_title ?? true,
        show_subtitle: banner.show_subtitle ?? true,
          device_targeting: banner.device_targeting || 'all',
        created_at: banner.created_at,
        start_date: banner.start_date,
        end_date: banner.end_date
        };
        console.log('Transformed banner:', transformed);
        return transformed;
      }) as Banner[];

      console.log('Final transformed banners:', transformedBanners);
      setBanners(transformedBanners);
    } catch (err) {
      console.error('Error fetching banners:', err);
      // If there's an error, use test banner
      console.log('Error occurred, using test banner');
      setBanners([TEST_BANNER]);
    } finally {
      setLoading(false);
    }
  };

  return { banners, loading, error };
}; 