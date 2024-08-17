<template>
<div class="customqry_dashboard">
    <div class="customqry_menu" :id="customqry_menu_dom_id">
        <img src="@/assets/images/mzts-customqry-view.png" @click="openBookmarkMenu" @contextmenu="openBookmarkMenu" title="__MSG_Bookmarks_Menu__" class="bookmarkmenu"/>
    </div>
        <span style="margin: 0px 10px;">__MSG_DateRange__</span> <VueDatePicker v-model="dateQry" @update:model-value="rangeChoosen" :dark="isDark" :format="datepickerFormat" :locale="prefLocale" :range="{ partialRange: false }" :max-date="new Date()" :multi-calendars="{ solo: false, static: true }" :enable-time-picker="false" :clearable="false" ></VueDatePicker>
        <button type="button" @click="update">__MSG_UpdateCustomQry__</button>
        &nbsp;<input type="checkbox" v-model="doOnlyBD" @change="updateDoOnlyBD" /> __MSG_OnlyBDCustomQry__
        <div class="customqry_datamsg" v-if="do_run">__MSG_CustomQryDataMsg__: <div class="email_list_container" @mouseover="showEmailListTooltip" @mouseleave="hideEmailListTooltip"><span v-text="customqry_current_account"></span><span class="email_list_tooltip_text" v-if="emailListTooltipVisible" v-text="customqry_current_account_tooltip"></span></div> - __MSG_TotalDays__: <span v-text="customqry_totaldays_num"></span></div>
    </div>
</template>


<script setup>
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import { tsUtils } from '@statslib/mzts-utils';
import { i18n } from "@statslib/mzts-i18n.js";
import { tsStore } from '@statslib/mzts-store';
import { TS_prefs } from '@statslib/mzts-options';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import ContextMenu from '@imengyu/vue3-context-menu'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'

const emit = defineEmits(['update', 'rangeChoosen']);
const props = defineProps({
    do_run: Boolean,
    customqry_current_account: String,
    customqry_current_account_tooltip: String,
    customqry_totaldays_num: Number,
  });

let doOnlyBD = ref(false);
let dateQry = ref([]);
let isDark = ref(false);
let emailListTooltipVisible = ref(false);
let datepickerFormat = ref("dd-MM-yyyy");
let prefLocale = ref("en-GB");
let customqry_menu_dom_id = ref("customqry_menu_dom_id" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));

let customqry_current_account_tooltip = computed(() => {
    return props.customqry_current_account_tooltip;
})

let first_day_week = 1;

onBeforeMount( async() => {
  prefLocale.value = await TS_prefs.getPref("datepicker_locale");
  datepickerFormat.value = tsUtils.formatDateStringLocale(prefLocale.value);
  if(tsStore.darkmode === undefined) {
    tsStore.darkmode = tsUtils.isDarkMode();
  }
  isDark.value = tsStore.darkmode;
});


onMounted(async () => {
    let prefs = await TS_prefs.getPrefs(["first_day_week", "bday_default_only"]);
    //console.log(">>>>>>>>>>> prefs: " + JSON.stringify(prefs));
    first_day_week = prefs.first_day_week;
    const endDate = new Date();
    const startDate = new Date(new Date().setDate(endDate.getDate() - 6));
    dateQry.value = [startDate, endDate];
    tsStore.current_search_filters.dateQry = dateQry.value;
    doOnlyBD.value = prefs.bday_default_only;
    i18n.updateDocument();
});

function update() {
    updateFiltersStoredValues();
    emit('update');
}

function rangeChoosen(modelData) {
    updateFiltersStoredValues();
    emit('rangeChoosen', modelData);
}

function updateFiltersStoredValues() {
    tsStore.current_search_filters.dateQry = dateQry.value;
    tsStore.current_search_filters.doOnlyBD = doOnlyBD.value;
}

function openBookmarkMenu(e){
    e.preventDefault();
    let menu_icon = document.getElementById(customqry_menu_dom_id.value).getBoundingClientRect();
    let x = menu_icon.x + menu_icon.width/2;
    let y = menu_icon.y + menu_icon.height/2;
    ContextMenu.showContextMenu({
      theme: tsStore.darkmode ? "mac dark" : "mac",
      x: x,
      y: y,
      items: [
        { 
          label: browser.i18n.getMessage("CurrentWeek"), 
          onClick: () => {
            setPeriod("currentweek");
          }
        },
        { 
          label: browser.i18n.getMessage("LastWeek"), 
          onClick: () => {
            setPeriod("lastweek");
          }
        },
        { 
          label: browser.i18n.getMessage("Last2Week"), 
          onClick: () => {
            setPeriod("last2week");
          }
        },
        { 
          label: browser.i18n.getMessage("CurrentMonth"), 
          onClick: () => {
            setPeriod("currentmonth");
          }
        },
        { 
          label: browser.i18n.getMessage("LastMonth"),
          onClick: () => {
            setPeriod("lastmonth");
          }
        },
        { 
          label: browser.i18n.getMessage("CurrentYear"),
          onClick: () => {
            setPeriod("currentyear");
          }
        },
        { 
          label: browser.i18n.getMessage("LastYear"),
          onClick: () => {
            setPeriod("lastyear");
          }
        },
        /*{
          label: "A submenu", 
          children: [
            { label: "Item1" },
            { label: "Item2" },
            { label: "Item3" },
          ]
        },*/
      ]
  });
}

async function setPeriod(period){
    switch(period){
        case "currentweek":
        //console.log(">>>>>>>>>>> getLastMonday: "+JSON.stringify(tsUtils.getLastMonday()));
            dateQry.value = [tsUtils.getLastWeekday(first_day_week), new Date()];
            break;
        case "lastweek":
            let last_weekday = tsUtils.getLastWeekday(first_day_week);
            last_weekday = new Date(last_weekday.setDate(last_weekday.getDate() - 1));
            dateQry.value = [tsUtils.getPreviousWeekday(last_weekday, 1), last_weekday];
            break;
        case "last2week":
            let last_weekday2 = tsUtils.getLastWeekday(first_day_week);
            last_weekday2 = new Date(last_weekday2.setDate(last_weekday2.getDate() - 1));
            dateQry.value = [tsUtils.getPreviousWeekday(last_weekday2, 1), new Date()];
            break;
        case "currentmonth":
            dateQry.value = [tsUtils.getFirstDayOfCurrentMonth(), new Date()];
            break;
        case "lastmonth":
            dateQry.value = [tsUtils.getFirstDayOfLastMonth(), tsUtils.getLastDayOfLastMonth()];
            break;
        case "currentyear":
            dateQry.value = [tsUtils.getFirstDayOfCurrentYear(), new Date()];
            break;
        case "lastyear":
            dateQry.value = [tsUtils.getFirstDayOfLastYear(), tsUtils.getLastDayOfLastYear()];
            break;
    }
    if(await TS_prefs.getPref("customqry_loaddata_when_selectingrange")){
      update();
    }
}

function showEmailListTooltip(){
  emailListTooltipVisible.value = (customqry_current_account_tooltip.value != "");
}

function hideEmailListTooltip(){
  emailListTooltipVisible.value = false;
}

</script>


<style scoped>

</style>