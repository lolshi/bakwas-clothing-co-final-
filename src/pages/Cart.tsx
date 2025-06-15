import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';

const Cart = () => {
  const { items: cartItems, updateQuantity, removeFromCart, total: cartTotal } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [productDataMap, setProductDataMap] = useState<Record<string, { sizes: string[] }>>({});

  const subtotal = cartTotal;
  const shippingCost = subtotal > 2000 ? 0 : 50;
  const total = subtotal - discount + shippingCost;

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
      // Mock promo validation - in real app, this would be an API call
      const promoDiscounts: { [key: string]: number } = {
        'SAVE10': subtotal * 0.1,
        'WELCOME20': subtotal * 0.2,
        'FIRSTORDER': 500
      };

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      if (promoDiscounts[promoCode.toUpperCase()]) {
        setDiscount(promoDiscounts[promoCode.toUpperCase()]);
        setAppliedPromo(promoCode.toUpperCase());
        toast({
          title: "Promo code applied!",
          description: `₹${promoDiscounts[promoCode.toUpperCase()]} discount applied`,
        });
      } else {
        toast({
          title: "Invalid promo code",
          description: "Please check your code and try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error applying promo code",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsApplyingPromo(false);
    }
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
    <div 
      className="min-h-screen bg-background relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/lovable-uploads/dd9a56c9-3774-432e-930e-da9a0dbac0f3.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Logo and Heading - mobile responsive */}
      <div className="flex flex-col items-center gap-2 mb-4 md:flex-row md:items-end md:gap-4">
        <img 
          src="/images-videos-logo/d5018b9a-2aba-4a8d-b876-4dff468b69d8.png" 
          alt="Bakwas Clothing Co." 
          className="h-16 w-auto md:h-32 lg:h-40 xl:h-48"
        />
        <span className="font-anton text-2xl md:text-4xl text-white tracking-widest drop-shadow mt-2 md:mt-0">SHOPPING CART</span>
      </div>
      <div className="accent-line mt-2 h-1 w-24 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full"></div>
      <p className="hero-subtext mt-2 text-base md:text-lg text-gray-200/75 leading-relaxed text-left mb-8">
        Your curated streetwear collection awaits checkout.
      </p>

      {cartItems.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16">
          <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
          <h2 className="font-anton text-2xl mb-4 text-muted-foreground">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added anything to your cart yet
          </p>
          <Button asChild className="bg-neon-cyan text-black hover:bg-neon-cyan/80">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="cart-container mx-auto px-6 md:px-12 py-12 max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left (col-span-2): Cart items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex bg-white/10 rounded-2xl p-4 gap-4 items-center shadow-md w-full max-w-full flex-wrap md:flex-nowrap">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="font-semibold text-white text-base line-clamp-2 break-words">
                    {item.title}
                  </div>
                  <div className="flex items-center gap-2">
                    {productDataMap[item.id.split('-')[0]]?.sizes.length > 1 ? (
                      <select
                        value={item.selectedSize}
                        onChange={e => updateSize(item.id, e.target.value)}
                        className="rounded bg-white/10 text-white px-2 py-1 text-xs"
                      >
                        {productDataMap[item.id.split('-')[0]].sizes.map((size: string) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-gray-300">Size: {item.selectedSize}</span>
                    )}
                    {item.selectedColor && (
                      <span className="flex items-center gap-1 text-xs text-gray-300">
                        <span className="inline-block w-3 h-3 rounded-full border border-white/20" style={{ background: item.selectedColor }} />
                        {item.selectedColor}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition disabled:opacity-50 disabled:cursor-not-allowed text-white"
                    >
                      –
                    </button>
                    <span className="text-white font-semibold min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 ml-2 gap-2">
                  <p className="text-lg font-anton text-neon-cyan font-bold whitespace-nowrap">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>
            ))}

            {/* Continue Shopping Link */}
            <div className="flex justify-center mt-4">
              <Link 
                to="/shop" 
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur border border-white/20 text-white font-medium shadow hover:bg-neon-cyan/10 hover:text-neon-cyan transition"
              >
                <ShoppingBag className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Right (col-span-1): Order summary */}
          <div className="order-summary bg-white/10 backdrop-blur-md rounded-2xl p-6 pb-8 space-y-6 shadow-lg lg:sticky lg:top-8 lg:self-start">
            <h2 className="text-2xl font-space font-semibold text-white">Order Summary</h2>
            
            {/* Promo Code */}
            <div className="promo">
              <label className="text-sm text-gray-300 mb-1 block">Promo Code</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={isApplyingPromo}
                  className="w-full bg-transparent border border-gray-600 rounded-lg py-2 px-4 pr-24 text-white focus:outline-none focus:border-neon-cyan transition-colors placeholder-gray-400"
                />
                <button
                  onClick={handlePromoApply}
                  disabled={!promoCode.trim() || isApplyingPromo}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '6px',
                    transform: 'translateY(-50%)',
                    background: 'linear-gradient(to right, #00F0FF, #FF00D4, #FFA500)',
                    color: '#ffffff',
                    fontWeight: '600',
                    borderRadius: '9999px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: (!promoCode.trim() || isApplyingPromo) ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!(!promoCode.trim() || isApplyingPromo)) {
                      e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                      e.currentTarget.style.opacity = '0.95';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(!promoCode.trim() || isApplyingPromo)) {
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                      e.currentTarget.style.opacity = '1';
                    }
                  }}
                >
                  {isApplyingPromo ? (
                    <Loader2 style={{ width: '16px', height: '16px', color: '#ffffff' }} className="animate-spin" />
                  ) : (
                    <span style={{ color: '#ffffff' }}>Apply</span>
                  )}
                </button>
              </div>
            </div>

            {/* Totals */}
            <div className="totals space-y-2 text-right">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-neon-cyan">
                  <span>Discount ({appliedPromo})</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
              </div>
              
              <hr className="border-gray-600"/>
              
              <div className="flex justify-between text-white font-semibold text-lg">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className="w-full py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-3xl shadow-inner hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
            </button>
            
            <p className="text-xs text-gray-500 text-center">Secure checkout powered by Razorpay</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
