
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight } from "lucide-react";

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}

const Hero = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback hero if no banners are available
  const defaultHero = (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background/80 to-black">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/9ca1b5b5-09ad-44d4-abd5-c4b3cd6cbaed.png')] bg-cover bg-center opacity-20"></div>
      <div className="container relative z-10 text-center">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-anton mb-6 neon-glow">
          BAKWAS
        </h1>
        <p className="text-xl md:text-2xl font-space mb-8 text-muted-foreground max-w-2xl mx-auto">
          Street culture redefined. Where rebellion meets style.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-space font-semibold px-8 py-6 text-lg"
          >
            Shop Now
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black font-space px-8 py-6 text-lg"
          >
            Explore Collection
          </Button>
        </div>
      </div>
    </section>
  );

  if (loading) {
    return defaultHero;
  }

  if (banners.length === 0) {
    return defaultHero;
  }

  if (banners.length === 1) {
    const banner = banners[0];
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${banner.image_url})` }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="container relative z-10 text-center">
          {banner.title && (
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-anton mb-6 neon-glow">
              {banner.title}
            </h1>
          )}
          {banner.subtitle && (
            <p className="text-xl md:text-2xl font-space mb-8 text-muted-foreground max-w-2xl mx-auto">
              {banner.subtitle}
            </p>
          )}
          {banner.link_url && (
            <Button 
              size="lg" 
              className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-space font-semibold px-8 py-6 text-lg"
              asChild
            >
              <a href={banner.link_url}>
                Shop Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Carousel className="w-full h-screen">
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <div className="relative h-screen flex items-center justify-center">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${banner.image_url})` }}
                >
                  <div className="absolute inset-0 bg-black/50"></div>
                </div>
                <div className="container relative z-10 text-center">
                  {banner.title && (
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-anton mb-6 neon-glow">
                      {banner.title}
                    </h1>
                  )}
                  {banner.subtitle && (
                    <p className="text-xl md:text-2xl font-space mb-8 text-muted-foreground max-w-2xl mx-auto">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.link_url && (
                    <Button 
                      size="lg" 
                      className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-space font-semibold px-8 py-6 text-lg"
                      asChild
                    >
                      <a href={banner.link_url}>
                        Shop Now
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </section>
  );
};

export default Hero;
