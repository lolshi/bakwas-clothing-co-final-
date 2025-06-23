import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    let isValid = true;
    setFullNameError('');
    setEmailError('');
    setPasswordError('');

    if (!fullName.trim()) {
      setFullNameError('Full name is required');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(email, password, fullName);

    if (error) {
      toast({
        title: "Signup Failed",
        description: error,
        variant: "destructive",
      });
    } else {
      navigate('/login?message=confirm_email');
    }

    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-black to-neon-cyan/20 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-neon-pink/10 via-transparent to-neon-orange/10 animate-pulse"></div>
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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <motion.img 
          src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
          alt="Bakwas Clothing Co." 
          className="w-32 sm:w-40 md:w-48 h-auto mx-auto mb-4 drop-shadow-2xl"
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
          className="text-4xl sm:text-6xl font-anton bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent mb-2"
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 5, repeat: Infinity }}
          style={{ backgroundSize: '200% 100%' }}
        >
          SIGN UP
        </motion.h1>
        <motion.p 
          className="text-lg text-white/80 font-space max-w-xl mx-auto mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Join the <span className="text-neon-cyan font-bold">BAKWAS</span> movement and unlock your streetwear journey.
        </motion.p>
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 hover:shadow-neon-purple/30 transition-all duration-500">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-neon-cyan text-2xl sm:text-3xl font-anton mb-2">Create Your Account</CardTitle>
            <div className="h-1 w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-full"></div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-neon-cyan font-semibold">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 mb-2 bg-gray-900/60 text-white rounded-xl border-2 border-gray-600 focus:border-neon-cyan transition-all duration-300"
                  placeholder="Full Name"
                  required
                />
                {fullNameError && <p className="text-red-400 text-sm">{fullNameError}</p>}
              </div>
              <div>
                <Label htmlFor="email" className="text-neon-cyan font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 mb-2 bg-gray-900/60 text-white rounded-xl border-2 border-gray-600 focus:border-neon-cyan transition-all duration-300"
                  placeholder="Email"
                  required
                />
                {emailError && <p className="text-red-400 text-sm">{emailError}</p>}
              </div>
              <div>
                <Label htmlFor="password" className="text-neon-cyan font-semibold">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pr-10 mb-2 bg-gray-900/60 text-white rounded-xl border-2 border-gray-600 focus:border-neon-cyan transition-all duration-300"
                    placeholder="Password (min 6 characters)"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 hover:text-neon-cyan"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full group relative h-12 overflow-hidden rounded-xl border-0 bg-gradient-to-r from-neon-cyan to-neon-pink p-0 transition-all duration-500 hover:scale-[1.02] font-anton text-lg"
              >
                {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
                Sign Up
              </Button>
            </form>
            <div className="my-4 flex items-center justify-center gap-2">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent" />
              <span className="text-white/70 text-sm font-medium">or</span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent via-neon-cyan to-transparent" />
            </div>
            <Button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 rounded-lg shadow hover:bg-gray-100 transition"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </Button>
            <div className="text-center mt-4">
              <span className="text-white/60">Already have an account? </span>
              <Link
                to="/login"
                className="text-neon-cyan underline hover:text-neon-pink"
              >
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
