
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import OrderSelector from '@/components/returns/OrderSelector';
import ItemSelector from '@/components/returns/ItemSelector';
import RequestTypeSelector from '@/components/returns/RequestTypeSelector';
import ReasonSelector from '@/components/returns/ReasonSelector';
import PhotoUpload from '@/components/returns/PhotoUpload';

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
  const [requestType, setRequestType] = useState<'return' | 'refund'>('return');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files].slice(0, 5)); // Max 5 photos
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
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

      // Upload photos if any
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const fileName = `${Date.now()}-${photo.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('returns')
          .upload(fileName, photo);

        if (uploadError) throw uploadError;
        photoUrls.push(uploadData.path);
      }

      const { error } = await supabase
        .from('returns')
        .insert({
          order_id: selectedOrder,
          customer_email: user?.email,
          customer_name: user?.user_metadata?.full_name || 'Unknown',
          items: returnItems,
          request_type: requestType,
          reason,
          description,
          photos: photoUrls,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: `${requestType === 'return' ? 'Return' : 'Refund'} request submitted`,
        description: `We'll process your ${requestType} shortly and get back to you within 24 hours.`,
      });

      // Reset form
      setSelectedOrder('');
      setSelectedItems([]);
      setRequestType('return');
      setReason('');
      setDescription('');
      setPhotos([]);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
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
            <h1 className="text-3xl font-anton mb-2">Return & Refund Request</h1>
            <p className="text-muted-foreground">Request a return or refund for your order</p>
          </div>

          <Card className="bg-gray-800 rounded-lg">
            <CardHeader>
              <CardTitle className="text-white">Return/Refund Request Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <OrderSelector
                  orders={orders}
                  selectedOrder={selectedOrder}
                  onOrderChange={setSelectedOrder}
                />

                <ItemSelector
                  orderItems={orderItems}
                  selectedItems={selectedItems}
                  onItemToggle={handleItemToggle}
                  selectedOrder={selectedOrder}
                />

                <RequestTypeSelector
                  requestType={requestType}
                  onRequestTypeChange={setRequestType}
                />

                <ReasonSelector
                  reason={reason}
                  onReasonChange={setReason}
                  requestType={requestType}
                />

                <div>
                  <Label htmlFor="description" className="text-white">Additional Details (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide any additional details..."
                    rows={4}
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>

                <PhotoUpload
                  photos={photos}
                  onPhotoUpload={handlePhotoUpload}
                  onRemovePhoto={removePhoto}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-400 hover:bg-blue-500 text-black">
                  {isSubmitting ? 'Submitting...' : `Submit ${requestType === 'return' ? 'Return' : 'Refund'} Request`}
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
