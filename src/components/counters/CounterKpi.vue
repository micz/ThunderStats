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
  <div class="ts-kpi">
    <div class="ts-kpi-head">
      <div class="ts-kpi-label">{{ label }}</div>
      <button type="button" class="ts-kpi-toggle" :class="{ 'is-active': expanded }" v-if="expandable" :title="toggle_title" :aria-label="toggle_title" :aria-expanded="expanded" @click="emit('toggle')">
        <svg viewBox="0 0 24 24"><path :d="expanded ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'"></path></svg>
      </button>
    </div>
    <div class="ts-kpi-main">
      <img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="" v-if="is_loading"/>
      <template v-else>
        <span class="ts-kpi-value" :style="{ color: color }">{{ value }}</span>
        <span class="ts-kpi-delta" v-if="delta" :style="{ color: delta.color }" :title="delta.title || ''">{{ delta.text }}</span>
        <span class="ts-kpi-aside" v-if="aside">{{ aside }}</span>
      </template>
    </div>
    <div class="ts-kpi-sub" v-if="sub && !is_loading" :title="sub_title">{{ sub }}</div>
    <div class="ts-kpi-sub ts-kpi-sub2" v-if="sub2 && !is_loading" :title="sub_title">{{ sub2 }}</div>
    <button type="button" class="ts-link-btn ts-kpi-link" v-if="link && !is_loading" @click="emit('expand')">{{ link }}</button>
    <slot v-if="!is_loading"></slot>
  </div>
</template>

<script setup>
const emit = defineEmits(['toggle', 'expand']);

defineProps({
  label: { type: String, default: '' },
  value: { type: [String, Number], default: '' },
  color: { type: String, default: 'var(--text)' },
  delta: { type: Object, default: null },     // { text, color, title }
  aside: { type: String, default: '' },       // muted text next to the value
  sub: { type: String, default: '' },
  sub2: { type: String, default: '' },      // second, muted line (e.g. max / min / avg per day)
  sub_title: { type: String, default: '' },
  is_loading: { type: Boolean, default: false },
  expandable: { type: Boolean, default: false }, // shows a toggle button next to the label
  expanded: { type: Boolean, default: false },
  toggle_title: { type: String, default: '' },
  link: { type: String, default: '' },        // text button under the sub lines, emits 'expand'
});
</script>

<style scoped>
.ts-kpi {
  background: var(--surface2);
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 180px;
  min-width: 0;
}

.ts-kpi-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 22px;
}

.ts-kpi-toggle {
  flex: none;
  width: 24px;
  height: 22px;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 0;
  background: transparent;
  color: var(--text2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.ts-kpi-toggle:hover {
  color: var(--text);
  background: var(--surface3);
}

.ts-kpi-toggle.is-active {
  color: var(--accent);
  border-color: var(--accent);
}

.ts-kpi-toggle svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ts-kpi-link {
  align-self: flex-start;
  text-align: left;
}

.ts-kpi-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--text3);
}

.ts-kpi-main {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 10px;
  min-height: 40px;
}

.ts-kpi-value {
  font-size: 34px;
  font-weight: 680;
  letter-spacing: -.02em;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
}

.ts-kpi-delta {
  font-size: 13px;
  font-weight: 620;
}

.ts-kpi-aside {
  font-size: 13px;
  color: var(--text2);
}

.ts-kpi-sub {
  font-size: 12px;
  color: var(--text2);
}

.ts-kpi-sub2 {
  margin-top: -4px;
  color: var(--text3);
}
</style>
