import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RAZORPAY_CONFIG } from '@/config/razorpay';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Wallet } from 'lucide-react';

const Payment = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderItemsLoading, setOrderItemsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { orderNumber } = useParams();

  // Fetch order from Supabase using orderNumber
  useEffect(() => {
    if (!orderNumber) {
      navigate('/checkout');
      return;
    }
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();
      if (error || !data) {
        toast({ title: 'Order Not Found', description: 'Please try again.', variant: 'destructive' });
        navigate('/checkout');
        return;
      }
      setOrder(data);
      // Fetch order items for this order
      setOrderItemsLoading(true);
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', data.id);
      if (itemsError) {
        toast({ title: 'Order Items Not Found', description: itemsError.message, variant: 'destructive' });
        setOrderItems([]);
        setOrderItemsLoading(false);
        return;
      }
      // Fetch product variants for all unique variant_ids
      const variantIds = Array.from(new Set((items || []).map((item: any) => item.variant_id).filter(Boolean)));
      let variantsMap: Record<string, { size: string; color: string }> = {};
      if (variantIds.length > 0) {
        const { data: variants, error: variantsError } = await supabase
          .from('product_variants')
          .select('id, size, color')
          .in('id', variantIds);
        if (!variantsError && variants) {
          variantsMap = variants.reduce((acc: any, v: any) => {
            acc[v.id] = { size: v.size, color: v.color };
            return acc;
          }, {});
        }
      }
      // Attach size/color to each order item
      const itemsWithVariant = (items || []).map((item: any) => {
        if (item.variant_id && variantsMap[item.variant_id]) {
          return { ...item, size: variantsMap[item.variant_id].size, color: variantsMap[item.variant_id].color };
        }
        return { ...item };
      });
      setOrderItems(itemsWithVariant);
      setOrderItemsLoading(false);
    };
    fetchOrder();
  }, [orderNumber, navigate, toast]);

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
        document.body.removeChild(script);
      };
    } else {
      checkRazorpayReady();
    }
  }, []);

  const handleRazorpay = async () => {
    setIsProcessing(true);
    console.log('[Razorpay] handleRazorpay called');
    console.log('[Razorpay] isScriptLoaded:', isScriptLoaded, 'window.Razorpay:', typeof window.Razorpay);
    console.log('[Razorpay] order:', order);
    if (!isScriptLoaded || typeof window.Razorpay === 'undefined') {
      toast({
        title: 'Payment Gateway Not Ready',
        description: 'Please wait a moment and try again, or refresh the page.',
        variant: 'destructive',
      });
      setIsProcessing(false);
      return;
    }
    document.body.style.overflow = 'hidden';
    // Fetch Razorpay order_id from backend for this order
    let order_id = '';
    try {
      const response = await fetch('http://localhost:8000/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(order.total_amount * 100),
          currency: 'INR',
          receipt: order.order_number,
        }),
      });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const rawText = await response.text();
        console.error('[Razorpay] Backend did not return JSON. Raw response:', rawText);
        toast({ title: 'Razorpay Error', description: 'Backend did not return JSON. Check server logs and network tab.', variant: 'destructive' });
        setIsProcessing(false);
        document.body.style.overflow = '';
        return;
      }
      const data = await response.json();
      if (!response.ok || !data.id) {
        console.error('[Razorpay] Backend error or missing order_id. Response:', data);
        toast({ title: 'Razorpay Error', description: data.error || 'Failed to create Razorpay order', variant: 'destructive' });
        setIsProcessing(false);
        document.body.style.overflow = '';
        return;
      }
      order_id = data.id;
      console.log('[Razorpay] Received order_id from backend:', order_id);
    } catch (err) {
      console.error('[Razorpay] Error fetching order_id:', err);
      toast({ title: 'Razorpay Error', description: String(err), variant: 'destructive' });
      setIsProcessing(false);
      document.body.style.overflow = '';
      return;
    }
    const options = {
      key: RAZORPAY_CONFIG.key_id,
      amount: order.total_amount * 100,
      currency: 'INR',
      name: 'Bakwas Clothing Co.',
      description: 'Trippy Streetwear & Psychedelic Fashion',
      order_id,
      handler: async (response: any) => {
        document.body.style.overflow = '';
        console.log('[Razorpay] Payment handler called. Response:', response);
        // TODO: Verify payment and update order in Supabase
        toast({ title: 'Payment Successful!', description: 'Order placed.' });
        navigate('/order-success/' + order.order_number);
      },
      prefill: {
        name: order.customer_name,
        email: order.customer_email,
        contact: order.customer_phone,
      },
      theme: { color: '#6366f1' },
      modal: {
        ondismiss: () => {
          document.body.style.overflow = '';
          console.log('[Razorpay] Modal dismissed by user');
          toast({ title: 'Payment Cancelled', description: 'You have cancelled the payment.', variant: 'destructive' });
          setIsProcessing(false);
        },
      },
    };
    console.log('[Razorpay] options:', options);
    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
      console.log('[Razorpay] Razorpay modal opened');
    } catch (err) {
      console.error('[Razorpay] Error opening Razorpay modal:', err);
      toast({ title: 'Razorpay Error', description: String(err), variant: 'destructive' });
    }
    setIsProcessing(false);
  };

  const handleCash = async () => {
    setIsProcessing(true);
    // Update order as COD in Supabase
    const { error } = await supabase
      .from('orders')
      .update({ payment_method: 'cod', payment_status: 'cod', status: 'confirmed' })
      .eq('order_number', order.order_number);
    if (error) {
      toast({ title: 'Order Update Failed', description: error.message, variant: 'destructive' });
      setIsProcessing(false);
      return;
    }
    toast({ title: 'Order Placed!', description: 'You can pay on delivery.' });
    navigate('/order-success/' + order.order_number);
    setIsProcessing(false);
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading order...</div>
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
        <Card className="max-w-2xl w-full bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 hover:shadow-neon-purple/30 transition-all duration-500 mx-auto">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-neon-cyan text-2xl sm:text-3xl font-anton flex items-center gap-2 sm:gap-3">
              Complete Your Payment
            </CardTitle>
            <div className="h-1 w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-full"></div>
          </CardHeader>
          <CardContent>
            {/* Order summary */}
            <Card className="mb-4 border-neon-cyan/40 shadow-neon-cyan/20 bg-black/60">
              <CardHeader className="pb-2"><CardTitle className="text-neon-cyan text-lg font-anton">Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-white text-sm">
                <div>Order Number: <span className="font-mono">{orderNumber}</span></div>
                <div>Total: <span className="font-bold">₹{order.total_amount}</span></div>
                <div>Shipping: ₹{order.shipping_cost}</div>
                <div>Discount: ₹{order.discount_amount}</div>
                <div>Subtotal: ₹{order.subtotal}</div>
              </CardContent>
            </Card>
            {/* Customer Info */}
            <Card className="mb-4 border-neon-purple/40 shadow-neon-purple/20 bg-black/60">
              <CardHeader className="pb-2"><CardTitle className="text-neon-purple text-lg font-anton">Customer Information</CardTitle></CardHeader>
              <CardContent className="text-white text-sm space-y-1">
                <div>Name: {order.customer_name}</div>
                <div>Email: {order.customer_email}</div>
                <div>Phone: {order.customer_phone}</div>
              </CardContent>
            </Card>
            {/* Shipping Address */}
            <Card className="mb-4 border-neon-pink/40 shadow-neon-pink/20 bg-black/60">
              <CardHeader className="pb-2"><CardTitle className="text-neon-pink text-lg font-anton">Shipping Address</CardTitle></CardHeader>
              <CardContent className="text-white text-sm space-y-1">
                <div>{order.shipping_address.streetAddress}</div>
                <div>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postalCode}</div>
                <div>{order.shipping_address.country}</div>
              </CardContent>
            </Card>
            {/* Product List */}
            <Card className="mb-4 border-neon-orange/40 shadow-neon-orange/20 bg-black/60">
              <CardHeader className="pb-2"><CardTitle className="text-neon-orange text-lg font-anton">Products</CardTitle></CardHeader>
              <CardContent className="text-white text-sm">
                {orderItemsLoading ? (
                  <div>Loading products...</div>
                ) : orderItems.length === 0 ? (
                  <div>No products found for this order.</div>
                ) : (
                  <ul className="space-y-2">
                    {orderItems.map((item: any) => (
                      <li key={item.id} className="flex items-center gap-2">
                        <img src={item.product_image} alt={item.product_name} className="w-10 h-10 rounded object-cover border border-neon-cyan/40" />
                        <span>
                          {item.product_name} ×{item.quantity}
                          <div style={{ fontSize: '0.95em', marginLeft: '1.5em', marginTop: '0.2em', display: 'flex', gap: '1.5em' }}>
                            <span>
                              <strong>size:</strong> {item.size || '-'}
                            </span>
                            <span>
                              <strong>color:</strong>
                              {item.color ? (
                                <span
                                  title={item.color}
                                  style={{
                                    display: 'inline-block',
                                    width: '1em',
                                    height: '1em',
                                    borderRadius: '50%',
                                    background: item.color,
                                    border: '1px solid #fff',
                                    marginLeft: '0.4em',
                                    verticalAlign: 'middle',
                                  }}
                                />
                              ) : '-'}
                            </span>
                          </div>
                        </span>
                        <span className="ml-auto font-anton text-neon-cyan">₹{(item.unit_price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            {/* Payment Method Selection */}
            <div className="mb-6">
              <div className="block text-white mb-2 font-semibold">Select Payment Method:</div>
              <div className="flex gap-4 flex-wrap">
                <button
                  type="button"
                  className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl border-2 transition-all font-bold flex items-center justify-center gap-2 text-base sm:text-lg
                    ${selectedPaymentMethod === 'Razorpay' ? 'border-neon-cyan bg-black/80 text-neon-cyan shadow-neon-cyan/30' : 'border-gray-700 bg-black/40 text-white hover:border-neon-cyan/60'}`}
                  onClick={() => setSelectedPaymentMethod('Razorpay')}
                  disabled={isProcessing}
                >
                  <CreditCard className="w-5 h-5" /> Razorpay
                </button>
                <button
                  type="button"
                  className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl border-2 transition-all font-bold flex items-center justify-center gap-2 text-base sm:text-lg
                    ${selectedPaymentMethod === 'Cash' ? 'border-neon-orange bg-black/80 text-neon-orange shadow-neon-orange/30' : 'border-gray-700 bg-black/40 text-white hover:border-neon-orange/60'}`}
                  onClick={() => setSelectedPaymentMethod('Cash')}
                  disabled={isProcessing}
                >
                  <Wallet className="w-5 h-5" /> Cash on Delivery
                </button>
              </div>
            </div>
            <Button
              onClick={selectedPaymentMethod === 'Razorpay' ? handleRazorpay : handleCash}
              disabled={isProcessing || (selectedPaymentMethod === 'Razorpay' && !isScriptLoaded)}
              className={`w-full py-4 mt-2 rounded-2xl font-bold text-lg flex items-center justify-center gap-2
                bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink text-black shadow-lg shadow-neon-cyan/20 hover:from-neon-pink hover:to-neon-orange transition-all`}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2"><span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> Processing...</span>
              ) : selectedPaymentMethod === 'Razorpay' ? (
                <><CreditCard className="w-5 h-5" /> Pay with Razorpay</>
              ) : (
                <><Wallet className="w-5 h-5" /> Place Order</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment; 