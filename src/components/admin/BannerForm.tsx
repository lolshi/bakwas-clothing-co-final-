import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useBannerForm } from '@/hooks/useBannerForm';
import useMediaUpload from '@/hooks/useMediaUpload';
import BannerFormFields from './BannerFormFields';
import { X, Copy, Check, Cloud, Upload, ImageIcon, AlertCircle, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Banner } from '@/types/banner';

interface BannerFormProps {
  banner?: Banner | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const BannerForm: React.FC<BannerFormProps> = ({ banner, isOpen, onClose, onSave }) => {
  const { formData, updateFormData, loading, saveBanner } = useBannerForm(banner);
  const { 
    currentImageFile, 
    setCurrentImageFile,
    currentVideoFile,
    setCurrentVideoFile,
    uploadImage,
    uploadVideo
  } = useMediaUpload();
  const [imagePreview, setImagePreview] = useState<string>(banner?.image_url || '');
  const [videoPreview, setVideoPreview] = useState<string>(banner?.video_url || '');
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'video'>(banner?.media_type || 'image');
  const { toast } = useToast();

  useEffect(() => {
    if (banner) {
      setImagePreview(banner.image_url || '');
      setVideoPreview(banner.video_url || '');
      setActiveTab(banner.media_type || 'image');
      setCurrentImageFile(null);
      setCurrentVideoFile(null);
    } else {
      setImagePreview('');
      setVideoPreview('');
      setActiveTab('image');
      setCurrentImageFile(null);
      setCurrentVideoFile(null);
    }
  }, [banner]);

  const handleImageChange = (file: File | null, preview: string) => {
    setCurrentImageFile(file);
    setImagePreview(preview);
    setCurrentVideoFile(null);
    setVideoPreview('');
    setActiveTab('image');
    updateFormData({ 
      ...formData,
      media_type: 'image',
      show_title: formData.show_title ?? true,
      show_subtitle: formData.show_subtitle ?? true
    });
  };

  const handleVideoChange = (file: File | null, preview: string) => {
    setCurrentVideoFile(file);
    setVideoPreview(preview);
    setCurrentImageFile(null);
    setImagePreview('');
    setActiveTab('video');
    updateFormData({ 
      ...formData,
      media_type: 'video',
      show_title: formData.show_title ?? true,
      show_subtitle: formData.show_subtitle ?? true
    });
  };

  const handleMediaClear = () => {
    setImagePreview('');
    setVideoPreview('');
    setCurrentImageFile(null);
    setCurrentVideoFile(null);
    updateFormData({ 
      ...formData,
      image_url: '',
      video_url: null,
      media_type: activeTab,
      show_title: formData.show_title ?? true,
      show_subtitle: formData.show_subtitle ?? true
    });
  };

  const handleUploadToCloudinary = async () => {
    const currentFile = activeTab === 'image' ? currentImageFile : currentVideoFile;
    
    if (!currentFile) {
      toast({
        title: "No File Selected",
        description: `Please select a ${activeTab} to upload`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      let uploadedUrl;
      if (activeTab === 'image') {
        uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          updateFormData({ 
            ...formData,
            image_url: uploadedUrl,
            video_url: null,
            media_type: 'image',
            show_title: formData.show_title ?? true,
            show_subtitle: formData.show_subtitle ?? true
          });
        }
      } else {
        uploadedUrl = await uploadVideo();
        if (uploadedUrl) {
          updateFormData({ 
            ...formData,
            video_url: uploadedUrl,
            image_url: formData.image_url || '', // Keep the image URL for fallback
            media_type: 'video',
            show_title: formData.show_title ?? true,
            show_subtitle: formData.show_subtitle ?? true
          });
        }
      }

      if (uploadedUrl) {
        toast({
          title: "Success",
          description: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} uploaded successfully!`,
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || `Failed to upload ${activeTab}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "File URL copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying manually",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast({
        title: "Required Field Missing",
        description: "Please enter a banner title",
        variant: "destructive",
      });
      return;
    }

    const mediaUrl = activeTab === 'image' ? formData.image_url : formData.video_url;
    if (!mediaUrl) {
      toast({
        title: "Media Required",
        description: `Please upload a ${activeTab} for the banner`,
        variant: "destructive",
      });
      return;
    }

    try {
      await saveBanner(mediaUrl, activeTab, onSave, onClose);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: "Error",
        description: "Failed to save banner. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90%] w-[1200px] p-0 gap-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
            {banner ? 'Edit Banner' : 'Create New Banner'}
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Configure your banner settings and content
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                {banner?.id ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {banner?.id ? 'Update your banner information and settings' : 'Create a new banner for your storefront'}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1 px-6 py-4 bg-white dark:bg-gray-800">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
              {/* Left Column - Media Upload */}
              <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'image' | 'video')}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Banner Media</h3>
                      <TabsList>
                        <TabsTrigger value="image" className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Image
                        </TabsTrigger>
                        <TabsTrigger value="video" className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Video
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="image">
                      <MediaUploadArea
                        type="image"
                        accept="image/*"
                        file={currentImageFile}
                        preview={imagePreview}
                        onChange={handleImageChange}
                        onClear={handleMediaClear}
                        onUpload={handleUploadToCloudinary}
                        uploading={uploading}
                        uploadedUrl={formData.image_url}
                        onCopyUrl={copyToClipboard}
                        copied={copied}
                      />
                    </TabsContent>

                    <TabsContent value="video">
                      <MediaUploadArea
                        type="video"
                        accept="video/*"
                        file={currentVideoFile}
                        preview={videoPreview}
                        onChange={handleVideoChange}
                        onClear={handleMediaClear}
                        onUpload={handleUploadToCloudinary}
                        uploading={uploading}
                        uploadedUrl={formData.video_url || ''}
                        onCopyUrl={copyToClipboard}
                        copied={copied}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Right Column - Banner Details */}
              <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <ImageIcon className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Banner Details</h3>
                  </div>
                  
                  <BannerFormFields
                    formData={formData}
                    onUpdateFormData={updateFormData}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <AlertCircle className="h-4 w-4 mr-2" />
              All changes will be saved immediately
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || uploading}
                className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800"
              >
                {loading ? 'Saving...' : banner?.id ? 'Update Banner' : 'Create Banner'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface MediaUploadAreaProps {
  type: 'image' | 'video';
  accept: string;
  file: File | null;
  preview: string;
  onChange: (file: File | null, preview: string) => void;
  onClear: () => void;
  onUpload: () => void;
  uploading: boolean;
  uploadedUrl: string;
  onCopyUrl: (url: string) => void;
  copied: boolean;
}

const MediaUploadArea: React.FC<MediaUploadAreaProps> = ({
  type,
  accept,
  file,
  preview,
  onChange,
  onClear,
  onUpload,
  uploading,
  uploadedUrl,
  onCopyUrl,
  copied
}) => {
  return (
    <div className="space-y-4">
      <div className={`relative ${uploading ? 'opacity-50' : ''}`}>
        <div 
          className={`border-2 border-dashed rounded-lg p-8 transition-all duration-200 ease-in-out
            ${preview 
              ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900' 
              : 'border-blue-500 hover:border-blue-600 dark:border-blue-400 dark:hover:border-blue-500 bg-blue-50 dark:bg-gray-900 cursor-pointer'
            }`}
        >
          <input
            type="file"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onChange(file, URL.createObjectURL(file));
              }
            }}
            className="hidden"
            id={`banner-${type}-upload`}
          />
          
          {!preview ? (
            <label htmlFor={`banner-${type}-upload`} className="flex flex-col items-center cursor-pointer">
              <Upload className="h-12 w-12 text-blue-500 dark:text-blue-400 mb-4" />
              <div className="text-center space-y-2">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Click to upload {type}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {type === 'image' ? 'SVG, PNG, JPG or GIF (Max. 5MB)' : 'MP4, WebM or OGG (Max. 20MB)'}
                </p>
              </div>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                {type === 'image' ? (
                  <img
                    src={preview}
                    alt="Banner preview"
                    className="w-full aspect-[3/1] object-cover"
                  />
                ) : (
                  <video
                    src={preview}
                    className="w-full aspect-[3/1] object-cover"
                    controls
                  />
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                  onClick={onClear}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Button
                type="button"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                onClick={onUpload}
                disabled={uploading || !file}
              >
                {uploading ? (
                  <>
                    <Cloud className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Cloud className="h-4 w-4 mr-2" />
                    Upload to Cloud
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {uploadedUrl && (
        <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-3">
            <Cloud className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">Uploaded Successfully</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Cloud Storage
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-md p-2 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-mono truncate flex-1 text-gray-900 dark:text-gray-100">
              {uploadedUrl}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => onCopyUrl(uploadedUrl)}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerForm;
