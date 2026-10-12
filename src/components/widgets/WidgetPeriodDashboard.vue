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

<!-- Many-days layout, used by the Many Days tab (and by the Custom Query range) -->
<template>
  <div class="ts-dashboard">
    <WidgetStatusStrip v-bind="strip" :is_loading="loading.strip" />

    <div class="ts-kpi-grid">
      <CounterKpi v-for="kpi in kpis" :key="kpi.id" :label="kpi.label" :value="kpi.value" :color="kpi.color" :delta="kpi.delta" :aside="kpi.aside" :sub="kpi.sub" :sub2="kpi.sub2" :sub_title="kpi.sub_title" :is_loading="kpi.is_loading" />
    </div>

    <div class="ts-card ts-chart-card">
      <div class="ts-chart-head">
        <div class="ts-card-title">{{ chart.title }}</div>
        <div class="ts-legend">
          <div class="ts-legend-item"><span class="ts-legend-square" style="background: var(--rcvd)"></span>{{ received_label }}</div>
          <div class="ts-legend-item" v-if="chart.rcvd_inbox"><span class="ts-legend-square" style="background: var(--warn)"></span>{{ inbox_label }}</div>
          <div class="ts-legend-item"><span class="ts-legend-square" style="background: var(--sent)"></span>{{ sent_label }}</div>
          <div class="ts-legend-item"><span class="ts-legend-dash" style="border-color: var(--rcvd)"></span>{{ avg_received_label }}</div>
          <div class="ts-legend-item"><span class="ts-legend-dash" style="border-color: var(--sent)"></span>{{ avg_sent_label }}</div>
        </div>
      </div>
      <ChartPeriodDays :days="chart.days" :rcvd="chart.rcvd" :rcvd_inbox="chart.rcvd_inbox" :sent="chart.sent" :avg_rcvd="chart.avg_rcvd" :avg_sent="chart.avg_sent" :avg_label="chart.avg_label" :is_loading="loading.chart" />
      <div class="ts-card-note" v-if="chart.note && !loading.chart">{{ chart.note }}</div>
    </div>

    <div class="ts-two-col">
      <div class="ts-card ts-chart-card">
        <div class="ts-chart-head">
          <div class="ts-card-title">{{ tod_title }}</div>
          <div class="ts-legend">
            <div class="ts-legend-item"><span class="ts-legend-line" style="background: var(--rcvd)"></span>{{ received_label }}</div>
            <div class="ts-legend-item"><span class="ts-legend-line" style="background: var(--sent)"></span>{{ sent_label }}</div>
          </div>
        </div>
        <ChartHourlyAverage :rcvd="tod.rcvd" :sent="tod.sent" :is_loading="loading.chart" />
        <div class="ts-card-note" v-if="tod.note && !loading.chart">{{ tod.note }}</div>
      </div>
      <WidgetInboxZeroCalendar v-bind="iz" />
    </div>

    <div class="ts-two-col">
      <WidgetHeatmap :msg_weekday_hours="heat.msg_weekday_hours" :first_day_week="heat.first_day_week" :weekday_labels="heat.weekday_labels" :note="heat.note" :is_loading="loading.chart" />
      <WidgetWeekdayBars :rows="weekday.rows" :note="weekday.note" :is_loading="loading.chart" />
    </div>

    <div class="ts-two-col">
      <WidgetDomainBars :title="domains_title" :rows="domains" :empty_text="empty_text" :is_loading="loading.domains" />
      <WidgetEndedUp :title="ended.title" :folder_rows="ended.folders" :tag_rows="ended.tags" :note="ended.note" :info="ended.info" :open_in_first_tab="ended.open_in_first_tab" :empty_text="empty_text" :is_loading="loading.folders" />
    </div>

    <div class="ts-two-col">
      <div class="ts-card">
        <div class="ts-card-head"><div class="ts-card-title">{{ involved.recipients_title }}</div></div>
        <TableInvolved :tableData="involved.recipients" kind="sent" :is_loading="loading.involved" v-if="has_recipients" />
        <div class="ts-bars-empty" v-else>{{ involved.no_recipients_text }}</div>
      </div>
      <div class="ts-card">
        <div class="ts-card-head"><div class="ts-card-title">{{ involved.senders_title }}</div></div>
        <TableInvolved :tableData="involved.senders" kind="rcvd" :is_loading="loading.involved" v-if="has_senders" />
        <div class="ts-bars-empty" v-else>{{ involved.no_senders_text }}</div>
      </div>
    </div>

    <div class="ts-two-col-fill">
      <slot name="bottom"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import WidgetStatusStrip from './WidgetStatusStrip.vue';
import WidgetDomainBars from './WidgetDomainBars.vue';
import WidgetEndedUp from './WidgetEndedUp.vue';
import WidgetInboxZeroCalendar from './WidgetInboxZeroCalendar.vue';
import WidgetHeatmap from './WidgetHeatmap.vue';
import WidgetWeekdayBars from './WidgetWeekdayBars.vue';
import CounterKpi from '../counters/CounterKpi.vue';
import ChartPeriodDays from '../charts/ChartPeriodDays.vue';
import ChartHourlyAverage from '../charts/ChartHourlyAverage.vue';
import TableInvolved from '../tables/TableInvolved.vue';

const props = defineProps({
  strip: { type: Object, default: () => ({}) },       // WidgetStatusStrip props
  kpis: { type: Array, default: () => [] },           // [{ id, label, value, color, delta, aside, sub, sub2, sub_title, is_loading }]
  chart: { type: Object, default: () => ({}) },       // ChartPeriodDays props + title, note
  tod: { type: Object, default: () => ({}) },         // { rcvd, sent, note }
  iz: { type: Object, default: () => ({}) },          // WidgetInboxZeroCalendar props
  heat: { type: Object, default: () => ({}) },        // WidgetHeatmap props
  weekday: { type: Object, default: () => ({}) },     // { rows, note }
  involved: { type: Object, default: () => ({}) },    // { recipients, senders, recipients_title, senders_title, no_recipients_text, no_senders_text }
  domains: { type: Array, default: () => [] },
  ended: { type: Object, default: () => ({}) },       // { title, folders, tags, note }
  empty_text: { type: String, default: '' },
  loading: { type: Object, default: () => ({}) },     // { strip, chart, involved, domains, folders }
});

const received_label = browser.i18n.getMessage("Received");
const sent_label = browser.i18n.getMessage("Sent");
const inbox_label = browser.i18n.getMessage("StillInInbox");
const avg_received_label = browser.i18n.getMessage("AvgReceivedPerDay");
const avg_sent_label = browser.i18n.getMessage("AvgSentPerDay");
const tod_title = browser.i18n.getMessage("TimeOfDayTitle");
const domains_title = browser.i18n.getMessage("Domains");

let has_recipients = computed(() => props.loading.involved || Object.keys(props.involved.recipients || {}).length > 0);
let has_senders = computed(() => props.loading.involved || Object.keys(props.involved.senders || {}).length > 0);
</script>

<style scoped>
.ts-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ts-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
  gap: 14px;
}

.ts-chart-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.ts-chart-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 16px;
}

.ts-two-col:empty,
.ts-two-col-fill:empty {
  display: none;
}

.ts-legend-dash {
  display: block;
  width: 14px;
  border-top: 2px dashed;
}
</style>
