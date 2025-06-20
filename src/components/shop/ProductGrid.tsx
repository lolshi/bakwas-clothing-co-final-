import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, ShoppingCart, Heart, Settings, RefreshCw } from 'lucide-react';
import { FilterState } from '@/pages/Shop';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from './ProductCard';
import { getColorValueFromHex, getColorHexCode, getNearestColorFamilyAndShade } from '@/config/colors';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  sizes: string[];
  colors: string[];
  color?: string;
  description: string;
  images: string[];
  colorImages?: { [color: string]: string[] };
  variants?: { color: string; size: string; stock: number; images: string[]; price: number }[];
}

interface ProductGridProps {
  filters: FilterState;
  onQuickView: (product: Product) => void;
  onProductsLoaded?: (count: number) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ filters, onQuickView, onProductsLoaded }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const itemsPerPage = 8;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  // Add effect to refresh when window gains focus (user comes back from admin panel)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 ProductGrid: Window focused, checking for updates...');
      const timeSinceLastRefresh = Date.now() - lastRefresh;
      if (timeSinceLastRefresh > 5000) { // Refresh if more than 5 seconds since last refresh
        console.log('⚡ ProductGrid: Auto-refreshing products due to focus...');
        fetchProducts();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [lastRefresh]);

  const fetchProducts = async () => {
    setLoading(true);
    setLastRefresh(Date.now());
    try {
      // 1. Fetch all active products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (productsError) throw productsError;
      if (!productsData || productsData.length === 0) {
        setProducts([]);
        onProductsLoaded?.(0);
        setLoading(false);
        return;
      }
      // 2. Fetch all variants for these products
      const productIds = productsData.map((p: any) => p.id);
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('product_id, color, images, size, price, stock_quantity')
        .in('product_id', productIds);
      if (variantsError) throw variantsError;
      // 3. For each product, collect all color variants and their images
      const transformedProducts: Product[] = productsData.map(product => {
        const variants = (variantsData || []).filter(v => v.product_id === product.id);
        
        // Build colorImages map and colors array
        const colorImages: { [color: string]: string[] } = {};
        const allColors: string[] = [];
        
        // Calculate minimum variant price
        const variantPrices = variants.map(v => v.price).filter(Boolean);
        const minVariantPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : product.price;
        
        variants.forEach(variant => {
          if (variant.color && Array.isArray(variant.images) && variant.images.length > 0) {
            // Store images for this color
            if (!colorImages[variant.color]) {
              colorImages[variant.color] = [];
            }
            // Add unique images for this color
            variant.images.forEach(img => {
              if (!colorImages[variant.color].includes(img)) {
                colorImages[variant.color].push(img);
              }
            });
            if (!allColors.includes(variant.color)) {
              allColors.push(variant.color);
            }
          }
        });
        
        // Use the first color's images as default only if no other images are available
        let mainImages: string[] = [];
        if (Array.isArray(product.images) && product.images.length > 0) {
          mainImages = product.images;
        } else if (Object.keys(colorImages).length > 0) {
          // Use the first color's images as default
          const firstColor = allColors[0];
          mainImages = colorImages[firstColor] || [];
        } else {
          mainImages = ['/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png'];
        }
        
        return {
          id: product.id,
          title: product.name,
          price: minVariantPrice,
          image: mainImages[0],
          category: product.category_ids?.[0] || 'general',
          sizes: variants.map(v => v.size),
          colors: allColors,
          description: product.description || '',
          images: mainImages,
          colorImages,
          variants: variants.map(v => ({
            color: v.color,
            size: v.size,
            stock: v.stock_quantity,
            images: v.images,
            price: v.price
          }))
        };
      });
      setProducts(transformedProducts);
      onProductsLoaded?.(transformedProducts.length);
    } catch (error) {
      console.error('❌ ProductGrid: Error fetching products:', error);
      setProducts([]);
      onProductsLoaded?.(0);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];
    console.log('🔍 ProductGrid: Starting filter process with', filtered.length, 'products');

    // Apply category filter
    if (filters.categories.length > 0) {
      const beforeCategory = filtered.length;
      filtered = filtered.filter(product =>
        filters.categories.includes(product.category)
      );
      console.log(`📂 Category filter: ${beforeCategory} → ${filtered.length} products (filtered by categories: ${filters.categories.join(', ')})`);
    }

    // Apply size filter
    if (filters.sizes.length > 0) {
      const beforeSize = filtered.length;
      filtered = filtered.filter(product =>
        product.sizes.some(size => filters.sizes.includes(size))
      );
      console.log(`👕 Size filter: ${beforeSize} → ${filtered.length} products (filtered by sizes: ${filters.sizes.join(', ')})`);
    }

    // Apply color filter
    if (filters.colors.length > 0) {
      const beforeColor = filtered.length;
      filtered = filtered.filter(product => {
        // Check all variants for a color match
        return product.variants?.some(variant => {
          // Always map both variant color and filter color to their nearest display name
          const variantHex = variant.color.startsWith('#') ? variant.color : getColorHexCode(variant.color) || variant.color;
          const variantDisplay = getNearestColorFamilyAndShade(variantHex).displayName.toLowerCase();
          return filters.colors.some(filterColor => {
            // Map filter color to display name if it's a hex
            const filterDisplay = filterColor.startsWith('#')
              ? getNearestColorFamilyAndShade(filterColor).displayName.toLowerCase()
              : filterColor.toLowerCase();
            return variantDisplay === filterDisplay;
          });
        });
      });
      console.log(`🎨 Color filter: ${beforeColor} → ${filtered.length} products (filtered by colors: ${filters.colors.join(', ')})`);
    }

    // Apply price filter
    const beforePrice = filtered.length;
    const priceRangeMin = filters.priceRange[0];
    const priceRangeMax = filters.priceRange[1];
    
    console.log(`💰 Price filter: Checking range ₹${priceRangeMin} - ₹${priceRangeMax}`);
    products.forEach(product => {
      const inRange = product.price >= priceRangeMin && product.price <= priceRangeMax;
      console.log(`   ${product.title}: ₹${product.price} ${inRange ? '✅ INCLUDED' : '❌ EXCLUDED'}`);
    });
    
    filtered = filtered.filter(product =>
      product.price >= priceRangeMin && product.price <= priceRangeMax
    );
    console.log(`💰 Price filter: ${beforePrice} → ${filtered.length} products`);

    // Apply sorting
    console.log('Applying sort:', filters.sortBy);
    console.log('Products before sort:', filtered.map(p => ({ title: p.title, price: p.price })));
    
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => {
          console.log(`Comparing ${a.title} (${a.price}) with ${b.title} (${b.price})`);
          return a.price - b.price;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          console.log(`Comparing ${a.title} (${a.price}) with ${b.title} (${b.price})`);
          return b.price - a.price;
        });
        break;
      case 'popular':
        // Sort by popularity (for now, we'll use a random sort as a placeholder)
        // In the future, this should be based on actual sales/view data
        filtered.sort(() => Math.random() - 0.5);
        break;
      case 'newest':
      default:
        // Products are already sorted by created_at in descending order from the fetch
        break;
    }

    console.log('Products after sort:', filtered.map(p => ({ title: p.title, price: p.price })));

    console.log('✅ Final filtered products:', filtered.length);
    console.log('📋 Filtered product names:', filtered.map(p => p.title));

    setFilteredProducts(filtered);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const displayedProducts = filteredProducts.slice(0, page * itemsPerPage);
  const hasMore = filteredProducts.length > displayedProducts.length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <CardContent className="p-3 md:p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Add debug info if no products found
  if (products.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-yellow-800 mb-2">No Products Found</h3>
          <p className="text-sm md:text-base text-yellow-700 mb-4">
            There are no active products to display in the shop. This could mean:
          </p>
          <ul className="text-xs md:text-sm text-yellow-600 text-left max-w-md mx-auto space-y-1">
            <li>• No products have been added yet</li>
            <li>• Products exist but are not activated (is_active = false)</li>
            <li>• There's a database connection issue</li>
          </ul>
          <div className="mt-4 space-x-3">
            <Button 
              onClick={fetchProducts}
              className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm md:text-base"
            >
              Retry Loading
            </Button>
            <Button asChild variant="outline" className="text-sm md:text-base">
              <a href="/admin/products">Go to Admin Panel</a>
            </Button>
          </div>
        </div>
        <p className="text-sm md:text-base text-gray-500">
          Check the browser console (F12) for detailed debugging information.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {displayedProducts.map((product, index) => (
          <ProductCard
            key={product.id} 
            product={product}
            index={index}
            onQuickView={onQuickView}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={loadMore}
            size="lg"
            className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink hover:from-neon-cyan/80 hover:via-neon-purple/80 hover:to-neon-pink/80 text-black font-space font-semibold text-sm md:text-base"
          >
            Load More
          </Button>
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-8 md:py-12">
          <p className="text-muted-foreground text-base md:text-lg">No products found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

