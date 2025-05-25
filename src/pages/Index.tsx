
import { useEffect } from "react";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";

const Index = () => {
  useEffect(() => {
    document.body.classList.add('page-transition');
  }, []);

  return (
    <div className="min-h-screen text-foreground relative">
      {/* Content wrapper with backdrop for better readability */}
      <div className="relative z-10">
        <Hero />
        <div className="bg-black/30 backdrop-blur-sm">
          <ProductGrid />
        </div>
      </div>
    </div>
  );
};

export default Index;
