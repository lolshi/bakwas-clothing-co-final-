
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
  is_featured: boolean;
}

const ProductGrid = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, images, is_featured')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-black/30 backdrop-blur-sm">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-anton mb-4 neon-glow">
              🔥 HOT RIGHT NOW
            </h2>
            <p className="text-lg font-space text-muted-foreground">
              Loading featured products...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    return (
      <section className="py-20 bg-black/30 backdrop-blur-sm">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-anton mb-4 neon-glow">
              🔥 HOT RIGHT NOW
            </h2>
            <p className="text-lg font-space text-muted-foreground">
              No featured products available at the moment
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-black/30 backdrop-blur-sm">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-anton mb-4 neon-glow">
            🔥 HOT RIGHT NOW
          </h2>
          <p className="text-lg font-space text-muted-foreground">
            Fresh drops that are setting the streets on fire
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <div 
              key={product.id}
              className="group relative bg-black/40 rounded-2xl overflow-hidden border border-border/50 hover:border-neon-cyan/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              <div className="absolute top-4 left-4 z-10 bg-neon-cyan text-black px-3 py-1 rounded-full text-xs font-space font-bold">
                🔥 HOT
              </div>

              <div className="aspect-square overflow-hidden">
                <img 
                  src={product.images?.[0] || "/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="p-6">
                <h3 className="text-lg font-space font-semibold mb-2 group-hover:text-neon-cyan transition-colors">
                  {product.name}
                </h3>
                <p className="text-2xl font-anton text-neon-cyan mb-4">
                  ₹{product.price.toLocaleString()}
                </p>

                <div className="flex items-center justify-between">
                  <Button 
                    className="flex-1 mr-2 bg-neon-cyan hover:bg-neon-cyan/80 text-black font-space font-semibold"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="icon" className="border-neon-cyan/20 hover:bg-neon-cyan/10">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black font-space font-semibold"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
