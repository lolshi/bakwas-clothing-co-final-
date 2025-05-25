
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface CartItem {
  id: string;
  title: string;
  slug: string;
  variant: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Mock cart data - in real app, this would come from cart context/API
    const mockCartItems: CartItem[] = [
      {
        id: '1',
        title: 'Classic Hoodie',
        slug: 'classic-hoodie',
        variant: 'Black - M',
        size: 'M',
        color: 'Black',
        quantity: 1,
        price: 2499,
        image: '/lovable-uploads/aae6428d-9a3d-4b45-87c4-900c7fe5558e.png'
      },
      {
        id: '2',
        title: 'Streetwear Tee',
        slug: 'streetwear-tee',
        variant: 'White - L',
        size: 'L',
        color: 'White',
        quantity: 2,
        price: 1299,
        image: '/lovable-uploads/f28f3d2a-8930-4520-9cc7-8de233beae5c.png'
      }
    ];
    
    setCartItems(mockCartItems);
    setIsLoading(false);
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal > 2000 ? 0 : 50;
  const total = subtotal - discount + shippingCost;

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );

    // Fire GTM event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'update_cart', {
        currency: 'INR',
        value: total,
      });
    }

    toast({
      title: "Cart updated",
      description: "Quantity has been updated",
    });
  };

  const removeItem = (id: string) => {
    const item = cartItems.find(item => item.id === id);
    
    setCartItems(items => items.filter(item => item.id !== id));

    // Fire GTM event
    if (typeof window !== 'undefined' && window.gtag && item) {
      window.gtag('event', 'remove_from_cart', {
        currency: 'INR',
        value: item.price * item.quantity,
        items: [{
          item_id: item.id,
          item_name: item.title,
          quantity: item.quantity,
          price: item.price,
        }],
      });
    }

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
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
                <Card key={item.id} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                      />
                      
                      <div className="flex-1">
                        <Link 
                          to={`/product/${item.slug}`}
                          className="font-medium text-lg hover:text-neon-cyan transition-colors"
                        >
                          {item.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.variant}
                        </p>
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
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
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
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                          onClick={() => removeItem(item.id)}
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
              <Card className="bg-card border-border shadow-2xl">
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
