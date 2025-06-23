import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import CartAddAnimation from '@/components/shop/CartAddAnimation';
import { supabase } from '@/integrations/supabase/client';

export interface CartItem {
  id: string;
  productId: string;    // Product UUID
  variantId: string;    // Variant UUID
  title: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface PromoCodeData {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_cart_total: number;
  usage_count: number;
  usage_limit: number | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  free_shipping: boolean;
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
  promoCode: string | null;
  promoCodeData: PromoCodeData | null;
  discount: number;
  shippingDiscount: boolean;
  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: () => void;
  calculateShippingCost: (subtotal: number) => number;
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
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoCodeData, setPromoCodeData] = useState<PromoCodeData | null>(null);
  const [discount, setDiscount] = useState(0);
  const [shippingDiscount, setShippingDiscount] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout>();

  // Load cart and promo code from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('bakwas-cart');
      const savedPromoCode = localStorage.getItem('bakwas-promo-code');
      const savedPromoData = localStorage.getItem('bakwas-promo-data');
      const savedDiscount = localStorage.getItem('bakwas-discount');
      const savedShippingDiscount = localStorage.getItem('bakwas-shipping-discount');

      console.log('Loading cart from localStorage:', savedCart); // Debug log
      if (savedCart && savedCart !== 'undefined' && savedCart !== 'null') {
        const parsedCart = JSON.parse(savedCart);
        // Only set items if it's a valid array
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
          console.log('Cart loaded successfully:', parsedCart); // Debug log
        }
      }

      // Load promo code state
      if (savedPromoCode) {
        setPromoCode(savedPromoCode);
      }
      if (savedPromoData) {
        setPromoCodeData(JSON.parse(savedPromoData));
      }
      if (savedDiscount) {
        setDiscount(Number(savedDiscount));
      }
      if (savedShippingDiscount) {
        setShippingDiscount(savedShippingDiscount === 'true');
      }
    } catch (error) {
      console.error('Error parsing data from localStorage:', error);
      // Clear invalid data
      localStorage.removeItem('bakwas-cart');
      localStorage.removeItem('bakwas-promo-code');
      localStorage.removeItem('bakwas-promo-data');
      localStorage.removeItem('bakwas-discount');
      localStorage.removeItem('bakwas-shipping-discount');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart and promo code to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('bakwas-cart', JSON.stringify(items));
      if (promoCode) {
        localStorage.setItem('bakwas-promo-code', promoCode);
      } else {
        localStorage.removeItem('bakwas-promo-code');
      }
      if (promoCodeData) {
        localStorage.setItem('bakwas-promo-data', JSON.stringify(promoCodeData));
      } else {
        localStorage.removeItem('bakwas-promo-data');
      }
      localStorage.setItem('bakwas-discount', discount.toString());
      localStorage.setItem('bakwas-shipping-discount', shippingDiscount.toString());
      console.log('Cart and promo data saved to localStorage:', { items, promoCode, discount, shippingDiscount });
    }
  }, [items, isLoaded, promoCode, promoCodeData, discount, shippingDiscount]);

  const addToCart = async (product: Product, selectedSize?: string, selectedColor?: string, quantity?: number) => {
    try {
      // First, fetch the variant from Supabase
      const { data: variant, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id)
        .eq('color', selectedColor)
        .eq('size', selectedSize)
        .single();

      if (error || !variant) {
        toast({
          title: "Variant not found",
          description: "Selected color/size combination is not available for this product.",
          variant: "destructive",
        });
        return;
      }

      // Use the actual variant ID from the database
      const variantId = variant.id;
      const variantImage = (variant.images && variant.images.length > 0) 
        ? variant.images[0] 
        : (product.image || '/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png');
      
      // Create cart item ID using just the variant ID since it's unique
      const cartItemId = variantId;

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
            productId: product.id,
            variantId: variantId, // Use the actual variant ID
            title: product.title,
            price: variant.price || product.price,
            image: variantImage,
            quantity: quantity || 1,
            selectedSize,
            selectedColor
          }];
        }
      });

      setLastAddedImage(variantImage);
      setShowAnimation(true);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      animationTimeoutRef.current = setTimeout(() => {
        setShowAnimation(false);
      }, 1500);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
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

  const calculateShippingCost = (subtotal: number) => {
    // If there's a promo code with free shipping, return 0
    if (shippingDiscount) return 0;
    // Otherwise, use standard shipping logic
    return subtotal > 2000 ? 0 : 50;
  };

  const calculateDiscount = (promoCodeData: PromoCodeData | null, subtotal: number) => {
    if (!promoCodeData) return 0;
    
    if (subtotal < promoCodeData.min_cart_total) {
      return 0;
    }
    
    // Calculate shipping cost to include in discount calculation
    const shippingCost = subtotal > 2000 ? 0 : 50;
    
    if (promoCodeData.discount_type === 'percentage') {
      return Math.min((subtotal * promoCodeData.discount_value) / 100, subtotal);
    } else {
      // For fixed discounts, allow them to cover shipping cost
      const totalWithShipping = subtotal + shippingCost;
      return Math.min(promoCodeData.discount_value, totalWithShipping);
    }
  };

  const applyPromoCode = async (code: string) => {
    try {
      console.log('Attempting to validate promo code:', code);
      
      const { data: validPromoCode, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Promo code validation error:', error);
        toast({
          title: "Invalid promo code",
          description: "Please check your code and try again",
          variant: "destructive",
        });
        return false;
      }

      if (!validPromoCode) {
        console.log('No valid promo code found');
        toast({
          title: "Invalid promo code",
          description: "Please check your code and try again",
          variant: "destructive",
        });
        return false;
      }

      // Check if promo code is within valid date range
      const now = new Date();
      const startDate = validPromoCode.start_date ? new Date(validPromoCode.start_date) : null;
      const endDate = validPromoCode.end_date ? new Date(validPromoCode.end_date) : null;

      if (startDate && now < startDate) {
        toast({
          title: "Promo code not yet active",
          description: `This code will be active from ${startDate.toLocaleDateString()}`,
          variant: "destructive",
        });
        return false;
      }

      if (endDate && now > endDate) {
        toast({
          title: "Promo code expired",
          description: `This code expired on ${endDate.toLocaleDateString()}`,
          variant: "destructive",
        });
        return false;
      }

      // Check usage limit
      if (validPromoCode.usage_limit && validPromoCode.usage_count >= validPromoCode.usage_limit) {
        toast({
          title: "Promo code no longer available",
          description: "This code has reached its usage limit",
          variant: "destructive",
        });
        return false;
      }

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const minCartTotal = validPromoCode.min_cart_total ?? 0;
      
      if (subtotal < minCartTotal) {
        toast({
          title: "Minimum order not met",
          description: `Minimum order of ₹${minCartTotal} required for this promo code`,
          variant: "destructive",
        });
        return false;
      }

      const typedPromoCode: PromoCodeData = {
        id: validPromoCode.id,
        code: validPromoCode.code,
        discount_type: validPromoCode.discount_type,
        discount_value: validPromoCode.discount_value,
        min_cart_total: minCartTotal,
        usage_count: validPromoCode.usage_count ?? 0,
        usage_limit: validPromoCode.usage_limit,
        is_active: validPromoCode.is_active ?? true,
        start_date: validPromoCode.start_date,
        end_date: validPromoCode.end_date,
        created_at: validPromoCode.created_at,
        updated_at: validPromoCode.updated_at,
        free_shipping: validPromoCode.free_shipping ?? false
      };

      const discountAmount = calculateDiscount(typedPromoCode, subtotal);
      setDiscount(discountAmount);
      setPromoCode(code);
      setPromoCodeData(typedPromoCode);
      setShippingDiscount(typedPromoCode.free_shipping);
      
      // Prepare success message
      let discountMessage = `Discount of ₹${discountAmount} applied`;
      if (typedPromoCode.free_shipping) {
        discountMessage += ' and free shipping enabled';
      }
      
      toast({
        title: "Promo code applied",
        description: discountMessage,
      });
      
      return true;
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast({
        title: "Error",
        description: "Failed to apply promo code. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removePromoCode = () => {
    setDiscount(0);
    setPromoCode(null);
    setPromoCodeData(null);
    setShippingDiscount(false);
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    itemCount,
    promoCode,
    promoCodeData,
    discount,
    shippingDiscount,
    applyPromoCode,
    removePromoCode,
    calculateShippingCost
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartAddAnimation isVisible={showAnimation} productImage={lastAddedImage} />
    </CartContext.Provider>
  );
};
