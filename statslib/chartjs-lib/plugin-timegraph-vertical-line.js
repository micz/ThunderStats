/*
 *  ThunderStats [https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/]
 *  Copyright (C) 2024  Mic (m@micz.it)

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

export const tsVerticalLinePlugin = {
    id: "tsVerticalLinePlugin",
    beforeDraw: (chart) => {
        const drawVerticalLineAt = chart.options.plugins.tsVerticalLinePlugin.drawVerticalLineAt;
        const verticalLineColor = chart.options.plugins.tsVerticalLinePlugin.verticalLineColor;
        const xScale = chart.scales.x;
        const yScale = chart.scales.y;
        const ctx = chart.ctx;
        // Find the index of the tick where you want to draw the vertical line
        const index = chart.data.labels.indexOf(drawVerticalLineAt);

        if (index !== -1) {
            const x = xScale.getPixelForValue(index);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, yScale.top);
            ctx.lineTo(x, yScale.bottom);
            ctx.lineWidth = 1;
            ctx.strokeStyle = verticalLineColor;
            ctx.setLineDash([5, 5])
            ctx.stroke();
            ctx.restore();
        }
    }
}