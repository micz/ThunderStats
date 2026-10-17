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

<!-- A / B toggle of a card that lists Period A or Period B (Custom Query comparison) -->
<template>
  <div class="ts-mini-segmented">
    <button type="button" :class="{ 'is-active': period == 'a' }" :title="period_a_label" @click="period = 'a'">{{ period_a_short }}</button>
    <button type="button" :class="{ 'is-active': period == 'b' }" :title="period_b_label" @click="period = 'b'">{{ period_b_short }}</button>
  </div>
</template>

<script setup>
const period = defineModel({ type: String, default: 'a' });   // 'a' | 'b'

const period_a_short = browser.i18n.getMessage("PeriodAShort");
const period_b_short = browser.i18n.getMessage("PeriodBShort");
const period_a_label = browser.i18n.getMessage("PeriodA");
const period_b_label = browser.i18n.getMessage("PeriodB");
</script>

<style scoped>
.ts-mini-segmented {
  flex: none;
}
</style>
