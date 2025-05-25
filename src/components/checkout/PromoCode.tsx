
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface PromoCodeProps {
  onApply: (code: string) => Promise<boolean>;
}

const PromoCode: React.FC<PromoCodeProps> = ({ onApply }) => {
  const [code, setCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setIsApplying(true);
    await onApply(code.trim().toUpperCase());
    setIsApplying(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-anton text-neon-cyan">
          Have a promo code?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Input
            placeholder="Enter promo code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyPress={handleKeyPress}
            className="focus:border-neon-cyan transition-colors"
            disabled={isApplying}
          />
          <Button
            onClick={handleApply}
            disabled={!code.trim() || isApplying}
            className="bg-neon-cyan text-black hover:bg-neon-cyan/80 min-w-[100px]"
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Applying
              </>
            ) : (
              'Apply'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromoCode;
