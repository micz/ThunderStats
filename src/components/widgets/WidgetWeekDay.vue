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

    <GraphWeeksDay :chartData="weekday_chartData" :is_loading="is_loading" />

</template>


<script setup>

import { ref, computed } from 'vue'
import GraphWeeksDay from '../graphs/GraphWeeksDay.vue';

let props = defineProps({
    weekday_chartData: {
        type: Object,
        default: () => ({}),
        required: true
    },
    is_loading: {
        type: Boolean,
        default: true
    }
});

let weekday_chartData = computed(() => props.weekday_chartData)
let is_loading = computed(() => props.is_loading)



</script>


<style scoped>

</style>