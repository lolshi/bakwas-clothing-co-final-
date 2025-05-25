
import { useEffect } from "react";
import Hero from "@/components/Hero";
import USPSection from "@/components/USPSection";
import ProductGrid from "@/components/ProductGrid";

const Index = () => {
  useEffect(() => {
    document.body.classList.add('page-transition');
  }, []);

  return (
    <div className="min-h-screen text-foreground">
      <Hero />
      <USPSection />
      <ProductGrid />
    </div>
  );
};

export default Index;
