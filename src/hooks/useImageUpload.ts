
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useImageUpload = () => {
  const [currentImageFile, setCurrentImageFile] = useState<File | null>(null);

  const uploadImage = async (currentImageUrl: string): Promise<string> => {
    if (!currentImageFile) return currentImageUrl;

    const fileExt = currentImageFile.name.split('.').pop();
    const fileName = `banner-${Date.now()}.${fileExt}`;
    const filePath = `banners/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, currentImageFile);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  return {
    currentImageFile,
    setCurrentImageFile,
    uploadImage
  };
};
