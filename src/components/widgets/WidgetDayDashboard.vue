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

<!-- Single-day dashboard layout, shared by the Today and Yesterday tabs -->
<template>
  <div class="ts-dashboard">
    <WidgetStatusStrip v-bind="strip" :is_loading="loading.strip" />

    <div class="ts-kpi-row">
      <CounterKpi v-for="kpi in kpis" :key="kpi.id" :label="kpi.label" :value="kpi.value" :color="kpi.color" :delta="kpi.delta" :aside="kpi.aside" :sub="kpi.sub" :sub_title="kpi.sub_title" :is_loading="kpi.is_loading"
          :expandable="kpi.expandable" :expanded="kpi.expandable && show_inbox_age" :toggle_title="inbox_age_title" :link="kpi.link"
          @toggle="setInboxAge(!show_inbox_age)" @expand="setInboxAge(true)">
        <div class="ts-streak-strip" v-if="kpi.squares">
          <div v-for="square in kpi.squares" :key="square.key" class="ts-streak-square" :title="square.title" :style="{ background: square.bg, opacity: square.opacity }"></div>
        </div>
      </CounterKpi>
    </div>

    <WidgetInboxAge v-if="show_inbox_age" :inbox_dates="inbox_dates" :is_loading="inbox_loading" @close="setInboxAge(false)" />

    <div class="ts-main-grid">
      <div class="ts-card ts-chart-card">
        <div class="ts-chart-head">
          <div class="ts-card-title">{{ chart.title }}</div>
          <div class="ts-legend">
            <div class="ts-legend-item"><span class="ts-legend-line" style="background: var(--rcvd)"></span>{{ received_label }}</div>
            <div class="ts-legend-item"><span class="ts-legend-line" style="background: var(--sent)"></span>{{ sent_label }}</div>
            <div class="ts-legend-item" v-if="chart.band_low"><span class="ts-legend-band"></span>{{ usual_label }}</div>
            <div class="ts-legend-item" v-if="chart.cmp_rcvd"><span class="ts-legend-dashed"></span>{{ chart.cmp_label }}</div>
          </div>
        </div>
        <ChartDayVsNormal :rcvd="chart.rcvd" :sent="chart.sent" :band_low="chart.band_low" :band_high="chart.band_high" :cmp_rcvd="chart.cmp_rcvd" :cmp_sent="chart.cmp_sent" :cmp_label="chart.cmp_label" :now_position="chart.now_position" :callout="chart.callout" :is_loading="loading.chart" />
        <div class="ts-card-note" v-if="chart.note && !loading.chart">{{ chart.note }}</div>
      </div>

      <div class="ts-rail">
        <WidgetTopCorrespondents :title="top.title" :rows="top.rows" :total_count="top.count" :expanded="show_all_involved" :empty_text="top.empty_text" :is_loading="loading.involved" @toggleAll="show_all_involved = !show_all_involved" />
        <slot name="rail"></slot>
      </div>
    </div>

    <div class="ts-two-col" v-if="show_all_involved">
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

    <div class="ts-two-col">
      <WidgetDomainBars :title="domains_title" :rows="domains" :empty_text="empty_text" :is_loading="loading.domains" />
      <WidgetEndedUp :title="ended.title" :folder_rows="ended.folders" :tag_rows="ended.tags" :note="ended.note" :info="ended.info" :open_in_first_tab="ended.open_in_first_tab" :empty_text="empty_text" :is_loading="loading.folders" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { tsPrefs } from '@statslib/mzts-options';
import WidgetStatusStrip from './WidgetStatusStrip.vue';
import WidgetInboxAge from './WidgetInboxAge.vue';
import WidgetTopCorrespondents from './WidgetTopCorrespondents.vue';
import WidgetDomainBars from './WidgetDomainBars.vue';
import WidgetEndedUp from './WidgetEndedUp.vue';
import CounterKpi from '../counters/CounterKpi.vue';
import ChartDayVsNormal from '../charts/ChartDayVsNormal.vue';
import TableInvolved from '../tables/TableInvolved.vue';

const props = defineProps({
  strip: { type: Object, default: () => ({}) },       // WidgetStatusStrip props
  kpis: { type: Array, default: () => [] },           // [{ id, label, value, color, delta, aside, sub, sub_title, squares, expandable, link, is_loading }]
  chart: { type: Object, default: () => ({}) },       // ChartDayVsNormal props + title, note
  top: { type: Object, default: () => ({}) },         // { title, rows, count, empty_text }
  involved: { type: Object, default: () => ({}) },    // { recipients, senders, recipients_title, senders_title, no_recipients_text, no_senders_text }
  domains: { type: Array, default: () => [] },
  ended: { type: Object, default: () => ({}) },       // { title, folders, tags, note }
  empty_text: { type: String, default: '' },
  loading: { type: Object, default: () => ({}) },     // { strip, chart, involved, domains, folders }
  inbox_dates: { type: Object, default: () => ({}) }, // getInboxZeroDates().dates, for the "How old is your inbox" strip
  inbox_loading: { type: Boolean, default: false },
});

const received_label = browser.i18n.getMessage("ReceivedMails");
const sent_label = browser.i18n.getMessage("SentMails");
const usual_label = browser.i18n.getMessage("UsualRange");
const domains_title = browser.i18n.getMessage("Domains");

const inbox_age_title = browser.i18n.getMessage("InboxAgeToggle");

let show_all_involved = ref(false);

// the "How old is your inbox" strip under the KPI row, opened from the Inbox backlog KPI; the state is the inbox_age_expanded pref
let show_inbox_age = ref(false);

onMounted(async () => {
  browser.storage.onChanged.addListener(onStorageChanged);
  show_inbox_age.value = await tsPrefs.getPref("inbox_age_expanded");
});

onUnmounted(() => {
  browser.storage.onChanged.removeListener(onStorageChanged);
});

// keeps the other single-day tabs and the options page in sync
function onStorageChanged(changes, area) {
  if((area === 'sync') && changes.inbox_age_expanded) show_inbox_age.value = !!changes.inbox_age_expanded.newValue;
}

function setInboxAge(open) {
  show_inbox_age.value = open;
  tsPrefs.setPref("inbox_age_expanded", open);
}

let has_recipients = computed(() => props.loading.involved || Object.keys(props.involved.recipients || {}).length > 0);
let has_senders = computed(() => props.loading.involved || Object.keys(props.involved.senders || {}).length > 0);
</script>

<style scoped>
.ts-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ts-kpi-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.ts-streak-strip {
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  gap: 3px;
}

.ts-streak-square {
  height: 10px;
  border-radius: 2px;
}

.ts-main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 340px);
  gap: 18px;
  align-items: stretch;
}

@media (max-width: 760px) {
  .ts-main-grid {
    grid-template-columns: minmax(0, 1fr);
  }
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

.ts-rail {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.ts-two-col:empty {
  display: none;
}
</style>
