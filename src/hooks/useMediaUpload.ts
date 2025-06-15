import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MediaUploadHook {
  currentImageFile: File | null;
  setCurrentImageFile: (file: File | null) => void;
  currentVideoFile: File | null;
  setCurrentVideoFile: (file: File | null) => void;
  uploadImage: () => Promise<string | null>;
  uploadVideo: () => Promise<string | null>;
}

const CLOUDINARY_CLOUD_NAME = 'dpuygtr2j';
const CLOUDINARY_UPLOAD_PRESET = 'bakwas_unsigned';

const useMediaUpload = (): MediaUploadHook => {
  const [currentImageFile, setCurrentImageFile] = useState<File | null>(null);
  const [currentVideoFile, setCurrentVideoFile] = useState<File | null>(null);
  const { toast } = useToast();

  const uploadToCloudinary = async (file: File, resourceType: 'image' | 'video'): Promise<string | null> => {
    if (!file) return null;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error(`${resourceType} upload error:`, error);
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${resourceType}. Please try again.`,
        variant: "destructive",
      });
      return null;
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!currentImageFile) {
      toast({
        title: "No Image Selected",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return null;
    }

    // Validate image size (5MB limit)
    if (currentImageFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return null;
    }

    return uploadToCloudinary(currentImageFile, 'image');
  };

  const uploadVideo = async (): Promise<string | null> => {
    if (!currentVideoFile) {
      toast({
        title: "No Video Selected",
        description: "Please select a video to upload",
        variant: "destructive",
      });
      return null;
    }

    // Validate video size (20MB limit)
    if (currentVideoFile.size > 20 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Video must be less than 20MB",
        variant: "destructive",
      });
      return null;
    }

    return uploadToCloudinary(currentVideoFile, 'video');
  };

  return {
    currentImageFile,
    setCurrentImageFile,
    currentVideoFile,
    setCurrentVideoFile,
    uploadImage,
    uploadVideo,
  };
};

export default useMediaUpload; 