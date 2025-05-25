import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MultiImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  productId?: string;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  images,
  onImagesChange,
  productId
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const uploadImages = async (files: File[], tempProductId: string): Promise<string[]> => {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tempProductId}_${Date.now()}_${index}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const tempId = productId || `temp_${Date.now()}`;
      const newImageUrls = await uploadImages(selectedFiles, tempId);
      onImagesChange([...images, ...newImageUrls]);
      setSelectedFiles([]);
      
      // Clear the input
      const input = document.getElementById('images') as HTMLInputElement;
      if (input) input.value = '';

      toast({
        title: "Success",
        description: `${newImageUrls.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  return (
    <div>
      <Label htmlFor="images">Product Images</Label>
      
      {/* Existing Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative">
              <img
                src={imageUrl}
                alt={`Product image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* File Selection */}
      <div className="flex items-center gap-2 mb-4">
        <Input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('images')?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Select Images
        </Button>
        {selectedFiles.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {selectedFiles.length} file(s) selected
          </span>
        )}
      </div>

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <Button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="mb-4"
        >
          {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image(s)`}
        </Button>
      )}

      {/* Preview Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {selectedFiles.map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg opacity-70"
              />
              <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">Preview</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;
