
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import BannerForm from '@/components/admin/BannerForm';
import BannersSection from '@/components/admin/BannersSection';
import FeaturedProductsSection from '@/components/admin/FeaturedProductsSection';
import { useHomepageData } from '@/hooks/useHomepageData';

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}

const AdminHomepage = () => {
  const {
    banners,
    featuredProducts,
    loading,
    fetchHomepageData,
    toggleBannerStatus,
    deleteBanner,
    removeFeaturedProduct
  } = useHomepageData();

  const [bannerFormOpen, setBannerFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerFormOpen(true);
  };

  const handleAddBanner = () => {
    setEditingBanner(null);
    setBannerFormOpen(true);
  };

  const handleBannerSaved = () => {
    fetchHomepageData();
    setEditingBanner(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Homepage Management</h1>
          <p className="text-muted-foreground">
            Manage banners and featured products on your homepage
          </p>
        </div>

        <BannersSection
          banners={banners}
          onAddBanner={handleAddBanner}
          onEditBanner={handleEditBanner}
          onToggleBannerStatus={toggleBannerStatus}
          onDeleteBanner={deleteBanner}
        />

        <FeaturedProductsSection
          featuredProducts={featuredProducts}
          onRemoveFeaturedProduct={removeFeaturedProduct}
        />
      </div>

      <BannerForm
        banner={editingBanner}
        isOpen={bannerFormOpen}
        onClose={() => setBannerFormOpen(false)}
        onSave={handleBannerSaved}
      />
    </AdminLayout>
  );
};

export default AdminHomepage;
