import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWishlist, WishlistItem } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ShoppingCart, Trash2, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Wishlist = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (item: WishlistItem) => {
    addToCart(item);
    toast({
      title: "Added to cart",
      description: `${item.title} has been added to your cart`,
    });
  };

  const handleRemoveFromWishlist = (id: string) => {
    removeFromWishlist(id);
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist",
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Multiple animated gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-black to-neon-cyan/20 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-neon-pink/10 via-transparent to-neon-orange/10 animate-pulse"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-neon-cyan/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 sm:p-6 md:p-8">
        {/* Hero Section */}
        <motion.div 
          className="text-center py-6 sm:py-8 md:py-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.img 
            src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
            alt="Bakwas Clothing Co." 
            className="w-32 sm:w-40 md:w-48 h-auto mx-auto mb-4 sm:mb-6 md:mb-8 drop-shadow-2xl"
            animate={{ 
              filter: [
                'drop-shadow(0 0 20px rgba(0, 225, 255, 0.5))',
                'drop-shadow(0 0 30px rgba(139, 92, 246, 0.5))',
                'drop-shadow(0 0 20px rgba(0, 225, 255, 0.5))'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <motion.h1 
            className="text-4xl sm:text-6xl md:text-8xl font-anton bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ backgroundSize: '200% 100%' }}
          >
            YOUR WISHLIST
          </motion.h1>
          
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-white/80 font-space max-w-2xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {items.length} {items.length === 1 ? 'item' : 'items'} saved in your <span className="text-neon-cyan font-bold">BAKWAS</span> wishlist
          </motion.p>
        </motion.div>

        {/* Breadcrumbs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-7xl mx-auto mb-6"
        >
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-white/60 hover:text-neon-cyan transition-colors">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/40" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white font-medium">Wishlist</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 hover:shadow-neon-purple/30 transition-all duration-500">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-neon-cyan text-2xl sm:text-3xl font-anton flex items-center gap-2 sm:gap-3">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-neon-cyan" />
                SAVED ITEMS
              </CardTitle>
              <div className="h-1 w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-full"></div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <motion.div 
                  className="text-center py-16"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Heart className="h-16 w-16 mx-auto mb-4 text-neon-cyan" />
                  <h2 className="text-2xl font-anton mb-4 text-white">Your wishlist is empty</h2>
                  <p className="text-white/60 mb-6">Start browsing and save items you love</p>
                  <Link to="/shop">
                    <Button
                      className="group relative w-full sm:w-auto h-12 sm:h-14 text-base sm:text-lg font-anton overflow-hidden rounded-xl sm:rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                      <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-neon-purple via-neon-pink to-neon-orange p-[2px] group-hover:from-neon-cyan group-hover:via-neon-purple group-hover:to-neon-pink transition-all duration-500">
                        <div className="w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                      </div>
                      <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 h-full px-4 sm:px-8">
                        <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-neon-purple via-white to-neon-orange bg-clip-text text-transparent group-hover:from-neon-cyan group-hover:via-neon-purple group-hover:to-neon-pink transition-all duration-500">
                          Browse Products
                        </span>
                      </div>
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="group relative bg-gray-900/60 backdrop-blur-sm rounded-xl overflow-hidden border-2 border-gray-800 hover:border-neon-cyan/50 transition-all duration-300"
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-space font-semibold mb-2 text-white group-hover:text-neon-cyan transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-white/60 mb-2">{item.category}</p>
                        <p className="text-xl font-anton text-neon-cyan mb-4">
                          ₹{item.price.toLocaleString()}
                        </p>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAddToCart(item)}
                            className="flex-1 bg-neon-cyan hover:bg-neon-cyan/80 text-black font-space font-semibold transition-all transform hover:scale-105"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveFromWishlist(item.id)}
                            className="border-red-500/20 hover:bg-red-500/10 hover:border-red-500 transition-all transform hover:scale-110"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
