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
<div :class="getWrapperClass">
  <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.svg" alt="__MSG_Loading__..." id="yesterday_hours_graph_wait"/></div>
  <Line
      :options="chartOptions"
      :data="chartData"
      :plugins="chartPlugins"
      :key="chartData_length"
      ref="yesterdayChartBar_ref"
      v-if="!is_loading"
    />
</div>
<div :id="legend_id" class="legend-time" v-if="!is_loading"></div>
</template>



<script setup>
import { ref, computed, watch } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart, LineController, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { externalTooltipTimeGraphLines } from '@statslib/chartjs-lib/external-tooltip-timegraphlines';
import { htmlLegendPlugin } from '@statslib/chartjs-lib/plugin-timegraph-legend';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import { tsStore } from '@statslib/mzts-store';

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
    },
    yesterday: {
      type: Boolean,
      default: true
    },
    is_last_business_day: {
      type: Boolean,
      default: false
    },
    is_generic_day: {
      type: Boolean,
      default: false
    }
});

let yesterdayChartBar_ref = ref(null);

let chartData_length = computed(() => (chartData.value.datasets.length + Math.floor(Math.random() * 101)));

let legend_id = ref("yesterday-time-legend-container");

let chartData = computed(() => props.chartData)
let is_loading = computed(() => props.is_loading)
let do_yesterday = computed(() => props.yesterday)
let is_generic_day = computed(() => props.is_generic_day)

let maxY = ref(0);
let is_last_business_day = ref(false);

const getWrapperClass = computed(() => {
  return {
    'chart_time_full': is_generic_day.value,
    'chart_time': !is_generic_day.value && !is_last_business_day.value,
    'chart_time_86': !is_generic_day.value && is_last_business_day.value,
  };
});

watch(props.chartData, (newChartData) => {
  if(!do_yesterday.value) {
    legend_id.value = "singleday-time-legend-container";
  }
  is_last_business_day.value = props.is_last_business_day;
    //console.log(">>>>>>>>>>>>> watch: " + JSON.stringify(newChartData));
    if (newChartData.datasets && newChartData.datasets.length > 0) {
      let data = newChartData.datasets[0].data.concat(newChartData.datasets[1].data);
      let maxData = tsCoreUtils.getMaxFromData(data);
      maxY.value = (Math.ceil(maxData / 5) * 5);
      if(maxY.value == maxData) {
        maxY.value = maxY.value + 3;
      }
    } else {
        maxY.value = 5;
    }
    if(!chartOptions) return;
    chartOptions.value.plugins.htmlLegend.is_last_business_day = props.is_last_business_day;
    //console.log(">>>>>>>>>>>>>>>>>>>> maxY: " + maxY.value);
    if(maxY.value < 20) {
      chartOptions.value.scales.y.ticks.stepSize = 1;
    }else{
      chartOptions.value.scales.y.ticks.stepSize = 5;
    }
    chartOptions.value.scales.y.max = maxY.value;

    if(tsStore.darkmode) {
      Chart.defaults.color = 'white';
      Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.2)';
    }
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
              text: browser.i18n.getMessage('TimeChart.Time')
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
            containerID: legend_id.value,
            is_today: false,
            is_yesterday: do_yesterday.value,
            is_last_business_day: is_last_business_day.value,
          },
          tooltip: {
              enabled: false,
              mode: 'index',
              intersect: false,
              external: function(context) {
                externalTooltipTimeGraphLines(context, {is_generic_day: is_generic_day.value, is_last_business_day: is_last_business_day.value});
              }
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