
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBannerForm } from '@/hooks/useBannerForm';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImageUpload from './ImageUpload';
import BannerFormFields from './BannerFormFields';

interface Banner {
  id?: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  sort_order: number;
}

interface BannerFormProps {
  banner?: Banner | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const BannerForm: React.FC<BannerFormProps> = ({ banner, isOpen, onClose, onSave }) => {
  const { formData, updateFormData, loading, saveBanner } = useBannerForm(banner);
  const { currentImageFile, setCurrentImageFile, uploadImage } = useImageUpload();
  const [imagePreview, setImagePreview] = useState<string>(banner?.image_url || '');

  const handleImageChange = (file: File | null, preview: string) => {
    setCurrentImageFile(file);
    setImagePreview(preview);
  };

  const handleImageClear = () => {
    setImagePreview('');
    setCurrentImageFile(null);
    updateFormData({ image_url: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const imageUrl = await uploadImage(formData.image_url);
      await saveBanner(imageUrl, onSave, onClose);
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {banner?.id ? 'Edit Banner' : 'Add New Banner'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <BannerFormFields
            formData={formData}
            onUpdateFormData={updateFormData}
          />

          <ImageUpload
            imagePreview={imagePreview}
            onImageChange={handleImageChange}
            onImageClear={handleImageClear}
          />

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : banner?.id ? 'Update Banner' : 'Create Banner'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BannerForm;
