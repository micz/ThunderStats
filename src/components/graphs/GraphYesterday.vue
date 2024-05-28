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
<div class="chart_time">
  <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.gif" alt="__MSG_Loading__..." id="yesterday_hours_graph_wait"/></div>
  <Line
      :options="chartOptions"
      :data="chartData"
      :plugins="chartPlugins"
      :key="chartData.datasets.length"
      ref="yesterdayChartBar_ref"
      v-if="!is_loading"
    />
</div>
<div id="yesterday-time-legend-container" class="legend-time"></div>
</template>



<script setup>
import { ref, computed, watch } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart, LineController, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { externalTooltipTimeGraphLines } from '@statslib/chartjs-lib/external-tooltip-timegraphlines';
import { htmlLegendPlugin } from '@statslib/chartjs-lib/plugin-timegraph-legend';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';

Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Title );

let props = defineProps({
    chartData: {
        type: Object,
        default: () => ({}),
        required: true
    },
    is_loading: {
        type: Boolean,
        default: true
    }
});

let yesterdayChartBar_ref = ref(null);

let chartData = computed(() => props.chartData)
let is_loading = computed(() => props.is_loading)

let maxY = ref(0);

watch(props.chartData, (newChartData) => {
    //console.log(">>>>>>>>>>>>> watch: " + JSON.stringify(newChartData));
    if (newChartData.datasets && newChartData.datasets.length > 0) {
        maxY.value = Math.ceil(tsCoreUtils.getMaxFromData(newChartData.datasets[0].data) / 5) * 5;
    } else {
        maxY.value = 5;
    }
    if(!chartOptions) return;
    //console.log(">>>>>>>>>>>>>>>>>>>> maxY: " + maxY.value);
    if(maxY.value < 20) {
      chartOptions.value.scales.y.ticks.stepSize = 1;
    }else{
      chartOptions.value.scales.y.ticks.stepSize = 5;
    }
    chartOptions.value.scales.y.max = maxY.value;
}, { immediate: true });

var chartOptions = ref({
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        categoryPercentage: 1,
        barPercentage: 1,
        scales: {
          x: {
            title: {
              display: true,
              text: browser.i18n.getMessage('TimeGraph.Time')
            },
            beginAtZero: true,
            min: 0,
          },
          y: {
            title: {
              display: true,
              text: browser.i18n.getMessage('Mails')
            },
            ticks: {
              stepSize: 1,
              // callback: function(value) {
              //   if (Number.isInteger(value)) {
              //     return value;
              //   }
              //   return '';
              // },
            },
            beginAtZero: true,
            min: 0,
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          htmlLegend: {
            // ID of the container to put the legend in
            containerID: 'yesterday-time-legend-container',
            is_today: false,
          },
          tooltip: {
              enabled: false,
              mode: 'index',
              intersect: false,
              external: externalTooltipTimeGraphLines
            }
        },
      });


let chartPlugins =  [htmlLegendPlugin];

/*async function updateChart() {
  //console.log("updateChart: " + JSON.stringify(chartData.value));
}*/

//defineExpose({ updateChart });

</script>


<style scoped>

</style>