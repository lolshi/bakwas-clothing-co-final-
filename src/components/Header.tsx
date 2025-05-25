
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { adminUser } = useAdminAuth();
  const location = useLocation();
  
  // Hide admin links on public pages
  const isPublicPage = !location.pathname.startsWith('/admin');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/40fa6e4a-a62b-4c00-b9c8-e3077d47e80b.png" 
              alt="Bakwas Clothing Co." 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="font-space hover:text-neon-cyan transition-colors">Home</Link>
            <Link to="/shop" className="font-space hover:text-neon-cyan transition-colors">Shop</Link>
            <Link to="/about" className="font-space hover:text-neon-cyan transition-colors">About</Link>
            <Link to="/contact" className="font-space hover:text-neon-cyan transition-colors">Contact</Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Only show admin link on public pages and if user is admin */}
            {isPublicPage && adminUser && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-neon-cyan">
                  Admin Panel
                </Button>
              </Link>
            )}
            {/* Only show admin login if no admin user and on public pages */}
            {isPublicPage && !adminUser && (
              <Link to="/admin/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-neon-cyan">
                  Admin
                </Button>
              </Link>
            )}
            <Link to="/login">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 bg-neon-cyan text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="font-space hover:text-neon-cyan transition-colors" onClick={toggleMenu}>
                Home
              </Link>
              <Link to="/shop" className="font-space hover:text-neon-cyan transition-colors" onClick={toggleMenu}>
                Shop
              </Link>
              <Link to="/about" className="font-space hover:text-neon-cyan transition-colors" onClick={toggleMenu}>
                About
              </Link>
              <Link to="/contact" className="font-space hover:text-neon-cyan transition-colors" onClick={toggleMenu}>
                Contact
              </Link>
              <div className="flex items-center space-x-4 pt-4 border-t border-border/50">
                {/* Only show admin link on public pages */}
                {isPublicPage && adminUser && (
                  <Link to="/admin" onClick={toggleMenu}>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-neon-cyan">
                      Admin Panel
                    </Button>
                  </Link>
                )}
                {isPublicPage && !adminUser && (
                  <Link to="/admin/login" onClick={toggleMenu}>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-neon-cyan">
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to="/login" onClick={toggleMenu}>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/cart" onClick={toggleMenu}>
                  <Button variant="ghost" size="sm" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 bg-neon-cyan text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      0
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
