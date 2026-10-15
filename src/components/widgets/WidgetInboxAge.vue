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

<!-- "How old is your inbox": mails still in the inbox by age as one stacked bar, with the per-date details list.
     Opened from the Inbox backlog KPI of the single-day dashboard; emits 'close' from the Hide button -->
<template>
  <div class="ts-card ts-bars-card ts-age-card">
    <div class="ts-bars-head">
      <div class="ts-age-title">
        <div class="ts-card-title">{{ title }}</div>
        <button type="button" class="ts-link-btn" v-if="!is_loading && total > 0" @click="show_details = !show_details">{{ show_details ? by_age_label : details_label }}</button>
      </div>
      <div class="ts-age-actions">
        <!-- kept in the layout (hidden) in the ages view, so the header has the same height and the title does not move -->
        <div class="ts-mini-segmented" :class="{ 'is-hidden': !show_details }" :aria-hidden="!show_details" v-if="!is_loading && total > 0">
          <button type="button" :class="{ 'is-active': order == 'date' }" @click="order = 'date'">{{ by_date_label }}</button>
          <button type="button" :class="{ 'is-active': order == 'mails' }" @click="order = 'mails'">{{ by_mails_label }}</button>
        </div>
        <button type="button" class="ts-link-btn ts-age-hide" @click="emit('close')">{{ hide_label }}</button>
      </div>
    </div>
    <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.svg" alt="" /></div>
    <div class="ts-bars-empty" v-else-if="total == 0">{{ empty_label }}</div>
    <template v-else>
      <template v-if="!show_details">
        <div class="ts-age-stack">
          <div class="ts-age-segment" v-for="bucket in buckets.filter(b => b.n > 0)" :key="bucket.id" :title="bucket.title" :style="{ flexGrow: bucket.n, background: bucket.color }"></div>
        </div>
        <div class="ts-age-legend">
          <div class="ts-age-legend-item" v-for="bucket in buckets" :key="bucket.id" :title="bucket.title">
            <span class="ts-age-swatch" :style="{ background: bucket.color }"></span>{{ bucket.label }} <span class="ts-bar-count">{{ bucket.n }}</span>
          </div>
        </div>
      </template>
      <div class="ts-bars-rows ts-age-details" v-else>
        <div class="ts-age-row" v-for="row in date_rows" :key="row.key">
          <div class="ts-age-name">{{ row.label }}</div>
          <div class="ts-bar-line"><div class="ts-bar" :style="{ width: barWidth(row.n, dates_max), background: 'var(--rcvd)' }"></div><span class="ts-bar-count">{{ row.n }}</span></div>
        </div>
      </div>
      <div class="ts-bars-note">{{ note }}</div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { tsInsights } from '@statslib/mzts-insights';
import { tsUtils } from '@statslib/mzts-utils';

const emit = defineEmits(['close']);

const props = defineProps({
  inbox_dates: { type: Object, default: () => ({}) },   // getInboxZeroDates().dates: {YYYYMMDD: mails still in the inbox}
  is_loading: { type: Boolean, default: false },
});

const BUCKET_LABELS = {
  today: "today_small", yesterday: "yesterday_small", week: "InboxAgeWeek",
  month: "InboxAgeMonth", quarter: "InboxAgeQuarter", older: "InboxAgeOlder",
};

// from fresh to stale: the received color gets stronger up to a month, then the warning color
const BUCKET_COLORS = {
  today: 'color-mix(in srgb, var(--rcvd) 35%, var(--surface2))',
  yesterday: 'color-mix(in srgb, var(--rcvd) 55%, var(--surface2))',
  week: 'color-mix(in srgb, var(--rcvd) 78%, var(--surface2))',
  month: 'var(--rcvd)',
  quarter: 'color-mix(in srgb, var(--warn) 60%, var(--surface2))',
  older: 'var(--warn)',
};

const title = browser.i18n.getMessage("InboxMailsDateSpreading");
const empty_label = browser.i18n.getMessage("NoMailsInbox");
const details_label = browser.i18n.getMessage("InboxMailsDateSpreadingExtended");
const by_age_label = browser.i18n.getMessage("InboxAgeByAge");
const by_date_label = browser.i18n.getMessage("Date");
const by_mails_label = browser.i18n.getMessage("Mails");
const hide_label = browser.i18n.getMessage("InboxAgeHide");

let show_details = ref(false);
let order = ref('date');

// a new load closes the details list
watch(() => props.is_loading, (loading) => { if(loading) show_details.value = false; });

let total = computed(() => tsInsights.sum(Object.values(props.inbox_dates)));

let buckets = computed(() => tsInsights.inboxAgeBuckets(props.inbox_dates).map(b => {
  let label = browser.i18n.getMessage(BUCKET_LABELS[b.id]);
  return {
    id: b.id,
    n: b.n,
    label,
    color: BUCKET_COLORS[b.id],
    stale: b.max_days > 30,
    title: browser.i18n.getMessage("InboxAgeSegmentTooltip", [label, b.n, total.value > 0 ? Math.round(b.n / total.value * 100) : 0]),
  };
}));

let note = computed(() => {
  let over_month = buckets.value.filter(b => b.stale).reduce((acc, b) => acc + b.n, 0);
  return over_month > 0 ? browser.i18n.getMessage("InboxAgeNote", [over_month]) : browser.i18n.getMessage("InboxAgeNoteFresh");
});

let date_rows = computed(() => {
  let rows = Object.keys(props.inbox_dates).filter(k => props.inbox_dates[k] > 0).map(key => ({
    key,
    n: props.inbox_dates[key],
    label: tsUtils.parseYYYYMMDDToDate(key).toLocaleDateString(browser.i18n.getUILanguage(), { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
  }));
  if(order.value == 'date') rows.sort((a, b) => b.key.localeCompare(a.key));
  else rows.sort((a, b) => b.n - a.n || b.key.localeCompare(a.key));
  return rows;
});
let dates_max = computed(() => Math.max(1, ...date_rows.value.map(r => r.n)));

function barWidth(value, max) {
  if(value == 0) return '2px';
  // leave room for the count after the bar
  return 'calc(' + (value / max * 100).toFixed(1) + '% - 40px)';
}
</script>

<style scoped>
.ts-age-card {
  gap: 14px;
}

.ts-age-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.ts-mini-segmented.is-hidden {
  visibility: hidden;
}

.ts-age-hide {
  color: var(--text2);
}

.ts-age-stack {
  display: flex;
  gap: 2px;
  height: 22px;
  border-radius: 6px;
  overflow: hidden;
}

.ts-age-segment {
  flex-shrink: 1;
  flex-basis: 0;
  min-width: 6px;
}

.ts-age-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
}

.ts-age-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text2);
}

.ts-age-legend-item .ts-bar-count {
  color: var(--text);
}

.ts-age-swatch {
  flex: none;
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.ts-age-row {
  display: grid;
  grid-template-columns: minmax(90px, 150px) minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.ts-age-name {
  font-size: 13px;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ts-age-details {
  max-height: 320px;
  overflow-y: auto;
  gap: 8px;
}

.ts-age-details .ts-bar {
  height: 11px;
}

.ts-age-title {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 16px;
}
</style>
