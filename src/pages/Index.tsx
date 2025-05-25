
import { useEffect } from "react";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import USPSection from "@/components/USPSection";

const Index = () => {
  useEffect(() => {
    document.body.classList.add('page-transition');
  }, []);

  return (
    <div className="min-h-screen text-foreground relative">
      <Hero />
      <USPSection />
      <div className="bg-black/30 backdrop-blur-sm">
        <ProductGrid />
      </div>
    </div>
  );
};

export default Index;
