import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@statslib': fileURLToPath(new URL('./statslib', import.meta.url)),
      '@public': fileURLToPath(new URL('./public', import.meta.url)),
    }
  },
  build: {
    minify: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.thunderstats.html'),
        options: resolve(__dirname, 'index.ts-options.html')
      }
    }
  },
})
