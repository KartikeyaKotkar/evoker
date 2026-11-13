import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Hash routes share one document directory, including the GitHub Pages repository path.
  base: './',
  publicDir: resolve(root, '../assets'),
  plugins: [react()],
  resolve: {
    alias: {
      '@kartikeyak/evoker-core': resolve(root, '../core/src/index.ts'),
      '@kartikeyak/evoker': resolve(root, '../react/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
});
