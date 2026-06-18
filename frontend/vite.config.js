import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tailwind is processed via PostCSS (see postcss.config.js + tailwind.config.js).
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    // Forward API calls to the Express backend during development so the
    // frontend can call "/api/..." without worrying about CORS or ports.
    proxy: {
      '/api': {
        target: 'http://localhost:2121',
        changeOrigin: true,
      },
    },
  },

  // Bundle / build rules
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split big, rarely-changing dependencies into their own chunks
        // so browsers can cache them between deploys.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor'
            if (id.includes('axios') || id.includes('lucide-react')) return 'vendor'
          }
        },
      },
    },
  },
})
