
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { resolve } from 'path';
import fs from 'fs-extra';

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    {
      name: 'copy-service-worker',
      writeBundle: async () => {
        // Ensure the service worker is copied to the root of the dist folder
        const srcPath = resolve(__dirname, 'src/serviceWorker.ts');
        const destPath = resolve(__dirname, 'dist/service-worker.js');
        
        if (fs.existsSync(srcPath)) {
          await fs.copy(srcPath, destPath);
          console.log('Service worker copied to dist root');
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    outDir: 'dist',
  },
}));
