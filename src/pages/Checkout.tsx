import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ShoppingCart, CreditCard, Feather, Send } from 'lucide-react';

const Checkout = () => {
  const { user } = useAuth();
  const { items: cartItems, total: cartTotal, clearCart, promoCode: appliedPromo, discount, applyPromoCode, removePromoCode, calculateShippingCost } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subtotal, setSubtotal] = useState(0);
  const [promoInput, setPromoInput] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    customerNotes: '',
  });

  useEffect(() => {
    // If user info becomes available after component mount, update the form
    if (user && !formData.name) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
      }));
    }
  }, [user, formData.name]);
  
  useEffect(() => {
    setSubtotal(cartTotal);
  }, [cartTotal]);

  const shippingCost = calculateShippingCost(subtotal);
  const total = Math.max(subtotal + shippingCost - discount, 0);

  const handlePromoApply = async () => {
    if (!promoInput.trim()) return;
    await applyPromoCode(promoInput.trim());
    setPromoInput('');
  };

  const handlePromoRemove = () => {
    removePromoCode();
    setPromoInput('');
  };

  const updateFormField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProceedToPayment = async () => {
    const requiredFields: (keyof typeof formData)[] = ['name', 'email', 'phone', 'streetAddress', 'city', 'state', 'postalCode', 'country'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please complete all required fields: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to place an order.", variant: "destructive" });
      navigate('/login?next=/checkout');
      return;
    }

    setIsProcessingPayment(true);
    try {
      // New logic: Store details in localStorage and navigate
      const tempOrderDetails = {
        formData,
        cart: cartItems,
        subtotal,
        discount,
        shipping: shippingCost,
        total,
        promoCode: appliedPromo,
      };

      localStorage.setItem('tempOrderDetails', JSON.stringify(tempOrderDetails));
      navigate('/payment');

    } catch (err: any) {
      console.error('Checkout exception:', err);
      toast({ title: 'Checkout Failed', description: err.message || 'An unexpected error occurred.', variant: 'destructive' });
      setIsProcessingPayment(false); // Ensure button is re-enabled on error
    }
    // No need to set isProcessingPayment to false here as navigation will occur
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative overflow-hidden bg-black text-white font-sans">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-black to-neon-cyan/20 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-neon-pink/10 via-transparent to-neon-orange/10 animate-pulse"></div>

        <div className="relative z-10 p-4 sm:p-6 md:p-8">
          <motion.div className="text-center py-6 sm:py-8" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.img src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" alt="Bakwas Clothing Co." className="w-32 sm:w-40 md:w-48 h-auto mx-auto mb-4 drop-shadow-2xl" animate={{ filter: ['drop-shadow(0 0 20px rgba(0, 225, 255, 0.5))', 'drop-shadow(0 0 30px rgba(139, 92, 246, 0.5))', 'drop-shadow(0 0 20px rgba(0, 225, 255, 0.5))'] }} transition={{ duration: 3, repeat: Infinity }} />
            <motion.h1 className="text-4xl sm:text-6xl md:text-8xl font-anton bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent mb-2" animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }} transition={{ duration: 5, repeat: Infinity }} style={{ backgroundSize: '200% 100%' }}>
              CHECKOUT
            </motion.h1>
            <motion.p className="text-lg sm:text-xl text-white/80 font-space max-w-2xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}>
              Final step to claiming your <span className="text-neon-cyan font-bold">exclusive</span> drop.
            </motion.p>
          </motion.div>

          <div className="max-w-7xl mx-auto mt-8">
            <div className="grid lg:grid-cols-5 gap-8">
              <motion.div className="lg:col-span-3" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
                <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 hover:shadow-neon-purple/30 transition-all duration-500">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-neon-cyan text-2xl font-anton flex items-center gap-3">
                      <CreditCard className="h-8 w-8 text-neon-cyan" />
                      SHIPPING & DELIVERY
                    </CardTitle>
                    <div className="h-1 w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-full"></div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="text-neon-cyan font-space font-semibold text-lg mb-2 block">Full Name *</Label>
                        <Input id="name" value={formData.name} onChange={(e) => updateFormField('name', e.target.value)} className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-cyan rounded-xl h-12 text-lg" placeholder="Your Full Name" required />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-neon-cyan font-space font-semibold text-lg mb-2 block">Email *</Label>
                        <Input id="email" type="email" value={formData.email} className="bg-gray-900/60 text-gray-400 border-2 border-gray-600 rounded-xl h-12 text-lg" placeholder="your.email@example.com" required readOnly />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-neon-cyan font-space font-semibold text-lg mb-2 block">Phone *</Label>
                      <Input id="phone" type="tel" value={formData.phone} onChange={(e) => updateFormField('phone', e.target.value)} className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-cyan rounded-xl h-12 text-lg" placeholder="Your Phone Number" required />
                    </div>
                    <div>
                      <Label htmlFor="streetAddress" className="text-neon-cyan font-space font-semibold text-lg mb-2 block">Street Address *</Label>
                      <Input id="streetAddress" value={formData.streetAddress} onChange={(e) => updateFormField('streetAddress', e.target.value)} className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-cyan rounded-xl h-12 text-lg" placeholder="123 Neon Street" required />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="city" className="text-neon-cyan font-space font-semibold text-lg mb-2 block">City *</Label>
                        <Input id="city" value={formData.city} onChange={(e) => updateFormField('city', e.target.value)} className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-cyan rounded-xl h-12 text-lg" placeholder="Neo-Delhi" required />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-neon-cyan font-space font-semibold text-lg mb-2 block">State / Province *</Label>
                        <Input id="state" value={formData.state} onChange={(e) => updateFormField('state', e.target.value)} className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-cyan rounded-xl h-12 text-lg" placeholder="State" required />
                      </div>
                    </div>
                     <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="postalCode" className="text-neon-cyan font-space font-semibold text-lg mb-2 block">Postal Code *</Label>
                        <Input id="postalCode" value={formData.postalCode} onChange={(e) => updateFormField('postalCode', e.target.value)} className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-cyan rounded-xl h-12 text-lg" placeholder="Postal Code" required />
                      </div>
                      <div>
                        <Label htmlFor="country" className="text-neon-cyan font-space font-semibold text-lg mb-2 block">Country *</Label>
                         <select id="country" value={formData.country} onChange={(e) => updateFormField('country', e.target.value)} className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-cyan transition-all duration-300 rounded-xl h-12 text-lg w-full px-3" required>
                          <option value="India" className="bg-gray-800">India</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="customerNotes" className="text-neon-cyan font-space font-semibold text-lg mb-2 block">Order Notes (Optional)</Label>
                      <Textarea id="customerNotes" value={formData.customerNotes} onChange={(e) => updateFormField('customerNotes', e.target.value)} className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-cyan rounded-xl text-lg resize-none" placeholder="Special instructions for your order..." rows={4} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
                <div className="sticky top-8">
                  <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-purple/30 shadow-2xl shadow-neon-purple/20 hover:shadow-neon-cyan/30 transition-all duration-500">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-neon-purple text-2xl font-anton flex items-center gap-3">
                        <ShoppingCart className="h-8 w-8 text-neon-purple" />
                        ORDER SUMMARY
                      </CardTitle>
                      <div className="h-1 w-full bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-pink rounded-full"></div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="space-y-4 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
                        {cartItems.map(item => (
                          <div key={item.id} className="flex items-center space-x-4">
                            <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover border-2 border-neon-purple/50" />
                            <div className="flex-grow">
                              <p className="font-semibold text-lg">{item.title}</p>
                              <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-4 space-y-2">
                        {appliedPromo ? (
                          <div className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-sm">Promo applied: <span className="font-bold text-neon-cyan">{appliedPromo}</span></p>
                            <button onClick={handlePromoRemove} className="text-xs text-red-400 hover:underline">&times; Remove</button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Input type="text" placeholder="Promo code" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} className="flex-grow bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-cyan rounded-xl h-12 text-lg" />
                            <Button onClick={handlePromoApply} className="bg-neon-cyan text-black font-bold hover:bg-neon-cyan/80 h-12 shrink-0">Apply</Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 border-t border-neon-purple/30 pt-4 text-lg">
                        <div className="flex justify-between text-gray-300"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                        {discount > 0 && <div className="flex justify-between text-neon-cyan"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>}
                        <div className="flex justify-between text-gray-300"><span>Shipping</span><span>₹{shippingCost.toFixed(2)}</span></div>
                        <div className="flex justify-between text-xl font-bold text-white border-t border-neon-purple/50 mt-2 pt-2">
                          <span className="text-2xl">Total</span>
                          <span className="text-3xl font-anton text-neon-cyan">₹{total.toFixed(2)}</span>
                        </div>
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-6">
                        <button onClick={handleProceedToPayment} disabled={isProcessingPayment} className="group relative w-full h-16 text-xl font-anton overflow-hidden rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed">
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-cyan p-[2px] group-hover:from-neon-purple group-hover:via-neon-pink group-hover:to-neon-orange transition-all duration-500"><div className="w-full h-full rounded-[14px] bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div></div>
                          <div className="absolute inset-2 rounded-xl bg-gradient-to-r from-neon-cyan/5 via-transparent to-neon-cyan/5 group-hover:from-neon-purple/10 group-hover:via-neon-pink/5 group-hover:to-neon-orange/10 transition-all duration-500"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          <div className="relative z-10 flex items-center justify-center gap-4 h-full px-8 text-white">
                            {isProcessingPayment ? (
                              <>
                                <motion.div className="w-6 h-6 border-4 border-white/50 border-t-white rounded-full animate-spin" />
                                <span>PROCESSING...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-6 h-6 transition-transform group-hover:rotate-45" />
                                <span>PROCEED TO PAYMENT</span>
                              </>
                            )}
                          </div>
                        </button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Checkout;
