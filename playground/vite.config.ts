import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  publicDir: resolve(root, '../assets'),
  plugins: [react()],
  resolve: {
    alias: {
      '@evoker/core': resolve(root, '../core/src/index.ts'),
      '@evoker/react': resolve(root, '../react/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
});
