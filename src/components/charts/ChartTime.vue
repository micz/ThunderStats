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
  <div class="chart_time_container">
    <div :class="getWrapperClass">
      <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.svg" alt="__MSG_Loading__..." /></div>
      <Line
          :options="chartOptions"
          :data="chartData"
          :plugins="chartPlugins"
          :key="chartData_length"
          ref="timeChartBar_ref"
          v-if="!is_loading"
        />
    </div>
    <div :id="legend_id" class="legend-time" v-if="!is_loading"></div>
  </div>
</template>



<script setup>
import { ref, computed, watch } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart, LineController, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { externalTooltipTimeChartLines } from '@statslib/chartjs-lib/external-tooltip-timechartlines';
import { htmlLegendPlugin } from '@statslib/chartjs-lib/plugin-timechart-legend';
import { tsVerticalLinePlugin } from '@statslib/chartjs-lib/plugin-timechart-vertical-line';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import { tsUtils } from '@statslib/mzts-utils';
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
    day_type: {
        type: Number,
        default: 0
    },
    is_last_business_day: {
      type: Boolean,
      default: false
    },
});

let timeChartBar_ref = ref(null);
let legend_id = ref("time-legend-container");

let chartData = computed(() => props.chartData)
let is_loading = computed(() => props.is_loading)
let is_yesterday = computed(() => props.day_type === -1)
let is_today = computed(() => props.day_type === 0)
let is_generic_day = computed(() => props.day_type === 1)

let chartData_length = computed(() => (chartData.value.datasets.length + Math.floor(Math.random() * 101)));

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
  legend_id.value = "singleday-time-legend-container-" + props.day_type;
  is_last_business_day.value = props.is_last_business_day;
  // console.log(">>>>>>>>>>>>>> is_last_business_day.value: " + JSON.stringify(is_last_business_day.value));
  // console.log(">>>>>>>>>>>>> watch: " + JSON.stringify(newChartData));
    if (newChartData.datasets && newChartData.datasets.length > 0) {
        //let data = newChartData.datasets[0].data.concat(newChartData.datasets[1].data).concat(newChartData.datasets[2].data).concat(newChartData.datasets[3].data);
        let data = tsUtils.safeConcat(newChartData.datasets, 0)
                  .concat(tsUtils.safeConcat(newChartData.datasets, 1))
                  .concat(tsUtils.safeConcat(newChartData.datasets, 2))
                  .concat(tsUtils.safeConcat(newChartData.datasets, 3));
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
        gridLines: {
          color: 'rgba(255, 255, 255, 0.2)'
        },
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
            is_today: is_today.value,
            is_yesterday: is_yesterday.value,
            is_last_business_day: is_last_business_day.value,
          },
          tsVerticalLinePlugin: is_today.value ?{
            drawVerticalLineAt: () => {
              const now = new Date();
              const hour = now.getHours();
              let time = hour.toString().padStart(2, '0');
              return time;
            },
            verticalLineColor: () => {
              if(tsStore.darkmode) {
                return '#88ff73';
              }
              return '#265707';
            },
          } : {},
          tooltip: {
              enabled: false,
              mode: 'index',
              intersect: false,
              external: function(context) {
                externalTooltipTimeChartLines(context, {is_generic_day: is_generic_day.value, is_last_business_day: is_last_business_day.value});
              }
            }
        },
      });


let chartPlugins =  [htmlLegendPlugin, tsVerticalLinePlugin];

</script>


<style scoped>

</style>