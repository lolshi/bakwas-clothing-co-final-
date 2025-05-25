
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReasonSelectorProps {
  reason: string;
  onReasonChange: (value: string) => void;
  requestType: 'return' | 'refund';
}

const ReasonSelector: React.FC<ReasonSelectorProps> = ({ 
  reason, 
  onReasonChange, 
  requestType 
}) => {
  return (
    <div>
      <Label htmlFor="reason" className="text-white">
        Reason for {requestType === 'return' ? 'Return' : 'Refund'}
      </Label>
      <Select value={reason} onValueChange={onReasonChange}>
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
  );
};

export default ReasonSelector;
