<template>
<div class="chart_many_days">
  <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.gif" alt="__MSG_Loading__..." /></div>
  <Line
      :options="chartOptions"
      :data="chartData"
      :plugins="chartPlugins"
      :key="chartData.datasets.length"
      ref="manydaysChartBar_ref"
      v-if="!is_loading"
    />
</div>
</template>



<script setup>
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart, LineController, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { externalTooltipTimeGraphLines } from '@statslib/chartjs-lib/external-tooltip-timegraphlines';

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

let manydaysChartBar_ref = ref(null);

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
            // title: {
            //   display: true,
            //   text: browser.i18n.getMessage('TimeGraph.Time')
            // },
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
          tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false,
              //external: externalTooltipTimeGraphLines
            }
        },
      });


let chartPlugins =  null;

</script>


<style scoped>

</style>