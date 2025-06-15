import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Database, User, Plus } from 'lucide-react';

const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [adminCreationStatus, setAdminCreationStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [adminForm, setAdminForm] = useState({
    email: 'admin@bakwas.com',
    password: 'admin123',
    fullName: 'BAKWAS Admin'
  });

  const testConnection = async () => {
    setConnectionStatus('testing');
    setError('');
    setSuccess('');

    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('products')
        .select('count(*)')
        .limit(1);

      if (error) throw error;

      setConnectionStatus('success');
      setSuccess('✅ Supabase connection successful!');
    } catch (err: any) {
      setConnectionStatus('error');
      setError(`❌ Connection failed: ${err.message}`);
    }
  };

  const createAdminUser = async () => {
    setAdminCreationStatus('creating');
    setError('');
    setSuccess('');

    try {
      // Check if admin user already exists
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', adminForm.email)
        .single();

      if (existingAdmin) {
        setError('❌ Admin user with this email already exists');
        setAdminCreationStatus('error');
        return;
      }

      // Create admin user (Note: In production, hash the password properly)
      const { data, error } = await supabase
        .from('admin_users')
        .insert([
          {
            email: adminForm.email,
            password_hash: adminForm.password, // In production, use bcrypt hash
            full_name: adminForm.fullName
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setAdminCreationStatus('success');
      setSuccess(`✅ Admin user created successfully! You can now login with:
      Email: ${adminForm.email}
      Password: ${adminForm.password}`);
    } catch (err: any) {
      setAdminCreationStatus('error');
      setError(`❌ Failed to create admin user: ${err.message}`);
    }
  };

  const checkAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('email, full_name, created_at');

      if (error) throw error;

      if (data && data.length > 0) {
        setSuccess(`📋 Existing admin users: ${data.map(admin => admin.email).join(', ')}`);
      } else {
        setSuccess('📭 No admin users found in database');
      }
    } catch (err: any) {
      setError(`❌ Failed to check admin users: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Database className="h-6 w-6 text-neon-cyan" />
              BAKWAS Database Setup & Admin Creation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connection Test */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                1. Test Supabase Connection
              </h3>
              <Button 
                onClick={testConnection} 
                disabled={connectionStatus === 'testing'}
                className="bg-neon-cyan text-black hover:bg-neon-cyan/80"
              >
                {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>

            {/* Admin User Creation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                2. Create Admin User
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                    placeholder="admin@bakwas.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                    placeholder="admin123"
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={adminForm.fullName}
                    onChange={(e) => setAdminForm({...adminForm, fullName: e.target.value})}
                    placeholder="BAKWAS Admin"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={createAdminUser} 
                  disabled={adminCreationStatus === 'creating'}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {adminCreationStatus === 'creating' ? 'Creating...' : 'Create Admin User'}
                </Button>
                
                <Button 
                  onClick={checkAdminUsers} 
                  variant="outline"
                >
                  Check Existing Admins
                </Button>
              </div>
            </div>

            {/* Status Messages */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 whitespace-pre-line">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 whitespace-pre-line">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">🚀 Next Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
                <li>Test the Supabase connection above</li>
                <li>Create an admin user using the form</li>
                <li>Navigate to <a href="/admin/login" className="underline font-medium">/admin/login</a></li>
                <li>Login with your admin credentials</li>
                <li>Go to <a href="/admin/products" className="underline font-medium">/admin/products</a> to add products</li>
              </ol>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button asChild variant="outline">
                <a href="/admin/login">👤 Admin Login</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/admin/products">📦 Admin Products</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/">🏠 Back to Home</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupabaseConnectionTest; 