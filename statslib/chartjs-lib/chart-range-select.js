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

// Range selection on a category x axis: dragging highlights the whole band of the
// categories covered (full chart height) and, on release, calls
// onSelect(from_index, to_index), even for a single category. A plain click
// (the mouse moved less than MIN_DRAG_PX) selects nothing.
// While dragging the tooltip is hidden.

const MIN_DRAG_PX = 4;

// Category index under a pixel, clamped to the axis
export function indexAtPixel(scale, x, count) {
    if(count <= 0) return -1;
    let index = Math.round(scale.getValueForPixel(x));
    return Math.max(0, Math.min(count - 1, index));
}

// Left and right pixel of the band covering the categories from..to
export function bandEdges(scale, area, from, to, count) {
    let half = count > 1 ? Math.abs(scale.getPixelForValue(1) - scale.getPixelForValue(0)) / 2 : (area.right - area.left) / 2;
    let left = Math.max(area.left, scale.getPixelForValue(from) - half);
    let right = Math.min(area.right, scale.getPixelForValue(to) + half);
    return { left, right };
}

export function createRangeSelectPlugin({ enabled, color, onSelect }) {
    let state = { dragging: false, start: -1, end: -1, start_x: 0, moved: false };

    let count = (chart) => chart.data.labels ? chart.data.labels.length : 0;
    let reset = () => { state.dragging = false; state.start = -1; state.end = -1; state.moved = false; };

    return {
        id: 'tsRangeSelect',

        afterEvent(chart, args) {
            if(!enabled()) return;
            let event = args.event;
            let area = chart.chartArea;
            let scale = chart.scales.x;
            let n = count(chart);
            if(!scale || n == 0) return;

            if(event.type == 'mousedown') {
                if(event.x < area.left || event.x > area.right || event.y < area.top || event.y > area.bottom) return;
                state.dragging = true;
                state.start = state.end = indexAtPixel(scale, event.x, n);
                state.start_x = event.x;
                state.moved = false;
                chart.tooltip.setActiveElements([], { x: 0, y: 0 });
                args.changed = true;
            } else if(event.type == 'mousemove' && state.dragging) {
                if(!state.moved && Math.abs(event.x - state.start_x) >= MIN_DRAG_PX) {
                    state.moved = true;
                    args.changed = true;
                }
                let index = indexAtPixel(scale, event.x, n);
                if(index != state.end) {
                    state.end = index;
                    args.changed = true;
                }
                chart.tooltip.setActiveElements([], { x: 0, y: 0 });
            } else if(event.type == 'mouseup' && state.dragging) {
                let from = Math.min(state.start, state.end);
                let to = Math.max(state.start, state.end);
                let moved = state.moved;
                reset();
                args.changed = true;
                if(moved) onSelect(from, to);
            } else if(event.type == 'mouseout' && state.dragging) {
                reset();
                args.changed = true;
            }
        },

        beforeTooltipDraw() {
            // no tooltip while dragging
            return !state.dragging;
        },

        afterDatasetsDraw(chart) {
            if(!state.dragging || !state.moved) return;
            let n = count(chart);
            let from = Math.min(state.start, state.end);
            let to = Math.max(state.start, state.end);
            let area = chart.chartArea;
            let { left, right } = bandEdges(chart.scales.x, area, from, to, n);
            let ctx = chart.ctx;
            ctx.save();
            ctx.fillStyle = color();
            ctx.fillRect(left, area.top, right - left, area.bottom - area.top);
            ctx.restore();
        },
    };
}
