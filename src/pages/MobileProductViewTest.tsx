import React from 'react';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { Product, FilterState } from './Shop';
import { useNavigate } from 'react-router-dom';

const MobileProductViewTest: React.FC = () => {
  const navigate = useNavigate();

  // Handler for ProductGrid
  const handleQuickView = (product: Product) => {
    navigate(`/mobile-product-detail-test/${product.id}`);
  };

  // Dummy filters to show all products (priceRange is a tuple)
  const filters: FilterState = {
    categories: [],
    sizes: [],
    priceRange: [0, 100000],
    colors: [],
    sortBy: 'featured',
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start py-8">
      <h1 className="text-3xl font-bold mb-6">Mobile Product View Test Page</h1>
      <div className="w-full max-w-5xl px-2">
        <ProductGrid 
          filters={filters} 
          onQuickView={handleQuickView}
          onProductsLoaded={() => {}}
        />
      </div>
    </div>
  );
};

export default MobileProductViewTest; 