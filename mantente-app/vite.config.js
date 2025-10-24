import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimización de chunks para dispositivos de gama baja
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['react-bootstrap', 'bootstrap'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-utils': ['jspdf', 'html2canvas'],
          'vendor-external': ['@emailjs/browser', '@paypal/paypal-js', '@supabase/supabase-js'],
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remover console.log en producción
        drop_debugger: true
      }
    },
    // Optimización de assets
    assetsInlineLimit: 4096, // Inline assets menores a 4KB
    sourcemap: false, // Desactivar sourcemaps en producción
    cssCodeSplit: true, // Separar CSS en chunks
  },
  // Optimización de desarrollo
  server: {
    middlewareMode: false
  }
})
