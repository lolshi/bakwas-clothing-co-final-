import React, { useState } from 'react';
import { Eye, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/pages/Shop';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { getColorHexCode, getNearestColorFamilyAndShade } from '@/config/colors';
import { toast } from '@/hooks/use-toast';
import ProductColorCoverflow from '@/components/ProductColorCoverflow';

// Extend Product type to include colorImages
interface ProductWithColorImages extends Product {
  colorImages?: { [color: string]: string[] };
}

interface ProductCardProps {
  product: Product;
  index: number;
  onQuickView: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product: rawProduct, index, onQuickView }) => {
  const product = rawProduct as ProductWithColorImages;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Map all product.colors to robust color objects
  const availableColors = (product.colors || []).map(colorValue => {
    const hex = colorValue.startsWith('#') ? colorValue : getColorHexCode(colorValue) || colorValue;
    const nearest = getNearestColorFamilyAndShade(hex);
    return { hex: nearest.hex, displayName: nearest.displayName, original: colorValue };
  });
  const colorImages = product.colorImages || {};
  const imagesToShow = selectedColor && colorImages[selectedColor] && colorImages[selectedColor].length > 0
    ? colorImages[selectedColor]
    : product.images && product.images.length > 0
      ? product.images
      : [product.image];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imagesToShow.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imagesToShow.length) % imagesToShow.length);
  };

  const goToImage = (imageIndex: number) => {
    setCurrentImageIndex(imageIndex);
  };

  const handleAddToCart = (product: Product) => {
    const productWithSelectedColor = {
      ...product,
      selectedColor: product.colors?.[currentImageIndex] || product.colors?.[0] || product.color
    };
    addToCart(productWithSelectedColor);
  };

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div 
      className="group flex flex-col items-center w-full max-w-[370px] h-[520px] mx-auto mb-20 last:mb-0"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => onQuickView({
        ...product,
        selectedColor: product.colors?.[currentImageIndex] || product.colors?.[0] || ''
      })}
    >
      {/* 3D Carousel Image (hero) for both mobile and desktop */}
      <div className="w-full flex items-center justify-center relative overflow-visible" style={{ maxWidth: 450, height: 900 }}>
        <div className="w-full h-full flex items-center justify-center drop-shadow-2xl">
          <ProductColorCoverflow
            images={availableColors.map(color => (product.colorImages?.[color.hex]?.[0])).filter(Boolean) as string[]}
            alt={product.title}
            colors={availableColors}
            onColorIndexChange={setCurrentImageIndex}
            cardWidthMobile="w-72"
            cardHeightMobile="h-80"
          />
        </div>
      </div>
      {/* Info Card (reuse from Variant 8) */}
      <div className="w-full mt-2 rounded-2xl bg-black/70 backdrop-blur-md shadow-2xl px-6 py-4 flex flex-col items-stretch border border-white/20 max-w-[70%] mx-auto">
        {/* Line 1: Name + Wishlist */}
        <div className="flex flex-row items-center justify-between mb-2 w-full gap-2">
          <span className="font-anton text-xl md:text-2xl font-bold bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple bg-clip-text text-transparent animate-rainbow break-words">
            {product.title}
          </span>
          <button className="relative bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-pink/60 hover:scale-110">
            <Heart className={`w-6 h-6 relative z-10 ${isInWishlist(product.id) ? 'fill-current text-red-400' : ''}`} strokeWidth={2} />
          </button>
        </div>
        {/* Line 2: Color Swatches + Price */}
        <div className="flex flex-row items-center justify-between mb-3 w-full gap-2">
          <span className="flex gap-2 items-center">
            {availableColors.map((color, cidx) => (
              <button
                key={color.hex + color.displayName + color.original}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${cidx === currentImageIndex ? 'border-white ring-2 ring-white scale-110' : 'border-white/40 opacity-80 hover:scale-105'}`}
                style={{ backgroundColor: color.hex }}
                title={color.displayName}
                onClick={() => setCurrentImageIndex(cidx)}
                aria-label={`Select color ${color.displayName}`}
                type="button"
              />
            ))}
          </span>
          <span className="font-space text-xl md:text-2xl font-extrabold text-neon-cyan drop-shadow-[0_2px_8px_rgba(0,255,255,0.5)]">
            ₹{product.price}
          </span>
        </div>
        {/* Line 3: Buttons */}
        <div className="flex gap-3 w-full mt-1">
          <button
            className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none"
            onClick={e => { e.stopPropagation(); handleAddToCart({
              ...product,
              selectedColor: product.colors?.[currentImageIndex] || product.colors?.[0] || product.color
            }); }}
          >Add to Cart</button>
          <button
            className="flex-1 header-gradient text-white font-bold py-2 rounded-lg text-base shadow-md hover:scale-105 transition-all bg-gradient-to-r from-[#ff0099] via-[#3300ff] to-[#00ffee] bg-[length:200%_200%] animate-[headerGradient_20s_ease_infinite] border-none"
            onClick={e => { e.stopPropagation(); handleAddToCart({
              ...product,
              selectedColor: product.colors?.[currentImageIndex] || product.colors?.[0] || product.color
            }); }}
          >Buy Now</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 