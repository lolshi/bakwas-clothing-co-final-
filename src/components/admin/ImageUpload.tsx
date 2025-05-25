
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploadProps {
  imagePreview: string;
  onImageChange: (file: File | null, preview: string) => void;
  onImageClear: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  imagePreview,
  onImageChange,
  onImageClear
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        onImageChange(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setImageFile(null);
    onImageClear();
  };

  const uploadImage = async (currentImageUrl: string): Promise<string> => {
    if (!imageFile) return currentImageUrl;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `banner-${Date.now()}.${fileExt}`;
    const filePath = `banners/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, imageFile);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  return {
    component: (
      <div>
        <Label htmlFor="image">Banner Image</Label>
        <div className="mt-2">
          {imagePreview && (
            <div className="relative mb-4">
              <img
                src={imagePreview}
                alt="Banner preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('image')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
            <span className="text-sm text-muted-foreground">
              {imageFile ? imageFile.name : 'No file selected'}
            </span>
          </div>
        </div>
      </div>
    ),
    uploadImage
  };
};

export default ImageUpload;
