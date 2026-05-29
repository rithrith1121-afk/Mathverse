import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {

  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
    },
  },
});
