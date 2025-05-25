
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PromoCodeProps {
  onApply: (code: string) => Promise<boolean>;
  appliedCode?: string;
  onRemove?: () => void;
}

const PromoCode: React.FC<PromoCodeProps> = ({ onApply, appliedCode, onRemove }) => {
  const [code, setCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();

  const handleApply = async () => {
    if (!code.trim()) {
      toast({
        title: "Please enter a promo code",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);

    try {
      // Validate promo code with database
      const { data: promoCode, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !promoCode) {
        toast({
          title: "Invalid promo code",
          description: "Please check your code and try again",
          variant: "destructive",
        });
        setIsApplying(false);
        return;
      }

      // Check if promo code is still valid
      const now = new Date();
      const startDate = new Date(promoCode.start_date);
      const endDate = promoCode.end_date ? new Date(promoCode.end_date) : null;

      if (now < startDate) {
        toast({
          title: "Promo code not yet active",
          description: "This promo code is not yet available",
          variant: "destructive",
        });
        setIsApplying(false);
        return;
      }

      if (endDate && now > endDate) {
        toast({
          title: "Promo code expired",
          description: "This promo code has expired",
          variant: "destructive",
        });
        setIsApplying(false);
        return;
      }

      // Check usage limit
      if (promoCode.usage_limit && promoCode.usage_count >= promoCode.usage_limit) {
        toast({
          title: "Promo code limit reached",
          description: "This promo code has reached its usage limit",
          variant: "destructive",
        });
        setIsApplying(false);
        return;
      }

      const success = await onApply(code.toUpperCase());
      
      if (success) {
        setCode('');
        toast({
          title: "Promo code applied!",
          description: `${promoCode.discount_type === 'percentage' ? promoCode.discount_value + '%' : '₹' + promoCode.discount_value} discount applied`,
        });
      }
    } catch (error) {
      toast({
        title: "Error applying promo code",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
      toast({
        title: "Promo code removed",
        description: "The discount has been removed from your order",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Tag className="h-5 w-5" />
          <span>Promo Code</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appliedCode ? (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {appliedCode}
              </Badge>
              <span className="text-sm text-green-700">Applied successfully!</span>
            </div>
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex space-x-2">
            <Input
              placeholder="Enter promo code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleApply()}
              disabled={isApplying}
            />
            <Button
              onClick={handleApply}
              disabled={isApplying || !code.trim()}
            >
              {isApplying ? 'Applying...' : 'Apply'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromoCode;
