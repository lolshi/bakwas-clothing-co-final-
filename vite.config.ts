import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

// Debug environment files
const envFiles = ['.env'];
console.log('🔍 Debug - Environment Files:');
envFiles.forEach(file => {
  const exists = fs.existsSync(path.resolve(__dirname, file));
  if (exists) {
    const stats = fs.statSync(path.resolve(__dirname, file));
    console.log(`- ${file}: exists, size: ${stats.size} bytes, mode: ${stats.mode.toString(8)}`);
    // Try to read first line to verify file is readable
    try {
      const content = fs.readFileSync(path.resolve(__dirname, file), 'utf8');
      console.log('  Content preview:', content.substring(0, 50) + '...');
    } catch (err) {
      console.log(`  Error reading file: ${err.message}`);
    }
  } else {
    console.log(`- ${file}: does not exist`);
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Debug mode and env
  console.log('🛠️ Debug - Vite Configuration:');
  console.log('- Mode:', mode);
  console.log('- Process env keys:', Object.keys(process.env));
  console.log('- Loaded env keys:', Object.keys(env));
  console.log('- VITE_* env keys:', Object.keys(env).filter(key => key.startsWith('VITE_')));
  console.log('- VITE_GROQ_API_KEY length:', env.VITE_GROQ_API_KEY?.length || 0);
  
  // Get API key from loaded environment
  const apiKey = env.VITE_GROQ_API_KEY;
  console.log('- GROQ API Key present:', !!apiKey);
  console.log('- GROQ API Key preview:', apiKey ? `${apiKey.substring(0, 10)}...` : 'none');

  return {
  base: '/',
  server: {
    port: 8082,
    host: true,
      proxy: {
        '/api/groq': {
          target: 'https://api.groq.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/groq/, '/openai/v1'),
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.error('🔴 Proxy Error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              const authHeader = proxyReq.getHeader('Authorization');
              console.log('🔄 Proxying request:', req.method, req.url);
              console.log('🔑 Authorization header:', authHeader ? `${String(authHeader).substring(0, 15)}...` : 'missing');
            });
          }
        }
      },
    watch: {
      ignored: [
        '**/ai-service/**',
        '**/venv/**',
        '**/__pycache__/**',
        '**/node_modules/**'
      ]
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-toast', '@radix-ui/react-dialog', '@radix-ui/react-tooltip'],
          animation: ['framer-motion', '@react-spring/web']
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      '@radix-ui/react-toast',
      '@radix-ui/react-dialog',
      '@radix-ui/react-tooltip',
      'framer-motion',
      '@react-spring/web',
      '@use-gesture/react',
      'lucide-react',
    ],
  },
  };
});
