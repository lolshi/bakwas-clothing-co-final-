
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

const ReturnRequest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  useEffect(() => {
    if (selectedOrder) {
      fetchOrderItems();
    }
  }, [selectedOrder]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, created_at')
        .eq('customer_email', user?.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchOrderItems = async () => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', selectedOrder);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrder || selectedItems.length === 0 || !reason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const returnItems = orderItems
        .filter(item => selectedItems.includes(item.id))
        .map(item => ({
          id: item.id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price
        }));

      const { error } = await supabase
        .from('returns')
        .insert({
          order_id: selectedOrder,
          customer_email: user?.email,
          customer_name: user?.user_metadata?.full_name || 'Unknown',
          items: returnItems,
          reason,
          description,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Return request submitted",
        description: "We'll review your request and get back to you within 24 hours.",
      });

      // Reset form
      setSelectedOrder('');
      setSelectedItems([]);
      setReason('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting return request:', error);
      toast({
        title: "Error",
        description: "Failed to submit return request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-anton mb-2">Return Request</h1>
            <p className="text-muted-foreground">Request a return for your order</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Return Request Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="order">Select Order</Label>
                  <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an order" />
                    </SelectTrigger>
                    <SelectContent>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.order_number} - {new Date(order.created_at).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedOrder && orderItems.length > 0 && (
                  <div>
                    <Label>Select Items to Return</Label>
                    <div className="mt-2 space-y-2 border rounded-md p-4">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={item.id}
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => handleItemToggle(item.id)}
                          />
                          <Label htmlFor={item.id} className="flex-1 cursor-pointer">
                            {item.product_name} - Qty: {item.quantity} - ${item.unit_price}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="reason">Reason for Return</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="defective">Defective item</SelectItem>
                      <SelectItem value="wrong-size">Wrong size</SelectItem>
                      <SelectItem value="wrong-item">Wrong item sent</SelectItem>
                      <SelectItem value="not-as-described">Not as described</SelectItem>
                      <SelectItem value="changed-mind">Changed my mind</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Additional Details (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide any additional details about your return request..."
                    rows={4}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ReturnRequest;
