
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PhotoUploadProps {
  photos: File[];
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (index: number) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  photos, 
  onPhotoUpload, 
  onRemovePhoto 
}) => {
  return (
    <div>
      <Label htmlFor="photos" className="text-white">Upload Photos (Optional, max 5)</Label>
      <Input
        id="photos"
        type="file"
        accept="image/*"
        multiple
        onChange={onPhotoUpload}
        className="bg-gray-700 text-white border-gray-600"
      />
      {photos.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(photo)}
                alt={`Upload ${index + 1}`}
                className="w-20 h-20 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => onRemovePhoto(index)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
