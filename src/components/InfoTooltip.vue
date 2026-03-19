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
<sup v-if="showAnchor" @mouseover="showNoteTooltip" @mouseleave="hideNoteTooltip">(?)</sup><span class="_note_tooltip_text" v-if="noteTooltipVisible" v-text="noteText" ref="tooltip"></span>
</template>


<script setup>

import { ref, computed, nextTick } from 'vue'

const props = defineProps({
    showAnchor: {
        type: Boolean,
        default: false
    },
    noteText: {
        type: String,
        default: ""
    }
});

const tooltip = ref(null);
let noteTooltipVisible = ref(false);

let showAnchor = computed(() => props.showAnchor)
let noteText = computed(() => props.noteText)

function showNoteTooltip(){
  noteTooltipVisible.value = true;
  nextTick(() => {
    positionTooltip();
  })
}

function hideNoteTooltip(){
    noteTooltipVisible.value = false;
}

function positionTooltip() {
  const tooltipRect = tooltip.value.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Reset initial position
  tooltip.value.style.left = '';
  tooltip.value.style.top = '';

  // If the tooltip overflows to the right, move it to the left
  if (tooltipRect.right > windowWidth) {
    tooltip.value.style.left = `${windowWidth - tooltipRect.right}px`;
  }

  // If the tooltip overflows to the left, move it to the right
  if (tooltipRect.left < 0) {
    tooltip.value.style.left = `${-tooltipRect.left + 10}px`;
  }

  // If the tooltip overflows to the bottom, move it above
  if (tooltipRect.bottom > windowHeight) {
    tooltip.value.style.top = `${windowHeight - tooltipRect.bottom}px`;
  }

  // If the tooltip overflows to the top, move it below
  if (tooltipRect.top < 0) {
    tooltip.value.style.top = `${-tooltipRect.top}px`;
  }
}

</script>


<style scoped>

</style>