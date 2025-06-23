import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';

const Cart = () => {
  const { 
    items: cartItems, 
    updateQuantity, 
    removeFromCart, 
    total: cartTotal,
    promoCode: appliedPromo,
    discount,
    shippingDiscount,
    applyPromoCode,
    removePromoCode,
    calculateShippingCost
  } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [productDataMap, setProductDataMap] = useState<Record<string, { sizes: string[] }>>({});

  const subtotal = cartTotal;
  const shippingCost = calculateShippingCost(subtotal);
  // Calculate final total after all discounts
  const total = Math.max(subtotal + shippingCost - discount, 0);

  // Fetch product data for all cart items
  useEffect(() => {
    const fetchProducts = async () => {
      const ids = Array.from(new Set(cartItems.map(item => item.id.split('-')[0])));
      if (ids.length === 0) return;
      const { data } = await supabase.from('products').select('*').in('id', ids);
      const map: Record<string, { sizes: string[] }> = {};
      (data || []).forEach((product: { id: string; sizes: string[] }) => { map[product.id] = { sizes: product.sizes || [] }; });
      setProductDataMap(map);
    };
    fetchProducts();
  }, [cartItems]);

  const handleQuantityUpdate = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity);
    toast({
      title: "Cart updated",
      description: "Quantity has been updated",
    });
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    });
  };

  const handlePromoApply = async () => {
    if (!promoCode.trim()) return;
    
    setIsApplyingPromo(true);
    
    try {
      const success = await applyPromoCode(promoCode.trim());
      if (success) {
        setPromoCode(''); // Clear input on success
      }
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handlePromoRemove = () => {
    removePromoCode();
    setPromoCode('');
  };

  const handleCheckout = () => {
    // Fire GTM event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'INR',
        value: total,
        items: cartItems.map(item => ({
          item_id: item.id,
          item_name: item.title,
          quantity: item.quantity,
          price: item.price,
        })),
      });
    }

    navigate('/checkout');
  };

  // Update size handler
  const updateSize = (cartItemId: string, newSize: string) => {
    if (!cartItems || cartItems.length === 0) return;
    // Use a workaround: copy cartItems, update, and call updateQuantity to force re-render
    const item = cartItems.find((i: any) => i.id === cartItemId);
    if (!item) return;
    const baseId = cartItemId.split('-')[0];
    const newId = `${baseId}-${newSize || 'no-size'}-${item.selectedColor || 'no-color'}`;
    // Remove old item, add new (merge if needed)
    let filtered = cartItems.filter((i: any) => i.id !== cartItemId);
    const existing = filtered.find((i: any) => i.id === newId);
    if (existing) {
      // Merge quantities
      filtered = filtered.map((i: any) => i.id === newId ? { ...i, quantity: i.quantity + item.quantity } : i);
    } else {
      filtered = [...filtered, { ...item, id: newId, selectedSize: newSize }];
    }
    // Save to localStorage and force update
    localStorage.setItem('bakwas-cart', JSON.stringify(filtered));
    window.location.reload(); // Quick workaround to force re-render
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Multiple animated gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-black to-neon-cyan/20 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-neon-pink/10 via-transparent to-neon-orange/10 animate-pulse"></div>
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-neon-cyan/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
      {/* Content */}
      <div className="relative z-10 p-4 sm:p-6 md:p-8">
        {/* Hero Section */}
        <motion.div 
          className="text-center py-6 sm:py-8 md:py-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.img 
            src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
            alt="Bakwas Clothing Co." 
            className="w-32 sm:w-40 md:w-48 h-auto mx-auto mb-4 sm:mb-6 md:mb-8 drop-shadow-2xl"
            animate={{ 
              filter: [
                'drop-shadow(0 0 20px rgba(0, 225, 255, 0.5))',
                'drop-shadow(0 0 30px rgba(139, 92, 246, 0.5))',
                'drop-shadow(0 0 20px rgba(0, 225, 255, 0.5))'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.h1 
            className="text-4xl sm:text-6xl md:text-8xl font-anton bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ backgroundSize: '200% 100%' }}
          >
            YOUR SHOPPING CART
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-white/80 font-space max-w-2xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Your curated streetwear collection awaits checkout.
          </motion.p>
        </motion.div>
        <div className="max-w-7xl mx-auto">
          {cartItems.length === 0 ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-neon-cyan" />
              <h2 className="font-anton text-2xl mb-4 text-white">Your cart is empty</h2>
              <p className="text-white/60 mb-8">Looks like you haven't added anything to your cart yet</p>
              <Link to="/shop">
                <Button
                  className="group relative w-full sm:w-auto h-12 sm:h-14 text-base sm:text-lg font-anton overflow-hidden rounded-xl sm:rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-neon-purple via-neon-pink to-neon-orange p-[2px] group-hover:from-neon-cyan group-hover:via-neon-purple group-hover:to-neon-pink transition-all duration-500"></div>
                  <div className="relative flex items-center justify-center gap-2 px-6 sm:px-8 py-2 sm:py-3 font-semibold text-white">
                    Continue Shopping
                  </div>
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items Section */}
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-2 space-y-4"
              >
                <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 hover:shadow-neon-purple/30 transition-all duration-500">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-neon-cyan text-2xl sm:text-3xl font-anton flex items-center gap-2 sm:gap-3">
                      Cart Items
                    </CardTitle>
                    <div className="h-1 w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-full"></div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex bg-white/5 backdrop-blur-lg rounded-xl p-4 gap-4 items-center shadow-lg border border-white/10 hover:border-neon-cyan/30 transition-all duration-300"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-lg mb-2">{item.title}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-white/60">
                            <div className="flex items-center gap-2">
                              {productDataMap[item.id.split('-')[0]]?.sizes.length > 1 ? (
                                <select
                                  value={item.selectedSize}
                                  onChange={e => updateSize(item.id, e.target.value)}
                                  className="bg-white/10 border border-white/20 rounded-lg text-white px-3 py-1"
                                >
                                  {productDataMap[item.id.split('-')[0]].sizes.map((size: string) => (
                                    <option key={size} value={size}>{size}</option>
                                  ))}
                                </select>
                              ) : (
                                <span>Size: {item.selectedSize}</span>
                              )}
                            </div>
                            {item.selectedColor && (
                              <div className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full border border-white/20" style={{ background: item.selectedColor }} />
                                <span>{item.selectedColor}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg bg-white/10 border-white/20 hover:bg-white/20"
                                onClick={() => handleQuantityUpdate(item.id, Math.max(1, item.quantity - 1))}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="text-white min-w-[2rem] text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg bg-white/10 border-white/20 hover:bg-white/20"
                                onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-white font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
              {/* Summary Section */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-1"
              >
                <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 hover:shadow-neon-purple/30 transition-all duration-500 sticky top-4">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-neon-cyan text-2xl sm:text-3xl font-anton flex items-center gap-2 sm:gap-3">
                      Order Summary
                    </CardTitle>
                    <div className="h-1 w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-full"></div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Promo Code Section */}
                    {!appliedPromo && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Enter promo code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                          />
                          <Button
                            onClick={handlePromoApply}
                            disabled={isApplyingPromo || !promoCode.trim()}
                            className="group relative overflow-hidden rounded-xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02] min-w-[100px]"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-purple via-neon-pink to-neon-orange p-[2px] group-hover:from-neon-cyan group-hover:via-neon-purple group-hover:to-neon-pink transition-all duration-500"></div>
                            <div className="relative flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white">
                              {isApplyingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                            </div>
                          </Button>
                        </div>
                      </div>
                    )}
                    {/* Applied Promo */}
                    {appliedPromo && (
                      <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                        <span className="text-white">Code: {appliedPromo}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handlePromoRemove}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                    {/* Price Breakdown */}
                    <div className="space-y-3 text-white/80">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>₹{shippingCost.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-neon-cyan">
                          <span>Discount</span>
                          <span>-₹{discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-white/10 pt-3 flex justify-between font-semibold text-white text-lg">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                    {/* Checkout Button */}
                    <Button
                      onClick={handleCheckout}
                      className="w-full group relative h-14 overflow-hidden rounded-xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-purple via-neon-pink to-neon-orange p-[2px] group-hover:from-neon-cyan group-hover:via-neon-purple group-hover:to-neon-pink transition-all duration-500"></div>
                      <div className="relative flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white text-lg">
                        Proceed to Checkout
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
