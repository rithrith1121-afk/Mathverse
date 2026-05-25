import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Fixed port matching backend (default 3000)
      port: Number(process.env.PORT) || 3001,
      hmr: {
        clientPort: Number(process.env.PORT) || 3001,
        protocol: 'ws',
        host: 'localhost'
      },
      // Enable file watching (needed for Vite dev)
      watch: {}
    },
  };
});
