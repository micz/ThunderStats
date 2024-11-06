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
    <div class="list_heading_wrapper">
        <h2 class="list_heading cropped lowercase">{{ show_tags ? '__MSG_Tags__' : '__MSG_Folders__' }}</h2>
    </div>
    <ChartFolders v-if="!show_tags" :chartData="chartDataFolders" :chart_id="chart_id_folders" :chart_height="chart_height_folders" :is_loading="is_loading_folders" :key="chart_key" />
    <ChartTags v-if="show_tags" :chartData="chartDataTags" :chart_id="chart_id_tags" :chart_height="chart_height_tags" :is_loading="is_loading_tags" />
    <button type="button" @click="doSwitch" v-if="!(is_loading_folders || is_loading_tags)" class="btn" >switch</button>
</template>


<script setup>
import { computed, nextTick, ref } from 'vue'
import ChartTags from '../charts/ChartTags.vue';
import ChartFolders from '../charts/ChartFolders.vue';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import { tsStore } from '@statslib/mzts-store';
import { i18n } from "@statslib/mzts-i18n.js";

let props = defineProps({
    chartDataFolders: {
        type: Object,
        default: () => ({
                    labels: [],
                    datasets: []
                }),
        required: true
    },
    chartDataTags: {
        type: Object,
        default: () => ({
                    labels: [],
                    datasets: []
                }),
        required: true
    },
    is_loading_folders: {
        type: Boolean,
        default: true
    },
    is_loading_tags: {
        type: Boolean,
        default: true
    },
});

let chartDataFolders = computed(() => {
    return tsCoreUtils.sortDoubleDatasetsByTotal(props.chartDataFolders);
});

let chartDataTags = computed(() => {
    return tsCoreUtils.sortDoubleDatasetsByTotal(props.chartDataTags);
});

let is_loading_folders = computed(() => props.is_loading_folders);
let is_loading_tags = computed(() => props.is_loading_tags);

let show_tags = ref(tsStore.show_tags);
let chart_height_folders = ref("275px");
let chart_height_tags = ref("275px");

let chart_id_folders = ref("chart_folders_" + tsStore.currentTab);
let chart_id_tags = ref("chart_tags_" + tsStore.currentTab);

let force_rand = ref(Math.floor(Math.random() * 101));
let chart_key = computed(() => String(force_rand.value));

async function doSwitch(){
    show_tags.value = !show_tags.value;
    await nextTick();
    setChartHeight();
    i18n.updateDocument();
}

function setChartHeight(){
    if(!show_tags.value){
        let folders_dom_element = document.getElementById(chart_id_folders.value).parentElement;
        if(folders_dom_element != null){
            let folders_container_height = folders_dom_element.clientHeight;
            console.log(">>>>>>>>>>>>>>>> folders_container_height: " + folders_container_height);
            let folders_ipotetic_height = props.chartDataFolders.labels.length * 60;
            console.log(">>>>>>>>>>>>>>>> folders_ipotetic_height: " + folders_ipotetic_height);
            if(folders_container_height < folders_ipotetic_height){
                chart_height_folders.value = String(folders_ipotetic_height) + "px";
            } else {
                chart_height_folders.value = String(folders_container_height) + "px";
            }
            console.log(">>>>>>>>>>>>>>>> chart_height_folders.value: " + chart_height_folders.value);
        }
    }else{
        let tags_dom_element = document.getElementById(chart_id_tags.value).parentElement;
        if(tags_dom_element != null){
            let tags_container_height = tags_dom_element.clientHeight;
            console.log(">>>>>>>>>>>>>>>> tags_container_height: " + tags_container_height);
            let tags_ipotetic_height = props.chartDataTags.labels.length * 60;
            console.log(">>>>>>>>>>>>>>>> tags_ipotetic_height: " + tags_ipotetic_height);
            if(tags_container_height < tags_ipotetic_height){
                chart_height_tags.value = String(tags_ipotetic_height) + "px";
            } else {
                chart_height_tags.value = String(tags_container_height) + "px";
            }
            console.log(">>>>>>>>>>>>>>>> chart_height_tags.value: " + chart_height_tags.value);
        }
    }
    force_rand.value = Math.floor(Math.random() * 101);
}
</script>


<style scoped>

</style>