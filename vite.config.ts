import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    port: 8082,
    host: true,
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
          animation: ['framer-motion', 'react-spring', '@react-spring/web']
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
      'react-spring',
      '@react-spring/web',
      '@use-gesture/react',
      'lucide-react',
    ],
  },
}));
