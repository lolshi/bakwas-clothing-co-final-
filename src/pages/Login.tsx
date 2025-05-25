
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const confirmMessage = searchParams.get('message');

  useEffect(() => {
    if (confirmMessage === 'confirm_email') {
      toast({
        title: "Email Confirmation Required",
        description: "Thank you for signing up! Please check your email to confirm your account.",
        duration: 5000,
      });
    }
  }, [confirmMessage, toast]);

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

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
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Login Failed",
        description: error,
        variant: "destructive",
      });
    } else {
      const redirectTo = searchParams.get('next') || '/account';
      navigate(redirectTo);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <img 
        src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
        alt="Bakwas Clothing Co." 
        className="w-40 h-auto mb-4"
      />

      {/* Confirmation Banner */}
      {confirmMessage === 'confirm_email' && (
        <div className="w-full max-w-md mb-4 p-4 bg-blue-600 text-white rounded-lg text-center">
          Thank you for signing up! Please check your email to confirm your account.
        </div>
      )}

      <Card className="w-full max-w-md bg-gray-800 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white mb-4">
            Welcome Back
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mb-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-400 border-none"
                placeholder="Email"
                required
              />
              {emailError && <p className="text-red-400 text-sm">{emailError}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pr-10 mb-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-400 border-none"
                  placeholder="Password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-blue-400 underline hover:text-blue-300 text-sm"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-400 hover:bg-blue-500 text-black font-semibold rounded-lg transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>

            <div className="text-center mt-4">
              <span className="text-gray-400">New here? </span>
              <Link
                to="/signup"
                className="text-blue-400 underline hover:text-blue-300"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
