
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Banner Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/f28f3d2a-8930-4520-9cc7-8de233beae5c.png')`
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 border border-neon-cyan rounded-full animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border border-neon-purple rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 border border-neon-pink rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Shop the Drop Button - positioned at bottom center */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink hover:from-neon-cyan/80 hover:via-neon-purple/80 hover:to-neon-pink/80 text-black font-space font-semibold text-lg px-8 py-6 rounded-xl group transition-all duration-300 hover:scale-105 shadow-2xl animate-bounce"
        >
          Shop the Drop
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </section>
  );
};

export default Hero;
