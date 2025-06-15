
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const promoCodeSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50, 'Code must be 50 characters or less'),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().min(0.01, 'Discount value must be greater than 0'),
  min_cart_total: z.number().min(0, 'Minimum cart total must be 0 or greater'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  usage_limit: z.number().min(1).optional(),
  is_active: z.boolean(),
});

type PromoCodeFormData = z.infer<typeof promoCodeSchema>;

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_cart_total: number;
  start_date: string;
  end_date: string | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
}

interface PromoCodeFormProps {
  promoCode?: PromoCode | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PromoCodeForm: React.FC<PromoCodeFormProps> = ({ promoCode, onClose, onSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PromoCodeFormData>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: {
      code: promoCode?.code || '',
      discount_type: promoCode?.discount_type || 'percentage',
      discount_value: promoCode?.discount_value || 10,
      min_cart_total: promoCode?.min_cart_total || 0,
      start_date: promoCode?.start_date ? new Date(promoCode.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      end_date: promoCode?.end_date ? new Date(promoCode.end_date).toISOString().split('T')[0] : '',
      usage_limit: promoCode?.usage_limit || undefined,
      is_active: promoCode?.is_active ?? true,
    },
  });

  const savePromoCodeMutation = useMutation({
    mutationFn: async (data: PromoCodeFormData) => {
      const payload = {
        code: data.code.toUpperCase(),
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        min_cart_total: data.min_cart_total,
        start_date: new Date(data.start_date).toISOString(),
        end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
        usage_limit: data.usage_limit || null,
        is_active: data.is_active,
      };

      if (promoCode) {
        const { error } = await supabase
          .from('promo_codes')
          .update(payload)
          .eq('id', promoCode.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('promo_codes')
          .insert([payload]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast({
        title: promoCode ? "Promo code updated" : "Promo code created",
        description: `The promo code has been successfully ${promoCode ? 'updated' : 'created'}.`,
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save promo code.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PromoCodeFormData) => {
    savePromoCodeMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Promo Codes
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {promoCode ? 'Edit Promo Code' : 'Add Promo Code'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Promo Code Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="code">Promo Code</Label>
                <Input
                  id="code"
                  {...form.register('code')}
                  placeholder="Enter promo code"
                  className="uppercase"
                />
                {form.formState.errors.code && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.code.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="discount_type">Discount Type</Label>
                <Select
                  value={form.watch('discount_type')}
                  onValueChange={(value: 'percentage' | 'fixed') => 
                    form.setValue('discount_type', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discount_value">
                  Discount Value {form.watch('discount_type') === 'percentage' ? '(%)' : '(₹)'}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  step="0.01"
                  {...form.register('discount_value', { valueAsNumber: true })}
                  placeholder="Enter discount value"
                />
                {form.formState.errors.discount_value && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.discount_value.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="min_cart_total">Minimum Cart Total (₹)</Label>
                <Input
                  id="min_cart_total"
                  type="number"
                  step="0.01"
                  {...form.register('min_cart_total', { valueAsNumber: true })}
                  placeholder="Enter minimum cart total"
                />
                {form.formState.errors.min_cart_total && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.min_cart_total.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...form.register('start_date')}
                />
                {form.formState.errors.start_date && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.start_date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...form.register('end_date')}
                />
              </div>

              <div>
                <Label htmlFor="usage_limit">Usage Limit (Optional)</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  {...form.register('usage_limit', { valueAsNumber: true })}
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={form.watch('is_active')}
                  onCheckedChange={(checked) => form.setValue('is_active', checked)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                type="submit"
                disabled={savePromoCodeMutation.isPending}
              >
                {savePromoCodeMutation.isPending ? 'Saving...' : (promoCode ? 'Update Promo Code' : 'Create Promo Code')}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromoCodeForm;
