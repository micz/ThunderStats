<template>
<div @click="exportData(export_data, export_name)" :class="css_class">{{ link_text }}</div>
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
  },
  additional_css_class: {
    type: String,
    default: ""
  },
  link_text: {
    type: String,
    default: browser.i18n.getMessage("Export")
  }
});

let export_data = computed(() => props.export_data)
let export_name = computed(() => props.export_name)
let export_type = computed(() => props.export_type)
let css_class = computed(() => "export_data " + props.additional_css_class)
let additional_link_text = computed(() => props.additional_link_text)
let link_text = computed(() => props.link_text)


function exportData(data, export_name) {
    // console.log(">>>>>>>>>>>>> exportData data: " + JSON.stringify(data));

    switch(export_type.value) {
        case "correspondents":
            let output_data = tsExport.transformCorrespondentsJsonToArray(data);
            tsExport.downloadCSV(output_data, export_name);
          break;
        case 'daily_mails':
          //console.log(">>>>>>> exportData daily_mails: " + JSON.stringify(data));
          let output_data_daily_mails = tsExport.transformDailyMailsJsonToArray(data);
          //console.log(">>>>>>>> output_data_daily_mails: " + JSON.stringify(output_data_daily_mails));
          tsExport.downloadCSV(output_data_daily_mails, export_name);
          break;
        default: alert("export error: " + export_type.value);
          break;
    }
}

</script>


<style scoped>

</style>