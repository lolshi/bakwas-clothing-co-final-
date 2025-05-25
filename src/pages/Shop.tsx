
import React, { useState } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { FilterSidebar } from '@/components/shop/FilterSidebar';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { QuickViewModal } from '@/components/shop/QuickViewModal';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export interface FilterState {
  categories: string[];
  sizes: string[];
  priceRange: [number, number];
  colors: string[];
  sortBy: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  sizes: string[];
  colors: string[];
  description: string;
  images: string[];
}

const Shop = () => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    sizes: [],
    priceRange: [299, 1499],
    colors: [],
    sortBy: 'newest'
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium">Shop</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <h1 className="font-anton text-4xl md:text-5xl mt-4 mb-2 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
          Shop the Drop
        </h1>
        <p className="text-muted-foreground font-space">Discover our latest streetwear collection</p>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-80 flex-shrink-0">
            <FilterSidebar filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Mobile Filter Button */}
          <div className="md:hidden fixed top-20 left-4 z-40">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="bg-card border-border">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="p-6">
                  <h2 className="font-anton text-xl mb-4">Filters</h2>
                  <FilterSidebar filters={filters} onFiltersChange={setFilters} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Product Grid */}
          <div className="flex-1 md:ml-0 ml-16">
            <ProductGrid 
              filters={filters} 
              onQuickView={handleQuickView}
            />
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </div>
  );
};

export default Shop;
