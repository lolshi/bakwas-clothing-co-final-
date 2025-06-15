import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import CartAddAnimation from '@/components/shop/CartAddAnimation';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  image?: string;
  images?: string[];
  variants?: any[];
  colorImages?: { [key: string]: string[] };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, selectedSize?: string, selectedColor?: string, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [lastAddedImage, setLastAddedImage] = useState<string>('');
  const animationTimeoutRef = useRef<NodeJS.Timeout>();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('bakwas-cart');
      console.log('Loading cart from localStorage:', savedCart); // Debug log
      if (savedCart && savedCart !== 'undefined' && savedCart !== 'null') {
        const parsedCart = JSON.parse(savedCart);
        // Only set items if it's a valid array
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
          console.log('Cart loaded successfully:', parsedCart); // Debug log
        }
      }
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
      // Clear invalid data
      localStorage.removeItem('bakwas-cart');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever items change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('bakwas-cart', JSON.stringify(items));
      console.log('Cart saved to localStorage:', items); // Debug log
    }
  }, [items, isLoaded]);

  const addToCart = (product: Product, selectedSize?: string, selectedColor?: string, quantity?: number) => {
    console.log('🔍 [CartContext] Adding to cart:', {
      productId: product.id,
      selectedSize,
      selectedColor,
      quantity,
      productColorImages: product.colorImages,
      productVariants: product.variants,
      productImages: product.images
    });

    const cartItemId = `${product.id}-${selectedSize || 'no-size'}-${selectedColor || 'no-color'}`;
    
    // Find the correct variant image
    let variantImage = product.image;
    
    // First try to find the exact variant match
    if (product.variants && selectedColor && selectedSize) {
      console.log('🔍 [CartContext] Searching for exact variant match:', {
        color: selectedColor,
        size: selectedSize,
        variants: product.variants
      });
      
      const variant = product.variants.find(
        (v: any) => v.color === selectedColor && v.size === selectedSize
      );
      
      if (variant?.images && Array.isArray(variant.images) && variant.images.length > 0) {
        console.log('✅ [CartContext] Found exact variant match:', variant.images[0]);
        variantImage = variant.images[0];
      }
    }
    
    // If no exact match found, try colorImages
    if (!variantImage && selectedColor && product.colorImages && product.colorImages[selectedColor] && Array.isArray(product.colorImages[selectedColor]) && product.colorImages[selectedColor].length > 0) {
      console.log('🎨 [CartContext] Using colorImages:', {
        color: selectedColor,
        images: product.colorImages[selectedColor]
      });
      variantImage = product.colorImages[selectedColor][0];
    }
    
    // If still no image found, try variants without size match
    if (!variantImage && product.variants && selectedColor) {
      console.log('🔍 [CartContext] Searching variants without size match:', {
        color: selectedColor,
        variants: product.variants
      });
      
      const variant = product.variants.find(
        (v: any) => v.color === selectedColor
      );
      
      if (variant?.images && Array.isArray(variant.images) && variant.images.length > 0) {
        console.log('✅ [CartContext] Found color variant:', variant.images[0]);
        variantImage = variant.images[0];
      }
    }
    
    // Fallback to product images
    if (!variantImage && product.images && Array.isArray(product.images) && product.images.length > 0) {
      console.log('🖼️ [CartContext] Using product images:', product.images[0]);
      variantImage = product.images[0];
    }
    
    console.log('📸 [CartContext] Final image selected:', variantImage);
    
    // Final fallback to default image
    const productImage = variantImage || '/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png';
    
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === cartItemId);
      
      if (existingItem) {
        toast({
          title: "Quantity updated!",
          description: `${product.title} quantity increased in cart.`,
        });
        return prevItems.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + (quantity || 1) }
            : item
        );
      } else {
        toast({
          title: "Added to cart!",
          description: `${product.title} has been added to your cart.`,
        });
        return [...prevItems, {
          id: cartItemId,
          title: product.title,
          price: product.price,
          image: productImage,
          quantity: quantity || 1,
          selectedSize,
          selectedColor
        }];
      }
    });

    // Show animation
    setLastAddedImage(productImage);
    setShowAnimation(true);
    
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    // Set new timeout
    animationTimeoutRef.current = setTimeout(() => {
      setShowAnimation(false);
    }, 1500); // Show for 1.5 seconds
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const removeFromCart = (id: string) => {
    setItems(prevItems => {
      const item = prevItems.find(item => item.id === id);
      if (item) {
        toast({
          title: "Item removed",
          description: `${item.title} has been removed from your cart.`,
        });
      }
      return prevItems.filter(item => item.id !== id);
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    itemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartAddAnimation isVisible={showAnimation} productImage={lastAddedImage} />
    </CartContext.Provider>
  );
};
