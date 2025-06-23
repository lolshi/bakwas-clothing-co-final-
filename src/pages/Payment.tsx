import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RAZORPAY_CONFIG } from '@/config/razorpay';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Wallet } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

interface OrderData {
  formData: any;
  cart: any[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

const Payment = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    try {
      const data = localStorage.getItem('tempOrderDetails');
      if (!data) {
        toast({ title: 'Error', description: 'Order details not found. Redirecting to checkout.', variant: 'destructive' });
        navigate('/checkout');
        return;
      }
      setOrderData(JSON.parse(data));
    } catch (error) {
      toast({ title: 'Error', description: 'Could not parse order details.', variant: 'destructive' });
      navigate('/checkout');
    }
  }, [navigate, toast]);

  // Warm up backend on mount
  useEffect(() => {
    fetch('https://bakwas-api.onrender.com/health').catch(() => {});
  }, []);

  // Robust Razorpay script loading
  useEffect(() => {
    function checkRazorpayReady() {
      if (window.Razorpay) {
        setIsScriptLoaded(true);
      } else {
        setTimeout(checkRazorpayReady, 100);
      }
    }
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement('script');
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = checkRazorpayReady;
      document.body.appendChild(script);
      return () => {
        // Check if the script is still in the body before trying to remove
        const scriptElement = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (scriptElement && document.body.contains(scriptElement)) {
          document.body.removeChild(scriptElement);
        }
      };
    } else {
      checkRazorpayReady();
    }
  }, []);

  const createOrderInDatabase = async (paymentMethod: 'razorpay' | 'cod', paymentDetails: any = null) => {
    try {
      if (!orderData || !user) {
        toast({ title: 'Critical Error', description: 'Order data or user session is missing.', variant: 'destructive' });
        return null;
      }

      const { formData, cart, subtotal, discount, shipping, total } = orderData;
      const orderNumber = `ORD-${formData.name.substring(0, 3).toUpperCase()}-${Date.now()}`;
      const orderPayload = {
        user_id: user.id,
        order_number: orderNumber,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: {
          street_address: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          country: formData.country || 'India',
        },
        subtotal: subtotal,
        discount_amount: discount,
        shipping_cost: shipping,
        total_amount: total,
        payment_status: paymentMethod === 'razorpay' ? 'paid' : 'cod',
        status: 'confirmed',
        payment_details: paymentDetails,
      };

      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError || !newOrder) {
        console.error('Order insert error:', orderError);
        if (orderError) {
          console.error('Order error details:', orderError.details);
          console.error('Order error hint:', orderError.hint);
          console.error('Order error code:', orderError.code);
        }
        console.error('Order insert payload:', orderPayload);
        toast({ title: 'Database Error', description: `Failed to create order: ${orderError?.message}`, variant: 'destructive' });
        return null;
      }

      // Build order items payload with strict UUID validation
      const orderItemsPayload = cart
        .map((item: any) => {
          const isValidUUID = (id: string) => typeof id === 'string' && id.length === 36 && (id.match(/-/g) || []).length === 4;
          if (!isValidUUID(item.productId) || !isValidUUID(item.variantId)) {
            console.error('Invalid UUID in cart item:', item);
            return null;
          }
          return {
            order_id: newOrder.id,
            product_id: item.productId,
            product_name: item.title,
            product_image: item.image,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
            variant_id: item.variantId,
          };
        })
        .filter(Boolean);

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);

      if (itemsError) {
        console.error('Order items insert error:', itemsError);
        if (itemsError) {
          console.error('Order items error details:', itemsError.details);
          console.error('Order items error hint:', itemsError.hint);
          console.error('Order items error code:', itemsError.code);
        }
        console.error('Order items insert payload:', orderItemsPayload);
        toast({ title: 'Database Error', description: `Failed to add order items: ${itemsError.message}`, variant: 'destructive' });
        await supabase.from('orders').delete().eq('id', newOrder.id);
        return null;
      }

      clearCart();
      localStorage.removeItem('tempOrderDetails');
      return newOrder;
    } catch (err) {
      console.error('UNCAUGHT ERROR in createOrderInDatabase:', err);
      toast({ title: 'Critical Error', description: String(err), variant: 'destructive' });
      return null;
    }
  };

  const handleRazorpay = async () => {
    setIsProcessing(true);
    if (!isScriptLoaded || typeof window.Razorpay === 'undefined' || !orderData) {
      toast({
        title: 'Payment Gateway Not Ready',
        description: 'Please wait a moment and try again, or refresh the page.',
        variant: 'destructive',
      });
      setIsProcessing(false);
      return;
    }

    let razorpay_order_id = '';
    try {
      // Always use the Render backend URL for Razorpay order creation
      const backendUrl = 'https://bakwas-api.onrender.com/api/create-razorpay-order';

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(orderData.total * 100),
          currency: 'INR',
          receipt: `receipt_user_${Date.now()}`,
        }),
      });
      
      const data = await response.json();
      if (!response.ok || !data.id) {
        toast({ title: 'Razorpay Error', description: data.error || 'Failed to create Razorpay order', variant: 'destructive' });
        setIsProcessing(false);
        return;
      }
      razorpay_order_id = data.id;

      // Insert into razorpay_orders staging table
      const { error: stagingError } = await supabase.from('razorpay_orders').insert({
        razorpay_order_id: razorpay_order_id,
        amount: Math.round(orderData.total * 100),
        currency: 'INR',
        status: 'created',
        order_id: null, // No official order ID yet
        payment_response: { temp_order_details: orderData }, // Store temporary data here
      });

      if(stagingError) {
        toast({ title: 'Staging Error', description: `Could not log payment attempt: ${stagingError.message}`, variant: 'destructive' });
        setIsProcessing(false);
        return;
      }

    } catch (err) {
      toast({ title: 'Razorpay Error', description: String(err), variant: 'destructive' });
      setIsProcessing(false);
      return;
    }

    document.body.style.overflow = 'hidden';
    const options = {
      key: RAZORPAY_CONFIG.key_id,
      amount: orderData.total * 100,
      currency: 'INR',
      name: 'Bakwas Clothing Co.',
      description: 'Trippy Streetwear & Psychedelic Fashion',
      order_id: razorpay_order_id,
      handler: async (response: any) => {
        document.body.style.overflow = '';
        setIsProcessing(true); // Re-set processing for DB operations
        
        const newOrder = await createOrderInDatabase('razorpay', response);

        if (newOrder) {
          // Update the staging table with success and the new order_id
          console.log('Updating razorpay_orders:', {
            status: 'success',
            order_id: newOrder.id,
            payment_response: response,
            razorpay_order_id: razorpay_order_id
          });
          await supabase
            .from('razorpay_orders')
            .update({ 
              status: 'success', 
              order_id: newOrder.id,
              payment_response: response, // Overwrite temp data with actual response
            })
            .eq('razorpay_order_id', razorpay_order_id);
          
          toast({ title: 'Payment Successful!', description: 'Order placed.' });
          navigate(`/order-success/${newOrder.order_number}`);
        } else {
          toast({ title: 'Order Creation Failed', description: 'Your payment was successful but we failed to create your order. Please contact support.', variant: 'destructive' });
        }
        setIsProcessing(false);
      },
      prefill: {
        name: orderData.formData.name,
        email: orderData.formData.email,
        contact: orderData.formData.phone,
      },
      theme: { color: '#6366f1' },
      modal: {
        ondismiss: async () => {
          document.body.style.overflow = '';
          // Update staging table to reflect cancellation
          await supabase
            .from('razorpay_orders')
            .update({ status: 'cancelled' })
            .eq('razorpay_order_id', razorpay_order_id);

          toast({ title: 'Payment Cancelled', description: 'You have cancelled the payment.', variant: 'destructive' });
          setIsProcessing(false);
        },
      },
    };
    
    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast({ title: 'Razorpay Error', description: String(err), variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  const handleCash = async () => {
    setIsProcessing(true);
    const newOrder = await createOrderInDatabase('cod');
    if(newOrder) {
      toast({ title: 'Order Placed!', description: 'You can pay on delivery.' });
      navigate(`/order-success/${newOrder.order_number}`);
    } else {
      toast({ title: 'Order Failed', description: 'Could not place your order. Please try again.', variant: 'destructive' });
    }
    setIsProcessing(false);
  };

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading order details...</div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-black to-neon-cyan/20 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-neon-pink/10 via-transparent to-neon-orange/10 animate-pulse"></div>
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-neon-cyan/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>
      {/* Content */}
      <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-screen">
        <Card className="max-w-4xl w-full bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 hover:shadow-neon-purple/30 transition-all duration-500 mx-auto">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-neon-cyan text-2xl sm:text-3xl font-anton flex items-center gap-2 sm:gap-3">
              Complete Your Payment
            </CardTitle>
            <div className="h-1 w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-full"></div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Left Column: Details */}
            <div className="space-y-4">
              {/* Customer Info */}
              <Card className="border-neon-purple/40 shadow-neon-purple/20 bg-black/60">
                <CardHeader className="pb-2"><CardTitle className="text-neon-purple text-lg font-anton">Customer Information</CardTitle></CardHeader>
                <CardContent className="text-white text-sm space-y-1">
                  <div>Name: {orderData.formData.name}</div>
                  <div>Email: {orderData.formData.email}</div>
                  <div>Phone: {orderData.formData.phone}</div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="border-neon-pink/40 shadow-neon-pink/20 bg-black/60">
                <CardHeader className="pb-2"><CardTitle className="text-neon-pink text-lg font-anton">Shipping Address</CardTitle></CardHeader>
                <CardContent className="text-white text-sm space-y-1">
                  <div>{orderData.formData.streetAddress}</div>
                  <div>{orderData.formData.city}, {orderData.formData.state} {orderData.formData.postalCode}</div>
                  <div>{orderData.formData.country}</div>
                </CardContent>
              </Card>

              {/* Product List */}
              <Card className="border-neon-orange/40 shadow-neon-orange/20 bg-black/60">
                <CardHeader className="pb-2"><CardTitle className="text-neon-orange text-lg font-anton">Products</CardTitle></CardHeader>
                <CardContent className="text-white text-sm">
                  <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {orderData.cart.map((item: any) => (
                      <li key={item.id} className="flex items-center gap-3">
                        <img src={item.image} alt={item.title} className="w-12 h-14 rounded object-cover border border-neon-cyan/40" />
                        <div className="flex-grow">
                          <span>{item.title} &times;{item.quantity}</span>
                          <div className="text-xs flex items-center gap-3 text-gray-300 mt-1">
                            <span>Size: {item.selectedSize || '-'}</span>
                            <span className="flex items-center gap-1.5">
                              Color:
                              {item.selectedColor ? (
                                <span
                                  title={item.selectedColor}
                                  className="inline-block w-4 h-4 rounded-full border border-white/50"
                                  style={{ backgroundColor: item.selectedColor }}
                                />
                              ) : <span>-</span>}
                            </span>
                          </div>
                        </div>
                        <span className="ml-auto font-semibold text-base">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Payment */}
            <div className="space-y-4">
               {/* Totals */}
              <Card className="border-neon-cyan/40 shadow-neon-cyan/20 bg-black/60">
                <CardHeader className="pb-2"><CardTitle className="text-neon-cyan text-lg font-anton">Order Total</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-white">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{orderData.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-green-400"><span>Discount</span><span>- ₹{orderData.discount.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>₹{orderData.shipping.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-xl border-t border-neon-cyan/30 mt-2 pt-2">
                    <span>Total</span>
                    <span>₹{orderData.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method Selection */}
              <Card className="border-neon-purple/40 shadow-neon-purple/20 bg-black/60">
                 <CardHeader className="pb-2"><CardTitle className="text-neon-purple text-lg font-anton">Payment Method</CardTitle></CardHeader>
                 <CardContent className="space-y-3">
                    <div 
                      onClick={() => setSelectedPaymentMethod('Razorpay')}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 flex items-center justify-between ${selectedPaymentMethod === 'Razorpay' ? 'border-neon-cyan bg-black/80 text-neon-cyan shadow-neon-cyan/30' : 'border-gray-700 bg-black/40 text-white hover:border-neon-cyan/60'}`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6" />
                        <div>
                          <p className="font-bold">Pay with Razorpay</p>
                          <p className="text-xs text-gray-400">Cards, UPI, Wallets</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${selectedPaymentMethod === 'Razorpay' ? 'bg-neon-cyan border-neon-cyan' : 'border-gray-500'}`} />
                    </div>

                    <div 
                      onClick={() => setSelectedPaymentMethod('Cash')}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 flex items-center justify-between ${selectedPaymentMethod === 'Cash' ? 'border-neon-orange bg-black/80 text-neon-orange shadow-neon-orange/30' : 'border-gray-700 bg-black/40 text-white hover:border-neon-orange/60'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Wallet className="w-6 h-6" />
                        <div>
                          <p className="font-bold">Cash on Delivery</p>
                          <p className="text-xs text-gray-400">Pay at your doorstep</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${selectedPaymentMethod === 'Cash' ? 'bg-neon-orange border-neon-orange' : 'border-gray-500'}`} />
                    </div>
                 </CardContent>
              </Card>
              
              <Button
                onClick={selectedPaymentMethod === 'Razorpay' ? handleRazorpay : handleCash}
                className="w-full font-bold text-lg py-4 bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-pink hover:to-neon-purple transition-all duration-300 transform hover:scale-105 rounded-xl text-black shadow-lg"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Proceed with ${selectedPaymentMethod}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment; 