import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductColorCoverflow, { ProductColorCoverflowHandle } from '@/components/ProductColorCoverflow';

// Product type (copied for safety)
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
  variants?: { color: string; size: string; stock: number; images: string[] }[];
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

// Product Card with 3D coverflow color carousel
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const colorImages = product.colorImages || {};
  const allColors = product.colors || [];
  const firstImagesOfEachColor = allColors.map(color => colorImages[color]?.[0]).filter(Boolean);
  const images = firstImagesOfEachColor.length > 0 ? firstImagesOfEachColor : product.images || [];
  const [currentColorIdx, setCurrentColorIdx] = useState(0);
  const coverflowRef = useRef<ProductColorCoverflowHandle>(null);

  return (
    <div className="flex flex-col items-stretch bg-gradient-to-br from-white/10 via-white/5 to-black/30 rounded-3xl shadow-2xl p-0 md:p-0 w-full h-full overflow-hidden border border-white/10 backdrop-blur-xl">
      {/* Custom 3D Coverflow Carousel for Color Images */}
      <div className="px-2 pt-4 pb-2 md:px-4 md:pt-6 md:pb-2 w-full overflow-hidden">
        <ProductColorCoverflow
          ref={coverflowRef}
          images={images}
          alt={product.title}
          colors={allColors}
          onColorIndexChange={setCurrentColorIdx}
        />
      </div>
      {/* Divider */}
      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />
      {/* Info Card */}
      <div className="relative flex-1 flex flex-col justify-between rounded-b-3xl px-6 py-6 shadow-lg border-t border-white/10 overflow-hidden">
        {/* Animated gradient background (matches header/footer) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] z-0" />
        {/* Dark overlay for perfect match */}
        <div className="absolute inset-0 bg-black/70 z-10" />
        {/* Content */}
        <div className="relative z-20">
          <div className="text-center">
            {/* Product Name */}
            <h3
              className="font-anton uppercase text-2xl md:text-3xl tracking-widest bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(255,0,153,0.5)] mb-1 line-clamp-1 animate-rainbow antialiased"
              title={product.title}
            >
              {product.title}
            </h3>
            {/* Price */}
            <div
              className="font-space text-3xl md:text-4xl font-extrabold text-neon-cyan drop-shadow-[0_2px_8px_rgba(0,255,255,0.5)] mb-2 antialiased"
            >
              ₹ {product.price}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {/* Color swatches */}
            {allColors.length > 0 && (
              <div className="flex gap-2 mt-2 mb-2">
                {allColors.map((color, idx) => (
                  <button
                    key={color}
                    className={`w-7 h-7 rounded-full border-2 shadow-md transition-all duration-200 focus:outline-none ${
                      idx === currentColorIdx
                        ? 'border-white ring-2 ring-white scale-110'
                        : 'border-white/40 opacity-80 hover:scale-105'
                    }`}
                    style={{ background: getColorHex(color) }}
                    title={color}
                    onClick={() => {
                      setCurrentColorIdx(idx);
                      coverflowRef.current?.goToIndex(idx);
                    }}
                    aria-label={`Select color ${color}`}
                    type="button"
                  />
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-3">
            <button className="flex-1 bg-white/20 hover:bg-white/30 text-white border border-white/20 py-2 rounded-xl text-base font-semibold tracking-wide transition-all duration-200 shadow-md backdrop-blur-md active:scale-95">Add to Cart</button>
            <button className="flex-1 bg-white text-black py-2 rounded-xl text-base font-semibold tracking-wide transition-all duration-200 shadow-md active:scale-95 hover:bg-white/90">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShopTest: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [colorIndices, setColorIndices] = useState([0, 0]);

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

  return (
    <div className="min-h-screen bg-neutral-900 text-white py-8 px-2 md:px-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Shop Grid Test Page</h1>
      {loading ? (
        <div className="text-center py-12">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">No products found.</div>
      ) : (
        <div className="relative w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 md:gap-y-16 md:gap-x-0">
            {/* Left column */}
            <div className="flex justify-end pr-4 md:pr-8 w-full h-full">
              {products[0] && <ProductCard product={products[0]} />}
            </div>
            {/* Center divider */}
            <div className="hidden md:block absolute left-1/2 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-white/20 to-transparent z-10" style={{transform: 'translateX(-50%)'}} />
            {/* Right column */}
            <div className="absolute right-0 top-0 flex flex-col items-start z-10 md:block hidden" style={{ width: 'calc(50% - 20px)' }}>
              {products[1] && (
                <div className="group flex flex-col items-start w-full max-w-[370px] h-[520px]">
                  {/* 3D Carousel Image (hero) with peek effect */}
                  <div className="w-full flex items-center justify-start relative overflow-visible" style={{ maxWidth: 350, height: 350, marginLeft: 30 }}>
                    <div className="w-full h-full flex items-center justify-center drop-shadow-2xl">
                      <ProductColorCoverflow
                        images={products[1].colors.map(color => products[1].colorImages?.[color]?.[0]).filter(Boolean) as string[]}
                        alt={products[1].title}
                        colors={products[1].colors}
                        onColorIndexChange={colorIdx => {
                          setColorIndices(prev => {
                            const copy = [...prev];
                            copy[1] = colorIdx;
                            return copy;
                          });
                        }}
                        centerOffset={200}
                      />
                    </div>
                  </div>
                  {/* Info Card below image, 3 lines */}
                  <div className="w-full mt-2 rounded-2xl bg-black/70 backdrop-blur-md shadow-2xl px-6 py-4 flex flex-col items-stretch border border-white/20" style={{ marginRight: 30 }}>
                    {/* Line 1: Name + Wishlist */}
                    <div className="flex flex-row items-center justify-between mb-2 w-full gap-2">
                      <span className="font-anton text-xl md:text-2xl font-bold bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple bg-clip-text text-transparent animate-rainbow break-words">
                        {products[1].title}
                      </span>
                      {/* Wishlist Icon */}
                      <button className="relative bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-pink/60 hover:scale-110 group/wishlist">
                        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-pink/30 via-neon-cyan/20 to-neon-purple/30 blur-sm opacity-60 group-hover/wishlist:opacity-90 transition" />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 relative z-10">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z" />
                        </svg>
                      </button>
                    </div>
                    {/* Line 2: Color Swatches + Price */}
                    <div className="flex flex-row items-center justify-between mb-3 w-full gap-2">
                      {/* Color Swatches */}
                      <span className="flex gap-2 items-center">
                        {products[1].colors.map((color, cidx) => (
                          <button
                            key={color}
                            className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${cidx === (colorIndices[1] || 0) ? 'border-white ring-2 ring-white scale-110' : 'border-white/40 opacity-80 hover:scale-105'}`}
                            style={{ background: getColorHex(color) }}
                            title={color}
                            onClick={() => {
                              setColorIndices(prev => {
                                const copy = [...prev];
                                copy[1] = cidx;
                                return copy;
                              });
                            }}
                            aria-label={`Select color ${color}`}
                            type="button"
                          />
                        ))}
                      </span>
                      {/* Price */}
                      <span className="font-space text-xl md:text-2xl font-extrabold text-neon-cyan drop-shadow-[0_2px_8px_rgba(0,255,255,0.5)]">
                        ₹{products[1].price}
                      </span>
                    </div>
                    {/* Line 3: Buttons */}
                    <div className="flex gap-3 w-full mt-1">
                      <button className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none">Add to Cart</button>
                      <button className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none">Buy Now</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Render additional products below in rows of 2 */}
          {products.length > 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 md:gap-y-16 md:gap-x-0 mt-10">
              {products.slice(2).map((product, idx) => (
                <div key={product.id} className={idx % 2 === 0 ? 'flex justify-end pr-4 md:pr-8 w-full h-full' : 'flex justify-start pl-4 md:pl-8 w-full h-full'}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
          {/* Render additional products below in rows of 2 */}
          {/* --- New Smart Product Card Example --- */}
          <div className="mt-16">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Smart Product Card Example (5:1 Ratio)</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {products.slice(0, 2).map((product, idx) => (
                <div key={product.id + '-smart'} className="group flex flex-col h-[420px] w-[280px] md:w-[320px] rounded-3xl shadow-2xl overflow-hidden border border-white/10 bg-black/60 relative">
                  {/* Image area (5/6) */}
                  <div className="flex-1 flex items-center justify-center bg-black">
                    <img
                      src={product.images?.[0]}
                      alt={product.title}
                      className="w-full h-full object-contain"
                      style={{ aspectRatio: '1/1' }}
                    />
                  </div>
                  {/* Info bar (1/6) */}
                  <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] relative">
                    <div className="absolute inset-0 bg-black/70 z-0" />
                    {/* Name */}
                    <span className="relative z-10 font-anton uppercase text-xs md:text-sm tracking-widest bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple bg-clip-text text-transparent animate-rainbow truncate max-w-[40%]">
                      {product.title}
                    </span>
                    {/* Swatches */}
                    <span className="relative z-10 flex gap-1">
                      {(product.colors || []).slice(0, 3).map((color, idx) => (
                        <span
                          key={color}
                          className={`w-3 h-3 rounded-full border border-white/30`}
                          style={{ background: getColorHex(color) }}
                          title={color}
                        />
                      ))}
                      {(product.colors || []).length > 3 && (
                        <span className="text-xs text-white/60">+{(product.colors || []).length - 3}</span>
                      )}
                    </span>
                    {/* Price */}
                    <span className="relative z-10 font-space text-base md:text-lg font-extrabold text-neon-cyan drop-shadow-[0_2px_8px_rgba(0,255,255,0.5)]">
                      ₹{product.price}
                    </span>
                  </div>
                  {/* Action buttons on hover (optional) */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-2">
                    <button className="bg-white/20 hover:bg-white/30 text-white border border-white/20 py-1 px-3 rounded-lg text-xs font-semibold">Add to Cart</button>
                    <button className="bg-white text-black py-1 px-3 rounded-lg text-xs font-semibold">Buy Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* --- Variation 3: Modern Floating Glass Info Bar --- */}
          <div className="mt-16">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Modern Floating Glass Info Bar (Variation 3)</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {products.slice(0, 2).map((product, idx) => (
                <div key={product.id + '-glass'} className="group relative flex flex-col items-center w-[280px] md:w-[320px] h-[420px]">
                  {/* 3D Carousel Image (hero) */}
                  <div className="relative w-full flex-1 flex items-center justify-center" style={{ height: 320 }}>
                    <div className="w-full h-full flex items-center justify-center drop-shadow-2xl">
                      <ProductColorCoverflow
                        images={product.images}
                        alt={product.title}
                        colors={product.colors}
                        onColorIndexChange={() => {}}
                      />
                    </div>
                    {/* Floating Glass Info Bar */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[95%] rounded-2xl bg-white/10 dark:bg-black/30 backdrop-blur-md shadow-xl flex items-center justify-between gap-2 px-3 py-2 z-20 border border-white/20">
                      {/* Color Swatch */}
                      <span className="flex gap-1">
                        {(product.colors || []).slice(0, 1).map((color) => (
                          <span
                            key={color}
                            className="w-5 h-5 rounded-full border-2 border-white/40"
                            style={{ background: getColorHex(color) }}
                            title={color}
                          />
                        ))}
                      </span>
                      {/* Name */}
                      <span className="font-anton uppercase text-xs md:text-sm tracking-widest bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple bg-clip-text text-transparent animate-rainbow truncate max-w-[80px] text-center">
                        {product.title}
                      </span>
                      {/* Price */}
                      <span className="font-space text-base md:text-lg font-extrabold text-neon-cyan drop-shadow-[0_2px_8px_rgba(0,255,255,0.5)]">
                        ₹{product.price}
                      </span>
                      {/* Buttons */}
                      <span className="flex gap-1">
                        <button className="bg-white/20 hover:bg-white/30 text-white border border-white/20 px-3 py-1 rounded-lg text-xs font-semibold transition-all">Add to Cart</button>
                        <button className="bg-white text-black px-3 py-1 rounded-lg text-xs font-semibold transition-all">Buy Now</button>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* --- Variation 4: Aligned, Modern Info Card Below Image --- */}
          <div className="mt-16">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Modern Info Card Below Image (Variation 4)</h2>
            <div className="flex flex-row justify-between gap-8 w-full max-w-5xl mx-auto">
              {products.slice(0, 2).map((product, idx) => {
                const colorImages = product.colorImages || {};
                const allColors = product.colors || [];
                const images = allColors.map(color => colorImages[color]?.[0]).filter(Boolean);
                const currentColorIdx = colorIndices[idx] || 0;
                const currentColor = allColors[currentColorIdx] || allColors[0];
                return (
                  <div key={product.id + '-v4'} className={`group flex flex-col items-center w-[320px] h-[480px] ${idx === 0 ? 'justify-start' : 'justify-end'}`}
                    style={{ alignItems: idx === 0 ? 'flex-start' : 'flex-end' }}>
                    {/* 3D Carousel Image (hero) */}
                    <div className="w-full flex-1 flex items-center justify-center">
                      <div className="w-full h-[320px] flex items-center justify-center drop-shadow-2xl">
                        <ProductColorCoverflow
                          images={images}
                          alt={product.title}
                          colors={allColors}
                          onColorIndexChange={colorIdx => {
                            setColorIndices(prev => {
                              const copy = [...prev];
                              copy[idx] = colorIdx;
                              return copy;
                            });
                          }}
                        />
                      </div>
                    </div>
                    {/* Info Card below image */}
                    <div className="w-full mt-2 rounded-2xl bg-white/10 dark:bg-black/30 backdrop-blur-md shadow-xl px-5 py-4 flex flex-col items-stretch border border-white/20">
                      {/* Name */}
                      <div className="font-anton text-lg md:text-xl font-bold text-white mb-2 text-center break-words">
                        {product.title}
                      </div>
                      {/* Row: Price | Wishlist | Color Swatch */}
                      <div className="flex flex-row items-center justify-between mb-3 w-full gap-2">
                        {/* Price */}
                        <span className="font-space text-lg md:text-xl font-extrabold text-neon-cyan drop-shadow-[0_2px_8px_rgba(0,255,255,0.5)]">
                          ₹{product.price}
                        </span>
                        {/* Wishlist Button */}
                        <button className="mx-auto bg-white/20 hover:bg-white/30 text-white border border-white/20 rounded-full w-9 h-9 flex items-center justify-center text-lg transition-all" title="Add to Wishlist">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z" />
                          </svg>
                        </button>
                        {/* Color Swatch (current color) */}
                        <span className="flex gap-1 items-center">
                          {currentColor && (
                            <span
                              className="w-6 h-6 rounded-full border-2 border-white/40"
                              style={{ background: getColorHex(currentColor) }}
                              title={currentColor}
                            />
                          )}
                        </span>
                      </div>
                      {/* Buttons Row */}
                      <div className="flex gap-2 w-full">
                        <button className="flex-1 bg-white/20 hover:bg-white/30 text-white border border-white/20 py-2 rounded-lg text-sm font-semibold transition-all">Add to Cart</button>
                        <button className="flex-1 bg-white text-black py-2 rounded-lg text-sm font-semibold transition-all">Buy Now</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* --- Variant 6: Final Product Card, True Left/Right, 3-Line Info Card --- */}
          <div className="mt-20">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Final Product Card Variant 6</h2>
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-y-12 md:gap-y-0 md:gap-x-0 w-full max-w-6xl mx-auto items-start">
              {/* Center vertical divider */}
              <div className="hidden md:block absolute left-1/2 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-white/30 to-transparent z-0" style={{transform: 'translateX(-50%)'}} />
              {products.slice(0, 2).map((product, idx) => {
                const colorImages = product.colorImages || {};
                const allColors = product.colors || [];
                const images = allColors.map(color => colorImages[color]?.[0]).filter(Boolean) as string[];
                const currentColorIdx = colorIndices[idx] || 0;
                const currentColor = allColors[currentColorIdx] || allColors[0];
                // Card alignment and peek effect
                const cardAlign = idx === 0 ? 'items-start' : 'items-end';
                const cardJustify = idx === 0 ? 'justify-start' : 'justify-end';
                const cardMargin = idx === 0 ? 'md:mr-2' : 'md:ml-2';
                return (
                  <div key={product.id + '-v6'} className={`group flex flex-col ${cardAlign} ${cardJustify} w-full max-w-[370px] h-[520px] relative z-10 mx-auto ${cardMargin}`}
                    style={{ alignItems: idx === 0 ? 'flex-start' : 'flex-end' }}>
                    {/* 3D Carousel Image (hero) with peek effect */}
                    <div className="w-full flex items-center justify-center relative overflow-visible" style={{ maxWidth: 350, height: 350, marginRight: idx === 0 ? 20 : 0, marginLeft: idx === 1 ? 20 : 0 }}>
                      <div className="w-full h-full flex items-center justify-center drop-shadow-2xl">
                        <ProductColorCoverflow
                          images={images}
                          alt={product.title}
                          colors={allColors}
                          onColorIndexChange={colorIdx => {
                            setColorIndices(prev => {
                              const copy = [...prev];
                              copy[idx] = colorIdx;
                              return copy;
                            });
                          }}
                        />
                      </div>
                    </div>
                    {/* Info Card below image, 3 lines */}
                    <div className="w-full mt-2 rounded-2xl bg-black/70 backdrop-blur-md shadow-2xl px-6 py-4 flex flex-col items-stretch border border-white/20" style={{ marginRight: 30 }}>
                      {/* Line 1: Name + Wishlist */}
                      <div className="flex flex-row items-center justify-between mb-2 w-full gap-2">
                        <span className="font-anton text-xl md:text-2xl font-bold bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple bg-clip-text text-transparent animate-rainbow break-words">
                          {product.title}
                        </span>
                        {/* Wishlist Icon */}
                        <button className="relative bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-pink/60 hover:scale-110 group/wishlist">
                          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-pink/30 via-neon-cyan/20 to-neon-purple/30 blur-sm opacity-60 group-hover/wishlist:opacity-90 transition" />
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 relative z-10">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z" />
                          </svg>
                        </button>
                      </div>
                      {/* Line 2: Color Swatches + Price */}
                      <div className="flex flex-row items-center justify-between mb-3 w-full gap-2">
                        {/* Color Swatches */}
                        <span className="flex gap-2 items-center">
                          {allColors.map((color, cidx) => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${cidx === currentColorIdx ? 'border-white ring-2 ring-white scale-110' : 'border-white/40 opacity-80 hover:scale-105'}`}
                              style={{ background: getColorHex(color) }}
                              title={color}
                              onClick={() => {
                                setColorIndices(prev => {
                                  const copy = [...prev];
                                  copy[idx] = cidx;
                                  return copy;
                                });
                              }}
                              aria-label={`Select color ${color}`}
                              type="button"
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
                        <button className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none">Add to Cart</button>
                        <button className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none">Buy Now</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* --- Variant 7: No Overlap, True Center Gap, Absolute Left/Right --- */}
          <div className="mt-20">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Final Product Card Variant 7 (No Overlap, True Center Gap)</h2>
            <div className="relative w-full max-w-6xl mx-auto" style={{ minHeight: 560 }}>
              {/* Center vertical divider */}
              <div className="hidden md:block absolute left-1/2 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-white/30 to-transparent z-0" style={{transform: 'translateX(-50%)'}} />
              {/* Product A (left) */}
              <div className="absolute left-0 top-0 w-[calc(50%-30px)] flex flex-col items-end z-10 md:block hidden">
                {products[0] && (
                  <div className="group flex flex-col items-end w-full max-w-[370px] h-[520px]">
                    {/* 3D Carousel Image (hero) with peek effect */}
                    <div className="w-full flex items-center justify-end relative overflow-visible" style={{ maxWidth: 350, height: 350, marginRight: 20 }}>
                      <div className="w-full h-full flex items-center justify-center drop-shadow-2xl">
                        <ProductColorCoverflow
                          images={products[0].colors.map(color => products[0].colorImages?.[color]?.[0]).filter(Boolean) as string[]}
                          alt={products[0].title}
                          colors={products[0].colors}
                          onColorIndexChange={colorIdx => {
                            setColorIndices(prev => {
                              const copy = [...prev];
                              copy[0] = colorIdx;
                              return copy;
                            });
                          }}
                          centerOffset={-20}
                        />
                      </div>
                    </div>
                    {/* Info Card (reuse from Variant 6) */}
                    <div className="w-full mt-2 rounded-2xl bg-black/70 backdrop-blur-md shadow-2xl px-6 py-4 flex flex-col items-stretch border border-white/20" style={{ marginRight: 30 }}>
                      {/* Line 1: Name + Wishlist */}
                      <div className="flex flex-row items-center justify-between mb-2 w-full gap-2">
                        <span className="font-anton text-xl md:text-2xl font-bold bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple bg-clip-text text-transparent animate-rainbow break-words">
                          {products[0].title}
                        </span>
                        {/* Wishlist Icon */}
                        <button className="relative bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-pink/60 hover:scale-110 group/wishlist">
                          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-pink/30 via-neon-cyan/20 to-neon-purple/30 blur-sm opacity-60 group-hover/wishlist:opacity-90 transition" />
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 relative z-10">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z" />
                          </svg>
                        </button>
                      </div>
                      {/* Line 2: Color Swatches + Price */}
                      <div className="flex flex-row items-center justify-between mb-3 w-full gap-2">
                        {/* Color Swatches */}
                        <span className="flex gap-2 items-center">
                          {products[0].colors.map((color, cidx) => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${cidx === (colorIndices[0] || 0) ? 'border-white ring-2 ring-white scale-110' : 'border-white/40 opacity-80 hover:scale-105'}`}
                              style={{ background: getColorHex(color) }}
                              title={color}
                              onClick={() => {
                                setColorIndices(prev => {
                                  const copy = [...prev];
                                  copy[0] = cidx;
                                  return copy;
                                });
                              }}
                              aria-label={`Select color ${color}`}
                              type="button"
                            />
                          ))}
                        </span>
                        {/* Price */}
                        <span className="font-space text-xl md:text-2xl font-extrabold text-neon-cyan drop-shadow-[0_2px_8px_rgba(0,255,255,0.5)]">
                          ₹{products[0].price}
                        </span>
                      </div>
                      {/* Line 3: Buttons */}
                      <div className="flex gap-3 w-full mt-1">
                        <button className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none">Add to Cart</button>
                        <button className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none">Buy Now</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Product B (right) */}
              <div className="absolute right-0 top-0 w-[calc(50%-30px)] flex flex-col items-start z-10 md:block hidden" style={{ width: 'calc(50% - 20px)' }}>
                {products[1] && (
                  <div className="group flex flex-col items-start w-full max-w-[370px] h-[520px]">
                    {/* 3D Carousel Image (hero) with peek effect */}
                    <div className="w-full flex items-center justify-start relative overflow-visible" style={{ maxWidth: 350, height: 350, marginLeft: 20 }}>
                      <div className="w-full h-full flex items-center justify-center drop-shadow-2xl">
                        <ProductColorCoverflow
                          images={products[1].colors.map(color => products[1].colorImages?.[color]?.[0]).filter(Boolean) as string[]}
                          alt={products[1].title}
                          colors={products[1].colors}
                          onColorIndexChange={colorIdx => {
                            setColorIndices(prev => {
                              const copy = [...prev];
                              copy[1] = colorIdx;
                              return copy;
                            });
                          }}
                          centerOffset={200}
                        />
                      </div>
                    </div>
                    {/* Info Card (reuse from Variant 6) */}
                    <div className="w-full mt-2 rounded-2xl bg-black/70 backdrop-blur-md shadow-2xl px-6 py-4 flex flex-col items-stretch border border-white/20" style={{ marginLeft: 210 }}>
                      {/* Line 1: Name + Wishlist */}
                      <div className="flex flex-row items-center justify-between mb-2 w-full gap-2">
                        <span className="font-anton text-xl md:text-2xl font-bold bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple bg-clip-text text-transparent animate-rainbow break-words">
                          {products[1].title}
                        </span>
                        {/* Wishlist Icon */}
                        <button className="relative bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-pink/60 hover:scale-110 group/wishlist">
                          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-pink/30 via-neon-cyan/20 to-neon-purple/30 blur-sm opacity-60 group-hover/wishlist:opacity-90 transition" />
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 relative z-10">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z" />
                          </svg>
                        </button>
                      </div>
                      {/* Line 2: Color Swatches + Price */}
                      <div className="flex flex-row items-center justify-between mb-3 w-full gap-2">
                        {/* Color Swatches */}
                        <span className="flex gap-2 items-center">
                          {products[1].colors.map((color, cidx) => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${cidx === (colorIndices[1] || 0) ? 'border-white ring-2 ring-white scale-110' : 'border-white/40 opacity-80 hover:scale-105'}`}
                              style={{ background: getColorHex(color) }}
                              title={color}
                              onClick={() => {
                                setColorIndices(prev => {
                                  const copy = [...prev];
                                  copy[1] = cidx;
                                  return copy;
                                });
                              }}
                              aria-label={`Select color ${color}`}
                              type="button"
                            />
                          ))}
                        </span>
                        {/* Price */}
                        <span className="font-space text-xl md:text-2xl font-extrabold text-neon-cyan drop-shadow-[0_2px_8px_rgba(0,255,255,0.5)]">
                          ₹{products[1].price}
                        </span>
                      </div>
                      {/* Line 3: Buttons */}
                      <div className="flex gap-3 w-full mt-1">
                        <button className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none">Add to Cart</button>
                        <button className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none">Buy Now</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Mobile: stack cards vertically */}
              <div className="block md:hidden w-full">
                {products.slice(0, 2).map((product, idx) => (
                  <div key={product.id + '-v7-mobile'} className="group flex flex-col items-center w-full max-w-[370px] h-[520px] mx-auto mb-12 last:mb-0">
                    {/* 3D Carousel Image (hero) */}
                    <div className="w-full flex items-center justify-center relative overflow-visible" style={{ maxWidth: 450, height: 900 }}>
                      <div className="w-full h-full flex items-center justify-center drop-shadow-2xl">
                        <ProductColorCoverflow
                          images={product.colors.map(color => product.colorImages?.[color]?.[0]).filter(Boolean) as string[]}
                          alt={product.title}
                          colors={product.colors}
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
                    {/* Info Card (reuse from Variant 6) */}
                    <div className="w-full mt-2 rounded-2xl bg-black/70 backdrop-blur-md shadow-2xl px-6 py-4 flex flex-col items-stretch border border-white/20 max-w-[70%] mx-auto">
                      {/* Line 1: Name + Wishlist */}
                      <div className="flex flex-row items-center justify-between mb-2 w-full gap-2">
                        <span className="font-anton text-xl md:text-2xl font-bold bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple bg-clip-text text-transparent animate-rainbow break-words">
                          {product.title}
                        </span>
                        {/* Wishlist Icon */}
                        <button className="relative bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-pink/60 hover:scale-110 group/wishlist">
                          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-pink/30 via-neon-cyan/20 to-neon-purple/30 blur-sm opacity-60 group-hover/wishlist:opacity-90 transition" />
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 relative z-10">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z" />
                          </svg>
                        </button>
                      </div>
                      {/* Line 2: Color Swatches + Price */}
                      <div className="flex flex-row items-center justify-between mb-3 w-full gap-2">
                        {/* Color Swatches */}
                        <span className="flex gap-2 items-center">
                          {product.colors.map((color, cidx) => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${cidx === (colorIndices[idx] || 0) ? 'border-white ring-2 ring-white scale-110' : 'border-white/40 opacity-80 hover:scale-105'}`}
                              style={{ background: getColorHex(color) }}
                              title={color}
                              onClick={() => {
                                setColorIndices(prev => {
                                  const copy = [...prev];
                                  copy[idx] = cidx;
                                  return copy;
                                });
                              }}
                              aria-label={`Select color ${color}`}
                              type="button"
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
                        <button className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none">Add to Cart</button>
                        <button className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none">Buy Now</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* --- Variant 8: Variant 7 with Product B alignment fix --- */}
          <div className="mt-20">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">
              Final Product Card Variant 8 (No Overlap, True Center Gap, Alignment Fixed)
            </h2>
            <div className="relative w-full max-w-6xl mx-auto" style={{ minHeight: 560 }}>
              {/* Center vertical divider */}
              <div className="hidden md:block absolute left-1/2 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-white/30 to-transparent z-0" style={{transform: 'translateX(-50%)'}} />
              {/* Product A (left) */}
              <div className="absolute left-0 top-0 w-[calc(50%-30px)] flex flex-col items-end z-10 md:block hidden">
                {products[0] && (
                  <div className="group flex flex-col items-end w-full max-w-[370px] h-[520px]">
                    {/* 3D Carousel Image (hero) with peek effect */}
                    <div className="w-full flex items-center justify-end relative overflow-visible" style={{ maxWidth: 350, height: 350, marginRight: 20 }}>
                      <div className="w-full h-full flex items-center justify-center drop-shadow-2xl">
                        <ProductColorCoverflow
                          images={products[0].colors.map(color => products[0].colorImages?.[color]?.[0]).filter(Boolean) as string[]}
                          alt={products[0].title}
                          colors={products[0].colors}
                          onColorIndexChange={colorIdx => {
                            setColorIndices(prev => {
                              const copy = [...prev];
                              copy[0] = colorIdx;
                              return copy;
                            });
                          }}
                          centerOffset={-20}
                        />
                      </div>
                    </div>
                    {/* Info Card (reuse from Variant 7) */}
                    <div className="w-full mt-2 rounded-2xl bg-black/70 backdrop-blur-md shadow-2xl px-6 py-4 flex flex-col items-stretch border border-white/20" style={{ marginRight: 30 }}>
                      {/* Line 1: Name + Wishlist */}
                      <div className="flex flex-row items-center justify-between mb-2 w-full gap-2">
                        <span className="font-anton text-xl md:text-2xl font-bold bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple bg-clip-text text-transparent animate-rainbow break-words">
                          {products[0].title}
                        </span>
                        {/* Wishlist Icon */}
                        <button className="relative bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-pink/60 hover:scale-110 group/wishlist">
                          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-pink/30 via-neon-cyan/20 to-neon-purple/30 blur-sm opacity-60 group-hover/wishlist:opacity-90 transition" />
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 relative z-10">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z" />
                          </svg>
                        </button>
                      </div>
                      {/* Line 2: Color Swatches + Price */}
                      <div className="flex flex-row items-center justify-between mb-3 w-full gap-2">
                        {/* Color Swatches */}
                        <span className="flex gap-2 items-center">
                          {products[0].colors.map((color, cidx) => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${cidx === (colorIndices[0] || 0) ? 'border-white ring-2 ring-white scale-110' : 'border-white/40 opacity-80 hover:scale-105'}`}
                              style={{ background: getColorHex(color) }}
                              title={color}
                              onClick={() => {
                                setColorIndices(prev => {
                                  const copy = [...prev];
                                  copy[0] = cidx;
                                  return copy;
                                });
                              }}
                              aria-label={`Select color ${color}`}
                              type="button"
                            />
                          ))}
                        </span>
                        {/* Price */}
                        <span className="font-space text-xl md:text-2xl font-extrabold text-neon-cyan drop-shadow-[0_2px_8px_rgba(0,255,255,0.5)]">
                          ₹{products[0].price}
                        </span>
                      </div>
                      {/* Line 3: Buttons */}
                      <div className="flex gap-3 w-full mt-1">
                        <button className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none">Add to Cart</button>
                        <button className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none">Buy Now</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Product B (right) */}
              <div className="absolute right-0 top-0 w-[calc(50%-30px)] flex flex-col items-start z-10 md:block hidden" style={{ width: 'calc(50% - 20px)' }}>
                {products[1] && (
                  <div className="group flex flex-col items-start w-full max-w-[370px] h-[520px]">
                    {/* 3D Carousel Image (hero) with peek effect */}
                    <div className="w-full flex items-center justify-start relative overflow-visible" style={{ maxWidth: 350, height: 350, marginLeft: 20 }}>
                      <div className="w-full h-full flex items-center justify-center drop-shadow-2xl">
                        <ProductColorCoverflow
                          images={products[1].colors.map(color => products[1].colorImages?.[color]?.[0]).filter(Boolean) as string[]}
                          alt={products[1].title}
                          colors={products[1].colors}
                          onColorIndexChange={colorIdx => {
                            setColorIndices(prev => {
                              const copy = [...prev];
                              copy[1] = colorIdx;
                              return copy;
                            });
                          }}
                          centerOffset={200}
                        />
                      </div>
                    </div>
                    {/* Info Card (reuse from Variant 7) */}
                    <div className="w-full mt-2 rounded-2xl bg-black/70 backdrop-blur-md shadow-2xl px-6 py-4 flex flex-col items-stretch border border-white/20" style={{ marginLeft: 210 }}>
                      {/* Line 1: Name + Wishlist */}
                      <div className="flex flex-row items-center justify-between mb-2 w-full gap-2">
                        <span className="font-anton text-xl md:text-2xl font-bold bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple bg-clip-text text-transparent animate-rainbow break-words">
                          {products[1].title}
                        </span>
                        {/* Wishlist Icon */}
                        <button className="relative bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-pink/60 hover:scale-110 group/wishlist">
                          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-pink/30 via-neon-cyan/20 to-neon-purple/30 blur-sm opacity-60 group-hover/wishlist:opacity-90 transition" />
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 relative z-10">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z" />
                          </svg>
                        </button>
                      </div>
                      {/* Line 2: Color Swatches + Price */}
                      <div className="flex flex-row items-center justify-between mb-3 w-full gap-2">
                        {/* Color Swatches */}
                        <span className="flex gap-2 items-center">
                          {products[1].colors.map((color, cidx) => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${cidx === (colorIndices[1] || 0) ? 'border-white ring-2 ring-white scale-110' : 'border-white/40 opacity-80 hover:scale-105'}`}
                              style={{ background: getColorHex(color) }}
                              title={color}
                              onClick={() => {
                                setColorIndices(prev => {
                                  const copy = [...prev];
                                  copy[1] = cidx;
                                  return copy;
                                });
                              }}
                              aria-label={`Select color ${color}`}
                              type="button"
                            />
                          ))}
                        </span>
                        {/* Price */}
                        <span className="font-space text-xl md:text-2xl font-extrabold text-neon-cyan drop-shadow-[0_2px_8px_rgba(0,255,255,0.5)]">
                          ₹{products[1].price}
                        </span>
                      </div>
                      {/* Line 3: Buttons */}
                      <div className="flex gap-3 w-full mt-1">
                        <button className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none">Add to Cart</button>
                        <button className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none">Buy Now</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Mobile: stack cards vertically */}
              <div className="block md:hidden w-full">
                {products.slice(0, 2).map((product, idx) => (
                  <div key={product.id + '-v8-mobile'} className="group flex flex-col items-center w-full max-w-[370px] h-[520px] mx-auto mb-20 last:mb-0">
                    {/* 3D Carousel Image (hero) */}
                    <div className="w-full flex items-center justify-center relative overflow-visible" style={{ maxWidth: 450, height: 900 }}>
                      <div className="w-full h-full flex items-center justify-center drop-shadow-2xl">
                        <ProductColorCoverflow
                          images={product.colors.map(color => product.colorImages?.[color]?.[0]).filter(Boolean) as string[]}
                          alt={product.title}
                          colors={product.colors}
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
                    {/* Info Card (reuse from Variant 7) */}
                    <div className="w-full mt-2 rounded-2xl bg-black/70 backdrop-blur-md shadow-2xl px-6 py-4 flex flex-col items-stretch border border-white/20 max-w-[70%] mx-auto">
                      {/* Line 1: Name + Wishlist */}
                      <div className="flex flex-row items-center justify-between mb-2 w-full gap-2">
                        <span className="font-anton text-xl md:text-2xl font-bold bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple bg-clip-text text-transparent animate-rainbow break-words">
                          {product.title}
                        </span>
                        {/* Wishlist Icon */}
                        <button className="relative bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-pink/60 hover:scale-110 group/wishlist">
                          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-pink/30 via-neon-cyan/20 to-neon-purple/30 blur-sm opacity-60 group-hover/wishlist:opacity-90 transition" />
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 relative z-10">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z" />
                          </svg>
                        </button>
                      </div>
                      {/* Line 2: Color Swatches + Price */}
                      <div className="flex flex-row items-center justify-between mb-3 w-full gap-2">
                        {/* Color Swatches */}
                        <span className="flex gap-2 items-center">
                          {product.colors.map((color, cidx) => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${cidx === (colorIndices[idx] || 0) ? 'border-white ring-2 ring-white scale-110' : 'border-white/40 opacity-80 hover:scale-105'}`}
                              style={{ background: getColorHex(color) }}
                              title={color}
                              onClick={() => {
                                setColorIndices(prev => {
                                  const copy = [...prev];
                                  copy[idx] = cidx;
                                  return copy;
                                });
                              }}
                              aria-label={`Select color ${color}`}
                              type="button"
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
                        <button className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none">Add to Cart</button>
                        <button className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none">Buy Now</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopTest; 