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

<template>
  <div class="ts-daychart">
    <Line :data="chartData" :options="chartOptions" :plugins="[nowLinePlugin]" v-if="!is_loading" />
    <div class="ts-daychart-callout" v-if="!is_loading && callout" :style="callout_style">
      <div class="ts-daychart-callout-title">{{ callout.title }}</div>
      <div class="ts-daychart-callout-sub" v-if="callout.sub">{{ callout.sub }}</div>
    </div>
    <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.svg" alt="__MSG_Loading__..." /></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart, LineController, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { tsStore } from '@statslib/mzts-store';
import { themeColor, withAlpha } from '@statslib/chartjs-lib/chart-theme.js';

Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const props = defineProps({
  rcvd: { type: Array, default: () => [] },           // 24 values, null = not shown (future hours)
  sent: { type: Array, default: () => [] },
  band_low: { type: Array, default: null },           // usual range of received mails
  band_high: { type: Array, default: null },
  cmp_rcvd: { type: Array, default: null },           // optional comparison day, dashed
  cmp_sent: { type: Array, default: null },
  cmp_label: { type: String, default: '' },
  now_position: { type: Number, default: null },      // fractional hour of the "now" line, null on full days
  callout: { type: Object, default: null },           // { title, sub }
  is_loading: { type: Boolean, default: true },
});

const labels = Array.from({length: 24}, (_, i) => String(i).padStart(2, '0'));
const shown_ticks = [0, 6, 12, 18, 23];

const label_received = browser.i18n.getMessage("ReceivedMails");
const label_sent = browser.i18n.getMessage("SentMails");
const label_usual = browser.i18n.getMessage("UsualRange");

// x position (px) of the "now" line, set by the plugin and used to keep the callout on its left
let now_x = ref(null);
let chart_width = ref(0);

function lastIndex(values) {
  for(let i = values.length - 1; i >= 0; i--) {
    if(values[i] !== null && values[i] !== undefined) return i;
  }
  return -1;
}

let chartData = computed(() => {
  tsStore.darkmode;   // recompute the colors when the theme changes
  let rcvd_color = themeColor('rcvd');
  let sent_color = themeColor('sent');
  let datasets = [];

  if(props.band_low && props.band_high) {
    datasets.push({
      label: label_usual, data: props.band_high, fill: '+1', backgroundColor: withAlpha(rcvd_color, 0.16),
      borderWidth: 0, pointRadius: 0, pointHoverRadius: 0, tension: 0.3, ts_band: true,
    });
    datasets.push({
      label: label_usual, data: props.band_low, fill: false,
      borderWidth: 0, pointRadius: 0, pointHoverRadius: 0, tension: 0.3, ts_band: true,
    });
  }

  if(props.cmp_rcvd && props.cmp_sent) {
    datasets.push({
      label: props.cmp_label + ' · ' + label_received, data: props.cmp_rcvd, borderColor: withAlpha(rcvd_color, 0.6),
      borderDash: [6, 4], borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.3,
    });
    datasets.push({
      label: props.cmp_label + ' · ' + label_sent, data: props.cmp_sent, borderColor: withAlpha(sent_color, 0.6),
      borderDash: [6, 4], borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.3,
    });
  }

  let last_rcvd = lastIndex(props.rcvd);
  let last_sent = lastIndex(props.sent);
  datasets.push({
    label: label_received, data: props.rcvd, borderColor: rcvd_color, backgroundColor: rcvd_color,
    borderWidth: 2.5, fill: false, tension: 0.3,
    pointRadius: (ctx) => ctx.dataIndex == last_rcvd ? 4.5 : 0,
  });
  datasets.push({
    label: label_sent, data: props.sent, borderColor: sent_color, backgroundColor: sent_color,
    borderWidth: 2.5, fill: false, tension: 0.3,
    pointRadius: (ctx) => ctx.dataIndex == last_sent ? 4.5 : 0,
  });

  return { labels, datasets };
});

let chartOptions = computed(() => {
  tsStore.darkmode;
  let line_color = themeColor('line');
  let text3 = themeColor('text3');
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { mode: 'index', intersect: false },
    layout: { padding: { top: 6, right: 6 } },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        filter: (item) => !item.dataset.ts_band,
        callbacks: {
          title: (items) => items.length ? items[0].label + ':00' : '',
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: line_color },
        ticks: {
          color: text3, font: { size: 11 }, autoSkip: false, maxRotation: 0,
          callback: (value, index) => shown_ticks.includes(index) ? labels[index] : '',
        },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: line_color, borderDash: [3, 3], tickBorderDash: [3, 3] },
        ticks: { color: text3, font: { size: 11 }, maxTicksLimit: 5, precision: 0 },
      },
    },
  };
});

// Dashed vertical line at the current time (Today only)
const nowLinePlugin = {
  id: 'tsNowLine',
  afterDatasetsDraw(chart) {
    chart_width.value = chart.width;
    if(props.now_position === null) {
      now_x.value = null;
      return;
    }
    let x_scale = chart.scales.x;
    let hour = Math.floor(props.now_position);
    let fraction = props.now_position - hour;
    let x0 = x_scale.getPixelForValue(hour);
    let x1 = hour < 23 ? x_scale.getPixelForValue(hour + 1) : x0;
    let x = x0 + (x1 - x0) * fraction;
    let ctx = chart.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = themeColor('text3');
    ctx.moveTo(x, chart.chartArea.top - 6);
    ctx.lineTo(x, chart.chartArea.bottom);
    ctx.stroke();
    ctx.restore();
    if(now_x.value === null || Math.abs(now_x.value - x) > 0.5) now_x.value = x;
  },
};

// The callout sits on the left of the "now" line, or top-left on full days
let callout_style = computed(() => {
  if(now_x.value !== null && now_x.value > 220) {
    return { right: (chart_width.value - now_x.value + 12) + 'px' };
  }
  return { left: '48px' };
});
</script>

<style scoped>
.ts-daychart {
  position: relative;
  flex: 1;
  min-height: 220px;
}

.ts-daychart-callout {
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-input);
  background: var(--surface);
  white-space: nowrap;
  pointer-events: none;
}

.ts-daychart-callout-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}

.ts-daychart-callout-sub {
  font-size: 11px;
  color: var(--text2);
}
</style>
