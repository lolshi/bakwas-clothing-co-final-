
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import PromoCode from '@/components/checkout/PromoCode';
import ProgressBar from '@/components/checkout/ProgressBar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { checkoutSchema, type CheckoutFormData } from '@/schemas/checkoutSchema';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Checkout = () => {
  const { user } = useAuth();
  const { items: cartItems, total: cartTotal } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeData, setPromoCodeData] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: '',
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      customerNotes: '',
    },
  });

  useEffect(() => {
    setSubtotal(cartTotal);
  }, [cartTotal]);

  const shippingCost = subtotal > 2000 ? 0 : 50;
  const total = subtotal - discount + shippingCost;

  const calculateDiscount = (promoCodeData: any, subtotal: number) => {
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

      // Check minimum cart total
      if (subtotal < validPromoCode.min_cart_total) {
        toast({
          title: "Minimum order not met",
          description: `Minimum order of ₹${validPromoCode.min_cart_total} required for this promo code`,
          variant: "destructive",
        });
        return false;
      }

      const discountAmount = calculateDiscount(validPromoCode, subtotal);
      setDiscount(discountAmount);
      setPromoCode(code);
      setPromoCodeData(validPromoCode);
      
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

  const handlePayment = async (formData: CheckoutFormData) => {
    setIsProcessingPayment(true);
    
    try {
      // Create order
      const orderData = {
        items: cartItems,
        customerInfo: formData,
        promoCode,
        subtotal,
        discount,
        shipping: shippingCost,
        total,
      };

      // Mock order creation - in real app, this would be an API call
      const orderId = `order_${Date.now()}`;
      
      // If promo code was used, increment usage count
      if (promoCodeData) {
        await supabase
          .from('promo_codes')
          .update({ usage_count: promoCodeData.usage_count + 1 })
          .eq('id', promoCodeData.id);
      }

      // Mock Razorpay integration
      const options = {
        key: 'rzp_test_your_key_here', // Replace with actual Razorpay key
        amount: total * 100, // Razorpay expects amount in paise
        currency: 'INR',
        name: 'Bakwas Clothing Co.',
        description: 'Order Payment',
        order_id: orderId,
        handler: function (response: any) {
          // Payment successful
          toast({
            title: "Payment successful!",
            description: "Redirecting to order confirmation...",
          });
          
          setTimeout(() => {
            navigate(`/order-success/${orderId}`);
          }, 1000);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#00E1FF',
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
          }
        }
      };

      // For demo purposes, simulate payment success after 2 seconds
      setTimeout(() => {
        toast({
          title: "Payment successful!",
          description: "Redirecting to order confirmation...",
        });
        navigate(`/order-success/${orderId}`);
      }, 2000);

    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Please try again",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  };

  const onSubmit = (data: CheckoutFormData) => {
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

    handlePayment(data);
  };

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
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <ProgressBar currentStep="checkout" />
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Forms */}
              <div className="space-y-6">
                <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 border border-border">
                  <CheckoutForm form={form} />
                </div>
                <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 border border-border">
                  <PromoCode 
                    onApply={handlePromoApply} 
                    appliedCode={promoCode}
                    onRemove={handlePromoRemove}
                  />
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:sticky lg:top-8 lg:self-start">
                <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border">
                  <OrderSummary
                    items={cartItems}
                    subtotal={subtotal}
                    discount={discount}
                    shipping={shippingCost}
                    total={total}
                    promoCode={promoCode}
                    onPayment={form.handleSubmit(onSubmit)}
                    isProcessing={isProcessingPayment}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Checkout;
