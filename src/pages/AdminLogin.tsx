
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin = () => {
  const { adminUser, signIn } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (adminUser) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error);
      } else {
        toast.success('Login successful');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <img 
            src="/lovable-uploads/40fa6e4a-a62b-4c00-b9c8-e3077d47e80b.png" 
            alt="Bakwas Clothing Co." 
            className="h-12 w-auto mx-auto mb-4"
          />
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bakwas.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-neon-cyan text-black hover:bg-neon-cyan/80"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className="mt-4 text-sm text-gray-600 text-center">
            Demo credentials: admin@bakwas.com / admin123
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
