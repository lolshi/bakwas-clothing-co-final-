
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";

const ProductGrid = () => {
  const products = [
    {
      id: 1,
      name: "Cosmic Astronaut Tee",
      price: "₹1,999",
      image: "/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png",
      isHot: true
    },
    {
      id: 2,
      name: "Reality Dump Tee",
      price: "₹1,899",
      image: "/lovable-uploads/ff44b883-13f3-4aa0-b0e9-b170b00e8311.png",
      isHot: false
    },
    {
      id: 3,
      name: "Kernel Panic Tee",
      price: "₹1,999",
      image: "/lovable-uploads/14a3ddc7-f46d-42ce-90fd-3937f6a2ad9c.png",
      isHot: true
    },
    {
      id: 4,
      name: "Open Your Mind Tee",
      price: "₹1,899",
      image: "/lovable-uploads/74ef635a-d462-4782-ad34-91d7888e17ba.png",
      isHot: false
    },
    {
      id: 5,
      name: "Bakwas Classic Tank",
      price: "₹1,499",
      image: "/lovable-uploads/aae6428d-9a3d-4b45-87c4-900c7fe5558e.png",
      isHot: false
    },
    {
      id: 6,
      name: "Psychedelic Brain Tee",
      price: "₹1,999",
      image: "/lovable-uploads/ff44b883-13f3-4aa0-b0e9-b170b00e8311.png",
      isHot: true
    }
  ];

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
          {products.map((product) => (
            <div 
              key={product.id}
              className="group relative bg-black/40 rounded-2xl overflow-hidden border border-border/50 hover:border-neon-cyan/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              {product.isHot && (
                <div className="absolute top-4 left-4 z-10 bg-neon-cyan text-black px-3 py-1 rounded-full text-xs font-space font-bold">
                  🔥 HOT
                </div>
              )}

              <div className="aspect-square overflow-hidden">
                <img 
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="p-6">
                <h3 className="text-lg font-space font-semibold mb-2 group-hover:text-neon-cyan transition-colors">
                  {product.name}
                </h3>
                <p className="text-2xl font-anton text-neon-cyan mb-4">
                  {product.price}
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
