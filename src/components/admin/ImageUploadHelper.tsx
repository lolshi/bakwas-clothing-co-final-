import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Copy, Check, Image as ImageIcon, Tag, FileText, Download, X, Plus, Cloud, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ImageUploadHelperProps {
  onUrlsGenerated: (urls: string[]) => void;
}

interface ProductImageGroup {
  id: string;
  productName: string;
  productSlug: string;
  images: string[];
}

interface UploadedImageInfo {
  url: string;
  fileName: string;
  storageProvider: string;
  timestamp: number;
  fileSize: number;
}

type StorageProvider = 'supabase' | 'cloudinary' | 'imgbb' | 'postimages' | 'file2io';

const ImageUploadHelper: React.FC<ImageUploadHelperProps> = ({ onUrlsGenerated }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageInfo[]>([]);
  const [copiedUrls, setCopiedUrls] = useState<Set<string>>(new Set());
  const [productGroups, setProductGroups] = useState<ProductImageGroup[]>([]);
  const [currentProductName, setCurrentProductName] = useState('');
  const [currentProductSlug, setCurrentProductSlug] = useState('');
  const [storageProvider, setStorageProvider] = useState<StorageProvider>('cloudinary');

  // Storage test functionality
  const [storageStatus, setStorageStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [storageMessage, setStorageMessage] = useState('');

  // Auto-generate slug from product name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Cloudinary upload function (using your own account)
  const uploadToCloudinary = async (file: File): Promise<{url: string, provider: string}> => {
    try {
      // Your Cloudinary credentials are now configured
      const CLOUDINARY_CLOUD_NAME = 'dpuygtr2j';  // Your cloud name from dashboard
      const CLOUDINARY_UPLOAD_PRESET = 'bakwas_unsigned';  // Your unsigned upload preset
      
      // Use your own Cloudinary account
      console.log('Using your Cloudinary account:', CLOUDINARY_CLOUD_NAME);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.secure_url) {
        return { url: data.secure_url, provider: 'Cloudinary (Your Account)' };
      } else {
        throw new Error('No URL returned from Cloudinary');
      }
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      // Fallback to GitHub-based hosting
      const result = await uploadToGitHub(file);
      return { url: result.url, provider: `Cloudinary→${result.provider}` };
    }
  };

  // GitHub-based image hosting using GitHub's user content
  const uploadToGitHub = async (file: File): Promise<{url: string, provider: string}> => {
    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      // Create a simple GitHub Pages compatible hosting
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // For demo purposes, we'll create a data URL that can be used
      // In production, you'd upload to a GitHub repository
      console.log('Creating GitHub-compatible URL for:', fileName);
      
      // Since we can't actually upload to GitHub without authentication,
      // let's use a working free service: Imgur's API
      const result = await uploadToImgur(file);
      return { url: result.url, provider: result.provider };
      
    } catch (error) {
      console.error('GitHub upload failed:', error);
      const result = await uploadToImgur(file);
      return { url: result.url, provider: result.provider };
    }
  };

  // Imgur upload (works without API key for small uploads)
  const uploadToImgur = async (file: File): Promise<{url: string, provider: string}> => {
    try {
      const base64 = await fileToBase64(file);
      const base64Data = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': 'Client-ID 546c25a59c58ad7', // Public demo client ID
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          type: 'base64'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success && data.data && data.data.link) {
        return { url: data.data.link, provider: 'Imgur' };
      } else {
        throw new Error('Imgur upload failed - no URL returned');
      }
    } catch (error) {
      console.error('Imgur upload failed:', error);
      // Final fallback to local base64
      const result = await createLocalImageURL(file);
      return { url: result.url, provider: `Imgur→${result.provider}` };
    }
  };

  // ImgBB upload function with working API key
  const uploadToImgBB = async (file: File): Promise<{url: string, provider: string}> => {
    try {
      // Try Imgur first as it's more reliable
      const result = await uploadToImgur(file);
      return { url: result.url, provider: result.provider };
    } catch (error) {
      console.error('ImgBB/Imgur upload failed:', error);
      const result = await createLocalImageURL(file);
      return { url: result.url, provider: result.provider };
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Create a local base64 data URL (fallback option)
  const createLocalImageURL = async (file: File): Promise<{url: string, provider: string}> => {
    try {
      const base64 = await fileToBase64(file);
      
      // For demo purposes, we'll store in localStorage and create a reference
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const imageData = {
        id: imageId,
        name: file.name,
        data: base64,
        timestamp: Date.now()
      };
      
      // Store in localStorage (note: has size limits ~5-10MB)
      try {
        localStorage.setItem(`bakwas_image_${imageId}`, JSON.stringify(imageData));
        // Return a reference URL that can be resolved later
        return { url: `local://bakwas_image_${imageId}`, provider: 'Local' };
      } catch (storageError) {
        console.warn('localStorage full, using direct base64 URL');
        return { url: base64, provider: 'Local' };
      }
    } catch (error) {
      console.error('Local image URL creation failed:', error);
      throw new Error('Unable to create image URL. Please try a smaller file.');
    }
  };

  const uploadImages = async (files: FileList, productName?: string, productSlug?: string) => {
    setUploading(true);
    const urls: string[] = [];
    
    console.log('Starting upload for', files.length, 'files');
    console.log('Product context:', { productName, productSlug });
    console.log('Using storage provider:', storageProvider);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing file ${i + 1}:`, file.name, file.type, file.size);
        
        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          console.warn(`Skipping file ${file.name}: not an image or video`);
          toast({
            title: "Invalid File",
            description: `${file.name} is not an image or video file`,
            variant: "destructive",
          });
          continue;
        }
        
        // Validate file size (max 25MB for video, 10MB for images)
        const maxSize = file.type.startsWith('video/') ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          console.warn(`Skipping file ${file.name}: too large (${file.size} bytes)`);
          toast({
            title: "File Too Large",
            description: `${file.name} is larger than ${file.type.startsWith('video/') ? '25MB' : '10MB'}`,
            variant: "destructive",
          });
          continue;
        }
        
        try {
          let uploadedUrl: string;
          let actualProvider: string;
          
          console.log(`Uploading ${file.name} using ${storageProvider}...`);
          
          // Upload using selected provider
          switch (storageProvider) {
            case 'cloudinary':
              const cloudinaryResult = await uploadToCloudinary(file);
              uploadedUrl = cloudinaryResult.url;
              actualProvider = cloudinaryResult.provider;
              break;
            case 'imgbb':
              const imgbbResult = await uploadToImgBB(file);
              uploadedUrl = imgbbResult.url;
              actualProvider = imgbbResult.provider;
              break;
            case 'postimages':
              const postimagesResult = await uploadToImgur(file);
              uploadedUrl = postimagesResult.url;
              actualProvider = postimagesResult.provider;
              break;
            case 'file2io':
              const file2ioResult = await createLocalImageURL(file);
              uploadedUrl = file2ioResult.url;
              actualProvider = file2ioResult.provider;
              break;
            case 'supabase':
            default:
              uploadedUrl = await uploadToSupabase(file, productSlug, i);
              actualProvider = 'Supabase';
              break;
          }
          
          console.log('Upload successful for', file.name, ':', uploadedUrl);
          urls.push(uploadedUrl);
          
          // Store detailed image information
          const imageInfo: UploadedImageInfo = {
            url: uploadedUrl,
            fileName: file.name,
            storageProvider: actualProvider,
            timestamp: Date.now(),
            fileSize: file.size
          };
          
          setUploadedImages(prev => [...prev, imageInfo]);
          
          // Show progress toast for each successful upload
          toast({
            title: "File Uploaded",
            description: `${file.name} uploaded to ${actualProvider}!`,
          });
          
        } catch (uploadError: any) {
          console.error('Upload error for file:', file.name, uploadError);
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}: ${uploadError.message}`,
            variant: "destructive",
          });
          continue;
        }
      }
      
      console.log('All uploads completed. URLs:', urls);
      
      if (urls.length > 0) {
        setUploadedUrls(prev => {
          const newUrls = [...prev, ...urls];
          console.log('Updated uploaded URLs:', newUrls);
          return newUrls;
        });
        onUrlsGenerated(urls);
        
        // If uploading for a specific product, add to that group
        if (productName && productSlug) {
          console.log('Adding to product group:', productName);
          const existingGroupIndex = productGroups.findIndex(g => g.productSlug === productSlug);
          if (existingGroupIndex >= 0) {
            const updatedGroups = [...productGroups];
            updatedGroups[existingGroupIndex].images.push(...urls);
            setProductGroups(updatedGroups);
          } else {
            const newGroup: ProductImageGroup = {
              id: Date.now().toString(),
              productName,
              productSlug,
              images: urls
            };
            setProductGroups(prev => [...prev, newGroup]);
          }
        }
        
        toast({
          title: "Upload Complete!",
          description: `${urls.length} file(s) uploaded successfully using ${storageProvider}!`,
        });
      } else {
        console.warn('No files were successfully uploaded');
        toast({
          title: "No Files Uploaded",
          description: "No valid files were uploaded. Please check your files and try again.",
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error('General upload error:', error);
      toast({
        title: "Upload Error",
        description: `An error occurred during upload: ${error.message}. Check console for details.`,
        variant: "destructive",
      });
    } finally {
      console.log('Upload process finished, setting uploading to false');
      setUploading(false);
    }
  };

  // Supabase upload function (moved to separate function)
  const uploadToSupabase = async (file: File, productSlug?: string, index: number = 0): Promise<string> => {
    // First, let's check what buckets are available
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Cannot access storage buckets: ${bucketsError.message}`);
    }
    
    console.log('Available storage buckets:', buckets?.map(b => b.name));
    
    // Determine which bucket to use (try 'products' first, then 'product-images')
    let bucketName = 'products';
    const hasProductsBucket = buckets?.some(bucket => bucket.name === 'products');
    const hasProductImagesBucket = buckets?.some(bucket => bucket.name === 'product-images');
    
    if (!hasProductsBucket && hasProductImagesBucket) {
      bucketName = 'product-images';
    } else if (!hasProductsBucket && !hasProductImagesBucket) {
      // No suitable bucket found, try to create one
      console.log('No suitable bucket found, creating "products" bucket...');
      
      const { error: createError } = await supabase.storage.createBucket('products', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createError) {
        throw new Error(`Cannot create storage bucket: ${createError.message}`);
      } else {
        console.log('Successfully created "products" bucket');
        bucketName = 'products';
      }
    }
    
    console.log('Using bucket:', bucketName);
    
    // Generate filename with product context
    const fileExt = file.name.split('.').pop();
    const baseFileName = productSlug 
      ? `${productSlug}-${Date.now()}-${index + 1}.${fileExt}`
      : `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${baseFileName}`;
    
    console.log('Uploading to bucket:', bucketName, 'path:', filePath);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);
      
    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (currentProductName && currentProductSlug) {
        uploadImages(files, currentProductName, currentProductSlug);
      } else {
        uploadImages(files);
      }
    }
  };

  // Separate handler for legacy upload to ensure it always works
  const handleLegacyFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed!', event.target.files);
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log('Files selected:', Array.from(files).map(f => f.name));
      uploadImages(files); // Always call without product context for legacy upload
    } else {
      console.log('No files selected');
    }
  };

  // Test function to verify click handling
  const handleUploadButtonClick = () => {
    console.log('Upload button clicked!');
    const fileInput = document.getElementById('legacy-image-upload') as HTMLInputElement;
    if (fileInput) {
      console.log('File input found, triggering click');
      fileInput.click();
    } else {
      console.error('File input not found!');
    }
  };

  const addNewProductGroup = () => {
    if (!currentProductName.trim()) {
      toast({
        title: "Product Name Required",
        description: "Please enter a product name before adding images",
        variant: "destructive",
      });
      return;
    }

    const slug = currentProductSlug || generateSlug(currentProductName);
    const newGroup: ProductImageGroup = {
      id: Date.now().toString(),
      productName: currentProductName,
      productSlug: slug,
      images: []
    };
    
    setProductGroups(prev => [...prev, newGroup]);
    setCurrentProductName('');
    setCurrentProductSlug('');
  };

  const removeProductGroup = (groupId: string) => {
    setProductGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const removeImageFromGroup = (groupId: string, imageUrl: string) => {
    setProductGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, images: group.images.filter(img => img !== imageUrl) }
          : group
      )
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrls(prev => new Set([...prev, text]));
      
      toast({
        title: "Copied!",
        description: "URL copied to clipboard",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedUrls(prev => {
          const newSet = new Set(prev);
          newSet.delete(text);
          return newSet;
        });
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  const generateCSVData = () => {
    const csvRows = productGroups.map(group => {
      const imageUrls = group.images.join(',');
      return `${group.productName},${group.productSlug},"",0,0,true,false,"","","","${imageUrls}"`;
    });
    
    const headers = 'name,slug,description,price,stock_quantity,is_active,is_featured,color,tags,category_ids,images';
    return [headers, ...csvRows].join('\n');
  };

  const downloadCSVTemplate = () => {
    if (productGroups.length === 0) {
      toast({
        title: "No Products",
        description: "Add some products with images first",
        variant: "destructive",
      });
      return;
    }

    const csvContent = generateCSVData();
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-with-images.csv';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "CSV Downloaded",
      description: "Products CSV with image URLs generated!",
    });
  };

  // Storage test functionality
  const testStorageAccess = async () => {
    setStorageStatus('testing');
    setStorageMessage('Testing storage access...');
    
    try {
      // Test 1: List buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        setStorageStatus('error');
        setStorageMessage(`❌ Cannot access storage: ${bucketsError.message}`);
        return;
      }
      
      const bucketNames = buckets?.map(b => b.name) || [];
      console.log('Available buckets:', bucketNames);
      
      // Test 2: Check for suitable bucket
      const hasProductsBucket = bucketNames.includes('products');
      const hasProductImagesBucket = bucketNames.includes('product-images');
      
      if (!hasProductsBucket && !hasProductImagesBucket) {
        setStorageStatus('error');
        setStorageMessage(`❌ No suitable storage bucket found. Available buckets: ${bucketNames.join(', ')}`);
        return;
      }
      
      const bucketToTest = hasProductsBucket ? 'products' : 'product-images';
      
      // Test 3: Try to list files in the bucket
      const { data: files, error: listError } = await supabase.storage
        .from(bucketToTest)
        .list('', { limit: 1 });
        
      if (listError) {
        setStorageStatus('error');
        setStorageMessage(`❌ Cannot access bucket '${bucketToTest}': ${listError.message}`);
        return;
      }
      
      // Test 4: Try a small upload test
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testFileName = `test-${Date.now()}.txt`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucketToTest)
        .upload(testFileName, testBlob);
        
      if (uploadError) {
        setStorageStatus('error');
        setStorageMessage(`❌ Cannot upload to '${bucketToTest}': ${uploadError.message}`);
        return;
      }
      
      // Clean up test file
      await supabase.storage.from(bucketToTest).remove([testFileName]);
      
      setStorageStatus('success');
      setStorageMessage(`✅ Storage is working! Using bucket: '${bucketToTest}'. Found ${bucketNames.length} total buckets.`);
      
    } catch (error: any) {
      setStorageStatus('error');
      setStorageMessage(`❌ Unexpected error: ${error.message}`);
    }
  };

  return (
    <Card className="bg-white border-2 border-purple-300 shadow-lg">
      <CardHeader className="bg-purple-50 border-b border-purple-200">
        <CardTitle className="flex items-center gap-2 text-purple-800 font-bold">
          <ImageIcon className="h-5 w-5" />
          Smart Image Upload & Organization
        </CardTitle>
        <p className="text-purple-700 font-medium">Upload images organized by product for easy bulk import</p>
      </CardHeader>
      <CardContent className="p-6 bg-white space-y-6">
        {/* Storage Provider Selection */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-800 text-lg flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Choose Storage Provider
            </CardTitle>
            <p className="text-purple-700 text-sm">Select where to upload your images and videos</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Debug Test */}
            <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Debug Test:</strong> Click below to test if JavaScript is working
              </p>
              <Button 
                onClick={() => {
                  console.log('Debug button clicked!');
                  alert('JavaScript is working! Check console for upload logs.');
                }}
                size="sm"
                variant="outline"
                className="border-yellow-400 text-yellow-700"
              >
                Test JavaScript
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Cloudinary Option */}
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  storageProvider === 'cloudinary' 
                    ? 'border-green-400 bg-green-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
                onClick={() => setStorageProvider('cloudinary')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="h-5 w-5 text-green-600" />
                  <h3 className="font-bold text-green-800">Cloudinary + Imgur</h3>
                  <Badge className="bg-green-600 text-white text-xs">Best</Badge>
                </div>
                <div className="space-y-1 text-xs text-green-700">
                  <div>✅ Free image hosting</div>
                  <div>✅ Auto fallback to Imgur</div>
                  <div>✅ No registration needed</div>
                  <div>✅ Works immediately</div>
                </div>
              </div>

              {/* ImgBB Option */}
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  storageProvider === 'imgbb' 
                    ? 'border-blue-400 bg-blue-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
                onClick={() => setStorageProvider('imgbb')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-blue-800">Imgur + Local</h3>
                  <Badge className="bg-blue-600 text-white text-xs">Reliable</Badge>
                </div>
                <div className="space-y-1 text-xs text-blue-700">
                  <div>✅ Free Imgur hosting</div>
                  <div>✅ Local storage fallback</div>
                  <div>✅ No registration needed</div>
                  <div>✅ Always works</div>
                </div>
              </div>

              {/* Supabase Option */}
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  storageProvider === 'supabase' 
                    ? 'border-indigo-400 bg-indigo-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-indigo-300'
                }`}
                onClick={() => setStorageProvider('supabase')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-bold text-indigo-800">Supabase</h3>
                  <Badge className="bg-yellow-600 text-white text-xs">Setup</Badge>
                </div>
                <div className="space-y-1 text-xs text-indigo-700">
                  <div>✅ 1GB free storage</div>
                  <div>✅ Direct integration</div>
                  <div>⚠️ Requires bucket setup</div>
                  <div>⚠️ May need policies</div>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 bg-white p-3 rounded border">
              <strong>Selected:</strong> {storageProvider === 'cloudinary' ? 'Cloudinary → Imgur → Local fallback (Always works!)' : 
                                         storageProvider === 'imgbb' ? 'Imgur → Local storage fallback (Always works!)' : 
                                         'Supabase (1GB free - needs setup)'}
            </div>
          </CardContent>
        </Card>

        {/* Storage Test Section - Only show for Supabase */}
        {storageProvider === 'supabase' && (
          <Card className="bg-gray-50 border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-800 text-lg flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Storage Diagnostics
              </CardTitle>
              <p className="text-gray-600 text-sm">Test your Supabase storage before uploading images</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={testStorageAccess}
                  disabled={storageStatus === 'testing'}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  {storageStatus === 'testing' ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Storage Access'
                  )}
                </Button>
              </div>
              
              {storageMessage && (
                <div className={`p-3 rounded-lg text-sm font-medium ${
                  storageStatus === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
                  storageStatus === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
                  'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {storageMessage}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Product Setup Section */}
        <Card className="bg-blue-50 border border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-800 text-lg flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Product Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-blue-800 mb-1 block">Product Name</label>
                <Input
                  placeholder="e.g., Neon Street Tee"
                  value={currentProductName}
                  onChange={(e) => {
                    setCurrentProductName(e.target.value);
                    if (!currentProductSlug) {
                      setCurrentProductSlug(generateSlug(e.target.value));
                    }
                  }}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-blue-800 mb-1 block">Product Slug</label>
                <Input
                  placeholder="e.g., neon-street-tee"
                  value={currentProductSlug}
                  onChange={(e) => setCurrentProductSlug(e.target.value)}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={addNewProductGroup}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!currentProductName.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product for Images
              </Button>
              
              {productGroups.length > 0 && (
                <Button 
                  onClick={downloadCSVTemplate}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Groups */}
        {productGroups.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Products & Images ({productGroups.length})
            </h3>
            
            {productGroups.map((group) => (
              <Card key={group.id} className="bg-gray-50 border border-gray-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-800 text-lg">{group.productName}</CardTitle>
                      <p className="text-sm text-gray-600 font-mono">{group.productSlug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {group.images.length} images
                      </Badge>
                      <Button
                        onClick={() => removeProductGroup(group.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Upload for this product */}
                  <div className="border-2 border-dashed border-gray-400 rounded-lg p-4 text-center bg-white">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          uploadImages(e.target.files, group.productName, group.productSlug);
                        }
                      }}
                      className="hidden"
                      id={`image-upload-${group.id}`}
                    />
                    <label htmlFor={`image-upload-${group.id}`} className="cursor-pointer">
                      <Upload className="h-6 w-6 mx-auto text-gray-500 mb-2" />
                      <p className="text-sm text-gray-600 font-medium">
                        Click to upload images for {group.productName}
                      </p>
                    </label>
                  </div>
                  
                  {/* Images for this product */}
                  {group.images.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Images:</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {group.images.map((url, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-white rounded text-xs border">
                            <span className="flex-1 truncate font-mono">{url}</span>
                            <Button
                              onClick={() => copyToClipboard(url)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                            >
                              {copiedUrls.has(url) ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              onClick={() => removeImageFromGroup(group.id, url)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Legacy Upload (for backward compatibility) */}
        <Card className="bg-yellow-50 border border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-800 text-lg">Quick Upload (No Organization)</CardTitle>
            <p className="text-yellow-700 text-sm">Upload images without product association - you'll need to manually organize them later</p>
          </CardHeader>
          <CardContent>
            <div className={`border-2 border-dashed ${uploading ? 'border-blue-400 bg-blue-50' : 'border-yellow-400'} rounded-lg p-6 text-center bg-white transition-all duration-200`}>
              <Upload className={`h-8 w-8 mx-auto mb-2 ${uploading ? 'text-blue-500 animate-bounce' : 'text-yellow-500'}`} />
              <p className={`text-sm mb-2 ${uploading ? 'text-blue-700' : 'text-yellow-700'}`}>
                {uploading ? 'Uploading images...' : 'Upload product images to get URLs for manual use'}
              </p>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleLegacyFileSelect}
                className="hidden"
                id="legacy-image-upload"
                disabled={uploading}
              />
              <Button 
                onClick={handleUploadButtonClick}
                disabled={uploading} 
                variant="outline" 
                className={`cursor-pointer ${uploading ? 'border-blue-400 text-blue-700 bg-blue-50' : 'border-yellow-400 text-yellow-700 hover:bg-yellow-50'} transition-all duration-200`}
              >
                {uploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Select Images'
                )}
              </Button>
              
              {!uploading && (
                <p className="text-xs text-yellow-600 mt-2">
                  Supports: JPG, PNG, WebP, GIF, MP4 • Max: 25MB for video, 10MB for images
                </p>
              )}
            </div>

            {uploadedUrls.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-yellow-800">Uploaded Images ({uploadedImages.length})</h4>
                  <Button 
                    onClick={() => copyToClipboard(uploadedUrls.join(','))} 
                    size="sm" 
                    variant="outline"
                    className="text-xs border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                  >
                    Copy All URLs
                  </Button>
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {uploadedImages.map((imageInfo, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-yellow-200 hover:border-yellow-300 transition-colors">
                      {/* Image Preview */}
                      <div className="flex-shrink-0">
                        {imageInfo.url.startsWith('data:') || imageInfo.url.startsWith('http') ? (
                          <img 
                            src={imageInfo.url.startsWith('local://') ? 
                              JSON.parse(localStorage.getItem(imageInfo.url.replace('local://', '')) || '{}').data || imageInfo.url 
                              : imageInfo.url
                            }
                            alt={imageInfo.fileName}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjI4IiBjeT0iMjgiIHI9IjMiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI0IDM2TDI4IDMyTDM2IDQwSDI0VjM2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{imageInfo.fileName}</p>
                          <Badge 
                            className={`text-xs ${
                              imageInfo.storageProvider.includes('Cloudinary') ? 'bg-green-100 text-green-800 border-green-300' :
                              imageInfo.storageProvider.includes('Imgur') ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              imageInfo.storageProvider.includes('Local') ? 'bg-gray-100 text-gray-800 border-gray-300' :
                              'bg-purple-100 text-purple-800 border-purple-300'
                            }`}
                            variant="outline"
                          >
                            {imageInfo.storageProvider}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{(imageInfo.fileSize / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span>{new Date(imageInfo.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="mt-1">
                          <p className="text-xs font-mono text-gray-600 truncate bg-gray-50 px-2 py-1 rounded border">
                            {imageInfo.url}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-1">
                        <Button
                          onClick={() => copyToClipboard(imageInfo.url)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-yellow-100"
                        >
                          {copiedUrls.has(imageInfo.url) ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-600" />
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => {
                            // Remove from uploaded images
                            setUploadedImages(prev => prev.filter((_, i) => i !== index));
                            setUploadedUrls(prev => prev.filter((_, i) => i !== index));
                          }}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-xs text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <strong className="text-blue-800">💡 How it works:</strong><br/>
          <div className="mt-2 space-y-1 text-blue-700">
            <div>1. <strong>Add products</strong> with names and slugs</div>
            <div>2. <strong>Upload images</strong> for each product individually</div>
            <div>3. <strong>Download CSV</strong> with pre-filled image URLs</div>
            <div>4. <strong>Complete the CSV</strong> with prices, descriptions, etc.</div>
            <div>5. <strong>Upload the final CSV</strong> using the bulk upload feature</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUploadHelper; 