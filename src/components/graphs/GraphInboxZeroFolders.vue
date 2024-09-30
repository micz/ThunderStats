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
    <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.svg" alt="__MSG_Loading__..." id="today_hours_graph_wait"/></div>
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
import { tsStore } from '@statslib/mzts-store';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';


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
	        padding: 70
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
            // console.log("onClick path: " + JSON.stringify(chartData.value.folders[activeEls[0].index]));
            if(activeEls.length == 0){
              return;
            }
            if(openFolderInFirstTab.value){
              let tabs = await browser.tabs.query({windowId: window.WINDOW_ID_CURRENT});
              // Cycle through tabs to find the first mailtab
              let currTab = null;
              for(let i = 0; i < tabs.length; i++){
                if(tabs[i].mailTab){
                  currTab = tabs[i];
                  break;
                }
              }
              if(tsStore.isTB128plus){
                browser.mailTabs.update(currTab.id, {displayedFolder: chartData.value.folder_paths[activeEls[0].index]});
              }else{
                browser.mailTabs.update(currTab.id, {displayedFolder: {...chartData.value.folders[activeEls[0].index]}});
              }
              browser.tabs.update(currTab.id, {active: true});
            } else {
              if(tsStore.isTB128plus){
                browser.mailTabs.create({displayedFolder: chartData.value.folder_paths[activeEls[0].index]});
              }else{
                browser.mailTabs.update(currTab.id, {displayedFolder: {...chartData.value.folders[activeEls[0].index]}});
              }
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