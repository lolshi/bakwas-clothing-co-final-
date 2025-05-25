
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/pages/Shop';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const sizeLabels = {
  'S': 'Small',
  'M': 'Medium', 
  'L': 'Large',
  'XL': 'Extra Large',
  'XXL': 'Double XL'
};

const colorNames = {
  'black': 'Black',
  'white': 'White',
  'neon-cyan': 'Neon Cyan',
  'neon-purple': 'Neon Purple',
  'neon-pink': 'Neon Pink',
  'neon-orange': 'Neon Orange'
};

const colorValues = {
  'black': '#000000',
  'white': '#ffffff',
  'neon-cyan': '#00E1FF',
  'neon-purple': '#8B5CF6',
  'neon-pink': '#EC4899',
  'neon-orange': '#F97316'
};

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }

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
          quantity: 1,
          variant: `${selectedSize}-${selectedColor}`
        }]
      });
    }

    console.log('Added to cart:', {
      product: product.title,
      size: selectedSize,
      color: selectedColor
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full bg-card border-border scale-90 data-[state=open]:scale-100 transition-transform duration-200">
        <DialogHeader>
          <DialogTitle className="font-anton text-2xl bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
            {product.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Carousel */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={product.images[currentImageIndex]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            
            {/* Thumbnail strip */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <p className="text-3xl font-bold text-primary mb-2">₹{product.price}</p>
              <p className="text-muted-foreground font-space">{product.description}</p>
            </div>

            {/* Category Badge */}
            <div>
              <Badge variant="secondary" className="bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 text-foreground border-0">
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)} Drop
              </Badge>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <h4 className="font-anton text-lg">Size</h4>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSize(size)}
                    className={selectedSize === size ? 
                      "bg-gradient-to-r from-neon-cyan to-neon-purple text-black border-0" : 
                      "border-border hover:border-primary"
                    }
                  >
                    {size}
                  </Button>
                ))}
              </div>
              {selectedSize && (
                <p className="text-sm text-muted-foreground">
                  Selected: {sizeLabels[selectedSize as keyof typeof sizeLabels]}
                </p>
              )}
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <h4 className="font-anton text-lg">Color</h4>
              <div className="flex flex-wrap gap-3">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                      selectedColor === color ? 'border-primary shadow-lg scale-110' : 'border-border'
                    }`}
                    style={{ backgroundColor: colorValues[color as keyof typeof colorValues] }}
                    title={colorNames[color as keyof typeof colorNames]}
                  />
                ))}
              </div>
              {selectedColor && (
                <p className="text-sm text-muted-foreground">
                  Selected: {colorNames[selectedColor as keyof typeof colorNames]}
                </p>
              )}
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              size="lg"
              className="w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink hover:from-neon-cyan/80 hover:via-neon-purple/80 hover:to-neon-pink/80 text-black font-space font-semibold text-lg"
              disabled={!selectedSize || !selectedColor}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
