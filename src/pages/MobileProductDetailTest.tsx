import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Product } from './Shop';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, ShoppingCart, Maximize2 } from 'lucide-react';
import { getColorDisplayName, getColorNameFromHex, getHexFromColorValue, getNearestColorFamilyAndShade } from '@/config/colors';
import { toast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const MobileProductDetailTest: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      if (!productData) {
        setProduct(null);
        setLoading(false);
        return;
      }
      // Fetch variants
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('color, images, size, stock_quantity')
        .eq('product_id', productId);
      // Build colorImages, colors, sizes
      const colorImages: { [color: string]: string[] } = {};
      const allColors: string[] = [];
      const allSizes: string[] = [];
      (variantsData || []).forEach(variant => {
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
        if (variant.size && !allSizes.includes(variant.size)) {
          allSizes.push(variant.size);
        }
      });
      // Use the first color's images as default if no other images
      let mainImages: string[] = [];
      if (Array.isArray(productData.images) && productData.images.length > 0) {
        mainImages = productData.images;
      } else if (Object.keys(colorImages).length > 0) {
        const firstColor = allColors[0];
        mainImages = colorImages[firstColor] || [];
      } else {
        mainImages = ['/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png'];
      }
      setProduct({
        id: productData.id,
        title: productData.name,
        price: productData.price,
        image: mainImages[0],
        category: productData.category || '',
        sizes: allSizes,
        colors: allColors,
        color: productData.color || '',
        description: productData.description || '',
        images: mainImages,
        selectedColor: productData.color || allColors[0] || '',
        colorImages,
      });
      setLoading(false);
    };
    if (productId) fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.selectedColor || product.colors?.[0] || product.color || '');
      setSelectedSize('');
      setQuantity(1);
      setSelectedImageIndex(0);
    }
  }, [product]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!product) return <div className="text-center py-10">Product not found.</div>;

  const getAvailableImages = () => {
    if (product.colorImages && selectedColor && product.colorImages[selectedColor]) {
      return product.colorImages[selectedColor];
    }
    return product.images || [product.image];
  };
  const availableImages = getAvailableImages();

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    toast({ title: 'Product added to cart!' });
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'INR',
        value: product.price * quantity,
        items: [{
          item_id: product.id,
          item_name: product.title,
          category: product.category,
          price: product.price,
          quantity: quantity
        }]
      });
    }
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const getColorDisplay = (color: string) => {
    if (color.startsWith('#')) {
      const nearest = getNearestColorFamilyAndShade(color);
      return { name: `${nearest.baseFamily} (${nearest.displayName})`, code: color };
    }
    return { name: getColorDisplayName(color), code: getHexFromColorValue(color) };
  };
  const availableColors = product.colors?.map(color => getColorDisplay(color)) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#23272f] to-[#18181b] text-white flex flex-col items-center py-4 md:hidden">
      <div className="w-full max-w-md mx-auto px-2">
        {/* Modern Back to Shop Button */}
        <div className="mb-4">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium shadow border border-white/20 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </div>
        {/* Product Info Boxed */}
        <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 hover:shadow-neon-purple/30 transition-all duration-500 rounded-2xl mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-neon-cyan text-2xl font-anton flex items-center gap-3">
              {product.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Product Image with carousel/zoom/controls - only show here */}
            <div className="w-full mb-4 relative">
              <img
                src={availableImages[selectedImageIndex]}
                alt={product.title}
                className="w-full rounded-xl object-cover object-center max-h-96 mx-auto cursor-zoom-in transition-all duration-300 hover:scale-105"
                style={{ aspectRatio: '1/1' }}
                onClick={() => setShowFullImage(true)}
              />
              <button
                onClick={() => setShowFullImage(true)}
                className="absolute bottom-2 right-2 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md shadow-md transition-colors"
                aria-label="View full size image"
              >
                <Maximize2 className="w-5 h-5 text-white" />
              </button>
              {availableImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(prev => (prev - 1 + availableImages.length) % availableImages.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md shadow-md transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(prev => (prev + 1) % availableImages.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md shadow-md transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}
            </div>
            {/* Full Size Image Modal */}
            {showFullImage && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setShowFullImage(false)}>
                <img src={availableImages[selectedImageIndex]} alt={product.title} className="max-h-[90vh] max-w-[95vw] object-contain" />
                <button className="absolute top-4 right-4 p-2 bg-black/60 rounded-full" onClick={() => setShowFullImage(false)}>
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            )}
            <div className="text-white/80 text-base mb-2 leading-relaxed">{product.description}</div>
            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div className="space-y-2 mb-2">
                <h3 className="text-sm font-medium text-white/80">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color.code}
                      onClick={() => setSelectedColor(color.code)}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-200 shadow focus:outline-none focus:ring-2 focus:ring-white/60 relative group
                        ${selectedColor === color.code ? 'border-neon-cyan ring-2 ring-neon-cyan/40 scale-110' : 'border-white/20 hover:border-white/40'}`}
                      style={{ backgroundColor: color.code }}
                      aria-label={`Select ${color.name} color`}
                    >
                      <span className="sr-only">{color.name}</span>
                      {/* Tooltip on hover/tap */}
                      <span className="absolute left-1/2 -translate-x-1/2 top-12 text-xs bg-black/80 text-white px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2 mb-2">
                <h3 className="text-sm font-medium text-white/80">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow focus:outline-none focus:ring-2 focus:ring-neon-cyan/40
                        ${selectedSize === size ? 'bg-neon-cyan/90 text-black scale-105 ring-2 ring-neon-cyan/40' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Price */}
            <div className="flex items-baseline mt-2 mb-2">
              <span className="text-sm font-medium text-white/60 mr-1">₹</span>
              <span className="text-3xl font-bold text-white tracking-tight">{product.price}</span>
            </div>
            {/* Quantity Selector */}
            <div className="space-y-2 mb-4">
              <h3 className="text-sm font-medium text-white/80">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-lg font-bold shadow border border-white/20"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="text-white font-semibold text-lg min-w-[2ch] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-lg font-bold shadow border border-white/20"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
            {/* Add to Cart Button - subtle and modern */}
            <button
              onClick={handleAddToCart}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center justify-center gap-2 shadow transition-all text-lg mt-2 border border-white/20"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileProductDetailTest; 