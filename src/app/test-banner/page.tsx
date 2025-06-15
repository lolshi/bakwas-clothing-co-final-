'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Test banner configurations
const testBanners = [
  {
    id: 1,
    title: "Summer Collection 2024",
    subtitle: "Discover the latest trends in neon streetwear",
    image_url: "/lovable-uploads/b687c006-4250-445a-9bac-26f34cf86b87.png",
    mobile_image_url: "/lovable-uploads/b687c006-4250-445a-9bac-26f34cf86b87.png",
    video_url: "/images-videos-logo/1000113803.mp4",
    mobile_video_url: null,
    link_url: "#",
    is_active: true,
    sort_order: 1,
    device_targeting: "all",
    media_type: "video",
    show_title: true,
    show_subtitle: true
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "Check out our latest drops",
    image_url: "/lovable-uploads/b687c006-4250-445a-9bac-26f34cf86b87.png",
    mobile_image_url: "/lovable-uploads/b687c006-4250-445a-9bac-26f34cf86b87.png",
    video_url: null,
    mobile_video_url: null,
    link_url: "#",
    is_active: true,
    sort_order: 2,
    device_targeting: "all",
    media_type: "image",
    show_title: true,
    show_subtitle: true
  }
];

const TestBannerPage = () => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);
  const [bannerConfig, setBannerConfig] = useState(testBanners[0]);

  const handleBannerChange = (index: number) => {
    setCurrentBannerIndex(index);
    setBannerConfig(testBanners[index]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Banner Test Page</h1>
        
        {/* Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="mobile-view"
                  checked={isMobileView}
                  onCheckedChange={setIsMobileView}
                />
                <Label htmlFor="mobile-view">Mobile View</Label>
              </div>
              
              <div className="flex space-x-2">
                {testBanners.map((banner, index) => (
                  <Button
                    key={banner.id}
                    variant={currentBannerIndex === index ? "default" : "outline"}
                    onClick={() => handleBannerChange(index)}
                  >
                    Banner {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banner Preview */}
        <div className={`relative ${isMobileView ? 'max-w-md mx-auto' : 'w-full'}`}>
          <div className="relative min-h-[100vh] w-full overflow-hidden">
            {/* Banner Background */}
            {bannerConfig.media_type === 'video' && bannerConfig.video_url ? (
              <div className="absolute inset-0 w-full h-full">
                <video 
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                >
                  <source src={bannerConfig.video_url} type="video/mp4" />
                </video>
                
                {/* Fallback image */}
                {bannerConfig.image_url && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bannerConfig.image_url})` }}
                  />
                )}
              </div>
            ) : (
              <div className="absolute inset-0 w-full h-full">
                {/* Desktop Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center hidden md:block"
                  style={{ backgroundImage: `url(${bannerConfig.image_url})` }}
                />
                
                {/* Mobile Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center md:hidden"
                  style={{ 
                    backgroundImage: `url(${bannerConfig.mobile_image_url || bannerConfig.image_url})`,
                    backgroundPosition: 'center center'
                  }}
                />
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30"></div>

            {/* Content */}
            <div className="container relative z-20 flex flex-col items-center justify-center min-h-[100vh] px-4 text-center">
              {bannerConfig.title && bannerConfig.show_title && (
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 max-w-4xl">
                  {bannerConfig.title}
                </h1>
              )}
              
              {bannerConfig.subtitle && bannerConfig.show_subtitle && (
                <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl">
                  {bannerConfig.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Banner Configuration */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Current Banner Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-auto">
              {JSON.stringify(bannerConfig, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestBannerPage; 