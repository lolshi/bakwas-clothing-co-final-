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
  const { items: cartItems, total: cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeData, setPromoCodeData] = useState<PromoCodeData | null>(null);
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

  const shippingCost = subtotal > 2000 ? 0 : 50;
  const total = subtotal - discount + shippingCost;

  const calculateDiscount = (promoCodeData: PromoCodeData | null, subtotal: number) => {
    if (!promoCodeData) return 0;
    
    if (subtotal < promoCodeData.min_cart_total) {
      return 0;
    }
    
    if (promoCodeData.discount_type === 'percentage') {
      return Math.min((subtotal * promoCodeData.discount_value) / 100, subtotal);
    } else {
      return Math.min(promoCodeData.discount_value, subtotal);
    }
  };

  const handlePromoApply = async (code: string) => {
    try {
      const { data: validPromoCode, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error || !validPromoCode) {
        return false;
      }

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
      };

      const discountAmount = calculateDiscount(typedPromoCode, subtotal);
      setDiscount(discountAmount);
      setPromoCode(code);
      setPromoCodeData(typedPromoCode);
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const handlePromoRemove = () => {
    setDiscount(0);
    setPromoCode('');
    setPromoCodeData(null);
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
      
      console.log('User authenticated:', session.user.email);
      console.log('Session valid until:', new Date(session.expires_at! * 1000));
      
      // Test database connection first
      console.log('Testing database connection...');
      const { data: testData, error: testError } = await supabase
        .from('orders')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('Database connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }
      
      console.log('Database connection successful');
      
      // Test RLS policies by checking if we can read orders with current user
      console.log('Testing RLS policies...');
      const { data: rlsTest, error: rlsError } = await supabase
        .from('orders')
        .select('id, customer_email')
        .eq('customer_email', session.user.email!)
        .limit(1);
      
      if (rlsError) {
        console.error('RLS test failed:', rlsError);
        // Continue anyway, this might be expected if no orders exist
      } else {
        console.log('RLS test successful, found orders:', rlsTest?.length || 0);
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
      
      console.log('Missing fields:', missingFields);
      
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
      
      console.log('Generated order number:', orderNumber);
      
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

      console.log('Shipping address:', shippingAddress);

      // Create order record
      console.log('Creating order record...');
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
        payment_status: selectedPaymentMethod === 'Cash on Delivery' ? 'pending' : 'paid'
      };
      
      console.log('Order data to insert:', orderData);
      
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select();

      if (orderError) {
        console.error('Order creation error:', orderError);
        console.error('Error details:', {
          message: orderError.message,
          details: orderError.details,
          hint: orderError.hint,
          code: orderError.code
        });
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      console.log('Order created successfully:', orderResult);
      
      // Get the actual order ID from the created order
      const createdOrderId = orderResult[0]?.id;
      if (!createdOrderId) {
        throw new Error('Failed to get order ID from created order');
      }

      try {
        // Fetch all product_variants for the products in the cart
        const { data: variants, error: variantError } = await supabase
          .from('product_variants')
          .select('id, product_id, size, color');
        if (variantError) {
          throw new Error('Failed to fetch product variants: ' + variantError.message);
        }

        // Create order items with variant_id
        const orderItems = cartItems.map(item => {
          // Extract the product ID (UUID) from the composite cart item ID
          const productId = item.id.split('-').slice(0, 5).join('-');
          console.log('Looking up variant for:', {
            productId,
            size: item.selectedSize,
            color: item.selectedColor,
            item
          });

          const variant = variants.find(
            v =>
              v.product_id === productId &&
              v.size === item.selectedSize &&
              v.color === item.selectedColor
          );

          if (!variant) {
            console.error(
              `No variant found for product ${item.title} (productId: ${productId}, size: ${item.selectedSize}, color: ${item.selectedColor})`
            );
            // Log all available variants for debugging
            console.log('Available variants:', variants);
            throw new Error(
              `No variant found for product ${item.title} (size: ${item.selectedSize}, color: ${item.selectedColor})`
            );
          }
          return {
            order_id: createdOrderId,
            product_id: variant.product_id,
            variant_id: variant.id,
            product_name: item.title,
            product_image: item.image,
            unit_price: item.price,
            quantity: item.quantity,
            total_price: item.price * item.quantity
          };
        });

        console.log('Order items to create:', orderItems);

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('Order items creation error:', itemsError);
          console.error('Items error details:', {
            message: itemsError.message,
            details: itemsError.details,
            hint: itemsError.hint,
            code: itemsError.code
          });
          // Try to delete the order if items failed
          await supabase.from('orders').delete().eq('id', createdOrderId);
          throw new Error(`Failed to create order items: ${itemsError.message}`);
        }

        console.log('Order items created successfully');
      } catch (err) {
        console.error('Error in order item creation:', err);
        // Optionally, delete the order if order items fail
        await supabase.from('orders').delete().eq('id', createdOrderId);
        throw err;
      }

      // Update promo code usage if applied
      if (promoCodeData) {
        console.log('Updating promo code usage...');
        await supabase
          .from('promo_codes')
          .update({ usage_count: promoCodeData.usage_count + 1 })
          .eq('id', promoCodeData.id);
      }

      console.log('Payment process completed successfully');

      // Different processing based on payment method
      const processingTime = selectedPaymentMethod === 'Cash on Delivery' ? 1000 : 2000;
      const successMessage = selectedPaymentMethod === 'Cash on Delivery' 
        ? "Order placed successfully! You can pay when your order arrives."
        : "Payment successful! Redirecting to order confirmation...";

      setTimeout(() => {
        toast({
          title: "Success!",
          description: successMessage,
        });
        clearCart();
        navigate(`/order-success/${orderNumber}`);
      }, processingTime);

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
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-transparent border-b-2 border-gray-600 py-2 px-0 text-white focus:outline-none focus:border-cyan-400 transition-all"
                />
                <button
                  onClick={() => handlePromoApply(promoCode)}
                  className="px-6 py-2 bg-cyan-400 hover:bg-cyan-500 text-black font-semibold rounded-lg transition-all transform hover:scale-105"
                >
                  Apply
                </button>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-green-400">
                  <span>Discount Applied: {promoCode}</span>
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
