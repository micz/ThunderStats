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
    <div class="chart_time_full_domains" >
      <div class="chart_time_full_domains_container" :id="chart_id">
        <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.svg" alt="__MSG_Loading__..." /></div>
          <Bar
            :options="chartOptions"
            :data="chartData"
            :plugins="chartPlugins"
            :height="chart_height"
            :key="chartData_length"
            ref="domainsChartBar_ref"
            v-if="!is_loading"
          />
      </div>
    </div>
    <div :id="legend_id" class="legend-time" v-if="!is_loading"></div>
</div>
</template>


<script setup>
import { ref, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { htmlLegendPlugin } from '@statslib/chartjs-lib/plugin-timechart-legend';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import { tsStore } from '@statslib/mzts-store';
import { tsUtils } from '@statslib/mzts-utils';

Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, BarController);


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

let domainsChartBar_ref = ref(null);

let maxX = ref(0);

let chart_id = computed(() => props.chart_id);
let legend_id = computed(() => props.chart_id + "-legend");
let chart_height = computed(() => props.chart_height);
let chartData_length = computed(() => (chartData.value.datasets.length + Math.floor(Math.random() * 101)));

let chartData = computed(() => {
  if (props.chartData.datasets && props.chartData.datasets.length > 0) {
  let data = tsUtils.safeConcat(props.chartData.datasets, 0)
                  .concat(tsUtils.safeConcat(props.chartData.datasets, 1));
        let maxData = tsCoreUtils.getMaxFromData(data);
        maxX.value = (Math.ceil(maxData / 5) * 5);
        if(maxX.value == maxData) {
          maxX.value = maxX.value + 3;
        }
    } else {
        maxX.value = 5;
    }
    if(!chartOptions) return;
    // console.log(">>>>>>>>>>>>>>>>>>>> maxX: " + maxX.value);
    if(maxX.value < 20) {
      chartOptions.value.scales.x.ticks.stepSize = 1;
    }else{
      chartOptions.value.scales.x.ticks.stepSize = 5;
    }
    chartOptions.value.scales.x.max = maxX.value;

  let chart_container = document.getElementById(chart_id.value);
  if(chart_container) {
    chart_container.style.height = chart_height.value;
  }

  return props.chartData;
});

let is_loading = computed(() => props.is_loading)

var chartOptions = ref({
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        indexAxis: 'y',
        hover: {mode: null},
        // categoryPercentage: 1,
        // barPercentage: 0.8,
        scales: {
          x: {
            title: {
              display: true,
              text: browser.i18n.getMessage('Mails')
            },
            beginAtZero: true,
            min: 0,
            max: maxX.value,
            ticks: {
              stepSize: 5,
              callback: function(value) {
                if (Number.isInteger(value)) {
                  return value;
                }
                return '';
              },
              align: 'right',
              // maxRotation: 0,
              // minRotation: 0
            },
          },
          y: {
            title: {
              display: false,
            },
            beginAtZero: true,
            min: 0,
            ticks: {
              callback: function(value, index, ticks) {
                          return this.getLabelForValue(value);
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          htmlLegend: {
            // ID of the container to put the legend in
            containerID: legend_id.value,
            is_today: false,
            is_yesterday: false,
          },
          tooltip: {
              enabled: false,
          },
          datalabels: {
            display: true,
            anchor: 'end',
            align: function(context) {
              let width = context.chart.getDatasetMeta(context.datasetIndex).data[context.dataIndex].width;
              // console.log(">>>>>>>>>>>>>>>>>>>>> context.chart.getDatasetMeta(context.datasetIndex).data[context.dataIndex]: " + JSON.stringify(context.chart.getDatasetMeta(context.datasetIndex).data[context.dataIndex]));
              return width <= 25 ? 'right' : 'left';
            },
            color: function(context) {
              let width = context.chart.getDatasetMeta(context.datasetIndex).data[context.dataIndex].width;
              //console.log(">>>>>>>>>>>>>>>>>>>>> width: " + JSON.stringify(width));
              //console.log(">>>>>>>>>>>>>>>>>>>>> darkMode: " + JSON.stringify(tsStore.darkmode));
              return width > 25 ? '#fff' : tsStore.darkmode?'#bbb':'grey';
            },
            font: {
              weight: 'bold',
            },
          },
        },
      });

var chartPlugins = [ChartDataLabels, htmlLegendPlugin];

</script>


<style scoped>

</style>