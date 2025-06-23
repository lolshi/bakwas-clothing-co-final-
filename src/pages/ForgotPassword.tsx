import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) {
      return;
    }
    setIsLoading(true);
    setEmailError('');
    // Call Supabase to send the reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:8082/reset-password',
    });
    setIsLoading(false);
    if (error) {
      setEmailError('Failed to send reset link. Please try again.');
    } else {
      setIsSubmitted(true);
      toast({
        title: "Reset Link Sent",
        description: "If an account with that email exists, we've sent a password reset link.",
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <img 
          src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
          alt="Bakwas Clothing Co." 
          className="w-40 h-auto mb-4"
        />
        <Card className="w-full max-w-md bg-gray-800 shadow-lg">
          <CardContent className="text-center p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
            <p className="text-gray-300 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <Link
              to="/login"
              className="text-blue-400 underline hover:text-blue-300"
            >
              Back to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <img 
        src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
        alt="Bakwas Clothing Co." 
        className="w-40 h-auto mb-4"
      />
      <Card className="w-full max-w-md bg-gray-800 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white mb-4">
            Forgot Password?
          </CardTitle>
          <p className="text-gray-300 text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>
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
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-400 hover:bg-blue-500 text-black font-semibold rounded-lg transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
            <div className="text-center mt-4">
              <Link
                to="/login"
                className="text-blue-400 underline hover:text-blue-300"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
