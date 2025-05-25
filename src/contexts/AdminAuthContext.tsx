
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (token) {
        // Verify token with backend
        const { data, error } = await supabase
          .from('admin_users')
          .select('id, email, full_name')
          .eq('id', token)
          .single();

        if (data && !error) {
          setAdminUser(data);
        } else {
          localStorage.removeItem('admin_token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // For demo purposes, we'll use a simple check
      // In production, implement proper password hashing verification
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return { error: 'Invalid credentials' };
      }

      // Store admin session
      localStorage.setItem('admin_token', data.id);
      setAdminUser({
        id: data.id,
        email: data.email,
        full_name: data.full_name
      });

      return {};
    } catch (error) {
      return { error: 'Login failed' };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('admin_token');
    setAdminUser(null);
  };

  const value = {
    adminUser,
    loading,
    signIn,
    signOut,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};
