import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertTriangle, HardDrive } from 'lucide-react';

const StorageDiagnostic = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [results, setResults] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const testStorageSetup = async () => {
    setStatus('testing');
    setResults([]);
    const testResults: string[] = [];

    try {
      // Test 1: Check if we can list buckets
      testResults.push('🔍 Testing storage bucket access...');
      
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        testResults.push(`❌ Cannot access storage buckets: ${bucketsError.message}`);
        setResults([...testResults]);
        setStatus('error');
        return;
      }

      testResults.push(`✅ Can access storage. Found ${buckets?.length || 0} buckets`);
      
      // Test 2: Check if 'products' bucket exists
      const productsBucket = buckets?.find(bucket => bucket.name === 'products');
      if (productsBucket) {
        testResults.push('✅ "products" bucket exists');
      } else {
        testResults.push('❌ "products" bucket does not exist');
        setResults([...testResults]);
        setStatus('error');
        return;
      }

      // Test 3: Try to list files in products bucket
      const { data: files, error: filesError } = await supabase.storage
        .from('products')
        .list('', { limit: 1 });

      if (filesError) {
        testResults.push(`❌ Cannot access products bucket: ${filesError.message}`);
        setResults([...testResults]);
        setStatus('error');
        return;
      }

      testResults.push(`✅ Can list files in products bucket. Found ${files?.length || 0} files`);

      // Test 4: Try to upload a small test file
      try {
        const testFile = new Blob(['test'], { type: 'text/plain' });
        const testFileName = `test-${Date.now()}.txt`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(`test/${testFileName}`, testFile);

        if (uploadError) {
          testResults.push(`❌ Cannot upload to products bucket: ${uploadError.message}`);
          setResults([...testResults]);
          setStatus('error');
          return;
        }

        testResults.push('✅ Can upload files to products bucket');

        // Clean up test file
        await supabase.storage
          .from('products')
          .remove([`test/${testFileName}`]);

        testResults.push('✅ Can delete files from products bucket');

      } catch (error: any) {
        testResults.push(`❌ Upload test failed: ${error.message}`);
        setResults([...testResults]);
        setStatus('error');
        return;
      }

      testResults.push('🎉 All storage tests passed! Products bucket is ready for use.');
      setResults(testResults);
      setStatus('success');

    } catch (error: any) {
      testResults.push(`💥 Unexpected error: ${error.message}`);
      setResults(testResults);
      setStatus('error');
    }
  };

  const createProductsBucket = async () => {
    setCreating(true);
    setResults([]);

    try {
      const { data, error } = await supabase.storage.createBucket('products', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (error) {
        setResults([`❌ Failed to create products bucket: ${error.message}`]);
        setStatus('error');
      } else {
        setResults([
          '✅ Products bucket created successfully!',
          '📁 Bucket name: products',
          '🌐 Public access: enabled',
          '📷 Allowed types: JPEG, PNG, WebP',
          '📏 Max file size: 5MB',
          '',
          '🔄 Please run the diagnostic test again to verify everything is working.'
        ]);
        setStatus('success');
      }
    } catch (error: any) {
      setResults([`💥 Error creating bucket: ${error.message}`]);
      setStatus('error');
    } finally {
      setCreating(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'testing':
        return <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <HardDrive className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Supabase Storage Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          This tool helps diagnose and fix storage bucket issues that prevent product image uploads.
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={testStorageSetup}
            disabled={status === 'testing' || creating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {status === 'testing' ? 'Testing...' : 'Run Storage Test'}
          </Button>

          <Button 
            onClick={createProductsBucket}
            disabled={status === 'testing' || creating}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            {creating ? 'Creating...' : 'Create Products Bucket'}
          </Button>
        </div>

        {results.length > 0 && (
          <Alert className={status === 'success' ? 'border-green-200 bg-green-50' : status === 'error' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1 font-mono text-sm">
                {results.map((result, index) => (
                  <div key={index} className={
                    result.includes('✅') ? 'text-green-700' :
                    result.includes('❌') || result.includes('💥') ? 'text-red-700' :
                    result.includes('🎉') ? 'text-green-800 font-bold' :
                    'text-gray-700'
                  }>
                    {result}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold text-orange-800">Possible Solutions:</p>
                <ul className="text-sm text-orange-700 space-y-1 list-disc list-inside">
                  <li>Click "Create Products Bucket" to set up the storage bucket</li>
                  <li>Check Supabase dashboard → Storage → Policies for proper permissions</li>
                  <li>Verify your Supabase project has storage enabled</li>
                  <li>Ensure your Supabase API key has storage permissions</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default StorageDiagnostic; 