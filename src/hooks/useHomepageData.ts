
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
  is_featured: boolean;
}

export const useHomepageData = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHomepageData = async () => {
    try {
      // Fetch banners
      const { data: bannersData, error: bannersError } = await supabase
        .from('homepage_banners')
        .select('*')
        .order('sort_order', { ascending: true });

      // Fetch featured products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, images, is_featured')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (bannersError) throw bannersError;
      if (productsError) throw productsError;

      if (bannersData) setBanners(bannersData);
      if (productsData) setFeaturedProducts(productsData);
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
        .eq('id', bannerId);

      if (error) throw error;

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
        .eq('id', bannerId);

      if (error) throw error;

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
        .eq('id', productId);

      if (error) throw error;

      fetchHomepageData();
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
