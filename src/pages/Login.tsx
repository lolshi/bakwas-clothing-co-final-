
import React, { useState } from 'react';
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
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Login Failed",
        description: error,
        variant: "destructive",
      });
    } else {
      const redirectTo = searchParams.get('next') || '/';
      navigate(redirectTo);
    }

    setIsLoading(false);
  };

  const handleDemoLogin = () => {
    setEmail('demo@example.com');
    setPassword('password');
  };

  const isFormValid = email.length > 0 && password.length > 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card/90 backdrop-blur-sm border-border shadow-xl animate-in fade-in duration-300">
          <CardHeader className="text-center">
            <img 
              src="/lovable-uploads/40fa6e4a-a62b-4c00-b9c8-e3077d47e80b.png" 
              alt="Bakwas Clothing Co." 
              className="h-12 w-auto mx-auto mb-4"
            />
            <CardTitle className="text-2xl font-anton bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Demo Credentials Banner */}
            <div className="mb-6 p-4 bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg">
              <h4 className="font-anton text-neon-cyan mb-2">Demo Login</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Use these credentials to test the website:
              </p>
              <div className="text-sm font-mono bg-black/20 p-2 rounded">
                <div>Email: demo@example.com</div>
                <div>Password: password</div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 w-full border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                onClick={handleDemoLogin}
              >
                Use Demo Credentials
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border-transparent focus:border-neon-cyan transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pr-10 border-transparent focus:border-neon-cyan transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-neon-cyan hover:text-neon-purple transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full py-3 bg-neon-cyan text-black hover:bg-neon-cyan/80 transition-colors disabled:opacity-50"
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

              <div className="text-center">
                <span className="text-muted-foreground">New here? </span>
                <Link
                  to="/signup"
                  className="text-neon-cyan hover:text-neon-purple transition-colors font-medium"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
