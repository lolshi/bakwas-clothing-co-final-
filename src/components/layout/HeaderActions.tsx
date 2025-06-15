import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Heart, ShoppingCart, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface HeaderActionsProps {
  onLinkClick?: () => void; // For closing mobile menu
  iconClassName?: string;
  containerClassName?: string;
  showLabels?: boolean; // For mobile menu, perhaps show labels next to icons
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  onLinkClick,
  iconClassName = "h-6 w-6", // Default desktop size
  containerClassName = "flex items-center space-x-2",
  showLabels = false,
}) => {
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const iconButtonBaseClass = "icon-btn text-white hover:text-neon-pink transition-colors duration-200";
  const mobileMinSize = showLabels ? "min-w-[auto] min-h-[44px] p-2 flex items-center space-x-3" : "min-w-[44px] min-h-[44px]";

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/');
      if (onLinkClick) onLinkClick(); // Close mobile menu if open
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={containerClassName}>
      {user && (
        <Link to="/account" onClick={onLinkClick} aria-label="My Account">
          <button className={`${iconButtonBaseClass} ${showLabels ? mobileMinSize : ''}`}>
            <User className={iconClassName} />
            {showLabels && <span className="font-space-grotesk text-sm">Account</span>}
          </button>
        </Link>
      )}
      {user && (
        <button 
          onClick={handleLogout} 
          aria-label="Logout"
          className={`${iconButtonBaseClass} ${showLabels ? mobileMinSize : ''}`}
        >
          <LogOut className={iconClassName} />
          {showLabels && <span className="font-space-grotesk text-sm">Logout</span>}
        </button>
      )}
      <Link to="/wishlist" onClick={onLinkClick} aria-label="My Wishlist">
        <button className={`${iconButtonBaseClass} ${showLabels ? mobileMinSize : ''}`}>
          <Heart className={iconClassName} />
          {showLabels && <span className="font-space-grotesk text-sm">Wishlist</span>}
        </button>
      </Link>
      <Link to="/cart" onClick={onLinkClick} aria-label="View Cart">
        <button className={`${iconButtonBaseClass} relative ${showLabels ? mobileMinSize : ''}`}>
          <ShoppingCart className={iconClassName} />
          {itemCount > 0 && (
            <span className={`absolute -top-1 -right-1 bg-gradient-to-r from-neon-pink to-neon-orange text-white text-xs rounded-full flex items-center justify-center font-bold font-anton shadow-lg animate-pulse ${showLabels ? 'h-5 w-5 text-[10px]' : 'h-5 w-5' }`}>
              {itemCount}
            </span>
          )}
          {showLabels && <span className="font-space-grotesk text-sm">Cart</span>}
        </button>
      </Link>
    </div>
  );
}; 