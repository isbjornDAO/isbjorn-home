import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      // Safety net: catch any calls missing the /api prefix (e.g. /auth/...)
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, '/api/auth')
      }
    }
  },
  define: {
    // Ensure VITE_API_URL is available in production builds
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || ''),
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1000, // Wallet libraries are large but lazy-loaded
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'vendor';
          }
          // Stripe payment libraries
          if (id.includes('@stripe')) {
            return 'stripe';
          }
          // Blockchain/Ethereum libraries
          if (id.includes('ethers')) {
            return 'blockchain';
          }
          // WalletConnect and related wallet SDKs
          if (id.includes('@walletconnect') || id.includes('@reown') || id.includes('walletconnect')) {
            return 'walletconnect';
          }
          // MetaMask SDK
          if (id.includes('metamask') || id.includes('@metamask')) {
            return 'metamask-sdk';
          }
          // Coinbase wallet
          if (id.includes('@coinbase') || id.includes('@base-org')) {
            return 'coinbase-wallet';
          }
          // Charts library
          if (id.includes('recharts')) {
            return 'charts';
          }
          // Framer Motion animations
          if (id.includes('framer-motion')) {
            return 'animations';
          }
          // Node modules (split large vendor chunks)
          if (id.includes('node_modules')) {
            return 'vendor-libs';
          }
        }
      }
    }
  }
});
