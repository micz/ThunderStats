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
      <div class="ts-card-title">{{ title }}<span class="ts-info-icon" v-if="info" :title="info">i</span></div>
      <div class="ts-mini-segmented">
        <button type="button" :class="{ 'is-active': view == 'folders' }" @click="view = 'folders'">{{ folders_label }}</button>
        <button type="button" :class="{ 'is-active': view == 'tags' }" @click="view = 'tags'">{{ tags_label }}</button>
      </div>
    </div>
    <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.svg" alt="" /></div>
    <template v-else>
      <div class="ts-bars-empty" v-if="current_rows.length == 0">{{ view == 'folders' ? empty_text : no_tags_text }}</div>
      <div class="ts-bars-rows" v-else>
        <div class="ts-ended-row" v-for="row in shown_rows" :key="row.id" :class="{ 'is-clickable': isClickable(row) }" :title="isClickable(row) ? open_folder_label : ''" @click="openRow(row)">
          <div class="ts-ended-name" :title="row.name">{{ row.name }}</div>
          <div class="ts-bar-line"><div class="ts-bar" :style="{ width: barWidth(row.n), background: rowColor(row) }"></div><span class="ts-bar-count">{{ row.n }}</span></div>
        </div>
        <button type="button" class="ts-link-btn ts-bars-more" v-if="current_rows.length > max_rows" @click="show_all = !show_all">{{ show_all ? show_less_label : more_label }}</button>
      </div>
      <div class="ts-bars-note" v-if="view == 'folders' && note">{{ note }}</div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { tsStore } from '@statslib/mzts-store';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';

const props = defineProps({
  title: { type: String, default: '' },
  folder_rows: { type: Array, default: () => [] },  // [{ id, name, n, kind: inbox|filed }]
  tag_rows: { type: Array, default: () => [] },     // [{ id, name, n, color }]
  note: { type: String, default: '' },
  info: { type: String, default: '' },              // explanation shown by the info icon next to the title
  open_in_first_tab: { type: Boolean, default: false }, // inbox0_openFolderInFirstTab pref
  max_rows: { type: Number, default: 8 },
  empty_text: { type: String, default: '' },
  is_loading: { type: Boolean, default: false },
});

const folders_label = browser.i18n.getMessage("Folders");
const tags_label = browser.i18n.getMessage("Tags");
const no_tags_text = browser.i18n.getMessage("NoTaggedMails");
const show_less_label = browser.i18n.getMessage("ShowLess");
const open_folder_label = browser.i18n.getMessage("OpenFolder");

let view = ref('folders');
let show_all = ref(false);

let current_rows = computed(() => view.value == 'folders' ? props.folder_rows : props.tag_rows);
let shown_rows = computed(() => show_all.value ? current_rows.value : current_rows.value.slice(0, props.max_rows));
let more_label = computed(() => browser.i18n.getMessage("ShowMoreRows", [current_rows.value.length - props.max_rows]));
let max_value = computed(() => Math.max(1, ...current_rows.value.map(r => r.n)));

function barWidth(value) {
  // leave room for the count after the bar
  return 'calc(' + (value / max_value.value * 100).toFixed(1) + '% - 40px)';
}

// folder rows open the folder in Thunderbird
function isClickable(row) {
  return view.value == 'folders' && !!row.folder_data;
}

function openRow(row) {
  if(isClickable(row)) tsCoreUtils.openFolder(row.folder_data, props.open_in_first_tab);
}

function rowColor(row) {
  if(view.value == 'tags') {
    // black tags would disappear on the dark theme
    return (tsStore.darkmode && row.color === '#000000') ? 'var(--text2)' : row.color;
  }
  return row.kind == 'inbox' ? 'var(--rcvd)' : 'var(--good)';
}
</script>

<style scoped>
.ts-ended-row {
  display: grid;
  grid-template-columns: minmax(90px, 150px) minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.ts-ended-name {
  font-size: 13px;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ts-ended-row .ts-bar {
  height: 15px;
}

.ts-ended-row.is-clickable {
  cursor: pointer;
}

.ts-ended-row.is-clickable:hover .ts-ended-name {
  color: var(--accent);
  text-decoration: underline;
}
</style>
