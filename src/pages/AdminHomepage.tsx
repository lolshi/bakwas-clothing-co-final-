
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import BannerForm from '@/components/admin/BannerForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, GripVertical, Star } from 'lucide-react';
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

const AdminHomepage = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerFormOpen, setBannerFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  useEffect(() => {
    fetchHomepageData();
  }, []);

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Homepage Management</h1>
          <p className="text-muted-foreground">
            Manage banners and featured products on your homepage
          </p>
        </div>

        {/* Banners Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Homepage Banners</CardTitle>
                <CardDescription>
                  Manage promotional banners displayed on your homepage
                </CardDescription>
              </div>
              <Button 
                className="bg-neon-cyan text-black hover:bg-neon-cyan/80"
                onClick={handleAddBanner}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Banner
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {banners.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Order</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Subtitle</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          {banner.sort_order}
                        </div>
                      </TableCell>
                      <TableCell>
                        <img
                          src={banner.image_url}
                          alt={banner.title || 'Banner'}
                          className="w-16 h-10 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell>{banner.title || 'No title'}</TableCell>
                      <TableCell>{banner.subtitle || 'No subtitle'}</TableCell>
                      <TableCell>
                        {banner.link_url ? (
                          <a 
                            href={banner.link_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-neon-cyan hover:underline"
                          >
                            Link
                          </a>
                        ) : (
                          'No link'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={banner.is_active}
                            onCheckedChange={(checked) => toggleBannerStatus(banner.id, checked)}
                          />
                          <Badge variant={banner.is_active ? "default" : "secondary"}>
                            {banner.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditBanner(banner)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteBanner(banner.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No banners created yet</p>
                <Button onClick={handleAddBanner}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Banner
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Featured Products Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Featured Products</CardTitle>
                <CardDescription>
                  Products highlighted on your homepage (managed in Product Management)
                </CardDescription>
              </div>
              <Button variant="outline" asChild>
                <a href="/admin/products">
                  <Star className="mr-2 h-4 w-4" />
                  Manage Featured Products
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {featuredProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featuredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">No image</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>₹{Number(product.price).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeaturedProduct(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No featured products yet</p>
                <Button variant="outline" asChild>
                  <a href="/admin/products">
                    <Star className="mr-2 h-4 w-4" />
                    Feature Some Products
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
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
