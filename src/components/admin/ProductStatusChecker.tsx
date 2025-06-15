import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  is_active: boolean;
  is_featured: boolean;
  price: number;
  images: string[];
  created_at: string;
}

const ProductStatusChecker = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, is_active, is_featured, price, images, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to handle nulls
      const transformedProducts: Product[] = (data || []).map(item => ({
        id: item.id,
        name: item.name || 'Unnamed Product',
        is_active: item.is_active ?? false,
        is_featured: item.is_featured ?? false,
        price: item.price || 0,
        images: item.images || [],
        created_at: item.created_at || new Date().toISOString()
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActiveStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;
      
      // Refresh the list
      fetchProducts();
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const activeProducts = products.filter(p => p.is_active);
  const featuredProducts = products.filter(p => p.is_featured);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Product Status Checker</span>
          <Button onClick={fetchProducts} disabled={loading} size="sm">
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{products.length}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{activeProducts.length}</div>
            <div className="text-sm text-gray-600">Active (Shop Page)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{featuredProducts.length}</div>
            <div className="text-sm text-gray-600">Featured (Homepage)</div>
          </div>
        </div>

        {/* Product List */}
        <div className="space-y-3">
          <h3 className="font-semibold">All Products:</h3>
          {products.length === 0 ? (
            <p className="text-gray-500 italic">No products found</p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">₹{product.price} • {product.images?.length || 0} images</div>
                  <div className="text-xs text-gray-400">Created: {new Date(product.created_at).toLocaleDateString()}</div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Status Badges */}
                  <div className="flex flex-col gap-1">
                    <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs">
                      {product.is_active ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active (Shop)
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                    
                    <Badge variant={product.is_featured ? "default" : "outline"} className="text-xs">
                      {product.is_featured ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Featured
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Not Featured
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Toggle Active Button */}
                  <Button
                    size="sm"
                    variant={product.is_active ? "destructive" : "default"}
                    onClick={() => toggleActiveStatus(product.id, product.is_active)}
                  >
                    {product.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">📝 Understanding Product Status:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li><strong>Active:</strong> Product shows on Shop page (where customers browse all products)</li>
            <li><strong>Featured:</strong> Product shows on Homepage "Hot Right Now" section</li>
            <li><strong>Tip:</strong> For products to show everywhere, enable BOTH Active and Featured</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductStatusChecker; 