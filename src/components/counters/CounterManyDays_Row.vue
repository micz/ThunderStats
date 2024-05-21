<template>

<div class="_7days_aggregate_data">[<span v-if="!is_loading">{{ _max }}</span><img src="@/assets/images/mzts-wait_line.gif" alt="__MSG_Loading__..." v-if="is_loading"/> __MSG_max__ / <span v-if="!is_loading">{{ _min }}</span><img src="@/assets/images/mzts-wait_line.gif" alt="__MSG_Loading__..." v-if="is_loading"/> __MSG_min__ / <span v-if="!is_loading">{{ _avg }}</span><img src="@/assets/images/mzts-wait_line.gif" alt="__MSG_Loading__..." v-if="is_loading"/> __MSG_average__]</div>

</template>

<script setup>
import { computed } from 'vue';

let props = defineProps({
    _max: {
        type: Number,
        default: 0
    },
    _min: {
        type: Number,
        default: 0
    },
    _avg: {
        type: Number,
        default: 0
    },
    is_loading: {
        type: Boolean,
        default: true
    },
});

let _max = computed(() => {
    return props._max
})
let _min = computed(() => {
    return props._min
})
let _avg = computed(() => {
    return props._avg
})
let is_loading = computed(() => {
    return props.is_loading
})

</script>


<style scoped>

</style>