import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  video_url: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  media_type: 'image' | 'video';
  show_title: boolean;
  show_subtitle: boolean;
  device_targeting: 'all' | 'desktop' | 'mobile' | 'tablet';
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
  is_featured: boolean;
}

interface RawBanner extends Omit<Banner, 'is_active' | 'sort_order' | 'media_type' | 'show_title' | 'show_subtitle' | 'device_targeting'> {
  is_active: boolean | null;
  sort_order: number | null;
  media_type: 'image' | 'video' | null;
  show_title: boolean | null;
  show_subtitle: boolean | null;
  device_targeting: 'all' | 'desktop' | 'mobile' | 'tablet' | null;
}

interface RawProduct extends Omit<Product, 'is_featured'> {
  is_featured: boolean | null;
}

export const useHomepageData = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHomepageData = async () => {
    setLoading(true);
    console.log('Fetching homepage data...');
    try {
      // Fetch banners with no caching
      const { data: bannersData, error: bannersError } = await supabase
        .from('homepage_banners')
        .select('*')
        .order('sort_order', { ascending: true })
        .throwOnError();

      // Fetch featured products with no caching
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, images, is_featured')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .throwOnError();

      if (bannersError) {
        console.error('Error fetching banners:', bannersError);
        throw bannersError;
      }
      if (productsError) {
        console.error('Error fetching products:', productsError);
        throw productsError;
      }

      console.log('Raw banners data (detailed):', JSON.stringify(bannersData, null, 2));
      console.log('Raw products data:', productsData);

      // Transform the data to match our interfaces
      const transformedBanners = (bannersData as RawBanner[] || []).map(banner => {
        const transformed = {
          ...banner,
          is_active: banner.is_active ?? true,
          sort_order: banner.sort_order ?? 0,
          media_type: banner.media_type ?? 'image',
          show_title: banner.show_title ?? true,
          show_subtitle: banner.show_subtitle ?? true,
          device_targeting: banner.device_targeting ?? 'all'
        };
        console.log('Transformed banner:', JSON.stringify(transformed, null, 2));
        return transformed;
      });

      console.log('All transformed banners:', JSON.stringify(transformedBanners, null, 2));

      const transformedProducts = (productsData as RawProduct[] || []).map(product => ({
        ...product,
        is_featured: product.is_featured ?? false
      }));

      setBanners(transformedBanners);
      setFeaturedProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      toast.error('Failed to fetch homepage data');
    } finally {
      setLoading(false);
    }
  };

  const toggleBannerStatus = async (bannerId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('homepage_banners')
        .update({ is_active: isActive })
        .eq('id', bannerId)
        .throwOnError();

      if (error) throw error;

      // Only update local state, no need to refetch
      setBanners(banners.map(banner =>
        banner.id === bannerId ? { ...banner, is_active: isActive } : banner
      ));

      toast.success(`Banner ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('Failed to update banner');
    }
  };

  const deleteBanner = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const { error } = await supabase
        .from('homepage_banners')
        .delete()
        .eq('id', bannerId)
        .throwOnError();

      if (error) throw error;

      // Only update local state, no need to refetch
      setBanners(banners.filter(banner => banner.id !== bannerId));
      toast.success('Banner deleted successfully');
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  const removeFeaturedProduct = async (productId: string) => {
    if (!confirm('Remove this product from featured list?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: false })
        .eq('id', productId)
        .throwOnError();

      if (error) throw error;

      await fetchHomepageData();
      toast.success('Product removed from featured list');
    } catch (error) {
      console.error('Error removing featured product:', error);
      toast.error('Failed to remove featured product');
    }
  };

  useEffect(() => {
    fetchHomepageData();
  }, []);

  return {
    banners,
    featuredProducts,
    loading,
    fetchHomepageData,
    toggleBannerStatus,
    deleteBanner,
    removeFeaturedProduct
  };
};
