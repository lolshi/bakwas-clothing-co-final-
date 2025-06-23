import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { FilterSidebar } from '@/components/shop/FilterSidebar';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { QuickViewModal } from '@/components/shop/QuickViewModal';
import { supabase } from '@/integrations/supabase/client';
import MobileFilterBar from '@/components/shop/MobileFilterBar';
import ProductColorCoverflow from '@/components/ProductColorCoverflow';
import { useWishlist } from '@/contexts/WishlistContext';
import { Heart, Eye } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getNearestColorFamilyAndShade, getColorHexCode } from '@/config/colors';

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
  color?: string;
  description: string;
  images: string[];
  selectedColor?: string;
  colorImages?: { [color: string]: string[] };
}

// Helper to get color hex code (if color is a name, fallback to gray)
const getColorHex = (color: string) => {
  if (!color) return '#ccc';
  if (color.startsWith('#')) return color;
  // fallback for named colors
  const ctx = document.createElement('canvas').getContext('2d');
  if (ctx) {
    ctx.fillStyle = color;
    return ctx.fillStyle || '#ccc';
  }
  return '#ccc';
};

// Helper to map color string to color object
const mapColorToObj = (color: string) => {
  const hex = color.startsWith('#') ? color : getColorHexCode(color) || color;
  const nearest = getNearestColorFamilyAndShade(hex);
  return { hex: nearest.hex, displayName: nearest.displayName, original: color };
};

// Add this function to filter products based on filters
const filterProducts = (products: Product[], filters: FilterState) => {
  return products.filter(product => {
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false;
    }
    // Size filter
    if (filters.sizes.length > 0 && !product.sizes.some(size => filters.sizes.includes(size))) {
      return false;
    }
    // Color filter
    if (filters.colors.length > 0) {
      const productColorObjs = product.colors.map(mapColorToObj);
      const filterColorDisplays = filters.colors.map(c =>
        c.startsWith('#')
          ? getNearestColorFamilyAndShade(c).displayName.toLowerCase()
          : c.toLowerCase()
      );
      if (!productColorObjs.some(colorObj =>
        filterColorDisplays.includes(colorObj.displayName.toLowerCase())
      )) {
        return false;
      }
    }
    // Price filter
    if (
      product.price < filters.priceRange[0] ||
      product.price > filters.priceRange[1]
    ) {
      return false;
    }
    return true;
  });
};

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    sizes: [],
    priceRange: [0, 100000],
    colors: [],
    sortBy: 'featured'
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [colorIndices, setColorIndices] = useState([0, 0]);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [shouldFocusModal, setShouldFocusModal] = useState(false);

  // Handle product query parameter
  useEffect(() => {
    const productId = searchParams.get('product');
    if (productId) {
      fetchAndShowProduct(productId);
    }
  }, [searchParams]);

  // Add a simple mobile detection (can be improved with a custom hook)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (productsError) throw productsError;
      if (!productsData || productsData.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      // Fetch variants
      const productIds = productsData.map((p: any) => p.id);
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('product_id, color, images, size, price, stock_quantity')
        .in('product_id', productIds);
      if (variantsError) throw variantsError;
      // Transform products
      const transformedProducts: Product[] = productsData.map(product => {
        const variants = (variantsData || []).filter(v => v.product_id === product.id);
        const colorImages: { [color: string]: string[] } = {};
        const allColors: string[] = [];
        variants.forEach(variant => {
          if (variant.color && Array.isArray(variant.images) && variant.images.length > 0) {
            if (!colorImages[variant.color]) {
              colorImages[variant.color] = [];
            }
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
        // Only the first image of each color for the test carousel
        const firstImagesOfEachColor = allColors.map(color => colorImages[color]?.[0]).filter(Boolean);
        let mainImages: string[] = firstImagesOfEachColor.length > 0 ? firstImagesOfEachColor : product.images || [];
        if (mainImages.length === 0) {
          mainImages = ['/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png'];
        }
        return {
          id: product.id,
          title: product.name,
          price: product.price,
          image: mainImages[0],
          category: product.category_ids?.[0] || 'general',
          sizes: variants.map(v => v.size),
          colors: allColors,
          description: product.description || '',
          images: mainImages, // Only first image of each color
          colorImages,
          variants: variants.map(v => ({
            color: v.color,
            size: v.size,
            stock: v.stock_quantity,
            images: v.images
          }))
        };
      });
      setProducts(transformedProducts);
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAndShowProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      if (data) {
        const product: Product = {
          id: data.id,
          title: data.name,
          price: data.price,
          image: data.images?.[0] || "/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png",
          category: data.category || '',
          sizes: data.sizes || [],
          colors: data.colors || [],
          color: data.color || '',
          description: data.description || '',
          images: data.images || [],
          selectedColor: data.color || '',
          colorImages: data.colorImages || {}
        };
        setSelectedProduct(product);
        setIsQuickViewOpen(true);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const handleQuickView = (product: Product) => {
    if (isMobile) {
      navigate(`/mobile-product-detail-test/${product.id}`);
    } else {
      setSelectedProduct(product);
      setIsQuickViewOpen(true);
    }
  };

  // Function to update price range based on actual products
  const updateProductFilters = (count: number) => {
    // We'll need to fetch products to get the price range
    const fetchProductPrices = async () => {
      try {
        const { data: products, error } = await supabase
          .from('products')
          .select('price')
          .eq('is_active', true);

        if (error) throw error;
        if (!products || products.length === 0) return;

        const prices = products.map((p: { price: number }) => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        const padding = (maxPrice - minPrice) * 0.1;
        const adjustedMin = Math.max(0, Math.floor(minPrice - padding));
        const adjustedMax = Math.ceil(maxPrice + padding);
        
        setFilters(prev => ({
          ...prev,
          priceRange: [adjustedMin, adjustedMax]
        }));
      } catch (error) {
        console.error('Error fetching product prices:', error);
      }
    };

    fetchProductPrices();
  };

  const openQuickView = (product: Product) => {
    // Find the product index in the products array
    const productIndex = products.findIndex(p => p.id === product.id);
    // Fallback to 0 if not found
    const currentColorIndex = colorIndices[productIndex] || 0;
    const selectedColor = product.colors[currentColorIndex];
    // Use colorImages for the selected color if available, else fallback to product.images
    const images = (product.colorImages && selectedColor && product.colorImages[selectedColor] && product.colorImages[selectedColor].length > 0)
      ? product.colorImages[selectedColor]
      : product.images;
    setSelectedProduct({
      ...product,
      selectedColor,
      images,
    });
    setIsQuickViewOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShouldFocusModal(true);
  };

  const handleScrollLeft = () => {
    if (currentPairIndex > 0) {
      setCurrentPairIndex(prev => prev - 1);
    }
  };

  const handleScrollRight = () => {
    const maxPairs = Math.ceil(products.length / 2);
    if (currentPairIndex < maxPairs - 1) {
      setCurrentPairIndex(prev => prev + 1);
    }
  };

  // Add debugging logs before return
  console.log("products.length:", products.length);
  console.log("currentPairIndex:", currentPairIndex);
  console.log("maxPairs:", Math.ceil(products.length / 2));
  console.log("products:", products.map(p => p.title));
  console.log(
    "Right button rendered, disabled:",
    currentPairIndex >= Math.ceil(products.length / 2) - 1
  );

  // In the Shop component, before rendering, compute filteredProducts:
  const filteredProducts = filterProducts(products, filters);

  // In the Shop component, after products are loaded:
  const prices = products.map(p => p.price);
  const minProductPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxProductPrice = prices.length > 0 ? Math.max(...prices) : 10000;

  return (
    <div className="main-content min-h-screen text-foreground">
      {/* Content overlay for readability */}
      <div className="content-overlay" />
      
      <div className="content-container">
        {/* Logo - only show on md and up */}
        <div className="hidden md:block absolute -top-14 left-1/2 transform -translate-x-1/2 z-10">
          <img 
            src="/lovable-uploads/2c6d9788-8753-4221-8998-32f4357a72df.png" 
            alt="Bakwas Clothing Co." 
            className="h-48 lg:h-56 xl:h-64 w-auto"
          />
        </div>

        {/* Breadcrumbs and Heading */}
        <div className="container mx-auto px-4 md:px-16 py-4 md:py-6 pt-6 md:pt-16 text-left">
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
          
          <h1 className="hero-title text-3xl md:text-4xl lg:text-5xl font-space tracking-tight text-white drop-shadow-sm text-left mt-4 md:mt-6">
            UNLEASH THE DROP
          </h1>
          <div className="accent-line mt-2 h-1 w-20 md:w-24 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full"></div>
          <p className="hero-subtext mt-2 text-sm md:text-base lg:text-lg text-gray-200/75 leading-relaxed text-left">
            Discover the freshest streetwear curated for the bold and unapologetic.
          </p>
        </div>

        <div className="container mx-auto px-4 pb-6 md:pb-8">
          {/* Filter Top Bar */}
          {isMobile ? (
            <MobileFilterBar filters={filters} setFilters={setFilters} />
          ) : (
            <FilterSidebar 
              filters={filters} 
              onFiltersChange={setFilters}
              minPrice={minProductPrice}
              maxPrice={maxProductPrice}
            />
          )}

          {/* Desktop Products Container with scroll feature */}
          <div className="relative hidden md:block">
            {/* Navigation Buttons - absolute positioning */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full z-50 pointer-events-none">
              <button
                style={{ left: 0, transform: 'translateX(0px) translateY(100px)' }}
                className="pointer-events-auto absolute p-3 left-0 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all shadow-lg"
                onClick={handleScrollLeft}
                disabled={currentPairIndex === 0}
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button
                style={{ right: 0, transform: 'translateX(0px) translateY(100px)' }}
                className="pointer-events-auto absolute p-3 right-0 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all shadow-lg"
                onClick={handleScrollRight}
                disabled={currentPairIndex >= Math.ceil(products.length / 2) - 1}
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            {/* Products Container with animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPairIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="relative w-full max-w-6xl mx-auto"
                style={{ minHeight: 560 }}
              >
                {/* Center vertical divider */}
                <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-white/30 to-transparent z-0" 
                     style={{transform: 'translateX(-50%)'}} />
                {/* Left Product - fix alignment */}
                <div className="absolute left-0 top-0 w-[calc(50%-30px)] flex flex-col items-start z-10">
                  {filteredProducts[currentPairIndex * 2] && (
                    <div className="group flex flex-col items-start w-full max-w-[370px] h-[520px]">
                      {/* 3D Carousel Image (hero) with peek effect */}
                      <div className="w-full flex items-center justify-start relative overflow-visible" style={{ maxWidth: 350, height: 350, marginLeft: 20 }}>
                        <div className="w-full h-full flex items-center justify-center drop-shadow-2xl relative">
                          <ProductColorCoverflow
                            images={filteredProducts[currentPairIndex * 2].colors.map(color => 
                              filteredProducts[currentPairIndex * 2].colorImages?.[color]?.[0]).filter(Boolean) as string[]}
                            alt={filteredProducts[currentPairIndex * 2].title}
                            colors={filteredProducts[currentPairIndex * 2].colors.map(mapColorToObj)}
                            onColorIndexChange={colorIdx => {
                              setColorIndices(prev => {
                                if (prev[0] === colorIdx) return prev;
                                const copy = [...prev];
                                copy[0] = colorIdx;
                                return copy;
                              });
                            }}
                            centerOffset={-20}
                          />
                        </div>
                      </div>
                      {/* Info Card */}
                      <div className="w-full mt-2 rounded-2xl bg-black/70 backdrop-blur-md shadow-2xl px-6 py-4 flex flex-col items-stretch border border-white/20" style={{ marginLeft: 0 }}>
                        {/* Line 1: Name + Wishlist */}
                        <div className="flex flex-row items-center justify-between mb-2 w-full gap-2">
                          <span className="font-anton text-xl md:text-2xl font-bold bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple bg-clip-text text-transparent animate-rainbow break-words">
                            {filteredProducts[currentPairIndex * 2].title}
                          </span>
                          <div className="flex flex-row items-center gap-2">
                            <button
                              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 hover:scale-110 overflow-visible"
                              onClick={e => { e.stopPropagation(); openQuickView(filteredProducts[currentPairIndex * 2]); }}
                              aria-label="View product"
                            >
                              <Eye className="w-6 h-6" />
                            </button>
                            <button
                              className={`relative border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-pink/60 hover:scale-110 group/wishlist overflow-visible ${isInWishlist(filteredProducts[currentPairIndex * 2].id) ? 'bg-pink-100/80' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                              onClick={e => {
                                e.stopPropagation();
                                const prod = filteredProducts[currentPairIndex * 2];
                                isInWishlist(prod.id)
                                  ? removeFromWishlist(prod.id)
                                  : addToWishlist(prod);
                              }}
                              aria-label={isInWishlist(filteredProducts[currentPairIndex * 2].id) ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                              <Heart
                                className={`w-7 h-7 relative z-10 transition-all duration-200 ${
                                  isInWishlist(filteredProducts[currentPairIndex * 2].id)
                                    ? 'fill-pink-500 text-pink-500'
                                    : 'stroke-pink-500 text-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        {/* Line 2: Color Swatches + Price */}
                        <div className="flex flex-row items-center justify-between mb-3 w-full gap-2">
                          {/* Color Swatches */}
                          <span className="flex gap-2 items-center">
                            {filteredProducts[currentPairIndex * 2].colors.map((color, cidx) => (
                              <button
                                key={color}
                                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${cidx === colorIndices[0] ? 'border-white ring-2 ring-white scale-110' : 'border-white/40 opacity-80 hover:scale-105'}`}
                                style={{ background: getColorHex(color) }}
                                title={color}
                                aria-label={`Select color ${color}`}
                                type="button"
                                onClick={() => setColorIndices(prev => { const copy = [...prev]; copy[0] = cidx; return copy; })}
                              />
                            ))}
                          </span>
                          {/* Price */}
                          <span className="font-space text-xl md:text-2xl font-extrabold text-neon-cyan drop-shadow-[0_2px_8px_rgba(0,255,255,0.5)]">
                            ₹{filteredProducts[currentPairIndex * 2].price}
                          </span>
                        </div>
                        {/* Line 3: Buttons */}
                        <div className="flex gap-3 w-full mt-1">
                          <button
                            className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none"
                            onClick={() => openQuickView(filteredProducts[currentPairIndex * 2])}
                          >Add to Cart</button>
                          <button
                            className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none"
                            onClick={() => openQuickView(filteredProducts[currentPairIndex * 2])}
                          >Buy Now</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Right Product */}
                <div className="absolute right-0 top-0 w-[calc(50%-30px)] flex flex-col items-start z-10">
                  {filteredProducts[currentPairIndex * 2 + 1] && (
                    <div className="group flex flex-col items-start w-full max-w-[370px] h-[520px]">
                      {/* 3D Carousel Image (hero) with peek effect */}
                      <div className="w-full flex items-center justify-start relative overflow-visible" style={{ maxWidth: 350, height: 350, marginLeft: -5 }}>
                        <div className="w-full h-full flex items-center justify-center drop-shadow-2xl relative">
                          <ProductColorCoverflow
                            images={filteredProducts[currentPairIndex * 2 + 1].colors.map(color => 
                              filteredProducts[currentPairIndex * 2 + 1].colorImages?.[color]?.[0]).filter(Boolean) as string[]}
                            alt={filteredProducts[currentPairIndex * 2 + 1].title}
                            colors={filteredProducts[currentPairIndex * 2 + 1].colors.map(mapColorToObj)}
                            onColorIndexChange={colorIdx => {
                              setColorIndices(prev => {
                                if (prev[1] === colorIdx) return prev;
                                const copy = [...prev];
                                copy[1] = colorIdx;
                                return copy;
                              });
                            }}
                            centerOffset={200}
                          />
                        </div>
                      </div>
                      {/* Info Card */}
                      <div className="w-full mt-2 rounded-2xl bg-black/70 backdrop-blur-md shadow-2xl px-6 py-4 flex flex-col items-stretch border border-white/20" style={{ marginLeft: 185 }}>
                        {/* Line 1: Name + Wishlist */}
                        <div className="flex flex-row items-center justify-between mb-2 w-full gap-2">
                          <span className="font-anton text-xl md:text-2xl font-bold bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple bg-clip-text text-transparent animate-rainbow break-words">
                            {filteredProducts[currentPairIndex * 2 + 1].title}
                          </span>
                          <div className="flex flex-row items-center gap-2">
                            <button
                              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 hover:scale-110 overflow-visible"
                              onClick={e => { e.stopPropagation(); openQuickView(filteredProducts[currentPairIndex * 2 + 1]); }}
                              aria-label="View product"
                            >
                              <Eye className="w-6 h-6" />
                            </button>
                            <button
                              className={`relative border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-pink/60 hover:scale-110 group/wishlist overflow-visible ${isInWishlist(filteredProducts[currentPairIndex * 2 + 1].id) ? 'bg-pink-100/80' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                              onClick={e => {
                                e.stopPropagation();
                                const prod = filteredProducts[currentPairIndex * 2 + 1];
                                isInWishlist(prod.id)
                                  ? removeFromWishlist(prod.id)
                                  : addToWishlist(prod);
                              }}
                              aria-label={isInWishlist(filteredProducts[currentPairIndex * 2 + 1].id) ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                              <Heart
                                className={`w-7 h-7 relative z-10 transition-all duration-200 ${
                                  isInWishlist(filteredProducts[currentPairIndex * 2 + 1].id)
                                    ? 'fill-pink-500 text-pink-500'
                                    : 'stroke-pink-500 text-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        {/* Line 2: Color Swatches + Price */}
                        <div className="flex flex-row items-center justify-between mb-3 w-full gap-2">
                          {/* Color Swatches */}
                          <span className="flex gap-2 items-center">
                            {filteredProducts[currentPairIndex * 2 + 1].colors.map((color, cidx) => (
                              <button
                                key={color}
                                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${cidx === colorIndices[1] ? 'border-white ring-2 ring-white scale-110' : 'border-white/40 opacity-80 hover:scale-105'}`}
                                style={{ background: getColorHex(color) }}
                                title={color}
                                aria-label={`Select color ${color}`}
                                type="button"
                                onClick={() => setColorIndices(prev => { const copy = [...prev]; copy[1] = cidx; return copy; })}
                              />
                            ))}
                          </span>
                          {/* Price */}
                          <span className="font-space text-xl md:text-2xl font-extrabold text-neon-cyan drop-shadow-[0_2px_8px_rgba(0,255,255,0.5)]">
                            ₹{filteredProducts[currentPairIndex * 2 + 1].price}
                          </span>
                        </div>
                        {/* Line 3: Buttons */}
                        <div className="flex gap-3 w-full mt-1">
                          <button
                            className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none"
                            onClick={() => openQuickView(filteredProducts[currentPairIndex * 2 + 1])}
                          >Add to Cart</button>
                          <button
                            className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none"
                            onClick={() => openQuickView(filteredProducts[currentPairIndex * 2 + 1])}
                          >Buy Now</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile Products Container */}
          <div className="block md:hidden w-full">
            {filteredProducts.map((product, idx) => {
              // Show the first image of every color for the mobile carousel
              const images = product.colors
                .map(color => product.colorImages?.[color]?.[0])
                .filter(Boolean) as string[];
              const selectedColor = product.colors[colorIndices[idx]] || product.colors[0];
              return (
                <React.Fragment key={product.id}>
                  <div className="group flex flex-col items-center w-full max-w-[370px] h-[520px] mx-auto mb-8">
                    <div className="w-full flex items-center justify-center relative overflow-visible" style={{ maxWidth: 288, height: 320 }}>
                      <div className="w-full h-full flex items-center justify-center drop-shadow-2xl relative">
                        <ProductColorCoverflow
                          images={images}
                          alt={product.title}
                          colors={product.colors.map(mapColorToObj)}
                          onColorIndexChange={colorIdx => {
                            setColorIndices(prev => {
                              const copy = [...prev];
                              copy[idx] = colorIdx;
                              return copy;
                            });
                          }}
                          cardWidthMobile="w-72"
                          cardHeightMobile="h-80"
                        />
                      </div>
                    </div>
                    {/* Info Card (copied from desktop) */}
                    <div className="w-full mt-2 rounded-2xl bg-black/70 backdrop-blur-md shadow-2xl px-6 py-4 flex flex-col items-stretch border border-white/20 max-w-[90%] mx-auto">
                      {/* Line 1: Name + Wishlist */}
                      <div className="flex flex-row items-center justify-between mb-2 w-full gap-2">
                        <span className="font-anton text-xl md:text-2xl font-bold bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple bg-clip-text text-transparent animate-rainbow break-words">
                          {product.title}
                        </span>
                        <div className="flex flex-row items-center gap-2">
                          <button
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 hover:scale-110 overflow-visible"
                            onClick={e => { e.stopPropagation(); openQuickView(product); }}
                            aria-label="View product"
                          >
                            <Eye className="w-6 h-6" />
                          </button>
                          <button
                            className={`relative border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-pink/60 hover:scale-110 group/wishlist overflow-visible ${isInWishlist(product.id) ? 'bg-pink-100/80' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                            onClick={e => {
                              e.stopPropagation();
                              isInWishlist(product.id)
                                ? removeFromWishlist(product.id)
                                : addToWishlist(product);
                            }}
                            aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <Heart
                              className={`w-7 h-7 relative z-10 transition-all duration-200 ${
                                isInWishlist(product.id)
                                  ? 'fill-pink-500 text-pink-500'
                                  : 'stroke-pink-500 text-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      {/* Line 2: Color Swatches + Price */}
                      <div className="flex flex-row items-center justify-between mb-3 w-full gap-2">
                        {/* Color Swatches */}
                        <span className="flex gap-2 items-center">
                          {product.colors.map((color, cidx) => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${cidx === colorIndices[idx] ? 'border-white ring-2 ring-white scale-110' : 'border-white/40 opacity-80 hover:scale-105'}`}
                              style={{ background: getColorHex(color) }}
                              title={color}
                              aria-label={`Select color ${color}`}
                              type="button"
                              onClick={() => setColorIndices(prev => { const copy = [...prev]; copy[idx] = cidx; return copy; })}
                            />
                          ))}
                        </span>
                        {/* Price */}
                        <span className="font-space text-xl md:text-2xl font-extrabold text-neon-cyan drop-shadow-[0_2px_8px_rgba(0,255,255,0.5)]">
                          ₹{product.price}
                        </span>
                      </div>
                      {/* Line 3: Buttons */}
                      <div className="flex gap-3 w-full mt-1">
                        <button
                          className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none"
                          onClick={() => openQuickView(product)}
                        >Add to Cart</button>
                        <button
                          className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none"
                          onClick={() => openQuickView(product)}
                        >Buy Now</button>
                      </div>
                    </div>
                  </div>
                  {/* Horizontal divider between products */}
                  {idx < filteredProducts.length - 1 && (
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent my-8" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Quick View Modal */}
        <QuickViewModal
          product={selectedProduct}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          shouldFocus={shouldFocusModal}
          onDidFocus={() => setShouldFocusModal(false)}
        />
      </div>
    </div>
  );
};

export default Shop;
