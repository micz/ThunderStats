// Dev server for the store screenshots: the real add-on pages on top of a fake Thunderbird API.
// Run from the repository root: npx vite --config tools/screenshots/vite.config.js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  root: fileURLToPath(new URL('../..', import.meta.url)),
  publicDir: fileURLToPath(new URL('../../public', import.meta.url)),
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../../src', import.meta.url)),
      '@statslib': fileURLToPath(new URL('../../statslib', import.meta.url)),
      '@public': fileURLToPath(new URL('../../public', import.meta.url)),
    }
  },
  server: { port: 5199, strictPort: true },
})
