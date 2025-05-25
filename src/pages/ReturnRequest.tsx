
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
                <div>
                  <Label htmlFor="order" className="text-white">Select Order</Label>
                  <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                    <SelectTrigger className="bg-gray-700 text-white border-gray-600">
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
                    <Label className="text-white">Select Items</Label>
                    <div className="mt-2 space-y-2 border border-gray-600 rounded-md p-4 bg-gray-700">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={item.id}
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => handleItemToggle(item.id)}
                          />
                          <Label htmlFor={item.id} className="flex-1 cursor-pointer text-white">
                            {item.product_name} - Qty: {item.quantity} - ${item.unit_price}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-white">Request Type</Label>
                  <RadioGroup value={requestType} onValueChange={(value: 'return' | 'refund') => setRequestType(value)} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="return" id="return" />
                      <Label htmlFor="return" className="text-white">Return (Exchange/Store Credit)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="refund" id="refund" />
                      <Label htmlFor="refund" className="text-white">Refund (Money Back)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="reason" className="text-white">Reason for {requestType === 'return' ? 'Return' : 'Refund'}</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger className="bg-gray-700 text-white border-gray-600">
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

                <div>
                  <Label htmlFor="photos" className="text-white">Upload Photos (Optional, max 5)</Label>
                  <Input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="bg-gray-700 text-white border-gray-600"
                  />
                  {photos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Upload ${index + 1}`}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
