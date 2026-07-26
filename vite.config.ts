import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const parentEnv = loadEnv(mode, path.resolve(__dirname, './'), '');
  const geminiKey =
    parentEnv.VITE_GEMINI_API_KEY ||
    parentEnv.GEMINI_API_KEY ||
    parentEnv.EXPO_PUBLIC_GEMINI_API_KEY ||
    'AIzaSyCJ1fLhNMyWEIgqoFUZU3u-qJ62l2GXG5k';

  return {
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
    },
    optimizeDeps: {
      include: ['pdfjs-dist'],
    },
    build: {
      target: 'esnext',
      cssCodeSplit: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/pdfjs-dist')) {
              return 'pdfjs';
            }
            if (id.includes('node_modules/@google/genai')) {
              return 'gemini-sdk';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'icons';
            }
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react-vendor';
            }
          },
        },
      },
    },
  };
});
