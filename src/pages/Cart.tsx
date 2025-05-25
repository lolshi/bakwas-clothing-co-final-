import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';

const Cart = () => {
  const { items: cartItems, updateQuantity, removeFromCart, total: cartTotal } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const subtotal = cartTotal;
  const shippingCost = subtotal > 2000 ? 0 : 50;
  const total = subtotal - discount + shippingCost;

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
      <Header />
      
      {/* Logo */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
        <img 
          src="/lovable-uploads/760a84ab-66f6-4874-ad3a-c72e1cf8a830.png" 
          alt="Bakwas Clothing Co." 
          className="h-16 md:h-20 w-auto"
        />
      </div>
      
      <main className="container mx-auto px-4 py-8 pt-32">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/shop" className="text-muted-foreground hover:text-foreground">
                Shop
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium">Cart</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="font-anton text-4xl md:text-5xl mb-8 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
          Shopping Cart
        </h1>

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
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <Card key={item.id} className="bg-card/80 backdrop-blur-sm border-border">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-lg hover:text-neon-cyan transition-colors">
                          {item.title}
                        </h3>
                        {item.selectedSize && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Size: {item.selectedSize}
                          </p>
                        )}
                        <p className="text-lg font-bold text-neon-cyan mt-2">
                          ₹{item.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 hover:scale-110 transition-transform"
                            onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 hover:scale-110 transition-transform"
                            onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Line Total */}
                        <p className="font-bold text-lg">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/80"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Continue Shopping */}
              <div className="pt-4">
                <Link 
                  to="/shop" 
                  className="text-neon-cyan hover:text-neon-cyan/80 transition-colors font-medium"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-xl font-anton text-neon-cyan">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Promo Code */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Promo Code</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="focus:border-neon-cyan transition-colors"
                        disabled={isApplyingPromo}
                      />
                      <Button
                        onClick={handlePromoApply}
                        disabled={!promoCode.trim() || isApplyingPromo}
                        className="bg-neon-cyan text-black hover:bg-neon-cyan/80 min-w-[80px]"
                      >
                        {isApplyingPromo ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                  </div>

                  <hr className="border-border" />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-neon-cyan">
                        <span>Discount ({appliedPromo})</span>
                        <span>-₹{discount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
                    </div>

                    <hr className="border-border" />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0}
                    className="w-full py-4 bg-neon-cyan text-black hover:bg-neon-cyan/80 transition-all transform hover:scale-[1.02] text-lg font-bold"
                  >
                    Proceed to Checkout
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Secure checkout powered by Razorpay
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
