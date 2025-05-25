
import { useEffect } from "react";
import Hero from "@/components/Hero";
import USPFlipCards from "@/components/USPFlipCards";
import ProductGrid from "@/components/ProductGrid";

const Index = () => {
  useEffect(() => {
    document.body.classList.add('page-transition');
  }, []);

  return (
    <div className="min-h-screen text-foreground">
      <Hero />
      <USPFlipCards />
      <ProductGrid />
    </div>
  );
};

export default Index;
