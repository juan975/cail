import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/usuarios': {
        target: 'https://us-central1-cail-backend-prod.cloudfunctions.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/usuarios/, '/usuarios'),
      },
      '/api/ofertas': {
        target: 'https://us-central1-cail-backend-prod.cloudfunctions.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/ofertas/, '/ofertas'),
      },
      '/api/matching': {
        target: 'https://us-central1-cail-backend-prod.cloudfunctions.net/matching',
        changeOrigin: true,
        secure: true,
        // Rewrite /api/matching/X to /matching/X - this gets appended to target /matching
        // Final URL: .../matching/matching/X
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
