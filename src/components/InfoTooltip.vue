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