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

import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

// Real data tests on the mailbox dumps of tests/real/data (see tests/real/dump.js).
// The days of the mails depend on the time zone: TS_TZ sets the one of the dump (default Europe/Rome).
process.env.TZ = process.env.TS_TZ || 'Europe/Rome'

export default defineConfig((env) => mergeConfig(viteConfig(env), {
  test: {
    environment: 'node',
    include: ['tests/real/**/*.test.js'],
    setupFiles: ['tests/setup.js'],
    testTimeout: 10 * 60 * 1000,
  },
}))
