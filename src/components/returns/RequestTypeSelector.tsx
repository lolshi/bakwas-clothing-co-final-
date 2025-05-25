
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface RequestTypeSelectorProps {
  requestType: 'return' | 'refund';
  onRequestTypeChange: (value: 'return' | 'refund') => void;
}

const RequestTypeSelector: React.FC<RequestTypeSelectorProps> = ({ 
  requestType, 
  onRequestTypeChange 
}) => {
  return (
    <div>
      <Label className="text-white">Request Type</Label>
      <RadioGroup 
        value={requestType} 
        onValueChange={onRequestTypeChange} 
        className="mt-2"
      >
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
  );
};

export default RequestTypeSelector;
