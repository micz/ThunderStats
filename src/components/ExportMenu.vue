<template>
<div class="exportdata_menu" :id="exportdata_menu_dom_id">
                <img src="@/assets/images/mzts-export-data.png" @click="openExportMenu" @contextmenu="openExportMenu" title="__MSG_ExportData__" class="exportmenu"/>
            </div>
</template>


<script setup>

import { ref, computed, onMounted, h } from 'vue';
import { tsExport } from '@statslib/mzts-export';
import { tsStore } from '@statslib/mzts-store';
import { tsUtils } from '@statslib/mzts-utils';
import { tsPrefs } from '@statslib/mzts-options';
import ContextMenu from '@imengyu/vue3-context-menu'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'


const props = defineProps({
  export_data: {
    type: Object,
    default: {}
  },
  currentTab: {
    type: String,
    default: ""
  },
  singleDay: {
    type: Date,
    default: new Date()
  }
  // additional_css_class: {
  //   type: String,
  //   default: ""
  // },
});

let export_data = computed(() => props.export_data)
let currentTab = computed(() => props.currentTab)
let singleDay = computed(() => props.singleDay)
// let css_class = computed(() => "export_data " + props.additional_css_class)

let exportdata_menu_dom_id = ref("exportdata_menu_" + currentTab.value);

let export_menu_title = [
      {
        label: h('div', { class: 'my-menu-title' }, browser.i18n.getMessage("ExportData")),
        disabled: true,
      },
      {
        label: h('div', { class: 'my-menu-sperator' }),
        disabled: true,
      },
    ];

let export_menu = {
    //========================================== Today Tab
    "tab-today": [
        { 
          label: browser.i18n.getMessage("Correspondents"), 
          onClick: () => {
            let export_define = browser.i18n.getMessage("Day") + tsUtils.dateToYYYYMMDD(new Date());
            let export_type = tsExport.export["correspondents"].type;
            exportData(export_data.value[export_type], export_type, export_define + "_" + tsExport.export[export_type].name)
          }
        },
        { 
          label: browser.i18n.getMessage("MailsInADay"), 
          onClick: () => {
            let export_define = browser.i18n.getMessage("Day") + tsUtils.dateToYYYYMMDD(new Date());
            let export_type = tsExport.export["time_emails"].type;
            exportData(export_data.value[export_type], export_type, export_define + "_" + tsExport.export[export_type].name)
          }
        },
        {
          label: browser.i18n.getMessage("Tags"), 
          onClick: () => {
            let export_define = browser.i18n.getMessage("Day") + tsUtils.dateToYYYYMMDD(new Date());
            let export_type = tsExport.export["tags"].type;
            exportData(export_data.value[export_type], export_type, export_define + "_" + tsExport.export[export_type].name)
          }
        },
    ],
    //========================================== Today Tab - END
    //========================================== Yesterday Tab
    "tab-yesterday": [
      { 
        label: browser.i18n.getMessage("Correspondents"), 
        onClick: () => {
          let export_define = browser.i18n.getMessage("Day") + tsUtils.dateToYYYYMMDD(new Date(Date.now() - (1000 * 60 * 60 * 24)));
          let export_type = tsExport.export["correspondents"].type;
          exportData(export_data.value[export_type], export_type, export_define + "_" + tsExport.export[export_type].name)
        }
      },
      { 
        label: browser.i18n.getMessage("MailsInADay"), 
        onClick: () => {
          let export_define = browser.i18n.getMessage("Day") + tsUtils.dateToYYYYMMDD(new Date(Date.now() - (1000 * 60 * 60 * 24)));
          let export_type = tsExport.export["time_emails"].type;
          exportData(export_data.value[export_type], export_type, export_define + "_" + tsExport.export[export_type].name)
        }
      },
      {
        label: browser.i18n.getMessage("Tags"), 
        onClick: () => {
          let export_define = browser.i18n.getMessage("Day") + tsUtils.dateToYYYYMMDD(new Date(Date.now() - (1000 * 60 * 60 * 24)));
          let export_type = tsExport.export["tags"].type;
          exportData(export_data.value[export_type], export_type, export_define + "_" + tsExport.export[export_type].name)
        }
      },
    ],
    //========================================== ManyDays Tab - END
    "tab-manydays": [
      { 
        label: browser.i18n.getMessage("Correspondents"), 
        onClick: async () => {
          let _many_days = await tsPrefs.getPref("_many_days");
          let export_define = browser.i18n.getMessage("LastNumDays", _many_days);
          let export_type = tsExport.export["correspondents"].type;
          exportData(export_data.value[export_type], export_type, export_define + "_" + tsExport.export[export_type].name)
        }
      },
      { 
        label: browser.i18n.getMessage("DailyMails"), 
        onClick: async () => {
          let _many_days = await tsPrefs.getPref("_many_days");
          let export_define = browser.i18n.getMessage("LastNumDays", _many_days);
          let export_type = tsExport.export["daily_mails"].type;
          exportData(export_data.value[export_type], export_type, export_define + "_" + tsExport.export[export_type].name)
        }
      },
      // { 
      //   label: browser.i18n.getMessage("MailsInADay"), 
      //   onClick: async () => {
      //     let _many_days = await tsPrefs.getPref("_many_days");
      //     let export_define = browser.i18n.getMessage("LastNumDays", _many_days);
      //     let export_type = tsExport.export["time_emails"].type;
      //     exportData(export_data.value[export_type], export_type, export_define + "_" + tsExport.export[export_type].name)
      //   }
      // },
    ],
    //========================================== ManyDays Tab - END
    //========================================== CustomQry Tab - END
    "tab-customqry": [
      { 
        label: browser.i18n.getMessage("Correspondents"), 
        onClick: () => {
          let export_define = browser.i18n.getMessage("CustomQry");
          let export_type = tsExport.export["correspondents"].type;
          exportData(export_data.value[export_type], export_type, export_define + "_" + tsExport.export[export_type].name)
        }
      },
      { 
        label: browser.i18n.getMessage("DailyMails"), 
        onClick: () => {
          let export_define = browser.i18n.getMessage("CustomQry");
          let export_type = tsExport.export["daily_mails"].type;
          exportData(export_data.value[export_type], export_type, export_define + "_" + tsExport.export[export_type].name)
        }
      },
    ],
    "tab-customqry-single-day": [
      { 
        label: browser.i18n.getMessage("Correspondents"), 
        onClick: () => {
          let export_define = browser.i18n.getMessage("CustomQry");
          let export_type = tsExport.export["correspondents"].type;
          exportData(export_data.value[export_type], export_type, export_define + "_" + tsExport.export[export_type].name)
        }
      },
      { 
        label: browser.i18n.getMessage("MailsInADay"), 
        onClick: async () => {
          let export_define = browser.i18n.getMessage("Day") + tsUtils.dateToYYYYMMDD(singleDay.value);
          let export_type = tsExport.export["time_emails"].type;
          exportData(export_data.value[export_type], export_type, export_define + "_" + tsExport.export[export_type].name)
        }
      },
    ],
    //========================================== CustomQry Tab - END
};


function openExportMenu(e){
    e.preventDefault();
    let menu_icon = document.getElementById(exportdata_menu_dom_id.value).getBoundingClientRect();
    let x = menu_icon.x + menu_icon.width/2;
    let y = menu_icon.y + menu_icon.height/2;
    ContextMenu.showContextMenu({
      theme: tsStore.darkmode ? "mac dark" : "mac",
      x: x,
      y: y,
      zIndex: 1100,
      ignoreClickClassName: 'my-menu-title',
      preserveIconWidth: false,
      items: [...export_menu_title, ...export_menu[currentTab.value]],
  });
}


function exportData(data, export_type, export_name) {
    // console.log(">>>>>>>>>>>>> exportData data: " + JSON.stringify(data));

    switch(export_type) {
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
        case "time_emails":
          let output_data_time_emails = tsExport.transformTimeMailsJsonToArray(data);
          tsExport.downloadCSV(output_data_time_emails, export_name);
          break;
        case "tags":
          let output_data_tags = tsExport.transformTagsJsonToArray(data);
          tsExport.downloadCSV(output_data_tags, export_name);
          break;
        default: alert("export error: " + export_type);
          break;
    }
}

</script>


<style scoped>


</style>