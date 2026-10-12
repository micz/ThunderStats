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

<!-- Average received and sent mails per hour of the day, as lines with a light area -->
<template>
  <div class="ts-hourlychart">
    <Line :data="chartData" :options="chartOptions" v-if="!is_loading" />
    <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.svg" alt="" /></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart, LineController, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { tsStore } from '@statslib/mzts-store';
import { themeColor, withAlpha } from '@statslib/chartjs-lib/chart-theme.js';

Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const props = defineProps({
  rcvd: { type: Array, default: () => [] },    // 24 average values
  sent: { type: Array, default: () => [] },
  cmp_rcvd: { type: Array, default: null },    // Period B (Custom Query comparison), dashed
  cmp_sent: { type: Array, default: null },
  cmp_label: { type: String, default: '' },
  is_loading: { type: Boolean, default: true },
});

const labels = Array.from({length: 24}, (_, i) => String(i).padStart(2, '0'));
const label_received = browser.i18n.getMessage("ReceivedMails");
const label_sent = browser.i18n.getMessage("SentMails");

function oneDecimal(value) {
  return value < 10 ? value.toFixed(1) : String(Math.round(value));
}

let chartData = computed(() => {
  tsStore.darkmode;   // recompute the colors when the theme changes
  let rcvd_color = themeColor('rcvd');
  let sent_color = themeColor('sent');
  let line = { borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 3, tension: 0.35, fill: 'origin' };
  let datasets = [
    Object.assign({ label: label_received, data: props.rcvd, borderColor: rcvd_color, backgroundColor: withAlpha(rcvd_color, 0.12) }, line),
    Object.assign({ label: label_sent, data: props.sent, borderColor: sent_color, backgroundColor: withAlpha(sent_color, 0.10) }, line),
  ];
  if(props.cmp_rcvd && props.cmp_sent) {
    let dashed = { borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, pointHoverRadius: 3, tension: 0.35, fill: false };
    datasets.push(Object.assign({ label: props.cmp_label + ' · ' + label_received, data: props.cmp_rcvd, borderColor: rcvd_color }, dashed));
    datasets.push(Object.assign({ label: props.cmp_label + ' · ' + label_sent, data: props.cmp_sent, borderColor: sent_color }, dashed));
  }
  return { labels, datasets };
});

let chartOptions = computed(() => {
  tsStore.darkmode;
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => items.length ? items[0].label + ':00' : '',
          label: (item) => item.dataset.label + ': ' + oneDecimal(item.parsed.y),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: themeColor('line') },
        ticks: {
          color: themeColor('text3'), font: { size: 11 }, autoSkip: false, maxRotation: 0,
          callback: (value, index) => (index % 3 == 0 || index == 23) ? labels[index] : '',
        },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: themeColor('line'), borderDash: [3, 3], tickBorderDash: [3, 3] },
        ticks: { color: themeColor('text3'), font: { size: 11 }, maxTicksLimit: 3 },
      },
    },
  };
});
</script>

<style scoped>
.ts-hourlychart {
  position: relative;
  height: 170px;
}
</style>
