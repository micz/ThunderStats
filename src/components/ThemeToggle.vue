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
  <button type="button" class="ts-icon-btn ts-theme-toggle" :class="{ 'is-dark': tsStore.darkmode }" :title="theme_toggle_label" :aria-label="theme_toggle_label" @click="tsTheme.setMode(tsStore.darkmode ? 'light' : 'dark')">
    <svg viewBox="0 0 24 24">
      <mask id="ts-theme-moon-mask">
        <rect x="0" y="0" width="24" height="24" fill="#ffffff"></rect>
        <circle class="ts-theme-cut" cx="18" cy="6" r="7" fill="#000000"></circle>
      </mask>
      <g mask="url(#ts-theme-moon-mask)">
        <circle class="ts-theme-core" cx="12" cy="12" r="9"></circle>
      </g>
      <g class="ts-theme-rays">
        <path d="M12 1.5v2.5"></path><path d="M12 20v2.5"></path><path d="M1.5 12h2.5"></path><path d="M20 12h2.5"></path>
        <path d="M4.6 4.6l1.8 1.8"></path><path d="M17.6 17.6l1.8 1.8"></path><path d="M4.6 19.4l1.8-1.8"></path><path d="M17.6 6.4l1.8-1.8"></path>
      </g>
    </svg>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { tsStore } from '@statslib/mzts-store';
import { tsTheme } from "@statslib/mzts-theme.js";

const light_label = browser.i18n.getMessage("ThemeLight");
const dark_label = browser.i18n.getMessage("ThemeDark");
// the toggle title names the theme the click switches to
let theme_toggle_label = computed(() => tsStore.darkmode ? light_label : dark_label);
</script>

<style scoped>
/* Theme toggle: the sun core grows into a full disc, a masking circle slides in to carve the crescent
   and the rays rotate away */
.ts-theme-toggle svg {
  width: 18px;
  height: 18px;
  overflow: visible;
}

.ts-theme-core {
  fill: currentColor;
  stroke: none;
  transform-origin: 12px 12px;
  transform: scale(.5);
  transition: transform .45s cubic-bezier(.4, 0, .2, 1);
}

.ts-theme-cut {
  stroke: none;
  transform: translate(10px, -10px);
  transition: transform .45s cubic-bezier(.4, 0, .2, 1);
}

.ts-theme-rays {
  transform-origin: 12px 12px;
  transition: transform .45s cubic-bezier(.4, 0, .2, 1), opacity .3s ease;
}

.ts-theme-toggle.is-dark .ts-theme-core {
  transform: scale(.85);
}

.ts-theme-toggle.is-dark .ts-theme-cut {
  transform: translate(0, 0);
}

.ts-theme-toggle.is-dark .ts-theme-rays {
  opacity: 0;
  transform: rotate(90deg) scale(.5);
}

@media (prefers-reduced-motion: reduce) {
  .ts-theme-core, .ts-theme-cut, .ts-theme-rays {
    transition: none;
  }
}
</style>
