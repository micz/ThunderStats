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

<!-- Average received and sent mails per weekday: one column per weekday, received value on top -->
<template>
  <div class="ts-card ts-wd-card">
    <div class="ts-bars-head">
      <div class="ts-card-title">{{ title }}</div>
      <div class="ts-legend">
        <div class="ts-legend-item"><span class="ts-legend-square" style="background: var(--rcvd)"></span>{{ received_label }}</div>
        <div class="ts-legend-item"><span class="ts-legend-square" style="background: var(--sent)"></span>{{ sent_label }}</div>
      </div>
    </div>
    <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.svg" alt="" /></div>
    <template v-else>
      <div class="ts-wd-cols">
        <div class="ts-wd-col" v-for="row in rows" :key="row.label" :title="row.title">
          <div class="ts-wd-value">{{ Math.round(row.received) }}</div>
          <div class="ts-wd-bars">
            <div class="ts-wd-bar" :style="{ height: barHeight(row.received), background: 'var(--rcvd)' }"></div>
            <div class="ts-wd-bar" :style="{ height: barHeight(row.sent), background: 'var(--sent)' }"></div>
          </div>
          <div class="ts-wd-label">{{ row.label }}</div>
          <div class="ts-cmp-value" v-if="row.cmp_received !== null && row.cmp_received !== undefined">{{ period_b_short }} {{ Math.round(row.cmp_received) }}</div>
        </div>
      </div>
      <div class="ts-card-note" v-if="note">{{ note }}</div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  rows: { type: Array, default: () => [] },     // [{ label, received, sent, title, cmp_received }] ordered from the first day of the week
  note: { type: String, default: '' },
  is_loading: { type: Boolean, default: false },
});

const title = browser.i18n.getMessage("WeekdayTitle");
const received_label = browser.i18n.getMessage("ReceivedMails");
const sent_label = browser.i18n.getMessage("SentMails");
const period_b_short = browser.i18n.getMessage("PeriodBShort");

let max_value = computed(() => Math.max(1, ...props.rows.map(r => Math.max(r.received, r.sent))));

function barHeight(value) {
  return (value / max_value.value * 100).toFixed(1) + '%';
}
</script>

<style scoped>
.ts-wd-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.ts-wd-cols {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 190px;
}

.ts-wd-col {
  flex: 1;
  min-width: 0;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
}

.ts-wd-value {
  font-size: 12px;
  font-weight: 640;
  font-variant-numeric: tabular-nums;
}

.ts-wd-bars {
  width: 100%;
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
}

.ts-wd-bar {
  width: 40%;
  max-width: 18px;
  min-height: 2px;
  border-radius: 3px 3px 0 0;
}

.ts-wd-label {
  font-size: 11px;
  color: var(--text3);
}
</style>
