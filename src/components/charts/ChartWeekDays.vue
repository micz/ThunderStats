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
<div class="chart_time_full">
  <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.svg" alt="__MSG_Loading__..." /></div>
  <Bar
      :options="chartOptions"
      :data="chartData"
      :plugins="chartPlugins"
      :key="chartData.datasets.length"
      ref="weekdaysChartBar_ref"
      v-if="!is_loading"
    />
</div>
<div :id="legend_id" class="legend-time" v-if="!is_loading"></div>
</template>



<script setup>
import { ref, computed, watch } from 'vue'
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
        default: () => ({}),
        required: true
    },
    is_loading: {
        type: Boolean,
        default: true
    }
});

let weekdaysChartBar_ref = ref(null);

let legend_id = ref("weekdays-legend-container");
let maxY = ref(0);

let chartData = computed(() => {
  if (props.chartData.datasets && props.chartData.datasets.length > 0) {
  let data = tsUtils.safeConcat(props.chartData.datasets, 0)
                  .concat(tsUtils.safeConcat(props.chartData.datasets, 1));
        let maxData = tsCoreUtils.getMaxFromData(data);
        maxY.value = (Math.ceil(maxData / 5) * 5);
        if(maxY.value == maxData) {
          maxY.value = maxY.value + 3;
        }
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

  return props.chartData;
});

let is_loading = computed(() => props.is_loading)

var chartOptions = ref({
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        hover: {mode: null},
        // categoryPercentage: 1,
        // barPercentage: 0.8,
        scales: {
          x: {
            title: {
              display: false,
            },
            beginAtZero: true,
            min: 0,
            ticks: {
              callback: function(value, index, ticks) {
                            return tsCoreUtils.getWeekDaysLabel(this.getLabelForValue(value));
                        },
              align: 'center',
              color: function(context) {
                            const labelIndex = context['tick']['value'];
                            const label = context.chart.data.labels[labelIndex];
                            return tsCoreUtils.getWeekDaysLabelColor(label);
                        },
              // maxRotation: 0,
              // minRotation: 0
            },
          },
          y: {
            title: {
              display: true,
              text: browser.i18n.getMessage('Mails')
            },
            beginAtZero: true,
            min: 0,
            max: maxY.value,
            ticks: {
              stepSize: 5,
              callback: function(value) {
                if (Number.isInteger(value)) {
                  return value;
                }
                return '';
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
              let height = context.chart.getDatasetMeta(context.datasetIndex).data[context.dataIndex].height;
              //console.log(">>>>>>>>>>>>>>>>>>>>> height: " + JSON.stringify(height));
              return height <= 25 ? 'top' : 'bottom';
            },
            color: function(context) {
              let height = context.chart.getDatasetMeta(context.datasetIndex).data[context.dataIndex].height;
              //console.log(">>>>>>>>>>>>>>>>>>>>> height: " + JSON.stringify(height));
              //console.log(">>>>>>>>>>>>>>>>>>>>> darkMode: " + JSON.stringify(tsStore.darkmode));
              return height > 25 ? '#fff' : tsStore.darkmode?'#bbb':'grey';
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