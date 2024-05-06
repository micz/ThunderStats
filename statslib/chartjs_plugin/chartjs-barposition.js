/*
 *  ThunderStats [https://micz.it/thunderdbird-addon-thunderstats-your-thunderbird-statistics/]
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

export const tsBarPosition = {
    id: "tsBarPosition",
    afterUpdate(chart, args, options) {
        chart.data.datasets.forEach((dataset, dsIndex) => {
                const meta = chart.getDatasetMeta(dsIndex);
                meta.data.forEach(bar => {
                    switch(dataset.tsID){
                        case 'ts':
                            bar.x = bar.x - (2 * bar.width);
                            bar.width *= 2;
                            break;
                        case 'tr':
                            bar.x = bar.x - bar.width;
                            bar.width *= 2;
                            break;
                        case 'ys':
                            bar.x = bar.x + bar.width*3/4;
                            break;
                        case 'yr':
                            bar.x = bar.x + (3 * bar.width/2);
                            break;
                    }
                });
        });
    }

}