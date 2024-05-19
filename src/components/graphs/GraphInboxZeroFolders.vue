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
import { tsDoughnutLabelsLine } from '@statslib/chartjs-lib/plugin-doughnutlabels';
import { getRelativePosition } from 'chart.js/helpers';


ChartJS.register(ArcElement, Tooltip, Legend, Colors);

let props = defineProps({
    chartData: {
        type: Object,
        default: () => ({}),
        required: true
    },
    openFolderInFirstTab: {
        type: Boolean,
        default: false
    },
    is_loading: {
        type: Boolean,
        default: true
    }
});

let todayChartBar_ref = ref(null);

let chartData = computed(() => props.chartData)
let is_loading = computed(() => props.is_loading)
let openFolderInFirstTab = computed(() => props.openFolderInFirstTab)

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
          onClick: async (e, activeEls, chart) => {
            // console.log("onClick index: " + JSON.stringify(activeEls[0].index));
            // console.log("onClick path: " + JSON.stringify(chartData.value.folder_paths[activeEls[0].index]));
            if(activeEls.length == 0){
              return;
            }
            if(openFolderInFirstTab){
              let tabs = await browser.tabs.query({windowId: window.WINDOW_ID_CURRENT});
              // Cycle through tabs to find the first mailtab
              let currTab = null;
              for(let i = 0; i < tabs.length; i++){
                if(tabs[i].mailTab){
                  currTab = tabs[i];
                  break;
                }
              }
              browser.mailTabs.update(currTab.id, {displayedFolder: chartData.value.folder_paths[activeEls[0].index]});
              browser.tabs.update(currTab.id, {active: true});
            } else {
              browser.mailTabs.create({displayedFolder: chartData.value.folder_paths[activeEls[0].index]});
            }
          },
          onHover: async (e, activeEls, chart) => {
            if(activeEls.length == 0){
              chart.canvas.style.cursor = 'default';
            }else{
              chart.canvas.style.cursor = 'pointer';
            }
          }
      });

let chartPlugins = ref([tsDoughnutLabelsLine]);

</script>


<style scoped>

</style>