
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
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 border border-neon-cyan rounded-full animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border border-neon-purple rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 border border-neon-pink rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-8 space-y-4">
          <p className="text-lg md:text-xl font-space font-medium text-foreground/90">
            Bakwas isn't just a name. It's an attitude.
          </p>
          <p className="text-base md:text-lg font-space text-muted-foreground max-w-2xl mx-auto">
            We design for the ones who stand out, speak loud, and drip real. 
            Born from Delhi's street pulse, we blend psychedelic energy with unfiltered expression.
          </p>
        </div>

        <Button 
          size="lg" 
          className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-space font-semibold text-lg px-8 py-6 rounded-xl group transition-all duration-300 hover:scale-105"
        >
          Shop the Drop
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-neon-cyan rounded-full flex justify-center">
          <div className="w-1 h-3 bg-neon-cyan rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
