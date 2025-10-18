// filepath: c:\Users\John Clyde\Documents\3Y-2S\Capstone\futureu_project\FutureU-Capstone\frontend\futureu-capstone\vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Keep base to "/" for Vercel unless overridden explicitly
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [
    tailwindcss(),
    react()
  ],
  resolve: {
    alias: {
      'react-map-gl': 'react-map-gl/dist/esm'
    }
  },
  server: {
    proxy: {
      '/api': {
        // Use env override for local dev proxy target; default to localhost backend
        target: process.env.VITE_DEV_API_TARGET || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})