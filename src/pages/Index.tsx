
import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import USPSection from "@/components/USPSection";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    document.body.classList.add('page-transition');
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <USPSection />
      <ProductGrid />
      <Footer />
    </div>
  );
};

export default Index;
