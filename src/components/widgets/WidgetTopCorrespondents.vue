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
  <div class="ts-card ts-rail-card">
    <div class="ts-rail-head">
      <div class="ts-rail-title">{{ title }}</div>
      <button type="button" class="ts-link-btn" v-if="!is_loading && total_count > 0" @click="emit('toggleAll')">{{ expanded ? show_less_label : see_all_label }}</button>
    </div>
    <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.svg" alt="" /></div>
    <div class="ts-rail-empty" v-else-if="rows.length == 0">{{ empty_text }}</div>
    <div class="ts-top-rows" v-else>
      <div class="ts-top-row" v-for="row in rows" :key="row.email" :title="rowTitle(row)">
        <div class="ts-top-name">{{ row.name || row.email }}</div>
        <div class="ts-top-track">
          <div class="ts-top-bar" :style="{ width: barWidth(row) }">
            <div class="ts-top-seg" :style="{ width: segWidth(row, row.received), background: 'var(--rcvd)' }"></div>
            <div class="ts-top-seg" :style="{ width: segWidth(row, row.sent), background: 'var(--sent)' }"></div>
          </div>
        </div>
        <div class="ts-top-count">{{ row.total }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },     // [{ email, name, received, sent, total }]
  total_count: { type: Number, default: 0 },
  expanded: { type: Boolean, default: false },
  empty_text: { type: String, default: '' },
  is_loading: { type: Boolean, default: false },
});

const emit = defineEmits(['toggleAll']);

const received_small = browser.i18n.getMessage("received");
const sent_small = browser.i18n.getMessage("sent");
const show_less_label = browser.i18n.getMessage("ShowLess");
let see_all_label = computed(() => browser.i18n.getMessage("SeeAllCorrespondents", [props.total_count]));

let max_total = computed(() => Math.max(1, ...props.rows.map(r => r.total)));

function barWidth(row) {
  return (row.total / max_total.value * 100).toFixed(1) + '%';
}

// Share of the bar for the received or sent part of the row
function segWidth(row, count) {
  return row.total > 0 ? (count / row.total * 100).toFixed(1) + '%' : '0%';
}

function rowTitle(row) {
  return row.email + " — " + row.received + " " + received_small + ", " + row.sent + " " + sent_small;
}
</script>

<style scoped>
.ts-top-rows {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.ts-top-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ts-top-name {
  width: 104px;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ts-top-track {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: var(--surface3);
}

.ts-top-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.ts-top-seg {
  height: 100%;
}

.ts-top-count {
  min-width: 18px;
  text-align: right;
  font-size: 12px;
  font-weight: 660;
  font-variant-numeric: tabular-nums;
}
</style>
