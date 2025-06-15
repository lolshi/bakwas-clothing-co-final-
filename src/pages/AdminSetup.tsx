import React from 'react';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';
import StorageDiagnostic from '@/components/admin/StorageDiagnostic';
import ProductStatusChecker from '@/components/admin/ProductStatusChecker';
import DatabaseDiagnostic from '@/components/DatabaseDiagnostic';

const AdminSetup = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">BAKWAS Admin Setup & Diagnostics</h1>
          <p className="text-gray-300">Setup admin users, diagnose storage issues, and check product status</p>
        </div>
        
        <DatabaseDiagnostic />
        
        <SupabaseConnectionTest />
        
        <StorageDiagnostic />
        
        <ProductStatusChecker />
      </div>
    </div>
  );
};

export default AdminSetup; 