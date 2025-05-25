
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingCart, User, Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { adminUser } = useAdminAuth();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Check if user has admin role
  const isAdmin = adminUser || user?.user_metadata?.role === 'admin';

  return (
    <header className="sticky top-0 z-20 bg-gray-900/90 backdrop-blur-md border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
              alt="Bakwas Clothing Co." 
              className="h-12 md:h-16 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-space transition-colors ${
                location.pathname === '/' ? 'text-neon-cyan' : 'text-white hover:text-neon-cyan'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/shop" 
              className={`font-space transition-colors ${
                location.pathname === '/shop' ? 'text-neon-cyan' : 'text-white hover:text-neon-cyan'
              }`}
            >
              Shop
            </Link>
            <Link 
              to="/help" 
              className={`font-space transition-colors ${
                location.pathname === '/help' ? 'text-neon-cyan' : 'text-white hover:text-neon-cyan'
              }`}
            >
              Help
            </Link>
            <Link 
              to="/contact" 
              className={`font-space transition-colors ${
                location.pathname === '/contact' ? 'text-neon-cyan' : 'text-white hover:text-neon-cyan'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Admin Panel Link - only show if user is admin */}
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-neon-cyan">
                  Admin
                </Button>
              </Link>
            )}
            <Link to="/account">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-neon-cyan">
                <User className="h-4 w-4 mr-2" />
                Account
              </Button>
            </Link>
            <Link to="/wishlist">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-neon-cyan">
                <Heart className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative text-gray-300 hover:text-neon-cyan">
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-neon-cyan text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden text-white" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`font-space transition-colors ${
                  location.pathname === '/' ? 'text-neon-cyan' : 'text-white hover:text-neon-cyan'
                }`}
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link 
                to="/shop" 
                className={`font-space transition-colors ${
                  location.pathname === '/shop' ? 'text-neon-cyan' : 'text-white hover:text-neon-cyan'
                }`}
                onClick={toggleMenu}
              >
                Shop
              </Link>
              <Link 
                to="/help" 
                className={`font-space transition-colors ${
                  location.pathname === '/help' ? 'text-neon-cyan' : 'text-white hover:text-neon-cyan'
                }`}
                onClick={toggleMenu}
              >
                Help
              </Link>
              <Link 
                to="/contact" 
                className={`font-space transition-colors ${
                  location.pathname === '/contact' ? 'text-neon-cyan' : 'text-white hover:text-neon-cyan'
                }`}
                onClick={toggleMenu}
              >
                Contact
              </Link>
              
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-700">
                {isAdmin && (
                  <Link to="/admin" onClick={toggleMenu}>
                    <Button variant="ghost" size="sm" className="text-gray-300 hover:text-neon-cyan">
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to="/account" onClick={toggleMenu}>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-neon-cyan">
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </Button>
                </Link>
                <Link to="/wishlist" onClick={toggleMenu}>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-neon-cyan">
                    <Heart className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/cart" onClick={toggleMenu}>
                  <Button variant="ghost" size="sm" className="relative text-gray-300 hover:text-neon-cyan">
                    <ShoppingCart className="h-4 w-4" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-neon-cyan text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {itemCount}
                      </span>
                    )}
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
