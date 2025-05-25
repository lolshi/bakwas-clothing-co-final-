
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, User, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-black/50 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link to="/">
            <img 
              src="/lovable-uploads/6b112a77-ea8e-4f47-b08f-0f2be98c0b2f.png" 
              alt="Bakwas Clothing Co." 
              className="h-16 w-auto"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-sm font-medium hover:text-neon-cyan transition-colors">
            Home
          </Link>
          <Link to="/shop" className="text-sm font-medium hover:text-neon-cyan transition-colors">
            Shop
          </Link>
          <a href="/collections" className="text-sm font-medium hover:text-neon-cyan transition-colors">
            Collections
          </a>
          <a href="/about" className="text-sm font-medium hover:text-neon-cyan transition-colors">
            About
          </a>
        </nav>

        {/* Cart & Auth */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-neon-cyan text-xs font-medium text-black flex items-center justify-center">
                2
              </span>
            </Link>
          </Button>

          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                        <AvatarFallback className="bg-neon-cyan text-black">
                          {user.user_metadata?.full_name ? getInitials(user.user_metadata.full_name) : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user.user_metadata?.full_name && (
                          <p className="font-medium">{user.user_metadata.full_name}</p>
                        )}
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="cursor-pointer">
                        Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Button variant="ghost" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild className="bg-neon-cyan text-black hover:bg-neon-cyan/80">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </>
          )}
          
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
        <div className="md:hidden border-t border-border/40 bg-black/50 backdrop-blur">
          <nav className="container py-4 space-y-4">
            <Link to="/" className="block text-sm font-medium hover:text-neon-cyan transition-colors">
              Home
            </Link>
            <Link to="/shop" className="block text-sm font-medium hover:text-neon-cyan transition-colors">
              Shop
            </Link>
            <Link to="/cart" className="block text-sm font-medium hover:text-neon-cyan transition-colors">
              Cart
            </Link>
            <a href="/collections" className="block text-sm font-medium hover:text-neon-cyan transition-colors">
              Collections
            </a>
            <a href="/about" className="block text-sm font-medium hover:text-neon-cyan transition-colors">
              About
            </a>
            
            {!loading && !user && (
              <div className="pt-4 border-t border-border/40 space-y-2">
                <Link to="/login" className="block text-sm font-medium hover:text-neon-cyan transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="block text-sm font-medium hover:text-neon-cyan transition-colors">
                  Sign Up
                </Link>
              </div>
            )}

            {!loading && user && (
              <div className="pt-4 border-t border-border/40 space-y-2">
                <Link to="/admin" className="block text-sm font-medium hover:text-neon-cyan transition-colors">
                  Admin Panel
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
