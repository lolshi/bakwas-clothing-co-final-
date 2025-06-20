import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { checkoutSchema, type CheckoutFormData } from '@/schemas/checkoutSchema';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import FloatingField from '@/components/FloatingField';
import FloatingSelect from '@/components/FloatingSelect';
import { initializeRazorpayPayment } from '@/utils/razorpay';

// Define the promo code type
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
}

const Checkout = () => {
  const { user } = useAuth();
  const { 
    items: cartItems, 
    total: cartTotal, 
    clearCart,
    promoCode: appliedPromo,
    promoCodeData,
    discount,
    shippingDiscount,
    applyPromoCode,
    removePromoCode,
    calculateShippingCost
  } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subtotal, setSubtotal] = useState(0);
  const [promoInput, setPromoInput] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [enabledPaymentMethods, setEnabledPaymentMethods] = useState<string[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  // Form state for floating fields
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
    paymentMethod: '',
  });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: formData,
  });

  useEffect(() => {
    setSubtotal(cartTotal);
    fetchEnabledPaymentMethods();
  }, [cartTotal]);

  const fetchEnabledPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('name')
        .eq('enabled', true);

      if (error) throw error;
      const methods = data?.map(method => method.name) || [];
      setEnabledPaymentMethods(methods);
      
      // Set default payment method to first available method
      if (methods.length > 0 && !selectedPaymentMethod) {
        setSelectedPaymentMethod(methods[0]);
        updateFormField('paymentMethod', methods[0]);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      const defaultMethods = ['Razorpay', 'Cash on Delivery'];
      setEnabledPaymentMethods(defaultMethods);
      
      // Set default payment method
      if (!selectedPaymentMethod) {
        setSelectedPaymentMethod(defaultMethods[0]);
        updateFormField('paymentMethod', defaultMethods[0]);
      }
    }
  };

  const shippingCost = calculateShippingCost(subtotal);
  // Calculate final total after all discounts
  const total = Math.max(subtotal + shippingCost - discount, 0);

  const handlePromoApply = async () => {
    if (!promoInput.trim()) return;
    await applyPromoCode(promoInput.trim());
    setPromoInput(''); // Clear input on success
  };

  const handlePromoRemove = () => {
    removePromoCode();
    setPromoInput('');
  };

  const handlePayment = async () => {
    if (isProcessingPayment) return;
    
    setIsProcessingPayment(true);
    
    try {
      // Validate user authentication first
      if (!user) {
        console.error('User not authenticated');
        toast({
          title: "Authentication required",
          description: "Please log in to complete your order",
          variant: "destructive",
        });
        setIsProcessingPayment(false);
        navigate('/login?next=/checkout');
        return;
      }
      
      // Get current session to ensure we have the latest auth state
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast({
          title: "Authentication error",
          description: "Please log in again to complete your order",
          variant: "destructive",
        });
        setIsProcessingPayment(false);
        navigate('/login?next=/checkout');
        return;
      }
      
      // Validate payment method selection
      if (!selectedPaymentMethod) {
        console.log('Payment method validation failed');
        toast({
          title: "Payment method required",
          description: "Please select a payment method to continue",
          variant: "destructive",
        });
        setIsProcessingPayment(false);
        return;
      }

      // Validate form data
      const requiredFields = ['name', 'email', 'phone', 'streetAddress', 'city', 'state', 'postalCode', 'country'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        console.log('Form validation failed');
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setIsProcessingPayment(false);
        return;
      }

      const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
      
      // Create shipping address object
      const shippingAddress = {
        name: formData.name,
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone
      };

      // Create order record
      const orderData = {
        order_number: orderNumber,
        customer_name: formData.name,
        customer_email: session.user.email!,
        customer_phone: formData.phone,
        shipping_address: shippingAddress,
        subtotal: subtotal,
        shipping_cost: shippingCost,
        discount_amount: discount,
        total_amount: total,
        status: 'pending',
        payment_status: selectedPaymentMethod === 'Cash on Delivery' ? 'pending' : 'pending'
      };
      
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      const createdOrderId = orderResult[0]?.id;
      if (!createdOrderId) {
        throw new Error('Failed to get order ID from created order');
      }

      // Handle different payment methods
      if (selectedPaymentMethod === 'Razorpay') {
        try {
          // Create a Razorpay order first
          const { data: razorpayOrder, error: razorpayError } = await supabase
            .from('razorpay_orders')
            .insert({
              order_id: createdOrderId,
              amount: total * 100, // Razorpay expects amount in paise
              currency: 'INR',
              status: 'created'
            })
            .select()
            .single();

          if (razorpayError) {
            throw new Error(`Failed to create Razorpay order: ${razorpayError.message}`);
        }

          // Create Razorpay order via API
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
          const response = await fetch(`${backendUrl}/api/create-razorpay-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              amount: total * 100, // Convert to paise
              currency: 'INR',
              receipt: orderNumber,
            }),
          });

          let responseData;
          try {
            const textResponse = await response.text();
            console.log('Raw response:', textResponse); // Debug log
            responseData = textResponse ? JSON.parse(textResponse) : null;

            if (!response.ok) {
              const errorMessage = responseData?.error || responseData?.detail || 'Failed to create Razorpay order';
              console.error('Razorpay API Error:', errorMessage);
              throw new Error(errorMessage);
            }

            if (!responseData || !responseData.id) {
              console.error('Invalid response:', responseData);
              throw new Error('Invalid Razorpay order response: Missing order ID');
            }

            // Update the razorpay_order with the Razorpay order ID
            const { error: updateError } = await supabase
              .from('razorpay_orders')
              .update({ razorpay_order_id: responseData.id })
              .eq('id', razorpayOrder.id);

            if (updateError) {
              throw new Error(`Failed to update Razorpay order: ${updateError.message}`);
            }

            // Initialize Razorpay payment
            initializeRazorpayPayment({
              amount: total,
              orderId: responseData.id, // Use the Razorpay order ID from the API
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              onSuccess: async (response) => {
                try {
                  // Update order status and payment details
                  const { error: updateError } = await supabase
                    .from('orders')
                    .update({
                      payment_status: 'paid',
                      payment_details: response,
                      status: 'confirmed'
                    })
                    .eq('id', createdOrderId);

                  if (updateError) {
                    console.error('Failed to update order status:', updateError);
                    toast({
                      title: "Payment verification failed",
                      description: "Please contact support with your order number",
                      variant: "destructive",
                    });
                    return;
                  }

                  // Clear cart and redirect
                  clearCart();
                  navigate(`/order-success/${orderNumber}`);
                } catch (error) {
                  console.error('Error in payment success handler:', error);
                  toast({
                    title: "Payment verification failed",
                    description: "Please contact support with your order number",
                    variant: "destructive",
                  });
                }
              },
              onError: async (error) => {
                console.error('Payment failed:', error);
                try {
                  // Update order status to failed
                  await supabase
                    .from('orders')
                    .update({
                      payment_status: 'failed',
                      payment_details: error,
                      status: 'cancelled'
                    })
                    .eq('id', createdOrderId);

                  toast({
                    title: "Payment failed",
                    description: error.description || "Please try again or choose a different payment method",
                    variant: "destructive",
                  });
                } catch (updateError) {
                  console.error('Error updating order status:', updateError);
                  toast({
                    title: "Payment failed",
                    description: "Please try again or choose a different payment method",
                    variant: "destructive",
                  });
      }
              }
            });
          } catch (error) {
            console.error('Error parsing response:', error);
            throw new Error('Failed to parse Razorpay API response');
          }
        } catch (error) {
          console.error('Error initializing Razorpay:', error);
          toast({
            title: "Payment initialization failed",
            description: "Please try again or choose a different payment method",
            variant: "destructive",
          });
          throw error; // Re-throw to be caught by the outer try-catch
        }
      } else if (selectedPaymentMethod === 'Cash on Delivery') {
        // Handle COD
        toast({
          title: "Order Placed!",
          description: "Your order has been placed successfully. You can pay when your order arrives.",
        });
        clearCart();
        navigate(`/order-success/${orderNumber}`);
      }

      setIsProcessingPayment(false);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  };

  const updateFormField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    form.setValue(field, value);
  };

  const countryOptions = [
    { value: 'India', label: 'India' },
    { value: 'USA', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Australia', label: 'Australia' },
  ];

  return (
    <ProtectedRoute>
      <div 
        className="min-h-screen bg-background relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/lovable-uploads/dd9a56c9-3774-432e-930e-da9a0dbac0f3.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Logo */}
        <div className="flex justify-center z-10">
          <img 
            src="/images-videos-logo/d5018b9a-2aba-4a8d-b876-4dff468b69d8.png" 
            alt="Bakwas Clothing Co." 
            className="h-32 md:h-40 lg:h-48 xl:h-56 w-auto"
          />
        </div>

        {/* Full-Viewport Hero Strip with Progress */}
        <section className="w-full bg-gradient-to-r from-[#0A0A1F] to-[#1E1E3F] pb-4">
          <div className="max-w-6xl mx-auto py-6 px-4 flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-anton text-white opacity-75">Checkout</h2>
            </div>
            <nav className="flex items-center space-x-4 text-sm">
              <Link to="/" className="text-gray-400 hover:text-cyan-400 transition-colors">Home</Link>
              <span className="text-gray-600">→</span>
              <Link to="/cart" className="text-gray-400 hover:text-cyan-400 transition-colors">Cart</Link>
              <span className="text-gray-600">→</span>
              <span className="text-cyan-400 font-semibold">Checkout</span>
            </nav>
          </div>
        </section>

        {/* Two-Column Glass Layout */}
        <div className="max-w-6xl mx-auto mt-[120px] mb-48 grid grid-cols-1 lg:grid-cols-2 gap-12 px-4">
          {/* LEFT: Form Panels */}
          <div className="space-y-8">
            {/* Customer Info Panel */}
            <div className="panel bg-black/40 backdrop-blur-lg rounded-2xl p-8 space-y-6 shadow-lg">
              <h3 className="text-xl font-space text-white">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FloatingField 
                  label="Full Name" 
                  value={formData.name}
                  onChange={(value) => updateFormField('name', value)}
                  required
                />
                <FloatingField 
                  label="Email Address" 
                  type="email"
                  value={formData.email}
                  onChange={(value) => updateFormField('email', value)}
                  required
                />
              </div>
              <FloatingField 
                label="Phone Number" 
                type="tel"
                value={formData.phone}
                onChange={(value) => updateFormField('phone', value)}
                required
              />
            </div>

            {/* Shipping Address Panel */}
            <div className="panel bg-black/40 backdrop-blur-lg rounded-2xl p-8 space-y-6 shadow-lg">
              <h3 className="text-xl font-space text-white">Shipping Address</h3>
              <FloatingField 
                label="Street Address" 
                value={formData.streetAddress}
                onChange={(value) => updateFormField('streetAddress', value)}
                fullWidth
                required
              />
              <div className="grid grid-cols-2 gap-6">
                <FloatingField 
                  label="City" 
                  value={formData.city}
                  onChange={(value) => updateFormField('city', value)}
                  required
                />
                <FloatingField 
                  label="State/Province" 
                  value={formData.state}
                  onChange={(value) => updateFormField('state', value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <FloatingField 
                  label="Postal Code" 
                  value={formData.postalCode}
                  onChange={(value) => updateFormField('postalCode', value)}
                  required
                />
                <FloatingSelect 
                  label="Country" 
                  options={countryOptions}
                  value={formData.country}
                  onChange={(value) => updateFormField('country', value)}
                  required
                />
              </div>
            </div>

            {/* Promo Code Panel */}
            <div className="panel bg-black/40 backdrop-blur-lg rounded-2xl p-8 space-y-4 shadow-lg">
              <h3 className="text-xl font-space text-white">Promo Code</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 bg-transparent border-b-2 border-gray-600 py-2 px-0 text-white focus:outline-none focus:border-cyan-400 transition-all"
                />
                <button
                  onClick={handlePromoApply}
                  className="px-6 py-2 bg-cyan-400 hover:bg-cyan-500 text-black font-semibold rounded-lg transition-all transform hover:scale-105"
                >
                  Apply
                </button>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-green-400">
                  <span>Discount Applied: {promoInput}</span>
                  <button onClick={handlePromoRemove} className="text-red-400 hover:text-red-300">
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method Panel */}
            <div className="panel bg-black/40 backdrop-blur-lg rounded-2xl p-8 space-y-6 shadow-lg">
              <h3 className="text-xl font-space text-white">Payment Method</h3>
              <div className="space-y-4">
                {enabledPaymentMethods.map((method) => (
                  <label key={method} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={selectedPaymentMethod === method}
                      onChange={(e) => {
                        setSelectedPaymentMethod(e.target.value);
                        updateFormField('paymentMethod', e.target.value);
                      }}
                      className="w-4 h-4 text-cyan-400 bg-transparent border-2 border-gray-600 focus:ring-cyan-400 focus:ring-2"
                    />
                    <span className="text-white group-hover:text-cyan-400 transition-colors">
                      {method}
                    </span>
                    {method === 'Cash on Delivery' && (
                      <span className="text-xs text-gray-400 ml-2">(₹50 extra charge)</span>
                    )}
                  </label>
                ))}
              </div>
              {!selectedPaymentMethod && (
                <p className="text-red-400 text-sm">Please select a payment method to continue</p>
              )}
            </div>
          </div>

          {/* RIGHT: Summary & Pay */}
          <div className="space-y-6">
            <div className="panel bg-black/40 backdrop-blur-lg rounded-2xl p-8 space-y-6 shadow-lg">
              <h3 className="text-xl font-space text-white">Order Summary</h3>
              <ul className="space-y-3">
                {cartItems.map((item) => (
                  <li key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex justify-between text-white">
                    <span>{item.title} ×{item.quantity}</span>
                    <span className="font-anton text-cyan-400">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-700 pt-4 space-y-2 text-white">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between"><span>Shipping</span><span>₹{shippingCost.toFixed(2)}</span></div>
              </div>
              <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
                <span className="text-lg font-semibold text-white">Total</span>
                <span className="text-2xl font-anton text-cyan-400">₹{total.toFixed(2)}</span>
              </div>
              <button
                onClick={handlePayment}
                disabled={isProcessingPayment || !selectedPaymentMethod}
                className="w-full mt-6 py-4 bg-cyan-400 hover:bg-cyan-500 text-black font-semibold rounded-3xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none animate-pulse"
                style={{ animationDuration: '2s', animationIterationCount: '3' }}
              >
                {isProcessingPayment 
                  ? 'Processing...' 
                  : !selectedPaymentMethod 
                    ? 'Select Payment Method' 
                    : `Pay ₹${total.toFixed(2)} with ${selectedPaymentMethod}`
                }
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">Your payment is secure & encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Checkout;
