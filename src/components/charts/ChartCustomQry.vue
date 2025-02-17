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
<div class="chart_customqry">
  <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.svg" alt="__MSG_Loading__..." /></div>
  <Bar
      :options="chartOptions"
      :data="chartData"
      :plugins="chartPlugins"
      :key="chartData.datasets.length"
      ref="customQryChartBar_ref"
      v-if="!is_loading"
      :width="chart_width"
      height="350px"
    />
</div>
</template>



<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import { tsStore } from '@statslib/mzts-store';

Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, BarController);


let props = defineProps({
    chartData: {
        type: Object,
        default: () => ({}),
        required: true
    },
    chart_width: {
        type: String,
        default: '1500px'
    },
    data_type: {
        type: String,
        default: 'YYYYMMDD'
    },
    is_loading: {
        type: Boolean,
        default: true
    }
});

let customQryChartBar_ref = ref(null);

let chartData = computed(() => props.chartData)
let is_loading = computed(() => props.is_loading)
let chart_width = computed(() => props.chart_width)

let maxY = ref(0);

var chartOptions = ref({
        responsive: false,
        animation: false,
        maintainAspectRatio: false,
        hover: {mode: null},
        categoryPercentage: 1,
        barPercentage: 0.8,
        scales: {
          x: {
            title: {
              display: true,
            },
            beginAtZero: true,
            min: 0,
            ticks: {
              callback: function(value, index, ticks) {
                            return tsCoreUtils.getCustomQryLabel(this.getLabelForValue(value), props.data_type);
                        },
              align: 'center',
              color: function(context) {
                            const labelIndex = context['tick']['value'];
                            const label = context.chart.data.labels[labelIndex];
                            return tsCoreUtils.getDaysLabelColor(label, props.data_type == 'YYYYMMDD', props.data_type == 'YYYYMMDD');
                        },
              // maxRotation: 0,
              //minRotation: 90
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
              return height > 25 ? '#fff' : tsStore.darkmode?'#bbb':'grey';
            },
            font: {
              weight: 'bold',
            },
          },
        },
      });

var chartPlugins = [ChartDataLabels];

watch(props.chartData, (newChartData) => {
    // console.log(">>>>>>>>>>>>> watch: " + JSON.stringify(newChartData));
    if (newChartData.datasets && newChartData.datasets.length > 0) {
        maxY.value = Math.ceil(tsCoreUtils.getMaxFromData(newChartData.datasets[0].data) / 5) * 5;
    } else {
        maxY.value = 5;
    }
    if(!chartOptions) return;
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

</script>


<style scoped>

</style>