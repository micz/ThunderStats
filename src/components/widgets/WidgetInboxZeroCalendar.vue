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

<!-- Inbox Zero calendar of a period: one cell per day, aligned on the first day of the week -->
<template>
  <div class="ts-card ts-iz-card">
    <div class="ts-bars-head">
      <div class="ts-card-title" :title="tooltip">{{ title }}</div>
      <div class="ts-legend">
        <div class="ts-legend-item"><span class="ts-iz-swatch state-zero"></span>{{ closed_label }}</div>
        <div class="ts-legend-item"><span class="ts-iz-swatch state-few"></span>{{ few_label }}</div>
        <div class="ts-legend-item"><span class="ts-iz-swatch state-missed"></span>{{ missed_label }}</div>
      </div>
    </div>
    <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.svg" alt="" /></div>
    <template v-else>
      <div class="ts-iz-stats">
        <div class="ts-iz-stat"><span class="ts-iz-num" style="color: var(--good)">{{ zero }}</span><span class="ts-iz-lbl">{{ days_at_zero_label }}</span></div>
        <div class="ts-iz-stat"><span class="ts-iz-num">{{ streak }}</span><span class="ts-iz-lbl">{{ streak_label }}</span></div>
        <div class="ts-iz-stat" v-if="cmp_zero !== null"><span class="ts-iz-num">{{ cmp_zero }}</span><span class="ts-iz-lbl">{{ cmp_days_at_zero_label }}</span></div>
      </div>
      <div class="ts-iz-grid">
        <div class="ts-iz-head" v-for="label in weekday_labels" :key="'h' + label">{{ label }}</div>
        <template v-for="cell in cells" :key="cell.key">
          <div class="ts-iz-cell ts-iz-pad" v-if="cell.pad" :style="{ height: cell_height }"></div>
          <div class="ts-iz-cell" v-else :class="['state-' + cell.state, { 'is-today': cell.is_today }]" :style="{ height: cell_height }" :title="cell.title">{{ cell.n }}</div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  cells: { type: Array, default: () => [] },            // [{ key, pad } | { key, n, state: zero|few|missed, is_today, title }]
  weekday_labels: { type: Array, default: () => [] },
  zero: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  big: { type: Boolean, default: false },              // taller cells for short periods
  cmp_zero: { type: Number, default: null },           // Period B days at zero (Custom Query comparison), or null
  cmp_total: { type: Number, default: 0 },
  is_loading: { type: Boolean, default: false },
});

const title = browser.i18n.getMessage("InboxZero");
const tooltip = browser.i18n.getMessage("InboxZeroStreakTooltip");
const closed_label = browser.i18n.getMessage("ClosedAtZero");
const few_label = browser.i18n.getMessage("FewLeft");
const missed_label = browser.i18n.getMessage("Missed");
const streak_label = browser.i18n.getMessage("StreakAtEnd");

let days_at_zero_label = computed(() => browser.i18n.getMessage("DaysAtZero", [props.total]));
let cmp_days_at_zero_label = computed(() => browser.i18n.getMessage("DaysAtZeroPeriodB", [props.cmp_total]));
let cell_height = computed(() => props.big ? '44px' : '28px');
</script>

<style scoped>
.ts-iz-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.ts-iz-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 28px;
}

.ts-iz-stat {
  display: flex;
  align-items: baseline;
  gap: 7px;
}

.ts-iz-num {
  font-size: 22px;
  font-weight: 680;
  letter-spacing: -.02em;
  font-variant-numeric: tabular-nums;
}

.ts-iz-lbl {
  font-size: 12px;
  color: var(--text2);
}

.ts-iz-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
}

.ts-iz-head {
  font-size: 11px;
  color: var(--text3);
  text-align: center;
}

.ts-iz-cell {
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.ts-iz-pad {
  background: transparent;
}

.state-zero { background: var(--good); color: #ffffff; }
.state-few { background: color-mix(in oklab, var(--good) 35%, var(--surface3)); color: var(--text); }
.state-missed { background: var(--surface3); color: var(--text3); }

.ts-iz-cell.is-today {
  box-shadow: inset 0 0 0 2px var(--accent);
}

.ts-iz-swatch {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
}
</style>
