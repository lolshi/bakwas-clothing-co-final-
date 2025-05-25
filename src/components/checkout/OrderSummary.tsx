
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Loader2 } from 'lucide-react';

interface CartItem {
  id: string;
  title: string;
  variant: string;
  quantity: number;
  price: number;
  image: string;
}

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode: string;
  onPayment: () => void;
  isProcessing: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  discount,
  shipping,
  total,
  promoCode,
  onPayment,
  isProcessing,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className="bg-card border-border shadow-2xl">
      <CardHeader className="lg:hidden">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <CardTitle className="text-xl font-anton text-neon-cyan">
              Order Summary
            </CardTitle>
            <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
        </Collapsible>
      </CardHeader>

      <CardHeader className="hidden lg:block">
        <CardTitle className="text-xl font-anton text-neon-cyan">
          Order Summary
        </CardTitle>
      </CardHeader>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent className="lg:block">
          <CardContent className="space-y-4">
            {/* Items List */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.variant}</p>
                    <p className="text-sm">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">₹{item.price.toLocaleString()} each</p>
                  </div>
                </div>
              ))}
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
                  <span>Discount ({promoCode})</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>

              <hr className="border-border" />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              onClick={onPayment}
              disabled={isProcessing}
              className="w-full py-4 bg-neon-cyan text-black hover:bg-neon-cyan/80 transition-all transform hover:scale-[1.02] text-lg font-bold"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                `Pay ₹${total.toLocaleString()} with Razorpay`
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Your payment information is secure and encrypted
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default OrderSummary;
