
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-general bg-cover bg-center bg-fixed relative overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      {/* Content */}
      <div className="text-center z-10 px-4 max-w-2xl mx-auto relative">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
            alt="Bakwas Clothing Co." 
            className="h-20 w-auto mx-auto mb-6 filter drop-shadow-2xl"
          />
        </div>

        {/* 404 Text */}
        <div className="mb-8 bg-black/60 backdrop-blur-md rounded-lg p-8">
          <h1 className="text-8xl md:text-9xl font-anton mb-4 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent animate-psychedelic-pulse">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-anton mb-4 text-white">
            Page Not Found
          </h2>
          <p className="text-lg md:text-xl text-gray-300 font-space mb-2">
            Looks like you took a wrong turn in the streets
          </p>
          <p className="text-md text-gray-400 font-space">
            This page doesn't exist in our digital neighborhood
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-cyan/80 hover:to-neon-purple/80 text-black font-semibold font-space px-8 py-3 text-lg"
            >
              <Home className="h-5 w-5 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link to="/shop">
            <Button 
              variant="outline" 
              size="lg"
              className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black font-space px-8 py-3 text-lg"
            >
              Browse Shop
            </Button>
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 flex justify-center space-x-4 text-neon-cyan/30">
          <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse animation-delay-200"></div>
          <div className="w-2 h-2 bg-neon-pink rounded-full animate-pulse animation-delay-400"></div>
        </div>
      </div>

      {/* Floating shapes */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-neon-cyan/10 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-neon-purple/10 rounded-full blur-xl animate-float animation-delay-1000"></div>
      <div className="absolute top-3/4 left-1/3 w-16 h-16 bg-neon-pink/10 rounded-full blur-xl animate-float animation-delay-2000"></div>
    </div>
  );
};

export default NotFound;
