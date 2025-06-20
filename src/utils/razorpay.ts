import { RAZORPAY_CONFIG } from '@/config/razorpay';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  amount: number;
  orderId: string;
  name: string;
  email: string;
  phone: string;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
}

export const initializeRazorpayPayment = (options: RazorpayOptions) => {
  if (typeof window.Razorpay === 'undefined') {
    console.error('Razorpay script not loaded');
    options.onError(new Error('Razorpay script not loaded'));
    return;
  }

  try {
    const razorpay = new window.Razorpay({
      key: RAZORPAY_CONFIG.key_id,
      amount: Math.round(options.amount * 100), // Razorpay expects amount in paise, ensure it's rounded
      currency: RAZORPAY_CONFIG.currency,
      name: RAZORPAY_CONFIG.name,
      description: RAZORPAY_CONFIG.description,
      order_id: options.orderId,
      handler: function (response: any) {
        options.onSuccess(response);
      },
      prefill: {
        name: options.name,
        email: options.email,
        contact: options.phone,
      },
      theme: RAZORPAY_CONFIG.theme,
      modal: {
        ondismiss: function() {
          options.onError(new Error('Payment cancelled by user'));
        }
      }
    });

    razorpay.on('payment.failed', function (response: any) {
      options.onError(response.error);
    });

    razorpay.open();
  } catch (error) {
    console.error('Error initializing Razorpay:', error);
    options.onError(error);
  }
}; 