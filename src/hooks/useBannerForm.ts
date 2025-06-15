import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Banner } from '@/types/banner';

export const useBannerForm = (initialBanner?: Banner | null) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Banner>({
    title: initialBanner?.title || '',
    subtitle: initialBanner?.subtitle || '',
    image_url: initialBanner?.image_url || '',
    video_url: initialBanner?.video_url || null,
    link_url: initialBanner?.link_url || '',
    is_active: initialBanner?.is_active ?? true,
    sort_order: initialBanner?.sort_order || 0,
    media_type: initialBanner?.media_type || 'image',
    show_title: initialBanner?.show_title ?? true,
    show_subtitle: initialBanner?.show_subtitle ?? true,
    device_targeting: initialBanner?.device_targeting || 'all'
  });

  // Add useEffect to update form data when initialBanner changes
  useEffect(() => {
    if (initialBanner) {
      setFormData({
        title: initialBanner.title || '',
        subtitle: initialBanner.subtitle || '',
        image_url: initialBanner.image_url || '',
        video_url: initialBanner.video_url || null,
        link_url: initialBanner.link_url || '',
        is_active: initialBanner.is_active ?? true,
        sort_order: initialBanner.sort_order || 0,
        media_type: initialBanner.media_type || 'image',
        show_title: initialBanner.show_title ?? true,
        show_subtitle: initialBanner.show_subtitle ?? true,
        device_targeting: initialBanner.device_targeting || 'all'
      });
    }
  }, [initialBanner]);

  const updateFormData = (updates: Partial<Banner>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const saveBanner = async (mediaUrl: string, mediaType: 'image' | 'video', onSuccess: () => void, onClose: () => void) => {
    setLoading(true);

    try {
      const bannerData = {
        ...formData,
        title: formData.title,
        subtitle: formData.subtitle,
        image_url: mediaType === 'image' ? mediaUrl : formData.image_url,
        video_url: mediaType === 'video' ? mediaUrl : formData.video_url,
        link_url: formData.link_url,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
        media_type: mediaType,
        show_title: formData.show_title,
        show_subtitle: formData.show_subtitle,
        device_targeting: formData.device_targeting
      };

      console.log('Saving banner data:', JSON.stringify(bannerData, null, 2));

      let result;
      if (initialBanner?.id) {
        console.log('Updating existing banner:', initialBanner.id);
        const { data, error } = await supabase
          .from('homepage_banners')
          .update(bannerData)
          .eq('id', initialBanner.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating banner:', error);
          throw error;
        }
        console.log('Banner update result:', JSON.stringify(data, null, 2));
        result = data;

        toast({
          title: "Banner Updated",
          description: "Banner has been updated successfully!",
        });
      } else {
        console.log('Creating new banner');
        const { data, error } = await supabase
          .from('homepage_banners')
          .insert(bannerData)
          .select()
          .single();

        if (error) {
          console.error('Error creating banner:', error);
          throw error;
        }
        console.log('Banner creation result:', JSON.stringify(data, null, 2));
        result = data;

        toast({
          title: "Banner Created",
          description: "New banner has been created successfully!",
        });
      }

      if (onSuccess) {
        await onSuccess();
      }

      if (onClose) {
        onClose();
      }
    } catch (error: any) {
      console.error('Banner save error:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to save banner',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Test function to create a banner with all fields
  const createTestBanner = async () => {
    try {
      const testBannerData = {
        title: 'Test Banner',
        subtitle: 'Testing all fields',
        image_url: 'https://example.com/test.jpg',
        video_url: null,
        link_url: 'https://example.com',
        is_active: true,
        sort_order: 0,
        media_type: 'image' as const,
        show_title: true,
        show_subtitle: true,
        device_targeting: 'all' as const
      };

      console.log('Creating test banner:', JSON.stringify(testBannerData, null, 2));

      const { data, error } = await supabase
        .from('homepage_banners')
        .insert(testBannerData)
        .select()
        .single();

      if (error) {
        console.error('Error creating test banner:', error);
        throw error;
      }

      console.log('Test banner creation result:', JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error('Test banner creation failed:', error);
      throw error;
    }
  };

  return {
    formData,
    updateFormData,
    loading,
    saveBanner,
    createTestBanner,
  };
};
