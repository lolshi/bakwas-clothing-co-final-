
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: number;
  customer_email: string;
}

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
        .eq('customer_email', user?.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="bg-black/60 backdrop-blur-md rounded-lg p-6 mb-6">
              <h1 className="text-3xl font-anton mb-2 text-white">Order History</h1>
              <p className="text-gray-300">View your past orders and their status</p>
            </div>
          </div>

          <Card className="bg-black/60 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Your Orders</CardTitle>
              <div className="flex gap-4">
                <Input
                  placeholder="Search by order number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm bg-black/40 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-300">Loading orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-300">No orders found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20">
                        <TableHead className="text-gray-200">Order Number</TableHead>
                        <TableHead className="text-gray-200">Date</TableHead>
                        <TableHead className="text-gray-200">Status</TableHead>
                        <TableHead className="text-gray-200">Total</TableHead>
                        <TableHead className="text-gray-200">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id} className="border-white/20 hover:bg-white/5">
                          <TableCell className="font-medium text-white">{order.order_number}</TableCell>
                          <TableCell className="text-gray-200">{format(new Date(order.created_at), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">${order.total_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                                <Download className="h-4 w-4 mr-1" />
                                Invoice
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default OrderHistory;
