import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { X, Upload, Loader2, Package, Camera, ArrowLeft, AlertCircle, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes

interface ReturnItemData {
  itemId: string;
  quantity: number;
  reason: string;
  description: string;
  photos: File[];
}

const ReturnRequest = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [returnItems, setReturnItems] = useState<Record<string, ReturnItemData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const returnReasons = [
    { value: 'wrong_size', label: 'Wrong Size' },
    { value: 'quality_issue', label: 'Quality Issue' },
    { value: 'damaged', label: 'Damaged Item' },
    { value: 'not_as_described', label: 'Not as Described' },
    { value: 'wrong_item', label: 'Wrong Item Received' },
    { value: 'style_change', label: 'Style Change' },
    { value: 'other', label: 'Other Reason' }
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      if (orderError) {
        toast({ title: 'Error', description: 'Order not found', variant: 'destructive' });
        setLoading(false);
        return;
      }
      setOrder(orderData);
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      if (itemsError) {
        toast({ title: 'Error', description: 'Failed to fetch order items', variant: 'destructive' });
        setLoading(false);
        return;
      }
      setItems(itemsData || []);
      setLoading(false);
    };
    if (orderId) fetchOrder();
  }, [orderId, toast]);

  const handleItemSelection = (itemId: string, quantity: number) => {
    setReturnItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        itemId,
        quantity,
        reason: prev[itemId]?.reason || '',
        description: prev[itemId]?.description || '',
        photos: prev[itemId]?.photos || []
      }
    }));
  };

  const handleReasonChange = (itemId: string, reason: string) => {
    setReturnItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        reason
      }
    }));
  };

  const handleDescriptionChange = (itemId: string, description: string) => {
    setReturnItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        description
      }
    }));
  };

  const handlePhotoUpload = (itemId: string, files: File[]) => {
    setPhotoError(null);

    // Check number of photos
    const currentPhotos = returnItems[itemId]?.photos || [];
    if (currentPhotos.length + files.length > MAX_PHOTOS) {
      setPhotoError(`You can only upload up to ${MAX_PHOTOS} photos per item`);
      return;
    }

    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setPhotoError(`Some files exceed the 3MB size limit. Please resize them before uploading.`);
      return;
    }

    setReturnItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        photos: [...(prev[itemId]?.photos || []), ...files]
      }
    }));
  };

  const handleRemovePhoto = (itemId: string, photoIndex: number) => {
    setReturnItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        photos: prev[itemId].photos.filter((_, index) => index !== photoIndex)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate return items
    const returnItemsArray = Object.values(returnItems);
    if (returnItemsArray.length === 0) {
      toast({ 
        title: 'Error', 
        description: 'Please select at least one item to return.', 
        variant: 'destructive' 
      });
      return;
    }

    // Validate each item has a reason
    const invalidItems = returnItemsArray.filter(item => !item.reason);
    if (invalidItems.length > 0) {
      toast({ 
        title: 'Error', 
        description: 'Please provide a reason for each item being returned.', 
        variant: 'destructive' 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Starting return request submission...');
      console.log('Return items:', returnItemsArray);
      console.log('Order ID:', orderId);
      console.log('User ID:', user?.id);

      const allPhotoUrls: string[] = []; // Declare at the top

      // Create return request first
      const returnRequestData = {
        order_id: orderId,
        user_id: user?.id,
        status: 'pending',
        refund_status: 'pending',
        reason: returnItemsArray[0].reason,
        photos: [], // We'll update this after uploading photos
        refund_amount: returnItemsArray.reduce((total, item) => {
          const orderItem = items.find(i => i.id === item.itemId);
          return total + (orderItem?.unit_price || 0) * item.quantity;
        }, 0)
      };

      console.log('Creating return request with data:', returnRequestData);

      const { data: returnData, error: returnError } = await supabase
        .from('returns')
        .insert(returnRequestData)
        .select()
        .single();

      if (returnError) {
        console.error('Error creating return request:', returnError);
        throw returnError;
      }

      console.log('Return request created successfully:', returnData);

      // Create return item details with photos
      const returnItemDetails = await Promise.all(returnItemsArray.map(async (item) => {
        const orderItem = items.find(i => i.id === item.itemId);
        const itemPhotoUrls: string[] = [];

        // Upload photos for this item
        for (const photo of item.photos) {
          try {
            const fileName = `${user?.id}/${Date.now()}-${photo.name}`;
            console.log('Uploading photo:', fileName);

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('return_photos')
              .upload(fileName, photo);

            if (uploadError) {
              console.error('Error uploading photo:', uploadError);
              continue;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('return_photos')
              .getPublicUrl(fileName);

            if (publicUrl) {
              itemPhotoUrls.push(publicUrl);
              allPhotoUrls.push(publicUrl);
            }
          } catch (error) {
            console.error('Error processing photo:', error);
            continue;
          }
        }

        return {
          return_id: returnData.id,
          order_item_id: item.itemId,
          quantity: item.quantity,
          item_reason: item.reason || 'No reason provided',
          item_description: item.description || 'No description provided',
          item_refund_amount: orderItem?.unit_price * item.quantity,
          status: 'pending',
          item_photos: itemPhotoUrls // Include photos directly in the insert
        };
      }));

      console.log('Creating return item details with photos:', returnItemDetails);

      const { error: detailsError, data: detailsData } = await supabase
        .from('return_item_details')
        .insert(returnItemDetails);

      if (detailsError) {
        console.error('Error creating return item details:', detailsError);
        throw detailsError;
      }

      // Update return request with all photo URLs
      if (allPhotoUrls.length > 0) {
        console.log('Updating return request with photos:', {
          returnId: returnData.id,
          photos: allPhotoUrls
        });

        const { error: updateError } = await supabase
          .from('returns')
          .update({ 
            photos: allPhotoUrls
          })
          .eq('id', returnData.id);

        if (updateError) {
          console.error('Error updating return photos:', updateError);
          throw updateError;
        }
      }

      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'return_initiated'
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order status:', orderError);
        throw orderError;
      }

      // Show success message
      toast({
        title: 'Return Request Submitted',
        description: 'Your return request has been submitted successfully. We will review it shortly.',
        duration: 5000,
      });

      // Redirect to order history page after a short delay
      setTimeout(() => {
        navigate('/order-history');
      }, 2000);

    } catch (error) {
      console.error('Error submitting return request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit return request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center">
        <motion.div 
          className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 rounded-2xl p-12 shadow-2xl shadow-neon-cyan/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="w-8 h-8 border-3 border-neon-cyan border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-2xl font-anton bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              LOADING ORDER...
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Package className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 font-space text-lg">Order not found</p>
          <Button
            onClick={() => navigate('/account?tab=orders')}
            className="mt-4 bg-neon-cyan hover:bg-neon-cyan/90 text-black font-space"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-black to-neon-cyan/20 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-neon-pink/10 via-transparent to-neon-orange/10 animate-pulse"></div>
      </div>

      <div className="max-w-4xl mx-auto py-4 md:py-8 px-3 md:px-4">
        <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30">
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-2xl md:text-3xl font-anton text-neon-cyan">
              Return Request
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              {items.map(item => (
                <div key={item.id} className="border-2 border-neon-purple/30 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
                  {/* Product Info Section with Image - Mobile Optimized */}
                  <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 mb-4 md:mb-6">
                    {/* Product Image - Full width on mobile */}
                    <div className="relative w-full md:w-24 h-32 md:h-24 rounded-lg overflow-hidden border-2 border-neon-purple/30">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Product Details - Stacked on mobile */}
                    <div className="flex-1 w-full">
                      <h3 className="text-lg md:text-xl font-semibold text-white mb-2">{item.product_name}</h3>
                      <div className="space-y-1 text-sm md:text-base text-gray-400">
                        <p>Size: {item.size}</p>
                        <p>Price: ₹{item.unit_price}</p>
                        <p>Ordered Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    {/* Return Quantity Controls - Full width on mobile */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <Label className="text-white text-sm md:text-base">Return Quantity:</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleItemSelection(item.id, Math.max(0, (returnItems[item.id]?.quantity || 0) - 1))}
                          disabled={!returnItems[item.id]?.quantity}
                          className="border-neon-purple/30 hover:border-neon-purple/50 h-8 w-8 md:h-10 md:w-10"
                        >
                          <Minus className="h-4 w-4 text-neon-purple" />
                        </Button>
                        <span className="w-12 text-center text-white">
                          {returnItems[item.id]?.quantity || 0}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleItemSelection(item.id, Math.min(item.quantity, (returnItems[item.id]?.quantity || 0) + 1))}
                          disabled={(returnItems[item.id]?.quantity || 0) >= item.quantity}
                          className="border-neon-purple/30 hover:border-neon-purple/50 h-8 w-8 md:h-10 md:w-10"
                        >
                          <Plus className="h-4 w-4 text-neon-purple" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Return Details Section - Only show if quantity > 0 */}
                  {returnItems[item.id]?.quantity > 0 && (
                    <div className="space-y-4 mt-4 border-t border-neon-purple/20 pt-4">
                      {/* Reason Selection - Mobile Optimized */}
                      <div>
                        <Label className="text-white text-sm md:text-base">Reason for Return</Label>
                        <Select
                          value={returnItems[item.id]?.reason}
                          onValueChange={(value) => handleReasonChange(item.id, value)}
                        >
                          <SelectTrigger className="bg-gray-900/60 border-neon-purple/30 h-10 md:h-11">
                            <SelectValue placeholder="Select a reason" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900/95 border-neon-purple/30">
                            {returnReasons.map(reason => (
                              <SelectItem
                                key={reason.value}
                                value={reason.value}
                                className="text-white hover:text-neon-purple"
                              >
                                {reason.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Additional Details - Mobile Optimized */}
                      <div>
                        <Label className="text-white text-sm md:text-base">Additional Details</Label>
                        <Textarea
                          value={returnItems[item.id]?.description}
                          onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                          placeholder="Please provide more details about your return..."
                          className="bg-gray-900/60 border-neon-purple/30 text-white min-h-[100px] md:min-h-[120px]"
                          minLength={30}
                        />
                      </div>
                      {/* Photo Upload - Mobile Optimized */}
                      <div>
                        <Label className="text-white text-sm md:text-base">Upload Photos</Label>
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handlePhotoUpload(item.id, Array.from(e.target.files || []))}
                            className="hidden"
                            id={`photo-upload-${item.id}`}
                          />
                          <label
                            htmlFor={`photo-upload-${item.id}`}
                            className="flex items-center justify-center gap-2 p-3 md:p-4 border-2 border-dashed border-neon-purple/30 rounded-lg cursor-pointer hover:border-neon-purple/50 bg-gray-900/60"
                          >
                            <Camera className="h-5 w-5 text-neon-purple" />
                            <span className="text-white text-sm md:text-base">
                              {returnItems[item.id]?.photos?.length 
                                ? `${returnItems[item.id].photos.length} photos uploaded`
                                : 'Upload Photos'}
                            </span>
                          </label>
                          {/* Photo Preview Grid - 2 columns on mobile */}
                          {returnItems[item.id]?.photos?.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                              {returnItems[item.id].photos.map((photo, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={URL.createObjectURL(photo)}
                                    alt={`Return photo ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg border border-neon-purple/30"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePhoto(item.id, index)}
                                    className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-4 w-4 text-white" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {/* Submit Button - Mobile Optimized */}
              <Button
                type="submit"
                disabled={isSubmitting || Object.keys(returnItems).length === 0}
                className="w-full bg-neon-purple hover:bg-neon-purple/90 text-white font-space h-11 md:h-12 text-base md:text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Submit Return Request'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReturnRequest; 