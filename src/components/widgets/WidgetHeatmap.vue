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

<!-- "When mail arrives": received mails by hour (rows, earliest on top) and weekday (columns) -->
<template>
  <div class="ts-card ts-heat-card">
    <div class="ts-bars-head">
      <div class="ts-card-title">{{ title }}</div>
      <div class="ts-mini-segmented">
        <button type="button" :class="{ 'is-active': !full_day }" @click="full_day = false">{{ tsUtils.formatHourShort(7) }}&ndash;{{ tsUtils.formatHourShort(20) }}</button>
        <button type="button" :class="{ 'is-active': full_day }" @click="full_day = true">24h</button>
      </div>
    </div>
    <div class="circle_wait" v-if="is_loading || !msg_weekday_hours"><img src="@/assets/images/mzts-wait_circle.svg" alt="" /></div>
    <template v-else>
      <div class="ts-heat-grid">
        <template v-for="row in grid.rows" :key="row.hour">
          <div class="ts-heat-hour">{{ hourLabel(row.hour) }}</div>
          <div class="ts-heat-cell" v-for="(value, c) in row.cells" :key="row.hour + '-' + c" :style="{ height: full_day ? '9px' : '14px', background: cellColor(value) }" :title="cellTitle(row.hour, c, value)"></div>
        </template>
        <div></div>
        <div class="ts-heat-day" v-for="label in weekday_labels" :key="label">{{ label }}</div>
      </div>
      <div class="ts-heat-foot">
        <div class="ts-card-note ts-heat-note">{{ note }}</div>
        <div class="ts-heat-scale">{{ fewer_label }}<span class="ts-heat-gradient"></span>{{ more_label }}</div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { tsInsights } from '@statslib/mzts-insights';
import { tsUtils } from '@statslib/mzts-utils';

const props = defineProps({
  msg_weekday_hours: { type: Object, default: null },    // getFullStatsData().msg_weekday_hours
  first_day_week: { type: Number, default: 1 },
  weekday_labels: { type: Array, default: () => [] },
  note: { type: String, default: '' },
  cmp_msg_weekday_hours: { type: Object, default: null }, // Period B (Custom Query comparison), shown only in the cell tooltips
  is_loading: { type: Boolean, default: false },
});

const title = browser.i18n.getMessage("HeatTitle");
const fewer_label = browser.i18n.getMessage("HeatFewer");
const more_label = browser.i18n.getMessage("HeatMore");
const period_b_label = browser.i18n.getMessage("PeriodB");

let full_day = ref(false);

let grid = computed(() => full_day.value
  ? tsInsights.heatGrid(props.msg_weekday_hours, 0, 23, props.first_day_week)
  : tsInsights.heatGrid(props.msg_weekday_hours, 7, 20, props.first_day_week));

let cmp_grid = computed(() => {
  if(!props.cmp_msg_weekday_hours) return null;
  return full_day.value
    ? tsInsights.heatGrid(props.cmp_msg_weekday_hours, 0, 23, props.first_day_week)
    : tsInsights.heatGrid(props.cmp_msg_weekday_hours, 7, 20, props.first_day_week);
});

function hourLabel(hour) {
  // every 3 hours on the 24h view
  if(full_day.value && hour % 3 != 0) return '';
  return tsUtils.formatHourShort(hour);
}

function cellColor(value) {
  let percent = Math.round(value / grid.value.max * 100);
  return 'color-mix(in oklab, var(--rcvd) ' + percent + '%, var(--surface3))';
}

function cellTitle(hour, column, value) {
  let title = props.weekday_labels[column] + ' ' + tsUtils.formatHour(hour) + ' — ' + browser.i18n.getMessage("NumReceived", [value]);
  if(cmp_grid.value) {
    let row = cmp_grid.value.rows.find(r => r.hour == hour);
    title += '\n' + period_b_label + ': ' + browser.i18n.getMessage("NumReceived", [row ? row.cells[column] : 0]);
  }
  return title;
}
</script>

<style scoped>
.ts-heat-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.ts-heat-grid {
  display: grid;
  grid-template-columns: minmax(30px, max-content) repeat(7, minmax(0, 1fr));
  gap: 3px;
  align-items: center;
}

.ts-heat-hour {
  font-size: 11px;
  line-height: 1;
  white-space: nowrap;
  color: var(--text3);
  font-variant-numeric: tabular-nums;
}

.ts-heat-cell {
  border-radius: 3px;
}

.ts-heat-day {
  margin-top: 3px;
  font-size: 11px;
  color: var(--text2);
  text-align: center;
}

.ts-heat-foot {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 16px;
}

.ts-heat-note {
  flex: 1;
  min-width: 200px;
}

.ts-heat-scale {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text3);
}

.ts-heat-gradient {
  display: block;
  width: 60px;
  height: 8px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--surface3), var(--rcvd));
}
</style>
