import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface DatabaseProduct {
  id: string;
  name: string;
  is_active: boolean;
  is_featured: boolean;
  price: number;
  images: string[] | null;
  created_at: string;
  slug: string;
}

const DatabaseDiagnostic = () => {
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostic = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 DatabaseDiagnostic: Starting comprehensive database check...');
      
      // Fetch ALL products with key fields
      const { data, error } = await supabase
        .from('products')
        .select('id, name, is_active, is_featured, price, images, created_at, slug')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ DatabaseDiagnostic: Database error:', error);
        setError(`Database Error: ${error.message}`);
        return;
      }

      console.log('📊 DatabaseDiagnostic: Raw database response:', data);
      console.log(`📈 DatabaseDiagnostic: Found ${data?.length || 0} total products`);

      if (data) {
        // Process and analyze the data
        const processedProducts: DatabaseProduct[] = data.map(item => ({
          id: item.id,
          name: item.name || 'Unnamed Product',
          is_active: Boolean(item.is_active),
          is_featured: Boolean(item.is_featured),
          price: item.price || 0,
          images: item.images,
          created_at: item.created_at || new Date().toISOString(),
          slug: item.slug || 'no-slug'
        }));

        // Log detailed analysis
        const activeCount = processedProducts.filter(p => p.is_active).length;
        const featuredCount = processedProducts.filter(p => p.is_featured).length;
        const withImagesCount = processedProducts.filter(p => p.images && p.images.length > 0).length;

        console.log('📋 DatabaseDiagnostic: Analysis Results:');
        console.log(`   Total Products: ${processedProducts.length}`);
        console.log(`   Active Products: ${activeCount}`);
        console.log(`   Featured Products: ${featuredCount}`);
        console.log(`   Products with Images: ${withImagesCount}`);

        // Log each product individually
        processedProducts.forEach((product, index) => {
          console.log(`Product ${index + 1}: ${product.name}`);
          console.log(`   ID: ${product.id}`);
          console.log(`   Active: ${product.is_active}`);
          console.log(`   Featured: ${product.is_featured}`);
          console.log(`   Price: ₹${product.price}`);
          console.log(`   Images: ${product.images?.length || 0}`);
          console.log(`   Created: ${new Date(product.created_at).toLocaleString()}`);
          console.log('   ---');
        });

        setProducts(processedProducts);
        setLastChecked(new Date());

        // Test the exact query that ProductGrid uses
        console.log('🔍 DatabaseDiagnostic: Testing ProductGrid query...');
        const { data: activeProducts, error: activeError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (activeError) {
          console.error('❌ DatabaseDiagnostic: Active products query failed:', activeError);
        } else {
          console.log(`✅ DatabaseDiagnostic: Active products query returned ${activeProducts?.length || 0} products`);
          if (activeProducts && activeProducts.length > 0) {
            console.log('📦 DatabaseDiagnostic: Active products:', activeProducts.map(p => p.name));
          }
        }

      } else {
        console.warn('⚠️ DatabaseDiagnostic: No data returned from database');
        setProducts([]);
      }

    } catch (err) {
      console.error('❌ DatabaseDiagnostic: Unexpected error:', err);
      setError(`Unexpected Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const bulkActivateProducts = async () => {
    if (!products.length) return;
    
    setLoading(true);
    try {
      console.log('🚀 DatabaseDiagnostic: Bulk activating all products...');
      
      const { error } = await supabase
        .from('products')
        .update({ is_active: true })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all products

      if (error) {
        console.error('❌ DatabaseDiagnostic: Bulk activation failed:', error);
        setError(`Bulk activation failed: ${error.message}`);
      } else {
        console.log('✅ DatabaseDiagnostic: All products activated successfully');
        // Re-run diagnostic to see updated status
        await runDiagnostic();
      }
    } catch (err) {
      console.error('❌ DatabaseDiagnostic: Bulk activation error:', err);
      setError(`Bulk activation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  const activeProducts = products.filter(p => p.is_active);
  const inactiveProducts = products.filter(p => !p.is_active);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🔍 Database Diagnostic</span>
          <div className="flex gap-2">
            <Button onClick={runDiagnostic} disabled={loading} size="sm">
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Checking...' : 'Refresh'}
            </Button>
            {inactiveProducts.length > 0 && (
              <Button onClick={bulkActivateProducts} disabled={loading} size="sm" variant="default">
                Activate All Products
              </Button>
            )}
          </div>
        </CardTitle>
        {lastChecked && (
          <p className="text-sm text-gray-500">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <strong>Error:</strong>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{products.length}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{activeProducts.length}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{inactiveProducts.length}</div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {products.filter(p => p.is_featured).length}
            </div>
            <div className="text-sm text-gray-600">Featured</div>
          </div>
        </div>

        {/* Product Status */}
        {products.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Product Status Details:</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    product.is_active ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      ₹{product.price} • {product.images?.length || 0} images • ID: {product.id}
                    </div>
                    <div className="text-xs text-gray-400">
                      Created: {new Date(product.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={product.is_active ? "default" : "destructive"}>
                      {product.is_active ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                    
                    {product.is_featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No products found in database</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">🛠️ Quick Fix Instructions:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>This diagnostic shows the exact database state</li>
            <li>For products to show on Shop page, they must have <strong>is_active = true</strong></li>
            <li>Use "Activate All Products" button to make all products active</li>
            <li>Check the browser console (F12) for detailed logs</li>
            <li>The ProductGrid component has extensive debugging info</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseDiagnostic; 