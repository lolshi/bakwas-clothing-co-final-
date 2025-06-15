import React, { useEffect } from "react";
import Hero from "@/components/Hero";
import WhyBakwas from "@/components/WhyBakwas";
import ProductGrid from "@/components/ProductGrid";
import BrandTagline from "@/components/BrandTagline";
import Newsletter from "@/components/Newsletter";

const Index = () => {
  useEffect(() => {
    document.body.classList.add('page-transition');
  }, []);

  return (
    <div className="min-h-screen text-foreground">
      {/* Hero Banner - Excluded from background */}
      <div className="hero-banner">
        <Hero />
      </div>
      
      {/* All other sections with psychedelic background */}
      <div className="page-bg-wrapper">
        {/* Dark overlay for content readability */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        
        {/* Content sections */}
        <div className="relative z-20">
          <BrandTagline />
          <ProductGrid />
          <WhyBakwas />
          <Newsletter />
        </div>
      </div>
    </div>
  );
};

export default Index;
