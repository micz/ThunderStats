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

import { defineConfig, mergeConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.js'

// The stats work on local dates: a fixed time zone with DST makes the tests repeatable on every machine.
process.env.TZ = 'Europe/Rome'

// Reuses the Vite config (aliases, Vue plugin); the XPI packager only applies to builds.
export default defineConfig((env) => mergeConfig(viteConfig(env), {
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    // real data tests: npm run test:real (vitest.real.config.js)
    exclude: [...configDefaults.exclude, 'tests/real/**'],
    setupFiles: ['tests/setup.js'],
  },
}))
