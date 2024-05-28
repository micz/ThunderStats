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
  <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.gif" alt="__MSG_Loading__..." id="today_hours_graph_wait"/></div>
  <Bar
      :options="chartOptions"
      :data="chartData"
      :key="chartData.datasets.length"
      ref="todayChartBar_ref"
      v-if="!is_loading"
    />
</template>



<script setup>
import { ref, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, Colors } from 'chart.js'
import { externalTooltipInboxZeroDates } from '@statslib/chartjs-lib/external-tooltip-inboxzerodates';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, Colors)

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

let todayChartBar_ref = ref(null);

let chartData = computed(() => props.chartData)
let is_loading = computed(() => props.is_loading)

let chartOptions = ref({
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            display: false,
          },
          y: {
            stacked: true,
            min: 0,
            max: 1,
            ticks: {
              min: 0,
              max: 1,
              stepSize: 0.2,
              format: {
                style: 'percent',
                minimumFractionDigits: 0
              },
            }
          }
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
              enabled: false,
              position: 'nearest',
              //  callbacks: {
              //    title: () => {return ""},
                //  label: function(context){
                //   let label = context.dataset.label || '';
                //   console.log(">>>>>>>>>>>>> label: "+label);
                //   return label;
                // },
              //  },
              external: externalTooltipInboxZeroDates,
            }
        },
      });

/*async function updateChart() {
  //console.log("updateChart: " + JSON.stringify(chartData.value));
}*/

//defineExpose({ updateChart });

</script>


<style scoped>

</style>