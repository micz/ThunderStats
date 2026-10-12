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
  <div class="ts-card ts-bars-card">
    <div class="ts-bars-head">
      <div class="ts-card-title">{{ title }}</div>
      <div class="ts-legend">
        <div class="ts-legend-item"><span class="ts-legend-square" style="background: var(--sent)"></span>{{ sent_label }}</div>
        <div class="ts-legend-item"><span class="ts-legend-square" style="background: var(--rcvd)"></span>{{ received_label }}</div>
      </div>
    </div>
    <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.svg" alt="" /></div>
    <div class="ts-bars-empty" v-else-if="rows.length == 0">{{ empty_text }}</div>
    <div class="ts-bars-rows" v-else>
      <div class="ts-domain-row" v-for="row in shown_rows" :key="row.name">
        <div class="ts-domain-name" :title="row.name">{{ row.name }} <span class="ts-domain-tag" v-if="row.internal">{{ internal_label }}</span></div>
        <div class="ts-domain-bars">
          <div class="ts-bar-line"><div class="ts-bar" :style="{ width: barWidth(row.sent), background: 'var(--sent)' }"></div><span class="ts-bar-count">{{ row.sent }}</span></div>
          <div class="ts-bar-line"><div class="ts-bar" :style="{ width: barWidth(row.received), background: 'var(--rcvd)' }"></div><span class="ts-bar-count">{{ row.received }}</span></div>
        </div>
      </div>
      <button type="button" class="ts-link-btn ts-bars-more" v-if="rows.length > max_rows" @click="show_all = !show_all">{{ show_all ? show_less_label : more_label }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },     // [{ name, sent, received, internal }], sorted
  max_rows: { type: Number, default: 8 },
  empty_text: { type: String, default: '' },
  is_loading: { type: Boolean, default: false },
});

const sent_label = browser.i18n.getMessage("Sent");
const received_label = browser.i18n.getMessage("Received");
const internal_label = browser.i18n.getMessage("InternalTag");
const show_less_label = browser.i18n.getMessage("ShowLess");

let show_all = ref(false);

let shown_rows = computed(() => show_all.value ? props.rows : props.rows.slice(0, props.max_rows));
let more_label = computed(() => browser.i18n.getMessage("ShowMoreRows", [props.rows.length - props.max_rows]));
let max_value = computed(() => Math.max(1, ...props.rows.map(r => Math.max(r.sent, r.received))));

function barWidth(value) {
  if(value == 0) return '2px';
  // leave room for the count after the bar
  return 'calc(' + (value / max_value.value * 100).toFixed(1) + '% - 40px)';
}
</script>

<style scoped>
.ts-domain-row {
  display: grid;
  grid-template-columns: minmax(90px, 160px) minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.ts-domain-name {
  font-size: 13px;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ts-domain-tag {
  color: var(--text3);
}

.ts-domain-bars {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ts-domain-bars .ts-bar {
  height: 12px;
}
</style>
