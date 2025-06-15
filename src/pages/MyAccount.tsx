import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import OrderHistory from './OrderHistory';
import { User, Shield, MapPin, Package, Edit3, Save, Plus, Mail, Calendar, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AddressForm from '@/components/address/AddressForm';

interface Address {
  id: string;
  name: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

const MyAccount = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Log component lifecycle
  useEffect(() => {
    console.log('🔄 [Lifecycle] Component Mounted', {
      timestamp: new Date().toISOString(),
      component: 'MyAccount'
    });

    return () => {
      console.log('🔄 [Lifecycle] Component Unmounted', {
        timestamp: new Date().toISOString(),
        component: 'MyAccount'
      });
    };
  }, []);

  // Log auth state changes with more detail
  useEffect(() => {
    console.log('🔐 [Auth State] Detailed', {
      userId: user?.id,
      email: user?.email,
      isLoaded: !!user,
      hasMetadata: !!user?.user_metadata,
      metadataKeys: user?.user_metadata ? Object.keys(user.user_metadata) : [],
      timestamp: new Date().toISOString(),
      stack: new Error().stack // This will show us where the auth state change came from
    });
  }, [user]);

  // Log wallet state changes
  useEffect(() => {
    console.log('💰 [Wallet State] Changed', {
      previousBalance: walletBalance,
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    });
  }, [walletBalance]);

  // Main effect with detailed logging
  useEffect(() => {
    console.log('🔄 [Effect] Main Effect Running', {
      hasUser: !!user,
      userId: user?.id,
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    });

    fetchAddresses();
    if (user?.id) {  // Only fetch if we have a user
    fetchWalletBalance();
    }
  }, [user]); // Add user to dependencies

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load addresses. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchWalletBalance = async () => {
    console.log('💰 [Wallet] Starting fetch', {
      userId: user?.id,
      hasUser: !!user,
      currentBalance: walletBalance,
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    });

    if (!user?.id) {
      console.log('⚠️ [Wallet] No user ID, setting balance to 0', {
        timestamp: new Date().toISOString(),
        stack: new Error().stack
      });
      return setWalletBalance(0);
    }

    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('📊 [Wallet] Fetch result', {
        userId: user.id,
        data,
        error,
        timestamp: new Date().toISOString(),
        stack: new Error().stack
      });

      if (error || !data) {
        console.log('❌ [Wallet] Error or no data', {
          error,
          timestamp: new Date().toISOString(),
          stack: new Error().stack
        });
        setWalletBalance(0);
        return;
      }

      const balance = Number(data.balance) || 0;
      console.log('✅ [Wallet] Setting balance', {
        balance,
        previousBalance: walletBalance,
        timestamp: new Date().toISOString(),
        stack: new Error().stack
      });
      setWalletBalance(balance);
    } catch (error) {
      console.error('💥 [Wallet] Unexpected error', {
        error,
        timestamp: new Date().toISOString(),
        stack: new Error().stack
      });
      setWalletBalance(0);
    }
  };

  const handleAddAddress = async (data: any) => {
    try {
      setIsUpdating(true);

      // If this is the first address or marked as default, update other addresses
      if (data.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user?.id);
      }

      const { error } = await supabase
        .from('addresses')
        .insert([{ ...data, user_id: user?.id }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Address added successfully.",
      });

      setIsAddingAddress(false);
      fetchAddresses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Address deleted successfully.",
      });

      fetchAddresses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete address. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      setIsUpdating(true);

      // First, set all addresses to non-default
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Then set the selected address as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Default address updated successfully.",
      });

      fetchAddresses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update default address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Simulate profile update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profileData.newPassword !== profileData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: profileData.currentPassword
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // If current password is correct, update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: profileData.newPassword
      });

      if (updateError) {
        throw updateError;
      }
      
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      });
      
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative overflow-hidden bg-black">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Multiple animated gradient layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/15 via-black to-neon-cyan/15 animate-gradient-shift"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-neon-pink/8 via-transparent to-neon-orange/8 animate-pulse"></div>
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 bg-neon-cyan/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -25, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-4 md:p-8">
          {/* Hero Section */}
          <motion.div 
            className="max-w-7xl mx-auto mb-12 relative"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-8">
              <motion.img 
                src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
                alt="Bakwas Clothing Co." 
                className="w-32 h-auto mx-auto mb-6 drop-shadow-2xl"
                animate={{ 
                  filter: [
                    'drop-shadow(0 0 15px rgba(0, 225, 255, 0.4))',
                    'drop-shadow(0 0 25px rgba(139, 92, 246, 0.4))',
                    'drop-shadow(0 0 15px rgba(0, 225, 255, 0.4))'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <motion.h1 
                className="text-5xl md:text-7xl font-anton bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent mb-4"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 6, repeat: Infinity }}
                style={{ backgroundSize: '200% 100%' }}
              >
                MY ACCOUNT
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-white/70 font-space max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Welcome back to your <span className="text-neon-cyan font-bold">BAKWAS</span> universe. 
                Manage your profile, orders, and streetwear journey.
              </motion.p>
            </div>
          </motion.div>

          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/20 rounded-2xl h-16 mb-8 shadow-2xl shadow-neon-cyan/10">
                  <TabsTrigger 
                    value="profile" 
                    className="flex items-center gap-3 text-white font-space font-semibold text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-cyan/20 data-[state=active]:to-neon-purple/20 data-[state=active]:text-neon-cyan transition-all duration-300 rounded-xl"
                  >
                    <User className="h-5 w-5" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger 
                    value="addresses" 
                    className="flex items-center gap-3 text-white font-space font-semibold text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple/20 data-[state=active]:to-neon-pink/20 data-[state=active]:text-neon-purple transition-all duration-300 rounded-xl"
                  >
                    <MapPin className="h-5 w-5" />
                    Addresses
                  </TabsTrigger>
                  <TabsTrigger 
                    value="orders" 
                    className="flex items-center gap-3 text-white font-space font-semibold text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-pink/20 data-[state=active]:to-neon-orange/20 data-[state=active]:text-neon-pink transition-all duration-300 rounded-xl"
                  >
                    <Package className="h-5 w-5" />
                    Orders
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-8">
                  {/* Wallet Balance Card */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-orange/30 shadow-2xl shadow-neon-orange/20 rounded-2xl mb-6">
                      <CardHeader className="pb-4 flex flex-row items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-neon-orange to-neon-pink rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-black">₹</span>
                        </div>
                        <CardTitle className="text-neon-orange text-2xl font-anton">Wallet Balance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-neon-orange font-anton">
                          ₹{walletBalance !== null ? walletBalance.toFixed(2) : '0.00'}
                        </div>
                        <div className="text-white/60 font-space text-sm mt-1">
                          Use your wallet balance for instant refunds and future purchases.
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* User Info Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 hover:shadow-neon-purple/30 transition-all duration-500 rounded-2xl">
                      <CardHeader className="pb-6">
                        <CardTitle className="text-neon-cyan text-3xl font-anton flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-black" />
                          </div>
                          PROFILE INFORMATION
                        </CardTitle>
                        <div className="h-1 w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-full"></div>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Label htmlFor="fullName" className="text-neon-cyan font-space font-semibold text-lg mb-2 block">
                                Full Name
                              </Label>
                              <Input
                                id="fullName"
                                value={profileData.fullName}
                                onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                                className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-cyan transition-all duration-300 rounded-xl h-12 text-lg backdrop-blur-sm"
                                placeholder="Enter your full name"
                              />
                            </motion.div>
                            
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Label htmlFor="email" className="text-neon-purple font-space font-semibold text-lg mb-2 block">
                                Email Address
                              </Label>
                              <div className="relative">
                                <Input
                                  id="email"
                                  type="email"
                                  value={profileData.email}
                                  disabled
                                  className="bg-gray-900/40 text-white/60 border-2 border-gray-700 rounded-xl h-12 text-lg backdrop-blur-sm pl-12"
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neon-purple" />
                              </div>
                              <p className="text-sm text-white/50 mt-2 font-space">Email cannot be changed for security reasons</p>
                            </motion.div>
                          </div>
                          
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button 
                              type="submit" 
                              disabled={isUpdating} 
                              className="group relative w-full md:w-auto h-14 text-lg font-anton overflow-hidden rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02] disabled:opacity-70"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-cyan p-[2px] group-hover:from-neon-purple group-hover:via-neon-pink group-hover:to-neon-orange transition-all duration-500">
                                <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                              </div>
                              <div className="relative z-10 flex items-center justify-center gap-3 h-full px-8">
                                {isUpdating ? (
                                  <motion.div 
                                    className="flex items-center gap-3"
                                    animate={{ opacity: [1, 0.7, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  >
                                    <motion.div 
                                      className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full"
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    <span className="text-lg font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                                      UPDATING...
                                    </span>
                                  </motion.div>
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <Save className="h-6 w-6 text-neon-cyan group-hover:text-neon-pink transition-colors duration-300" />
                                    <span className="text-lg font-bold bg-gradient-to-r from-neon-cyan via-white to-neon-cyan bg-clip-text text-transparent group-hover:from-neon-purple group-hover:via-neon-pink group-hover:to-neon-orange transition-all duration-500">
                                      UPDATE PROFILE
                                    </span>
                                  </div>
                                )}
                              </div>
                            </Button>
                          </motion.div>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Password Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-purple/30 shadow-2xl shadow-neon-purple/20 hover:shadow-neon-cyan/30 transition-all duration-500 rounded-2xl">
                      <CardHeader className="pb-6">
                        <CardTitle className="text-neon-purple text-3xl font-anton flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-neon-purple to-neon-pink rounded-full flex items-center justify-center">
                            <Shield className="h-6 w-6 text-black" />
                          </div>
                          SECURITY SETTINGS
                        </CardTitle>
                        <div className="h-1 w-full bg-gradient-to-r from-neon-purple via-neon-pink to-neon-orange rounded-full"></div>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-6">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Label htmlFor="currentPassword" className="text-neon-purple font-space font-semibold text-lg mb-2 block">
                              Current Password
                            </Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              value={profileData.currentPassword}
                              onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-purple transition-all duration-300 rounded-xl h-12 text-lg backdrop-blur-sm"
                              placeholder="Enter current password"
                            />
                          </motion.div>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Label htmlFor="newPassword" className="text-neon-pink font-space font-semibold text-lg mb-2 block">
                                New Password
                              </Label>
                              <Input
                                id="newPassword"
                                type="password"
                                value={profileData.newPassword}
                                onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-pink transition-all duration-300 rounded-xl h-12 text-lg backdrop-blur-sm"
                                placeholder="Enter new password"
                              />
                            </motion.div>
                            
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Label htmlFor="confirmPassword" className="text-neon-orange font-space font-semibold text-lg mb-2 block">
                                Confirm Password
                              </Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                value={profileData.confirmPassword}
                                onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-orange transition-all duration-300 rounded-xl h-12 text-lg backdrop-blur-sm"
                                placeholder="Confirm new password"
                              />
                            </motion.div>
                          </div>
                          
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button 
                              type="submit" 
                              disabled={isUpdating} 
                              className="group relative w-full md:w-auto h-14 text-lg font-anton overflow-hidden rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02] disabled:opacity-70"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-purple via-neon-pink to-neon-orange p-[2px] group-hover:from-neon-cyan group-hover:via-neon-purple group-hover:to-neon-pink transition-all duration-500">
                                <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                              </div>
                              <div className="relative z-10 flex items-center justify-center gap-3 h-full px-8">
                                {isUpdating ? (
                                  <motion.div 
                                    className="flex items-center gap-3"
                                    animate={{ opacity: [1, 0.7, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  >
                                    <motion.div 
                                      className="w-6 h-6 border-2 border-neon-purple border-t-transparent rounded-full"
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    <span className="text-lg font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
                                      CHANGING...
                                    </span>
                                  </motion.div>
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <Shield className="h-6 w-6 text-neon-purple group-hover:text-neon-cyan transition-colors duration-300" />
                                    <span className="text-lg font-bold bg-gradient-to-r from-neon-purple via-white to-neon-orange bg-clip-text text-transparent group-hover:from-neon-cyan group-hover:via-neon-purple group-hover:to-neon-pink transition-all duration-500">
                                      CHANGE PASSWORD
                                    </span>
                                  </div>
                                )}
                              </div>
                            </Button>
                          </motion.div>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="addresses">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-orange/30 shadow-2xl shadow-neon-orange/20 hover:shadow-neon-pink/30 transition-all duration-500 rounded-2xl">
                      <CardHeader className="pb-6">
                        <CardTitle className="text-neon-orange text-3xl font-anton flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-neon-orange to-neon-pink rounded-full flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-black" />
                          </div>
                          SAVED ADDRESSES
                        </CardTitle>
                        <div className="h-1 w-full bg-gradient-to-r from-neon-orange via-neon-pink to-neon-cyan rounded-full"></div>
                      </CardHeader>
                      <CardContent>
                        {isAddingAddress ? (
                          <div className="space-y-6">
                            <AddressForm 
                              onSubmit={handleAddAddress}
                              isSubmitting={isUpdating}
                            />
                            <Button
                              onClick={() => setIsAddingAddress(false)}
                              className="group relative w-full md:w-auto h-14 text-lg font-anton overflow-hidden rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02]"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-600 via-gray-700 to-gray-600 p-[2px] transition-all duration-500">
                                <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                              </div>
                              <div className="relative z-10 flex items-center justify-center gap-3 h-full px-8">
                                <span className="text-lg font-bold text-white/70">
                                  CANCEL
                                </span>
                              </div>
                            </Button>
                          </div>
                        ) : addresses.length > 0 ? (
                          <div className="space-y-6">
                            {addresses.map((address) => (
                              <motion.div
                                key={address.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-black/40 backdrop-blur-xl border-2 border-neon-orange/20 rounded-xl p-6 space-y-4"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <h3 className="text-xl font-anton text-neon-orange">{address.name}</h3>
                                      {address.is_default && (
                                        <span className="px-2 py-1 text-xs font-bold bg-neon-orange/20 text-neon-orange rounded-full">
                                          DEFAULT
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-white/70">{address.street_address}</p>
                                    <p className="text-white/70">
                                      {address.city}, {address.state} {address.postal_code}
                                    </p>
                                    <p className="text-white/70">{address.country}</p>
                                    <p className="text-white/70">{address.phone}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {!address.is_default && (
                                      <Button
                                        onClick={() => handleSetDefaultAddress(address.id)}
                                        className="text-neon-orange hover:text-neon-pink transition-colors"
                                        variant="ghost"
                                      >
                                        Set as Default
                                      </Button>
                                    )}
                                    <Button
                                      onClick={() => handleDeleteAddress(address.id)}
                                      className="text-red-500 hover:text-red-400 transition-colors"
                                      variant="ghost"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                            
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button 
                                onClick={() => setIsAddingAddress(true)}
                                className="group relative h-14 text-lg font-anton overflow-hidden rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02]"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-orange via-neon-pink to-neon-cyan p-[2px] transition-all duration-500">
                                  <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                                </div>
                                <div className="relative z-10 flex items-center justify-center gap-3 h-full px-8">
                                  <Plus className="h-6 w-6 text-neon-orange group-hover:text-neon-cyan transition-colors duration-300" />
                                  <span className="text-lg font-bold bg-gradient-to-r from-neon-orange via-white to-neon-pink bg-clip-text text-transparent">
                                    ADD NEW ADDRESS
                                  </span>
                                </div>
                              </Button>
                            </motion.div>
                          </div>
                        ) : (
                        <div className="text-center py-12">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                            className="mb-8"
                          >
                            <div className="w-24 h-24 bg-gradient-to-r from-neon-orange/20 to-neon-pink/20 rounded-full flex items-center justify-center mx-auto mb-6">
                              <MapPin className="h-12 w-12 text-neon-orange" />
                            </div>
                            <h3 className="text-2xl font-anton text-neon-orange mb-4">NO ADDRESSES YET</h3>
                            <p className="text-white/60 font-space text-lg mb-8 max-w-md mx-auto">
                              Add your delivery addresses to make checkout faster and easier for your next streetwear drop!
                            </p>
                          </motion.div>
                          
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                              <Button 
                                onClick={() => setIsAddingAddress(true)}
                                className="group relative h-14 text-lg font-anton overflow-hidden rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02]"
                              >
                              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-orange via-neon-pink to-neon-cyan p-[2px] transition-all duration-500">
                                <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                              </div>
                              <div className="relative z-10 flex items-center justify-center gap-3 h-full px-8">
                                <Plus className="h-6 w-6 text-neon-orange group-hover:text-neon-cyan transition-colors duration-300" />
                                <span className="text-lg font-bold bg-gradient-to-r from-neon-orange via-white to-neon-pink bg-clip-text text-transparent">
                                  ADD NEW ADDRESS
                                </span>
                              </div>
                            </Button>
                          </motion.div>
                        </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="orders">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <OrderHistory />
                  </motion.div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MyAccount;
