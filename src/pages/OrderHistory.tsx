import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { downloadInvoice } from '@/utils/invoiceGenerator';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Order {
  id: string;
  order_number: string;
  created_at: string | null;
  status: string | null;
  total_amount: number;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  shipping_address: any;
  subtotal: number | null;
  shipping_cost: number | null;
  discount_amount: number | null;
  payment_status: string | null;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const OrderHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', user?.email || '')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderNumber: string) => {
    navigate(`/track-order/${orderNumber}`);
  };

  const handleDownloadInvoice = async (order: Order) => {
    try {
      setDownloadingInvoice(order.id);
      
      toast({
        title: "Generating Invoice",
        description: "Please wait while we generate your invoice...",
      });

      // Fetch order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (itemsError) {
        throw new Error(`Failed to fetch order items: ${itemsError.message}`);
      }

      if (!orderItems || orderItems.length === 0) {
        throw new Error('No order items found');
      }

      // Prepare invoice data
      const invoiceData = {
        orderNumber: order.order_number,
        orderDate: format(new Date(order.created_at || ''), 'MMM dd, yyyy'),
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone || '',
        shippingAddress: order.shipping_address || {
          name: order.customer_name,
          streetAddress: 'Address not available',
          city: '',
          state: '',
          postalCode: '',
          country: 'India',
          phone: order.customer_phone || ''
        },
        items: orderItems.map((item: any) => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        })),
        subtotal: order.subtotal || 0,
        shippingCost: order.shipping_cost || 0,
        discountAmount: order.discount_amount || 0,
        totalAmount: order.total_amount,
        paymentStatus: order.payment_status || 'pending',
        status: order.status || 'pending'
      };

      // Generate and download invoice
      await downloadInvoice(invoiceData);

      toast({
        title: "Invoice Downloaded",
        description: `Invoice for order ${order.order_number} has been downloaded successfully.`,
      });

    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Unable to download invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'return_initiated': return 'bg-orange-500';
      case 'return_approved': return 'bg-orange-600';
      case 'return_received': return 'bg-purple-600';
      case 'return_complete': return 'bg-green-600';
      case 'return_rejected': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const formatStatus = (status: string | null) => {
    if (!status) return 'Pending';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <ProtectedRoute>
      <div 
        className="min-h-screen p-2 md:p-4 relative"
        style={{
          backgroundImage: 'url(/images-videos-logo/order-history-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="bg-black/60 backdrop-blur-md rounded-lg p-4 md:p-6 mb-6">
              <h1 className="text-xl md:text-3xl font-anton mb-2 text-white">Order History</h1>
              <p className="text-gray-300 text-sm md:text-base">View your past orders and their status</p>
            </div>
          </div>

          {/* Mobile: Card layout, Desktop: Table */}
          <div className="block md:hidden">
            {filteredOrders.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No orders found.</div>
            ) : (
              filteredOrders.map(order => (
                <div key={order.id} className="bg-white/10 rounded-xl p-3 mb-3 shadow flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">Order #{order.order_number}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>{formatStatus(order.status)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>{format(new Date(order.created_at || ''), 'MMM dd, yyyy')}</span>
                    <span className="font-bold text-neon-cyan">₹{order.total_amount}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" className="flex-1 py-1 text-xs" onClick={() => handleViewOrder(order.order_number)}>
                      View
                    </Button>
                    <Button size="sm" className="flex-1 py-1 text-xs" onClick={() => handleDownloadInvoice(order)} disabled={downloadingInvoice === order.id}>
                      {downloadingInvoice === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invoice'}
                    </Button>
                    {order.status === 'delivered' && !order.status?.includes('return') && (
                      <Button
                        size="sm"
                        className="flex-1 py-1 text-xs"
                        onClick={() => navigate(`/return-request/${order.id}`)}
                      >
                        Request Return
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden md:block">
            <Card className="bg-black/60 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Your Orders</CardTitle>
                <div className="flex gap-4">
                  <Input
                    type="text"
                    placeholder="Search by order number"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-64 bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-400 py-8">No orders found.</TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map(order => (
                        <TableRow key={order.id}>
                          <TableCell>#{order.order_number}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>{formatStatus(order.status)}</span>
                          </TableCell>
                          <TableCell>{format(new Date(order.created_at || ''), 'MMM dd, yyyy')}</TableCell>
                          <TableCell className="font-bold text-neon-cyan">₹{order.total_amount}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleViewOrder(order.order_number)}>
                                View
                              </Button>
                              <Button size="sm" onClick={() => handleDownloadInvoice(order)} disabled={downloadingInvoice === order.id}>
                                {downloadingInvoice === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invoice'}
                              </Button>
                              {order.status === 'delivered' && !order.status?.includes('return') && (
                                <Button
                                  size="sm"
                                  onClick={() => navigate(`/return-request/${order.id}`)}
                                >
                                  Request Return
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default OrderHistory;
