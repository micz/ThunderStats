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

<!-- One setting per row: label, optional hint line, control on the right.
     A boolean "pref" renders a toggle switch bound to that option; otherwise the default slot is the control. -->
<template>
  <div class="opt-row" :class="{ 'is-disabled': disabled }">
    <div class="opt-row-text">
      <div class="opt-row-label">{{ label }}</div>
      <div class="opt-row-hint" v-if="hint || $slots.hint"><slot name="hint">{{ hint }}</slot></div>
    </div>
    <OptSwitch v-if="pref" :modelValue="!!prefs.values[pref]" :label="label" :disabled="disabled" @update:modelValue="onSwitch"/>
    <div class="opt-row-control" v-else><slot></slot></div>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import OptSwitch from './OptSwitch.vue';

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  pref: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['change']);

const prefs = inject('optPrefs');

function onSwitch(value) {
  prefs.set(props.pref, value);
  emit('change', value);
}
</script>
