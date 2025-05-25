
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface Banner {
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  sort_order: number;
}

interface BannerFormFieldsProps {
  formData: Banner;
  onUpdateFormData: (updates: Partial<Banner>) => void;
}

const BannerFormFields: React.FC<BannerFormFieldsProps> = ({
  formData,
  onUpdateFormData
}) => {
  return (
    <>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onUpdateFormData({ title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Textarea
          id="subtitle"
          value={formData.subtitle}
          onChange={(e) => onUpdateFormData({ subtitle: e.target.value })}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="link_url">Link URL</Label>
        <Input
          id="link_url"
          type="url"
          value={formData.link_url}
          onChange={(e) => onUpdateFormData({ link_url: e.target.value })}
          placeholder="https://example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sort_order">Priority Order</Label>
          <Input
            id="sort_order"
            type="number"
            value={formData.sort_order}
            onChange={(e) => onUpdateFormData({ sort_order: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.is_active}
            onCheckedChange={(checked) => onUpdateFormData({ is_active: checked })}
          />
          <Label htmlFor="active">Active</Label>
        </div>
      </div>
    </>
  );
};

export default BannerFormFields;
