import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: command === 'serve',
      minify: command === 'build',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            maps: ['@googlemaps/js-api-loader', '@googlemaps/markerclusterer', 'google-map-react'],
            ui: ['@heroicons/react', 'react-slick', 'slick-carousel'],
          },
        },
      },
    },
  }

  if (command === 'serve') {
    // Development configuration
    config.server = {
      port: 5173,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5002',
          changeOrigin: true,
          secure: false
        }
      }
    }
  }

  return config
})