
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  image?: string;
  images?: string[];
  category: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('bakwas-wishlist');
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        if (Array.isArray(parsedWishlist)) {
          setItems(parsedWishlist);
        }
      } catch (error) {
        console.error('Error parsing wishlist from localStorage:', error);
        localStorage.removeItem('bakwas-wishlist');
      }
    }
  }, []);

  // Save wishlist to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('bakwas-wishlist', JSON.stringify(items));
  }, [items]);

  const addToWishlist = (product: Product) => {
    const wishlistItem: WishlistItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || product.image,
      category: product.category
    };

    setItems(prevItems => {
      if (prevItems.find(item => item.id === product.id)) {
        return prevItems; // Already in wishlist
      }
      toast({
        title: "Added to wishlist!",
        description: `${product.title} has been added to your wishlist.`,
      });
      return [...prevItems, wishlistItem];
    });
  };

  const removeFromWishlist = (id: string) => {
    setItems(prevItems => {
      const item = prevItems.find(item => item.id === id);
      if (item) {
        toast({
          title: "Removed from wishlist",
          description: `${item.title} has been removed from your wishlist.`,
        });
      }
      return prevItems.filter(item => item.id !== id);
    });
  };

  const isInWishlist = (id: string) => {
    return items.some(item => item.id === id);
  };

  const clearWishlist = () => {
    setItems([]);
    toast({
      title: "Wishlist cleared",
      description: "All items have been removed from your wishlist.",
    });
  };

  const value = {
    items,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
