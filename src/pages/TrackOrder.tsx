import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Package, Truck, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getNearestColorFamilyAndShade } from '@/config/colors';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: number;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: any;
  tracking_number?: string;
  tracking_url?: string;
  estimated_delivery?: string;
  updated_at?: string;
  subtotal?: number;
  shipping_cost?: number;
  discount_amount?: number;
}

declare global {
  interface Window {
    dataLayer: any[];
  }
}

const TrackOrder = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails();
    }
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .eq('customer_email', user?.email)
        .single();

      if (error) throw error;
      setOrder(data);
      // Fetch order items with product_variants join
      if (data?.id) {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*, product_variants(size, color)')
          .eq('order_id', data.id);
        if (!itemsError) setOrderItems(items || []);
      }
      // Track order view with Google Tag Manager
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'order_tracking_view',
          order_number: orderNumber,
          order_status: data.status,
          order_total: data.total_amount,
          customer_email: data.customer_email
        });
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Failed to load order details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-6 w-6" />;
      case 'processing': return <Package className="h-6 w-6" />;
      case 'shipped': return <Truck className="h-6 w-6" />;
      case 'delivered': return <CheckCircle2 className="h-6 w-6" />;
      case 'cancelled': return <AlertCircle className="h-6 w-6" />;
      default: return <Package className="h-6 w-6" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black/95 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-neon-cyan border-t-transparent mx-auto"></div>
            <p className="mt-4 text-lg">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black/95 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-neon-red mb-4">Order Not Found</h1>
            <p className="text-gray-400 mb-8">We couldn't find the order you're looking for.</p>
            <Button
              onClick={() => navigate('/account')}
              className="bg-neon-cyan hover:bg-neon-purple text-black font-bold py-2 px-4 rounded"
            >
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black/95 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/order-history')}
            className="mb-8 flex items-center gap-2 text-neon-cyan hover:text-neon-purple bg-black/60 border border-neon-cyan px-4 py-2 rounded-lg shadow font-semibold"
            variant="ghost"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Orders
          </Button>

          <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 hover:shadow-neon-purple/30 transition-all duration-500 rounded-2xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-neon-cyan text-3xl font-anton flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-black" />
                </div>
                ORDER TRACKING
              </CardTitle>
              <div className="h-1 w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-full"></div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Order Status */}
              <div className="bg-black/40 backdrop-blur-xl border-2 border-neon-orange/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-anton text-neon-orange">Order Status</h3>
                    <p className="text-white/70">Order #{order.order_number}</p>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} text-white px-4 py-2 rounded-full flex items-center gap-2`}>
                    {getStatusIcon(order.status)}
                    {order.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-white/70">
                  <div>
                    <p className="text-sm">Order Date</p>
                    <p className="font-semibold">{format(new Date(order.created_at), 'PPP')}</p>
                  </div>
                  <div>
                    <p className="text-sm">Last Updated</p>
                    <p className="font-semibold">{order.updated_at ? format(new Date(order.updated_at), 'PPP') : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Tracking Information */}
              {order.tracking_number && (
                <div className="bg-black/40 backdrop-blur-xl border-2 border-neon-purple/20 rounded-xl p-6">
                  <h3 className="text-xl font-anton text-neon-purple mb-4">Tracking Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-white/70">
                    <div>
                      <p className="text-sm">Tracking Number</p>
                      <p className="font-semibold">{order.tracking_number}</p>
                    </div>
                    <div>
                      <p className="text-sm">Estimated Delivery</p>
                      <p className="font-semibold">{order.estimated_delivery ? format(new Date(order.estimated_delivery), 'PPP') : 'N/A'}</p>
                    </div>
                  </div>
                  {order.tracking_url && (
                    <Button
                      onClick={() => window.open(order.tracking_url, '_blank')}
                      className="mt-4 bg-neon-purple hover:bg-neon-pink text-white"
                    >
                      Track Package
                    </Button>
                  )}
                </div>
              )}

              {/* Shipping Address */}
              <div className="bg-black/40 backdrop-blur-xl border-2 border-neon-pink/20 rounded-xl p-6">
                <h3 className="text-xl font-anton text-neon-pink mb-4">Shipping Address</h3>
                <div className="text-white/70">
                  <p className="font-semibold">{order.customer_name}</p>
                  <p>{order.shipping_address.street_address}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                  <p>{order.shipping_address.country}</p>
                  <p className="mt-2">Phone: {order.customer_phone}</p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/20 rounded-xl p-6">
                <h3 className="text-xl font-anton text-neon-cyan mb-4">Order Summary</h3>
                <div className="space-y-2 text-white/70">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{order.shipping_cost?.toFixed(2) || '0.00'}</span>
                  </div>
                  {order.discount_amount && (
                    <div className="flex justify-between text-neon-green">
                      <span>Discount</span>
                      <span>-₹{order.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-white/20 my-2"></div>
                  <div className="flex justify-between text-lg font-bold text-white">
                    <span>Total</span>
                    <span>₹{order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Ordered Items Section */}
              <div className="bg-black/40 backdrop-blur-xl border-2 border-neon-green/20 rounded-xl p-4 md:p-6">
                <h3 className="text-xl font-anton text-neon-green mb-4 flex items-center gap-2">
                  <ShoppingBag className="h-6 w-6" /> Ordered Items
                </h3>
                {orderItems.length === 0 ? (
                  <div className="text-gray-400">No items found for this order.</div>
                ) : (
                  <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
                    {orderItems.map(item => (
                      <div key={item.id} className="flex gap-3 items-center bg-white/5 rounded-lg p-3 md:p-4">
                        <img src={item.product_image} alt={item.product_name} className="w-16 h-16 rounded object-cover border border-neon-green/30" />
                        <div className="flex-1">
                          <div className="font-semibold text-base md:text-lg">{item.product_name}</div>
                          <div className="text-xs md:text-sm text-gray-400">Size: {item.product_variants?.size || 'N/A'} | Color: {item.product_variants?.color ? getNearestColorFamilyAndShade(item.product_variants.color).displayName : 'N/A'}</div>
                          <div className="text-xs md:text-sm text-gray-400">Qty: {item.quantity}</div>
                          <div className="font-bold text-neon-green">₹{item.unit_price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TrackOrder; 