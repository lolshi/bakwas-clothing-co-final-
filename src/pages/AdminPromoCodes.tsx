
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PromoCodeForm from '@/components/admin/PromoCodeForm';

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
  created_at: string;
  updated_at: string;
}

const AdminPromoCodes = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: promoCodes, isLoading } = useQuery({
    queryKey: ['promo-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PromoCode[];
    },
  });

  const deletePromoCodeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast({
        title: "Promo code deleted",
        description: "The promo code has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete promo code.",
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
    },
  });

  const handleEdit = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPromoCode(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDiscount = (type: string, value: number) => {
    return type === 'percentage' ? `${value}%` : `₹${value}`;
  };

  if (showForm) {
    return (
      <AdminLayout>
        <PromoCodeForm
          promoCode={editingPromoCode}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Promo Codes</h1>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Promo Code
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage Promo Codes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Code</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Value</th>
                      <th className="text-left p-4 font-medium">Min Order</th>
                      <th className="text-left p-4 font-medium">Starts</th>
                      <th className="text-left p-4 font-medium">Expires</th>
                      <th className="text-left p-4 font-medium">Usage</th>
                      <th className="text-left p-4 font-medium">Active</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoCodes?.map((promoCode) => (
                      <tr key={promoCode.id} className="border-b hover:bg-gray-700 hover:text-blue-400 transition-colors">
                        <td className="p-4">
                          <span className="font-mono font-bold">{promoCode.code}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant={promoCode.discount_type === 'percentage' ? 'default' : 'secondary'}>
                            {promoCode.discount_type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {formatDiscount(promoCode.discount_type, promoCode.discount_value)}
                        </td>
                        <td className="p-4">₹{promoCode.min_cart_total}</td>
                        <td className="p-4">{formatDate(promoCode.start_date)}</td>
                        <td className="p-4">
                          {promoCode.end_date ? formatDate(promoCode.end_date) : 'No expiry'}
                        </td>
                        <td className="p-4">
                          {promoCode.usage_count}
                          {promoCode.usage_limit && ` / ${promoCode.usage_limit}`}
                        </td>
                        <td className="p-4">
                          <Switch
                            checked={promoCode.is_active}
                            onCheckedChange={(checked) =>
                              toggleActiveMutation.mutate({
                                id: promoCode.id,
                                isActive: checked,
                              })
                            }
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(promoCode)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePromoCodeMutation.mutate(promoCode.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!promoCodes || promoCodes.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No promo codes found. Create your first promo code to get started.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPromoCodes;
