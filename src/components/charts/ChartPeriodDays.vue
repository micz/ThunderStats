<!--
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
-->

<!-- Day-by-day grouped bars (received / sent) with the dashed average lines; with selectable, dragging selects a range to zoom -->
<template>
  <div class="ts-periodchart" :class="{ 'is-selectable': selectable }">
    <Bar :data="chartData" :options="chartOptions" :plugins="[averageLinesPlugin, rangeSelectPlugin]" v-if="!is_loading" />
    <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.svg" alt="" /></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart, BarController, BarElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import { tsStore } from '@statslib/mzts-store';
import { themeColor, withAlpha } from '@statslib/chartjs-lib/chart-theme.js';
import { createRangeSelectPlugin } from '@statslib/chartjs-lib/chart-range-select.js';

Chart.register(BarController, BarElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip);

const props = defineProps({
  days: { type: Array, default: () => [] },        // [{ key, label, date_label, is_today, is_business }]
  rcvd: { type: Array, default: () => [] },        // received (without the mails still in the inbox when rcvd_inbox is set)
  rcvd_inbox: { type: Array, default: null },      // received mails still in the inbox, stacked on rcvd
  sent: { type: Array, default: () => [] },
  avg_rcvd: { type: Number, default: 0 },
  avg_sent: { type: Number, default: 0 },
  avg_label: { type: String, default: 'avg' },
  cmp_rcvd: { type: Array, default: null },        // Period B (Custom Query comparison), drawn as lines
  cmp_sent: { type: Array, default: null },
  cmp_label: { type: String, default: '' },
  is_loading: { type: Boolean, default: true },
  selectable: { type: Boolean, default: false },  // drag to select a range of bars, even a single one (Custom Query zoom)
});

const emit = defineEmits(['zoom']);   // (from_index, to_index) of the selected bars

const label_received = browser.i18n.getMessage("ReceivedMails");
const label_inbox = browser.i18n.getMessage("FolderLocation_percent_remaining");
const label_sent = browser.i18n.getMessage("SentMails");

let today_index = computed(() => props.days.findIndex(d => d.is_today));

function barColor(color) {
  // today is still in progress: lighter bar
  return (ctx) => ctx.dataIndex == today_index.value ? withAlpha(color, 0.5) : color;
}

let chartData = computed(() => {
  tsStore.darkmode;   // recompute the colors when the theme changes
  let rcvd_color = themeColor('rcvd');
  let sent_color = themeColor('sent');
  let bar = { borderRadius: 2, borderSkipped: 'bottom', maxBarThickness: 16 };
  let datasets = [
    Object.assign({ label: label_received, data: props.rcvd, backgroundColor: barColor(rcvd_color), stack: 'received' }, bar),
  ];
  if(props.rcvd_inbox) {
    datasets.push(Object.assign({ label: label_inbox, data: props.rcvd_inbox, backgroundColor: barColor(themeColor('warn')), stack: 'received' }, bar));
  }
  datasets.push(Object.assign({ label: label_sent, data: props.sent, backgroundColor: barColor(sent_color), stack: 'sent' }, bar));
  if(props.cmp_rcvd && props.cmp_sent) {
    // each line has its own stack, so the stacked scale does not add them up
    let line = { type: 'line', borderWidth: 1.5, pointRadius: 2, pointHoverRadius: 3, tension: 0.3, fill: false, order: -1 };
    datasets.push(Object.assign({ label: props.cmp_label + ' · ' + label_received, data: props.cmp_rcvd, borderColor: rcvd_color, backgroundColor: rcvd_color, borderDash: [2, 3], stack: 'cmp_received' }, line));
    datasets.push(Object.assign({ label: props.cmp_label + ' · ' + label_sent, data: props.cmp_sent, borderColor: sent_color, backgroundColor: sent_color, borderDash: [2, 3], stack: 'cmp_sent' }, line));
  }
  return { labels: props.days.map(d => d.label), datasets };
});

const rangeSelectPlugin = createRangeSelectPlugin({
  enabled: () => props.selectable,
  color: () => withAlpha(themeColor('accent'), 0.14),
  onSelect: (from, to) => emit('zoom', from, to),
});

let chartOptions = computed(() => {
  tsStore.darkmode;
  let wide_gaps = props.days.length <= 14;
  return {
    responsive: true,
    // mousedown and mouseup are not among the default events
    ...(props.selectable ? { events: ['mousedown', 'mousemove', 'mouseup', 'mouseout', 'click', 'touchstart', 'touchmove'] } : {}),
    maintainAspectRatio: false,
    animation: false,
    datasets: { bar: { categoryPercentage: wide_gaps ? 0.7 : 0.9, barPercentage: 0.84 } },
    interaction: { mode: 'index', intersect: false },
    layout: { padding: { top: 22 } },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => items.length ? props.days[items[0].dataIndex].date_label : '',
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        border: { color: themeColor('line') },
        ticks: {
          autoSkip: false, maxRotation: 0, font: { size: 11 },
          color: (ctx) => {
            let day = props.days[ctx.index];
            if(!day) return themeColor('text3');
            if(day.is_today) return themeColor('accent');
            return day.is_business ? themeColor('text2') : themeColor('text3');
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        border: { display: false },
        grid: { color: themeColor('line'), borderDash: [3, 3], tickBorderDash: [3, 3] },
        ticks: { color: themeColor('text3'), font: { size: 11 }, maxTicksLimit: 5, precision: 0 },
      },
    },
  };
});

// Dashed average lines with a label chip, first chip on the left and second on the right
const averageLinesPlugin = {
  id: 'tsAverageLines',
  afterDatasetsDraw(chart) {
    let lines = [
      { value: props.avg_rcvd, color: themeColor('rcvd'), align: 'left' },
      { value: props.avg_sent, color: themeColor('sent'), align: 'right' },
    ];
    let ctx = chart.ctx;
    let area = chart.chartArea;
    let surface = themeColor('surface');
    for(let line of lines) {
      if(!(line.value > 0)) continue;
      let y = chart.scales.y.getPixelForValue(line.value);
      ctx.save();
      // soft halo so the line stays readable over bars of the same color
      ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.strokeStyle = withAlpha(surface, 0.7);
      ctx.moveTo(area.left, y);
      ctx.lineTo(area.right, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = line.color;
      ctx.moveTo(area.left, y);
      ctx.lineTo(area.right, y);
      ctx.stroke();
      ctx.restore();

      // chip
      let text = props.avg_label + ' ' + Math.round(line.value);
      ctx.save();
      ctx.font = '640 11px ' + Chart.defaults.font.family;
      let width = ctx.measureText(text).width + 14;
      let height = 18;
      let x = line.align == 'left' ? area.left + 2 : area.right - width - 2;
      let top = y - height - 4;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, top, width, height, 6) : ctx.rect(x, top, width, height);
      ctx.fillStyle = surface;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = themeColor('line');
      ctx.stroke();
      ctx.fillStyle = line.color;
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x + 7, top + height / 2 + 0.5);
      ctx.restore();
    }
  },
};
</script>

<style scoped>
.ts-periodchart {
  position: relative;
  height: 240px;
}

.ts-periodchart.is-selectable {
  user-select: none;
}
</style>
