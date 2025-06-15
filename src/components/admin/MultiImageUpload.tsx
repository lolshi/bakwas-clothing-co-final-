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

      console.log('🔄 Uploading file:', fileName, 'to path:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ Upload error for file:', fileName, uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      console.log('✅ Generated public URL:', publicUrl);

      // Optional URL accessibility check (don't fail upload if this fails)
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' });
        console.log('🔗 URL accessibility check:', response.status, response.statusText);
        if (!response.ok) {
          console.warn('⚠️ URL may not be accessible yet (this is normal for new uploads):', publicUrl);
        } else {
          console.log('✅ URL is accessible:', publicUrl);
        }
      } catch (error) {
        console.warn('⚠️ Could not verify URL accessibility (this is normal):', error);
        // Don't throw error here - the upload was successful even if we can't verify accessibility
      }

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const tempId = productId || `temp_${Date.now()}`;
      console.log('🚀 Starting upload process with ID:', tempId);
      console.log('📁 Files to upload:', selectedFiles.map(f => f.name));
      
      const newImageUrls = await uploadImages(selectedFiles, tempId);
      console.log('📸 Uploaded image URLs:', newImageUrls);
      
      const updatedImages = [...images, ...newImageUrls];
      console.log('🔄 Updated images array:', updatedImages);
      
      onImagesChange(updatedImages);
      setSelectedFiles([]);
      
      // Clear the input
      const input = document.getElementById('images') as HTMLInputElement;
      if (input) input.value = '';

      toast({
        title: "Upload Successful! 🎉",
        description: `${newImageUrls.length} image(s) uploaded successfully to storage bucket.`,
      });
      
      console.log('✅ Upload process completed successfully');
    } catch (error: any) {
      console.error('💥 Error uploading images:', error);
      
      // Improved error handling
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message.toLowerCase();
        
        if (errorMessage.includes('bucket') || errorMessage.includes('not found')) {
          toast({
            title: "Storage Bucket Error",
            description: "The 'products' storage bucket doesn't exist. Please create it in Supabase Dashboard → Storage.",
            variant: "destructive",
          });
        } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
          toast({
            title: "Permission Error", 
            description: "No permission to upload. Check storage policies in Supabase Dashboard.",
            variant: "destructive",
          });
        } else if (errorMessage.includes('policy') || errorMessage.includes('rls')) {
          toast({
            title: "Policy Error",
            description: "Storage policy prevents upload. Check Row Level Security settings.",
            variant: "destructive",
          });
        } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
          toast({
            title: "Storage Limit",
            description: "Storage quota exceeded. Please upgrade your Supabase plan or free up space.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Upload Error",
            description: `Upload failed: ${(error as any).message}`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Unknown Error",
          description: "Upload failed for unknown reason. Check browser console for details.",
          variant: "destructive",
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4 p-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
      <div className="flex items-center justify-between">
        <Label htmlFor="images" className="text-lg font-semibold text-slate-900">Product Images</Label>
        <div className="text-sm text-slate-600">
          {images.length > 0 ? `${images.length} image(s) uploaded` : 'No images uploaded yet'}
        </div>
      </div>
      
      {/* Current Status */}
      <div className="bg-white p-3 rounded-lg border">
        <div className="text-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${images.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className={images.length > 0 ? 'text-green-700 font-medium' : 'text-gray-600'}>
              {images.length > 0 ? `✅ ${images.length} image(s) ready` : '📸 No images added yet'}
            </span>
          </div>
          {selectedFiles.length > 0 && (
            <div className="flex items-center gap-2 text-orange-600">
              <div className="w-3 h-3 rounded-full bg-orange-400"></div>
              <span>⚠️ {selectedFiles.length} file(s) selected but not uploaded yet</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Existing Images */}
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">Uploaded Images:</h4>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-green-200"
                />
                <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                  ✅ Uploaded
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Selection */}
      <div className="space-y-3">
        <Input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('images')?.click()}
            className="w-full h-12 border-2 border-dashed border-slate-400 hover:border-neon-cyan hover:bg-neon-cyan/5"
          >
            <Upload className="h-5 w-5 mr-2" />
            {selectedFiles.length > 0 ? 'Select Different Images' : 'Select Images to Upload'}
          </Button>
          
          {selectedFiles.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-orange-800">
                  📁 {selectedFiles.length} file(s) selected and ready to upload:
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-orange-700">
                    <span>📄 {file.name}</span>
                    <span className="text-xs text-orange-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                ))}
              </div>
              
              <Button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-cyan/90 hover:to-neon-purple/90 text-white font-medium h-12"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Uploading {selectedFiles.length} image(s)...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    🚀 Upload {selectedFiles.length} Image(s) Now
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Preview Selected Files */}
      {selectedFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">Preview (Not uploaded yet):</h4>
          <div className="grid grid-cols-3 gap-4">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-orange-200"
                />
                <div className="absolute inset-0 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-orange-800 text-xs font-bold bg-orange-200 px-2 py-1 rounded">
                    ⏳ Not Uploaded
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {images.length === 0 && selectedFiles.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Upload className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-lg font-medium">No images selected</p>
          <p className="text-sm">Click "Select Images to Upload" to add product photos</p>
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;
