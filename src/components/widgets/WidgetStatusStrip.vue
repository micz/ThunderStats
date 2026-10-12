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
  <div class="ts-strip">
    <div class="ts-strip-left">
      <div class="ts-strip-badge" :class="'tone-' + badge_tone"><span class="ts-strip-dot"></span>{{ badge_label }}</div>
      <div class="ts-strip-dates">{{ date_line1 }}<br>{{ date_line2 }}</div>
    </div>

    <div class="ts-strip-divider"></div>

    <div class="ts-strip-flow">
      <div class="ts-strip-values">
        <template v-for="(item, index) in flow" :key="'flow' + index">
          <div class="ts-strip-arrow" v-if="index > 0">&rarr;</div>
          <div class="ts-strip-item" :title="item.title || ''">
            <div class="ts-section-label">{{ item.label }}</div>
            <div class="ts-strip-number">
              <img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="" v-if="is_loading"/>
              <template v-else><span class="ts-strip-value" :style="{ color: item.color || 'var(--text)' }">{{ item.value }}</span><span class="ts-strip-sub">{{ item.sub }}</span></template>
            </div>
          </div>
        </template>
        <div class="ts-strip-spacer"></div>
        <div class="ts-strip-item" v-for="(item, index) in side" :key="'side' + index" :title="item.title || ''">
          <div class="ts-section-label">{{ item.label }}</div>
          <div class="ts-strip-number">
            <img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="" v-if="is_loading"/>
            <template v-else><span class="ts-strip-value">{{ item.value }}</span><span class="ts-strip-sub">{{ item.sub }}</span></template>
          </div>
        </div>
      </div>
      <div class="ts-strip-bar">
        <div class="ts-strip-bar-good" :style="{ width: bar_good }" v-if="!is_loading"></div>
        <div class="ts-strip-bar-left" :style="{ width: bar_left }" v-if="!is_loading"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  badge_label: { type: String, default: '' },
  badge_tone: { type: String, default: 'neutral' },   // good | warn | neutral
  date_line1: { type: String, default: '' },
  date_line2: { type: String, default: '' },
  flow: { type: Array, default: () => [] },            // [{ label, value, sub, color, title }]
  side: { type: Array, default: () => [] },            // [{ label, value, sub, title }]
  bar_good: { type: String, default: '0%' },
  bar_left: { type: String, default: '0%' },
  is_loading: { type: Boolean, default: false },
});
</script>

<style scoped>
.ts-strip {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  gap: 18px 22px;
  padding: 18px 20px;
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  background: var(--surface2);
}

.ts-strip-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  min-width: 170px;
}

.ts-strip-badge {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  width: fit-content;
  padding: 5px 12px 5px 9px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 660;
}

.ts-strip-dot {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: currentColor;
}

.tone-good { background: var(--goodSoft); color: var(--good); }
.tone-warn { background: color-mix(in oklab, var(--rcvd) 16%, transparent); color: var(--rcvd); }
.tone-neutral { background: var(--accentSoft); color: var(--accent); }

.ts-strip-dates {
  font-size: 12px;
  line-height: 1.45;
  color: var(--text2);
}

.ts-strip-divider {
  width: 1px;
  background: var(--line);
}

.ts-strip-flow {
  flex: 1;
  min-width: min(420px, 100%);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ts-strip-values {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px 18px;
}

.ts-strip-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 120px;
}

.ts-strip-number {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-height: 34px;
}

.ts-strip-value {
  font-size: 26px;
  font-weight: 680;
  letter-spacing: -.02em;
  font-variant-numeric: tabular-nums;
}

.ts-strip-sub {
  font-size: 13px;
  color: var(--text2);
}

.ts-strip-arrow {
  font-size: 16px;
  color: var(--text3);
}

.ts-strip-spacer {
  flex: 1;
}

.ts-strip-bar {
  display: flex;
  gap: 2px;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
  background: var(--surface3);
}

.ts-strip-bar-good { background: var(--good); }
.ts-strip-bar-left { background: var(--rcvd); }
</style>
