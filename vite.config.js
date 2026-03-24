/*
 *  ThunderStats [https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/]
 *  Copyright (C) 2024 - 2026 Mic (m@micz.it)

 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.

 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { createXpi } from './build.js'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    {
      name: 'xpi-packager',
      apply: 'build',
      closeBundle() {
        if (mode === 'production') {
          createXpi();
        }
      }
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@statslib': fileURLToPath(new URL('./statslib', import.meta.url)),
      '@public': fileURLToPath(new URL('./public', import.meta.url)),
    }
  },
  build: {
    minify: mode === 'production',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.thunderstats.html'),
        options: resolve(__dirname, 'index.ts-options.html')
      }
    }
  },
}))
