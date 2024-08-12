<template>
<sup v-if="showAnchor" @mouseover="showNoteTooltip" @mouseleave="hideNoteTooltip">(?)</sup><span class="_note_tooltip_text" v-if="noteTooltipVisible" v-text="noteText"></span>
</template>


<script setup>

import { ref, computed } from 'vue'

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

let noteTooltipVisible = ref(false);

let showAnchor = computed(() => props.showAnchor)
let noteText = computed(() => props.noteText)

function showNoteTooltip(){
  noteTooltipVisible.value = true;
}

function hideNoteTooltip(){
    noteTooltipVisible.value = false;
}
</script>


<style scoped>

</style>