import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import itineraryDevPlugin from './vite-plugin-itinerary.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), itineraryDevPlugin()],
  server: {
    headers: {
      // Configure security headers for Firebase Authentication
      // 'same-origin-allow-popups' is essential for popup-based authentication
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      // Using unsafe-none allows cross-origin content without requiring CORP headers
      "Cross-Origin-Embedder-Policy": "unsafe-none",
      // Add Cross-Origin-Resource-Policy header to prevent resources from being blocked
      "Cross-Origin-Resource-Policy": "cross-origin"
    },
    proxy: {
      // Proxy Firestore API requests to avoid CORS issues
      '/google.firestore.v1.Firestore': {
        target: 'https://firestore.googleapis.com',
        changeOrigin: true,
        secure: true
      }
    }
  },
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/functions'
    ]
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions'],
          react: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
})
