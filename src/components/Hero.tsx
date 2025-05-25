
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  useEffect(() => {
    document.body.classList.add('page-transition');
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Hero Banner Background - Using the new BAKWAS logo image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/lovable-uploads/b687c006-4250-445a-9bac-26f34cf86b87.png')"
        }}
      />
      
      {/* Semi-transparent overlay for better readability */}
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="container relative z-20 text-center flex flex-col items-center justify-center min-h-screen">
        
        {/* Logo positioned about 30% down from top */}
        <motion.div 
          className="absolute top-[30%] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Semi-transparent panel for logo and buttons */}
          <div className="bg-gray-900 bg-opacity-50 p-8 rounded-xl backdrop-blur-sm">
            {/* Brand Logo */}
            <h1 className="text-4xl md:text-6xl font-anton mb-8 text-white drop-shadow-lg h-20 md:h-24 flex items-center justify-center">
              BAKWAS
            </h1>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button 
                className="bg-blue-400 hover:bg-blue-500 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                asChild
              >
                <a href="/shop">
                  Shop Now
                  <ChevronRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button 
                variant="outline"
                className="bg-transparent border border-blue-400 hover:bg-blue-400 hover:text-black text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                asChild
              >
                <a href="/shop?filter=collection">
                  Explore Collection
                </a>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
