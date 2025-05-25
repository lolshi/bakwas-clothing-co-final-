import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';
import ProductCard from '@/components/admin/ProductCard';
import EmptyProductsState from '@/components/admin/EmptyProductsState';
import LoadingState from '@/components/admin/LoadingState';
import AdminLayout from '@/components/admin/AdminLayout';

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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsAddDialogOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsAddDialogOpen(true);
  };

  const handleProductSaved = () => {
    fetchProducts();
    setEditingProduct(null);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingProduct(null);
  };

  if (loading && products.length === 0) {
    return (
      <AdminLayout>
        <LoadingState />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onUpdate={fetchProducts}
            />
          ))}
        </div>

        {products.length === 0 && !loading && (
          <EmptyProductsState onAddProduct={handleAddProduct} />
        )}

        <ProductForm
          isOpen={isAddDialogOpen}
          onClose={handleCloseDialog}
          editingProduct={editingProduct}
          onProductSaved={handleProductSaved}
          categories={categories}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
