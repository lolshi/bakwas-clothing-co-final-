import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, ShoppingCart } from 'lucide-react';
import { FilterState, Product } from '@/pages/Shop';

interface ProductGridProps {
  filters: FilterState;
  onQuickView: (product: Product) => void;
}

// Mock product data
const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Neon Tiger Tee',
    price: 699,
    image: '/lovable-uploads/aae6428d-9a3d-4b45-87c4-900c7fe5558e.png',
    category: 'oversized',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['black', 'neon-cyan'],
    description: 'Bold tiger design with neon accents',
    images: ['/lovable-uploads/aae6428d-9a3d-4b45-87c4-900c7fe5558e.png']
  },
  {
    id: '2',
    title: 'Psychedelic Wave',
    price: 799,
    image: '/lovable-uploads/74ef635a-d462-4782-ad34-91d7888e17ba.png',
    category: 'weekly',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['black', 'neon-purple'],
    description: 'Trippy wave pattern streetwear',
    images: ['/lovable-uploads/74ef635a-d462-4782-ad34-91d7888e17ba.png']
  },
  {
    id: '3',
    title: 'Urban Glow',
    price: 899,
    image: '/lovable-uploads/6b112a77-ea8e-4f47-b08f-0f2be98c0b2f.png',
    category: 'limited',
    sizes: ['S', 'M', 'L'],
    colors: ['black', 'neon-pink'],
    description: 'Limited edition urban design',
    images: ['/lovable-uploads/6b112a77-ea8e-4f47-b08f-0f2be98c0b2f.png']
  },
  {
    id: '4',
    title: 'Retro Vibes',
    price: 649,
    image: '/lovable-uploads/14a3ddc7-f46d-42ce-90fd-3937f6a2ad9c.png',
    category: 'oversized',
    sizes: ['M', 'L', 'XL'],
    colors: ['white', 'neon-orange'],
    description: 'Vintage inspired modern cut',
    images: ['/lovable-uploads/14a3ddc7-f46d-42ce-90fd-3937f6a2ad9c.png']
  },
  {
    id: '5',
    title: 'Neon Dreams',
    price: 749,
    image: '/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png',
    category: 'weekly',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['black', 'neon-cyan', 'neon-purple'],
    description: 'Electric neon streetwear design',
    images: ['/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png']
  },
  {
    id: '6',
    title: 'Street Phoenix',
    price: 999,
    image: '/lovable-uploads/ff44b883-13f3-4aa0-b0e9-b170b00e8311.png',
    category: 'limited',
    sizes: ['M', 'L', 'XL'],
    colors: ['black', 'neon-pink', 'neon-orange'],
    description: 'Premium phoenix design tee',
    images: ['/lovable-uploads/ff44b883-13f3-4aa0-b0e9-b170b00e8311.png']
  }
];

export const ProductGrid: React.FC<ProductGridProps> = ({ filters, onQuickView }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      let filteredProducts = [...mockProducts];

      // Apply category filter
      if (filters.categories.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          filters.categories.includes(product.category)
        );
      }

      // Apply size filter
      if (filters.sizes.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          product.sizes.some(size => filters.sizes.includes(size))
        );
      }

      // Apply color filter
      if (filters.colors.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          product.colors.some(color => filters.colors.includes(color))
        );
      }

      // Apply price filter
      filteredProducts = filteredProducts.filter(product =>
        product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      );

      // Apply sorting
      switch (filters.sortBy) {
        case 'price-low':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'best-selling':
          // Mock best selling logic
          filteredProducts.sort(() => Math.random() - 0.5);
          break;
        case 'newest':
        default:
          // Keep original order for newest
          break;
      }

      setProducts(filteredProducts);
      setLoading(false);
    }, 500);
  }, [filters]);

  const handleAddToCart = (product: Product) => {
    // Fire GTM event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'add_to_cart', {
        currency: 'INR',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.title,
          category: product.category,
          price: product.price,
          quantity: 1
        }]
      });
    }
    
    console.log('Added to cart:', product.title);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const displayedProducts = products.slice(0, page * itemsPerPage);
  const hasMore = products.length > displayedProducts.length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="bg-card border-border animate-pulse">
            <div className="aspect-square bg-muted rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedProducts.map((product, index) => (
          <Card 
            key={product.id} 
            className="bg-card border-border group hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading={index < 8 ? 'eager' : 'lazy'}
              />
              
              {/* Overlay buttons */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => onQuickView(product)}
                  className="bg-white/90 hover:bg-white text-black"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  onClick={() => handleAddToCart(product)}
                  className="bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-cyan/80 hover:to-neon-purple/80 text-black"
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-anton text-lg mb-1 text-foreground group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-neon-cyan group-hover:to-neon-purple group-hover:bg-clip-text transition-all">
                {product.title}
              </h3>
              <p className="text-xl font-semibold text-primary">₹{product.price}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={loadMore}
            size="lg"
            className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink hover:from-neon-cyan/80 hover:via-neon-purple/80 hover:to-neon-pink/80 text-black font-space font-semibold"
          >
            Load More
          </Button>
        </div>
      )}

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No products found matching your filters.</p>
        </div>
      )}
    </div>
  );
};
