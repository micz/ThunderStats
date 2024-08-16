<template>
<div @click="exportData(export_data, export_name)" class="export_data">Export</div>
</template>


<script setup>

import { computed } from 'vue';
import { tsExport } from '@statslib/mzts-export';


const props = defineProps({
  export_data: {
    type: Object,
    default: {}
  },
  export_name: {
    type: String,
    default: ""
  }
});

let export_data = computed(() => props.export_data)
let export_name = computed(() => props.export_name)


function exportData(data, export_name) {
    // console.log(">>>>>>>>>>>>> exportData data: " + JSON.stringify(data));
    let output_data = tsExport.transformCorrespondantsJsonToArray(data);
    tsExport.downloadCSV(output_data, export_name);
}

</script>


<style scoped>

</style>