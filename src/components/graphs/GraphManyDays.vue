<template>
<div class="chart_many_days">
  <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.gif" alt="__MSG_Loading__..." /></div>
  <Bar
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
import { ref, computed, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { tsUtils } from '@statslib/mzts-utils';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);


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

//let maxY = ref(Math.ceil(Math.max(...chartData.value.datasets[0].data) / 5) * 5);

let maxY = ref(0);

watch(props.chartData, (newChartData) => {
    //console.log(">>>>>>>>>>>>> watch: " + JSON.stringify(newChartData));
    if (newChartData.datasets && newChartData.datasets.length > 0) {
        maxY.value = Math.ceil(tsUtils.getMaxFromData(newChartData.datasets[0].data) / 5) * 5;
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
}, { immediate: true });

var chartOptions = ref({
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        // categoryPercentage: 1,
        // barPercentage: 0.8,
        scales: {
          x: {
            // title: {
            //   display: true,
            //   text: browser.i18n.getMessage('TimeGraph.Time')
            // },
            beginAtZero: true,
            min: 0,
            ticks: {
              callback: function(value, index, ticks) {
                            return tsUtils.getManyDaysLabel(this.getLabelForValue(value));
                        },
              align: 'center',
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
          tooltip: {
              enabled: false,
              mode: 'index',
              intersect: false,
          },
          // animation: {
          //   onComplete: (animation) => {
          //     const ctx = animation.chart.ctx;
          //     ctx.font = Chart.helpers.fontString(Chart.defaults.font.size, Chart.defaults.font.style, Chart.defaults.font.family);
          //     ctx.textAlign = 'center';
          //     ctx.textBaseline = 'bottom';
          //     animation.chart.data.datasets.forEach((dataset, i) => {
          //       const meta = animation.chart.getDatasetMeta(i);
          //       meta.data.forEach((bar, index) => {
          //         const data = dataset.data[index];
          //         ctx.fillText(data, bar.x, bar.y - 5);
          //       });
          //     });
          //   },
          // },
        },
      });


let chartPlugins =  null;

</script>


<style scoped>

</style>