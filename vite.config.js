import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  define: {
    // Explicitly define environment variables for production
    'import.meta.env.VITE_LITELLM_BASE_URL': JSON.stringify(process.env.VITE_LITELLM_BASE_URL),
    'import.meta.env.VITE_LITELLM_MODEL': JSON.stringify(process.env.VITE_LITELLM_MODEL),
  },
  server: {
    port: 3000,
    host: true
  },
  preview: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
})
