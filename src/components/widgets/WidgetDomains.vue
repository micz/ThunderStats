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
    <ChartDomains :chartData="chartData" :chart_id="chart_id" :chart_height="chart_height" :is_loading="is_loading" />
</template>


<script setup>
import { computed } from 'vue'
import ChartDomains from '../charts/ChartDomains.vue';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';

let props = defineProps({
    chartData: {
        type: Object,
        default: () => ({
                    labels: [],
                    datasets: []
                }),
        required: true
    },
    chart_id: {
        type: String,
        default: 'domains-chart',
    },
    chart_height: {
        type: String,
        default: '500px'
    },
    is_loading: {
        type: Boolean,
        default: true
    }
});

let chartData = computed(() => {
    return tsCoreUtils.sortDoubleDatasetsByTotal(props.chartData);
});

let chart_id = computed(() => props.chart_id);
let chart_height = computed(() => props.chart_height);
let is_loading = computed(() => props.is_loading);

</script>


<style scoped>

</style>