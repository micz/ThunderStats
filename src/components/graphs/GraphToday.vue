<template>
<div class="chart_hours">
  <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.gif" alt="__MSG_Loading__..." id="today_hours_graph_wait"/></div>
  <Bar
      :options="chartOptions"
      :data="chartData"
      :plugins="chartPlugins"
      :key="chartData.datasets.length"
      ref="todayChartBar_ref"
      v-if="!is_loading"
    />
</div>
</template>



<script setup>
import { ref, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { tsBarPosition } from '@statslib/chartjs_plugin/chartjs-barposition';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

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
        categoryPercentage: 1,
        barPercentage: 1,
        scales: {
          x: {
            title: {
              display: true,
              text: browser.i18n.getMessage('TimeGraph.Time')
            },
          },
          y: {
            title: {
              display: true,
              text: browser.i18n.getMessage('Mails')
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'right',
            align: 'left',
          },
        },
      });

      let chartPlugins = ref([tsBarPosition]);

/*async function updateChart() {
  console.log("updateChart: " + JSON.stringify(chartData.value));
}*/

//defineExpose({ updateChart });

</script>


<style scoped>

</style>