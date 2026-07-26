import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const parentEnv = loadEnv(mode, path.resolve(__dirname, './'), '');
  const groqKey = parentEnv.VITE_GROQ_API_KEY || parentEnv.GROQ_API_KEY || '';

  return {
    plugins: [react()],
    define: {
      'process.env.GROQ_API_KEY': JSON.stringify(groqKey),
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
