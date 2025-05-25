
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Banner {
  id?: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  sort_order: number;
}

export const useBannerForm = (banner?: Banner | null) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Banner>({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    image_url: banner?.image_url || '',
    link_url: banner?.link_url || '',
    is_active: banner?.is_active ?? true,
    sort_order: banner?.sort_order || 0,
  });

  const updateFormData = (updates: Partial<Banner>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const saveBanner = async (imageUrl: string, onSave: () => void, onClose: () => void) => {
    setLoading(true);

    try {
      const bannerData = {
        ...formData,
        image_url: imageUrl,
      };

      let error;
      if (banner?.id) {
        const { error: updateError } = await supabase
          .from('homepage_banners')
          .update(bannerData)
          .eq('id', banner.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('homepage_banners')
          .insert([bannerData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Banner ${banner?.id ? 'updated' : 'created'} successfully`,
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast({
        title: "Error",
        description: `Failed to ${banner?.id ? 'update' : 'create'} banner`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    updateFormData,
    loading,
    saveBanner,
  };
};
