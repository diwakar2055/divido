import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import vercel from 'vite-plugin-vercel';

export default defineConfig({
  plugins: [react(), vercel()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  vercel: {
    rewrites: [
      {
        source: '/(.*)',
        destination: '/',
      },
    ],
  },
});
