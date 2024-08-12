<!--
/*
 *  ThunderStats [https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/]
 *  Copyright (C) 2024  Mic (m@micz.it)

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

<div class="_7days_aggregate_data">[<span v-if="!is_loading">{{ _total }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="is_loading"/> __MSG_total__ / <span v-if="!is_loading">{{ _max }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="is_loading"/> __MSG_max__ / <span v-if="!is_loading">{{ _min }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="is_loading"/> __MSG_min__ / <span v-if="!is_loading">{{ _avg }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="is_loading"/> __MSG_average__]</div>

</template>

<script setup>
import { computed } from 'vue';

let props = defineProps({
    _total: {
        type: Number,
        default: 0
    },
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

let _total = computed(() => {
    return props._total
})
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