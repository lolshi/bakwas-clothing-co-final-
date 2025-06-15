import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/pages/Shop';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { getColorDisplayName, getColorNameFromHex, getHexFromColorValue, getNearestColorFamilyAndShade } from '@/config/colors';

interface MobileProductViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ProductWithVariants extends Product {
  variants?: { color: string; size: string; stock: number; images: string[] }[];
  colorImages?: { [color: string]: string[] };
}

export const MobileProductView: React.FC<MobileProductViewProps> = ({ product, isOpen, onClose }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    if (isOpen && product) {
      setSelectedSize('');
      setSelectedColor(product.selectedColor || product.colors?.[0] || '');
      setQuantity(1);
      setSelectedImageIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const productWithVariants = product as ProductWithVariants;

  const getAvailableImages = () => {
    if (productWithVariants.variants) {
      const variant = productWithVariants.variants.find(v => v.color === selectedColor);
      return variant?.images || product.images || [product.image];
    }
    return product.images || [product.image];
  };

  const availableImages = getAvailableImages();

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
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

  const selectImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  const selectColor = (color: string) => {
    setSelectedColor(color);
    setSelectedImageIndex(0);
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
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 z-[1001] bg-black/40 backdrop-blur-2xl rounded-t-3xl border-t border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="p-4 space-y-6">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10">
                <img 
                  src={availableImages[selectedImageIndex]}
                  alt={product.title}
                  className="w-full aspect-square object-cover"
                />
                {availableImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(prev => (prev - 1 + availableImages.length) % availableImages.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/30 backdrop-blur-sm"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(prev => (prev + 1) % availableImages.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/30 backdrop-blur-sm"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h2 className="text-2xl font-medium text-white">{product.title}</h2>
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors ${
                      isInWishlist(product.id) ? 'text-red-400' : 'text-white'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="flex items-baseline">
                  <span className="text-sm font-medium text-white/60 mr-1">₹</span>
                  <span className="text-3xl font-medium text-white">{product.price}</span>
                </div>
                {availableColors.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-white/80">Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color) => (
                        <button
                          key={color.code}
                          onClick={() => selectColor(color.code)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            selectedColor === color.code
                              ? 'border-white scale-110'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                          style={{ backgroundColor: color.code }}
                          aria-label={`Select ${color.name} color`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-white/80">Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedSize === size
                              ? 'bg-white text-black'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-white/80">Quantity</h3>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                    >
                      -
                    </button>
                    <span className="text-white font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileProductView; 