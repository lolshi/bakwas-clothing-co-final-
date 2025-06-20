import { RAZORPAY_CONFIG } from '@/config/razorpay';
import Razorpay from 'razorpay';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: RAZORPAY_CONFIG.key_id,
  key_secret: RAZORPAY_CONFIG.key_secret,
}) as any; // Type assertion needed since @types/razorpay doesn't exist

interface CreateOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
}

export async function POST(req: Request) {
  try {
    const { amount, currency, receipt }: CreateOrderRequest = await req.json();

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
      payment_capture: 1, // Auto capture payment
    });

    return new Response(JSON.stringify(order), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return new Response(JSON.stringify({ error: 'Failed to create Razorpay order' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 