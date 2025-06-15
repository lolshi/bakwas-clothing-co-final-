import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import FeaturedCoverflow from "./FeaturedCoverflow";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
  is_featured?: boolean;
  description?: string;
  category?: string;
}

const ProductGrid = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, images, is_featured, description')
        .eq('is_featured', true)
        .limit(8);

      if (error) {
        console.error('Error fetching featured products:', error);
        return;
      }

      // Transform the data to match our Product interface
      const transformedProducts: Product[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        images: item.images,
        is_featured: item.is_featured || false,
        description: item.description || undefined
      }));

      setFeaturedProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    const transformedProduct = {
      id: product.id,
      title: product.name,
      price: product.price,
      image: product.images?.[0] || "/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png",
      images: product.images || ["/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png"]
    };
    addToCart(transformedProduct);
  };

  const handleWishlistToggle = (product: Product) => {
    const transformedProduct = {
      id: product.id,
      title: product.name,
      price: product.price,
      image: product.images?.[0] || "/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png",
      category: 'featured'
    };

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(transformedProduct);
    }
  };

  if (loading) {
    return (
      <section ref={sectionRef} className="py-24 relative overflow-hidden">
        <div className="container relative z-20">
          <div className="text-center">
            <div className="text-4xl md:text-6xl font-anton uppercase text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-orange">
              Loading...
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    return (
      <section ref={sectionRef} className="py-24 relative overflow-hidden">
        <div className="container relative z-20">
          <div className="text-center">
            <div className="text-4xl md:text-6xl font-anton uppercase text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-orange">
              No featured products available
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <FeaturedCoverflow
      products={featuredProducts}
      onAddToCart={handleAddToCart}
      onWishlistToggle={handleWishlistToggle}
      isInWishlist={isInWishlist}
      title="HOT RIGHT NOW"
    />
  );
};

export default ProductGrid;
