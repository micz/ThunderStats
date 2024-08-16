<template>
<div @click="exportData(export_data, export_name)" class="export_data">{{ link_text }}</div>
</template>


<script setup>

import { ref, computed, onMounted } from 'vue';
import { tsExport } from '@statslib/mzts-export';


const props = defineProps({
  export_data: {
    type: Object,
    default: {}
  },
  export_name: {
    type: String,
    default: ""
  },
  export_type: {
    type: String,
    default: ""
  }
});

let export_data = computed(() => props.export_data)
let export_name = computed(() => props.export_name)
let export_type = computed(() => props.export_type)

let link_text = ref('');

onMounted(() => {
    link_text.value = browser.i18n.getMessage("Export");
});


function exportData(data, export_name) {
    // console.log(">>>>>>>>>>>>> exportData data: " + JSON.stringify(data));

    switch(export_type.value) {
        case "correspondents":
            let output_data = tsExport.transformCorrespondentsJsonToArray(data);
            tsExport.downloadCSV(output_data, export_name);
          break;
        default: alert("export error: " + export_type.value);
          break;
    }
}

</script>


<style scoped>

</style>