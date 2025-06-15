import { useState } from "react";
import FeaturedImageCard from "@/components/FeaturedImageCard";
import { Button } from "@/components/ui/button";

const CardVariantsDemo = () => {
  const [wishlist, setWishlist] = useState<string[]>([]);

  const sampleProduct = {
    id: "demo-product-1",
    name: "Neon Streetwear Hoodie",
    price: 5665,
    images: ["/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png"]
  };

  const handleAddToCart = (product: any) => {
    console.log("Added to cart:", product);
    // Add your cart logic here
  };

  const handleWishlistToggle = (product: any) => {
    setWishlist(prev => 
      prev.includes(product.id) 
        ? prev.filter(id => id !== product.id)
        : [...prev, product.id]
    );
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-anton uppercase text-white mb-4"
              style={{
                textShadow: `
                  2px 2px 0 #e91e63,
                  4px 4px 0 #d81b60,
                  6px 6px 0 #c2185b,
                  8px 8px 15px rgba(0,0,0,0.6)
                `,
                filter: 'drop-shadow(0 0 20px rgba(233,30,99,0.5))'
              }}>
            Card Variants Demo
          </h1>
          <p className="text-xl text-white/80 font-space-grotesk max-w-3xl mx-auto">
            Three interactive info-panel variants for A/B testing. Hover over each card to see the unique animations.
          </p>
        </div>

        {/* Variants Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Underline Reveal Panel */}
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-anton text-white mb-4 text-center">
              1. Underline Reveal Panel
            </h3>
            <p className="text-sm text-white/70 mb-6 text-center max-w-xs">
              Thin neon-cyan underline expands to reveal price and button on hover
            </p>
            <FeaturedImageCard
              product={sampleProduct}
              variant="underline"
              onAddToCart={handleAddToCart}
              onWishlistToggle={handleWishlistToggle}
              isInWishlist={isInWishlist}
            />
          </div>

          {/* Corner Ribbon Tab */}
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-anton text-white mb-4 text-center">
              2. Corner Ribbon Tab
            </h3>
            <p className="text-sm text-white/70 mb-6 text-center max-w-xs">
              Diagonal ribbon unfolds from corner to full-width horizontal strip
            </p>
            <FeaturedImageCard
              product={sampleProduct}
              variant="ribbon"
              onAddToCart={handleAddToCart}
              onWishlistToggle={handleWishlistToggle}
              isInWishlist={isInWishlist}
            />
          </div>

          {/* Edge-Lit Slide-Up Dock */}
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-anton text-white mb-4 text-center">
              3. Edge-Lit Slide-Up Dock
            </h3>
            <p className="text-sm text-white/70 mb-6 text-center max-w-xs">
              Product name below image, neon pink rail expands to show price with cart icon
            </p>
            <FeaturedImageCard
              product={sampleProduct}
              variant="dock"
              onAddToCart={handleAddToCart}
              onWishlistToggle={handleWishlistToggle}
              isInWishlist={isInWishlist}
            />
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-black/20 backdrop-blur-md rounded-xl p-8 border border-white/10">
          <h2 className="text-3xl font-anton text-white mb-6">Technical Specifications</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6 rounded-lg border border-cyan-500/20">
              <h4 className="text-lg font-anton text-cyan-400 mb-3">Underline Reveal</h4>
              <ul className="text-sm text-white/80 space-y-2">
                <li>• 2px → 20% height animation</li>
                <li>• 250ms transition duration</li>
                <li>• Backdrop blur effect</li>
                <li>• Montserrat + Lato fonts</li>
                <li>• Smooth opacity fade-in</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-pink-500/10 to-red-500/10 p-6 rounded-lg border border-pink-500/20">
              <h4 className="text-lg font-anton text-pink-400 mb-3">Corner Ribbon</h4>
              <ul className="text-sm text-white/80 space-y-2">
                <li>• 40px triangle → full width</li>
                <li>• 200ms rotation animation</li>
                <li>• CSS clip-path morphing</li>
                <li>• Neon-pink (#ff0099) color</li>
                <li>• Price abbreviation (5K)</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-6 rounded-lg border border-purple-500/20">
              <h4 className="text-lg font-anton text-purple-400 mb-3">Slide-Up Dock</h4>
              <ul className="text-sm text-white/80 space-y-2">
                <li>• Product name below image</li>
                <li>• 4px neon pink rail → 50px dock</li>
                <li>• 200ms slide + morph animation</li>
                <li>• Cart icon + price + ADD button</li>
                <li>• Enhanced Inter font styling</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-anton uppercase px-8 py-3"
            onClick={() => window.location.reload()}
          >
            Reset Demo
          </Button>
          <Button 
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 font-anton uppercase px-8 py-3"
            onClick={() => console.log("Wishlist:", wishlist)}
          >
            View Wishlist
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CardVariantsDemo; 