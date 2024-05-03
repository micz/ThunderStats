<template>
    <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.gif" alt="__MSG_Loading__..." id="today_hours_graph_wait"/></div>
    <Doughnut
        :options="chartOptions"
        :data="chartData"
        :plugins="chartPlugins"
        :key="chartData.datasets.length"
        ref="todayChartBar_ref"
        v-if="!is_loading"
    />
</template>



<script setup>
import { ref, computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Colors } from 'chart.js'
import { tsDoughnutLabelsLine } from '@statslib/chartjs_plugin/chartjs-doughnutlabels';


ChartJS.register(ArcElement, Tooltip, Legend, Colors);

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
        clip: false,
        layout: {
	        padding: 25
	      },
        scales: {
            y: {
              display: false,
              beginAtZero: true,
              ticks: {
                display: false,
              },
              grid: {
                display: false,
              },
            },
            x: {
              display: false,
              ticks: {
                display: false,
              },
              grid: {
                display: false,
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
          },
      });

let chartPlugins = ref([tsDoughnutLabelsLine]);

</script>


<style scoped>

</style>