import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image, X, Upload, Cloud } from 'lucide-react';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const previewUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setLocalPreview(previewUrl);
    }
  }, []);

  const handleUpload = () => {
    if (selectedFile) {
      onImageChange(selectedFile, localPreview);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setLocalPreview('');
    onImageClear();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Banner Image</h3>
        </div>
        <p className="text-sm text-gray-500">Recommended size: 1920x600px</p>
      </div>
      
      {imagePreview ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white">
          <img
            src={imagePreview}
            alt="Banner preview"
            className="w-full aspect-[3/1] object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : localPreview ? (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white">
            <img
              src={localPreview}
              alt="Selected image"
              className="w-full aspect-[3/1] object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={handleUpload}
              className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <Cloud className="h-4 w-4" />
              Upload to Cloudinary
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200 aspect-[3/1] flex flex-col items-center justify-center
            ${isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
            </p>
            <p className="text-xs text-gray-600">
              or click to select a file
            </p>
            <p className="text-xs text-gray-500">
              Supported formats: JPEG, PNG, GIF, WebP
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
