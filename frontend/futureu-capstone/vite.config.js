// filepath: c:\Users\John Clyde\Documents\3Y-2S\Capstone\futureu_project\FutureU-Capstone\frontend\futureu-capstone\vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/FutureU-Capstone",
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
        target: 'http://localhost:8080', // Replace with your backend URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
})