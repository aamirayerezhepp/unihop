import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps every asset path relative, so the build also works inside a Claude artifact.
// The artifact build goes to its own folder: `dist` is only ever the website that Firebase Hosting publishes.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  build: { assetsInlineLimit: 0, modulePreload: false, outDir: mode === 'artifact' ? 'dist-artifact' : 'dist' }
}));
