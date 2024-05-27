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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';

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

let manydaysChartBar_ref = ref(null);

let chartData = computed(() => props.chartData)
let is_loading = computed(() => props.is_loading)

//let maxY = ref(Math.ceil(Math.max(...chartData.value.datasets[0].data) / 5) * 5);

let maxY = ref(0);

watch(props.chartData, (newChartData) => {
    //console.log(">>>>>>>>>>>>> watch: " + JSON.stringify(newChartData));
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
}, { immediate: true });

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
              display: true,
              text: browser.i18n.getMessage('TimeGraph.Time')
            },
            beginAtZero: true,
            min: 0,
            ticks: {
              callback: function(value, index, ticks) {
                            return tsCoreUtils.getManyDaysLabel(this.getLabelForValue(value));
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
              return height > 25 ? '#fff' : 'grey';
            },
            font: {
              weight: 'bold',
            },
            //formatter: function(value, context) {
              // console.log(">>>>>>>>>>>>>>>>>>>>> context.dataIndex: " + JSON.stringify(context.dataIndex));
              // console.log(">>>>>>>>>>>>>>>>>>>>> context.dataset: " + JSON.stringify(context.dataset));
              // const dataValues = Object.values(context.dataset.data);
              // value = dataValues[context.dataIndex];
              //console.log(">>>>>>>>>>>>>>>>>>>>> value: " + JSON.stringify(value));
            //   return value;
            // },
          },
        },
      });


var chartPlugins = [ChartDataLabels];

</script>


<style scoped>

</style>