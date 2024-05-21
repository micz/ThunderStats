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
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart, LineController, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { externalTooltipTimeGraphLines } from '@statslib/chartjs-lib/external-tooltip-timegraphlines';
import { htmlLegendPlugin } from '@statslib/chartjs-lib/plugin-timegraph-legend';

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

let chartOptions = ref({
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
  console.log("updateChart: " + JSON.stringify(chartData.value));
}*/

//defineExpose({ updateChart });

</script>


<style scoped>

</style>