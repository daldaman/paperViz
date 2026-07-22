import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command, isPreview }) => {
    return {
      // GitHub Pages project site lives under /paperViz/; dev stays at root.
      // `vite preview` also runs as command === 'serve', so it needs the
      // build base too — otherwise it serves the dist at / while the built
      // HTML references /paperViz/assets/... and every asset SPA-fallbacks
      // to index.html (blank page).
      base: command === 'build' || isPreview ? '/paperViz/' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
