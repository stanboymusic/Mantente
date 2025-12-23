import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['pocketbase']
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      external: ['pocketbase', 'pocketbase.exe'],
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['react-bootstrap', 'bootstrap'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-utils': ['jspdf', 'html2canvas'],
          'vendor-external': ['@emailjs/browser', '@paypal/paypal-js'],
        }
      }
    },
    minify: 'esbuild',
    assetsInlineLimit: 4096,
    sourcemap: false,
    cssCodeSplit: true,
  },
  server: {
    middlewareMode: false
  }
})
