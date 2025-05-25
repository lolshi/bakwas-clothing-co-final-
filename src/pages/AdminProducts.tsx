
import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Upload, Eye, EyeOff, Box, Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  color: string;
  tags: string[];
  images: string[];
  category_ids: string[];
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const AdminProducts = () => {
  const { adminUser } = useAdminAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    color: '',
    tags: '',
    category_ids: [] as string[],
    images: [] as string[],
    is_active: true,
    is_featured: false
  });

  useEffect(() => {
    if (adminUser) {
      fetchProducts();
      fetchCategories();
    }
  }, [adminUser]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock_quantity: '',
      color: '',
      tags: '',
      category_ids: [],
      images: [],
      is_active: true,
      is_featured: false
    });
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const productData = {
        name: formData.name,
        slug,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        color: formData.color,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        category_ids: formData.category_ids,
        images: formData.images,
        is_active: formData.is_active,
        is_featured: formData.is_featured
      };

      let error;
      if (editingProduct) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert([productData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Product ${editingProduct ? 'updated' : 'created'} successfully`,
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingProduct ? 'update' : 'create'} product`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      color: product.color || '',
      tags: product.tags?.join(', ') || '',
      category_ids: product.category_ids || [],
      images: product.images || [],
      is_active: product.is_active,
      is_featured: product.is_featured || false
    });
    setIsAddDialogOpen(true);
  };

  const toggleProductStatus = async (productId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !isActive })
        .eq('id', productId);

      if (error) throw error;
      
      fetchProducts();
      toast({
        title: "Success",
        description: `Product ${!isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  const toggleFeaturedStatus = async (productId: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !isFeatured })
        .eq('id', productId);

      if (error) throw error;
      
      fetchProducts();
      toast({
        title: "Success",
        description: `Product ${!isFeatured ? 'added to' : 'removed from'} featured`,
      });
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive",
      });
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Box className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-anton">Product Management</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="streetwear, graphic, limited"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="active">Active (visible on site)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label htmlFor="featured">Featured on Homepage</Label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {product.name}
                      {!product.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      {product.is_featured && (
                        <Badge className="bg-neon-cyan text-black">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {product.stock_quantity === 0 && (
                        <Badge variant="destructive">Out of Stock</Badge>
                      )}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1">{product.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFeaturedStatus(product.id, product.is_featured)}
                    >
                      <Star className={`h-4 w-4 ${product.is_featured ? 'fill-current text-neon-cyan' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleProductStatus(product.id, product.is_active)}
                    >
                      {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Price:</span>
                    <p>₹{product.price}</p>
                  </div>
                  <div>
                    <span className="font-medium">Stock:</span>
                    <p>{product.stock_quantity}</p>
                  </div>
                  <div>
                    <span className="font-medium">Color:</span>
                    <p>{product.color || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Tags:</span>
                    <p>{product.tags?.join(', ') || 'None'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Featured:</span>
                    <p>{product.is_featured ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <Box className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4">Get started by adding your first product</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
