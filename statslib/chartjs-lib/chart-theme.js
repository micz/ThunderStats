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

import { Chart } from 'chart.js';

// Sets the global Chart.js text and grid colors for the current theme
// and redraws the charts already on screen.
export function applyChartTheme(is_dark) {
    Chart.defaults.color = is_dark ? '#a2a8b4' : '#5b616e';
    Chart.defaults.borderColor = is_dark ? '#33383f' : '#e3e5e9';
    for(let chart of Object.values(Chart.instances)) {
        chart.update('none');
    }
}
