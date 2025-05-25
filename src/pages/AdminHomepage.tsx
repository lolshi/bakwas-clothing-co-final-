
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
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

interface FeaturedProduct {
  id: string;
  product_id: string;
  sort_order: number;
  products: {
    name: string;
    price: number;
    images: string[] | null;
  };
}

const AdminHomepage = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

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
      const { data: featuredData, error: featuredError } = await supabase
        .from('featured_products')
        .select(`
          *,
          products (
            name,
            price,
            images
          )
        `)
        .order('sort_order', { ascending: true });

      if (bannersError) throw bannersError;
      if (featuredError) throw featuredError;

      if (bannersData) setBanners(bannersData);
      if (featuredData) setFeaturedProducts(featuredData);
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

  const removeFeaturedProduct = async (featuredId: string) => {
    if (!confirm('Remove this product from featured list?')) return;

    try {
      const { error } = await supabase
        .from('featured_products')
        .delete()
        .eq('id', featuredId);

      if (error) throw error;

      setFeaturedProducts(featuredProducts.filter(fp => fp.id !== featuredId));
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
              <Button className="bg-neon-cyan text-black hover:bg-neon-cyan/80">
                <Plus className="mr-2 h-4 w-4" />
                Add Banner
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Subtitle</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <img
                        src={banner.image_url}
                        alt={banner.title || 'Banner'}
                        className="w-16 h-10 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>{banner.title || 'No title'}</TableCell>
                    <TableCell>{banner.subtitle || 'No subtitle'}</TableCell>
                    <TableCell>{banner.link_url || 'No link'}</TableCell>
                    <TableCell>{banner.sort_order}</TableCell>
                    <TableCell>
                      <Switch
                        checked={banner.is_active}
                        onCheckedChange={(checked) => toggleBannerStatus(banner.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
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
          </CardContent>
        </Card>

        {/* Featured Products Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Featured Products</CardTitle>
                <CardDescription>
                  Products highlighted on your homepage
                </CardDescription>
              </div>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Featured Product
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featuredProducts.map((featured) => (
                  <TableRow key={featured.id}>
                    <TableCell>
                      {featured.products.images && featured.products.images[0] ? (
                        <img
                          src={featured.products.images[0]}
                          alt={featured.products.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{featured.products.name}</TableCell>
                    <TableCell>₹{Number(featured.products.price).toLocaleString()}</TableCell>
                    <TableCell>{featured.sort_order}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeaturedProduct(featured.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminHomepage;
