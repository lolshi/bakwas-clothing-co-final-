import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only show the form if the URL hash contains type=recovery
    if (window.location.hash.includes('type=recovery')) {
      setShowForm(true);
    } else {
      setShowForm(false);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || !confirmPassword) {
      setError('Please fill in both fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);
    if (error) {
      setError('Failed to reset password. The link may have expired or is invalid.');
    } else {
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/30 via-transparent to-cyan-900/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_100%)]" />
      </div>
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="particles-container"></div>
      </div>
      {/* Logo */}
      <img 
        src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
        alt="Bakwas Clothing Co." 
        className="w-40 h-auto mb-8 relative animate-pulse-shadow"
      />
      {/* Card */}
      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <p className="text-gray-300 text-sm">
            Enter your new password below.
          </p>
        </CardHeader>
        <CardContent>
          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="text-white mb-2 block">New Password</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/30 text-white border-purple-500/20 focus:border-cyan-500/50 transition-colors"
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="text-white mb-2 block">Confirm Password</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/30 text-white border-purple-500/20 focus:border-cyan-500/50 transition-colors"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
              {success && <p className="text-green-400 text-sm mt-1">{success}</p>}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-semibold rounded-lg transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center text-red-400 font-semibold py-8">
              Invalid or expired reset link.<br />
              Please request a new password reset.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword; 