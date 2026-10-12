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
  <button type="button" role="switch" class="opt-switch" :class="{ 'is-on': modelValue }" :aria-checked="modelValue ? 'true' : 'false'" :aria-label="label" :disabled="disabled" @click="emit('update:modelValue', !modelValue)">
    <span class="opt-switch-knob"></span>
  </button>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);
</script>

<style scoped>
.opt-switch {
  flex: none;
  width: 36px;
  height: 20px;
  border-radius: 10px;
  border: 0;
  padding: 2px;
  cursor: pointer;
  background: var(--switchOff);
  transition: background-color 150ms ease;
}

.opt-switch.is-on {
  background: var(--accent);
}

.opt-switch:disabled {
  opacity: .5;
  cursor: default;
}

.opt-switch-knob {
  display: block;
  width: 16px;
  height: 16px;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, .2);
  transition: transform 150ms ease;
}

.opt-switch.is-on .opt-switch-knob {
  transform: translateX(16px);
}

@media (prefers-reduced-motion: reduce) {
  .opt-switch, .opt-switch-knob {
    transition: none;
  }
}
</style>
