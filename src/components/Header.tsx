
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/6b112a77-ea8e-4f47-b08f-0f2be98c0b2f.png" 
            alt="Bakwas Clothing Co." 
            className="h-8 w-auto"
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="/" className="text-sm font-medium hover:text-neon-cyan transition-colors">
            Home
          </a>
          <a href="/shop" className="text-sm font-medium hover:text-neon-cyan transition-colors">
            Shop
          </a>
          <a href="/collections" className="text-sm font-medium hover:text-neon-cyan transition-colors">
            Collections
          </a>
          <a href="/about" className="text-sm font-medium hover:text-neon-cyan transition-colors">
            About
          </a>
        </nav>

        {/* Cart & Mobile Menu */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-neon-cyan text-xs font-medium text-black flex items-center justify-center">
              0
            </span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <nav className="container py-4 space-y-4">
            <a href="/" className="block text-sm font-medium hover:text-neon-cyan transition-colors">
              Home
            </a>
            <a href="/shop" className="block text-sm font-medium hover:text-neon-cyan transition-colors">
              Shop
            </a>
            <a href="/collections" className="block text-sm font-medium hover:text-neon-cyan transition-colors">
              Collections
            </a>
            <a href="/about" className="block text-sm font-medium hover:text-neon-cyan transition-colors">
              About
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
