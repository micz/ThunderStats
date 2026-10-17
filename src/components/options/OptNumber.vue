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

<!-- Number input bound to an option: valid values are saved while typing (debounced),
     on blur the value is clamped to [min, max] and saved at once. -->
<template>
  <input type="number" class="opt-input" :min="min" :max="max" :value="text" :aria-label="label" @input="onInput" @change="onChange"/>
</template>

<script setup>
import { inject, ref, watch } from 'vue';

const props = defineProps({
  pref: {
    type: String,
    required: true
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 9999
  },
  label: {
    type: String,
    default: ''
  }
});

const prefs = inject('optPrefs');

let text = ref(String(prefs.values[props.pref] ?? ''));

watch(() => prefs.values[props.pref], (value) => {
  if(Number(text.value) !== value) text.value = String(value ?? '');
});

function isValid(value) {
  return Number.isInteger(value) && value >= props.min && value <= props.max;
}

function onInput(e) {
  text.value = e.target.value;
  let value = e.target.valueAsNumber;
  if(isValid(value)) prefs.set(props.pref, value, true);
}

function onChange(e) {
  let value = e.target.valueAsNumber;
  if(Number.isNaN(value)) value = Number(prefs.values[props.pref]);
  if(!Number.isFinite(value)) value = props.min;
  value = Math.min(props.max, Math.max(props.min, Math.round(value)));
  text.value = String(value);
  e.target.value = text.value;
  prefs.set(props.pref, value);
}
</script>
