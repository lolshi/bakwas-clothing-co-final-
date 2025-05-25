
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
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

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState('');
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
    // Mock cart data - in real app, this would come from cart context/state
    const mockCartItems = [
      {
        id: '1',
        title: 'Classic Hoodie',
        variant: 'Black - M',
        quantity: 1,
        price: 2499,
        image: '/lovable-uploads/aae6428d-9a3d-4b45-87c4-900c7fe5558e.png'
      },
      {
        id: '2',
        title: 'Streetwear Tee',
        variant: 'White - L',
        quantity: 2,
        price: 1299,
        image: '/lovable-uploads/f28f3d2a-8930-4520-9cc7-8de233beae5c.png'
      }
    ];
    setCartItems(mockCartItems);
    
    const total = mockCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setSubtotal(total);
  }, []);

  const shippingCost = subtotal > 2000 ? 0 : 50;
  const total = subtotal - discount + shippingCost;

  const handlePromoApply = async (code: string) => {
    try {
      // Mock promo validation - in real app, this would be an API call
      const promoDiscounts = {
        'SAVE10': subtotal * 0.1,
        'WELCOME20': subtotal * 0.2,
        'FIRSTORDER': 500
      };

      if (promoDiscounts[code]) {
        setDiscount(promoDiscounts[code]);
        setPromoCode(code);
        toast({
          title: "Promo code applied!",
          description: `₹${promoDiscounts[code]} discount applied`,
        });
        return true;
      } else {
        toast({
          title: "Invalid promo code",
          description: "Please check your code and try again",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Error applying promo code",
        description: "Please try again",
        variant: "destructive",
      });
      return false;
    }
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
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <ProgressBar currentStep="checkout" />
            
            <div className="grid lg:grid-cols-2 gap-8 mt-8">
              {/* Left Column - Forms */}
              <div className="space-y-6">
                <CheckoutForm form={form} />
                <PromoCode onApply={handlePromoApply} />
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:sticky lg:top-8 lg:self-start">
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
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Checkout;
