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
        <div id="customqry_dashboard">
            <div id="customqry_menu">
                <img src="@/assets/images/mzts-customqry-view.png" @click="openBookmarkMenu" @contextmenu="openBookmarkMenu" title="__MSG_Bookmarks_Menu__" class="bookmarkmenu"/>
            </div>
                <span style="margin: 0px 10px;">__MSG_DateRange__</span> <VueDatePicker v-model="dateQry" @update:model-value="rangeChoosen" :dark="isDark" :format="datepickerFormat" :range="{ partialRange: false }" :max-date="new Date()" :multi-calendars="{ solo: false, static: true }" :enable-time-picker="false" :clearable="false" ></VueDatePicker>
                <button type="button" id="customqry_update_btn" @click="update">__MSG_UpdateCustomQry__</button>
                <input type="checkbox" id="customqry_only_bd" v-model="doOnlyBD" /> __MSG_OnlyBDCustomQry__
                <span v-if="do_run">__MSG_CustomQryDataMsg__: <div class="email_list_container" @mouseover="showEmailListTooltip" @mouseleave="hideEmailListTooltip"><span v-text="customqry_current_account"></span><span class="email_list_tooltip_text" v-if="emailListTooltipVisible" v-text="customqry_current_account_tooltip"></span></div> - __MSG_TotalDays__: <span v-text="customqry_totaldays_num"></span></span>
            </div>
    <div class="square_container">
    <div class="square_item"><div class="list_heading_wrapper">
                        <h2 class="list_heading cropped">__MSG_SentMails__: <span v-if="do_run && !is_loading_counter_sent_rcvd">{{ sent_total }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="do_run && is_loading_counter_sent_rcvd"/></h2>
                        <CounterManyDays_Row v-if="do_run" :is_loading="is_loading_counter_customqry" :_max="counter_customqry_sent_max" :_min="counter_customqry_sent_min" :_avg="counter_customqry_sent_avg"/>
                      </div>
                      <GraphCustomQry v-if="do_run" :chartData="chartData_Sent" :chart_width="chart_width" :is_loading="is_loading_sent_graph" :key="chartData_Sent_length"/>
    </div>

    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped">__MSG_ReceivedMails__: <span v-if="do_run && !is_loading_counter_sent_rcvd">{{ rcvd_total }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="do_run && is_loading_counter_sent_rcvd"/></h2>
                        <CounterManyDays_Row v-if="do_run" :is_loading="is_loading_counter_customqry" :_max="counter_customqry_rcvd_max" :_min="counter_customqry_rcvd_min" :_avg="counter_customqry_rcvd_avg"/>
					  </div>
					  <GraphCustomQry v-if="do_run" :chartData="chartData_Rcvd" :chart_width="chart_width" :is_loading="is_loading_rcvd_graph"  :key="chartData_Rcvd_length"/>
    </div>

    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped lowercase" v-text="top_recipients_title"></h2>
					  </div>
					  <TableInvolved :is_loading="is_loading_involved_table_recipients" :tableData="table_involved_recipients" v-if="do_run && (is_loading_involved_table_recipients || show_table_involved_recipients)" />
                    <p class="chart_info_nomail" v-if="!is_loading_involved_table_recipients && !show_table_involved_recipients">__MSG_NoMailsSent__</p>
    </div>
    
    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped lowercase" v-text="top_senders_title"></h2>
					  </div>
                      <TableInvolved :is_loading="is_loading_involved_table_senders" :tableData="table_involved_senders" v-if="do_run && (is_loading_involved_table_senders || show_table_involved_senders)"/>
                      <p class="chart_info_nomail" v-if="!is_loading_involved_table_senders && !show_table_involved_senders">__MSG_NoMailsReceived__</p>
    </div>
  </div>
</template>



<script setup>
import { ref, onMounted, onBeforeMount, nextTick, computed } from 'vue';
import { tsLogger } from '@statslib/mzts-logger';
import { thunderStastsCore } from '@statslib/mzts-statscore';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import { tsUtils } from '@statslib/mzts-utils';
import TableInvolved from '../tables/TableInvolved.vue';
import GraphCustomQry from '../graphs/GraphCustomQry.vue';
import CounterManyDays_Row from '../counters/CounterManyDays_Row.vue';
import { TS_prefs } from '@statslib/mzts-options';
import { i18n } from "@statslib/mzts-i18n.js";
import { tsStore } from '@statslib/mzts-store';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import ContextMenu from '@imengyu/vue3-context-menu'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'

const emit = defineEmits(['updateCustomQry'],['updateElapsed']);

const props = defineProps({
    activeAccount: {
        type: Number,
        default: 0
    },
    accountEmails: {
        type: Array,
        default: []
    },
});


let tsLog = null;
var tsCore = null;

let dateQry = ref();
let do_run = ref(false);
let customqry_current_account = ref("");
let customqry_current_account_tooltip = ref("");
let customqry_totaldays_num = ref(0);
let isDark = ref(false);
let chart_width = ref("1500px");
let emailListTooltipVisible = ref(false);

let datepickerFormat = ref("dd-MM-yyyy");

let top_recipients_title = ref("");
let top_senders_title = ref("");

let sent_total = ref(0);
let rcvd_total = ref(0);

let is_loading_counter_sent_rcvd = ref(true);
let is_loading_counter_customqry = ref(true);
let is_loading_involved_table_recipients = ref(true);
let is_loading_involved_table_senders = ref(true);
let is_loading_sent_graph = ref(true);
let is_loading_rcvd_graph = ref(true);

let counter_customqry_sent_max = ref(0);
let counter_customqry_sent_min = ref(0);
let counter_customqry_sent_avg = ref(0);
let counter_customqry_rcvd_max = ref(0);
let counter_customqry_rcvd_min = ref(0);
let counter_customqry_rcvd_avg = ref(0);

let table_involved_recipients = ref([]);
let table_involved_senders = ref([]);
let show_table_involved_recipients = ref(false);
let show_table_involved_senders = ref(false);

let graphdata_customqry_sent = ref([]);
let graphdata_customqry_rcvd = ref([]);
let graphdata_customqry_labels = ref([]);

let _involved_num = 10;
let first_day_week = 1;

let doOnlyBD = ref(false);


let chartData_Sent = ref({
    labels: [],
    datasets: []
});
let chartData_Sent_length = computed(() => (chartData_Sent.value.datasets.length + Math.floor(Math.random() * 101)));

let chartData_Rcvd = ref({
    labels: [],
    datasets: []
});
let chartData_Rcvd_length = computed(() => (chartData_Rcvd.value.datasets.length + Math.floor(Math.random() * 101)));

onBeforeMount(async () => {
  tsLog = new tsLogger("TAB_CustomQry", tsStore.do_debug);
  TS_prefs.logger = tsLog;
  datepickerFormat.value = tsUtils.formatDateStringLocale(await TS_prefs.getPref("datepicker_locale"));
  if(tsStore.darkmode === undefined) {
    tsStore.darkmode = tsUtils.isDarkMode();
  }
  isDark.value = tsStore.darkmode;
})

onMounted(async () => {
    const endDate = new Date();
    const startDate = new Date(new Date().setDate(endDate.getDate() - 6));
    dateQry.value = [startDate, endDate];
    let prefs = await TS_prefs.getPrefs(["first_day_week", "_involved_num", "bday_default_only"]);
    console.log(">>>>>>>>>>> prefs: " + JSON.stringify(prefs));
    first_day_week = prefs.first_day_week;
    _involved_num = prefs._involved_num;
    top_recipients_title.value = browser.i18n.getMessage("TopRecipients", _involved_num);
    top_senders_title.value = browser.i18n.getMessage("TopSenders", _involved_num);
    doOnlyBD.value = prefs.bday_default_only;
});

function update(){
  tsLog.log("Update requested");
  emit('updateCustomQry');
}

async function rangeChoosen(modelData){
  //console.log(">>>>>>>>>>>>>>> rangeChoosen: " + JSON.stringify(modelData));
  if(await TS_prefs.getPref("customqry_loaddata_when_selectingrange")){
    doQry();
  }
}

function openBookmarkMenu(e){
    e.preventDefault();
    let menu_icon = document.getElementById("customqry_menu").getBoundingClientRect();
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
      doQry();
    }
}

async function doQry(){
  loadingDo();
  customqry_totaldays_num.value = tsUtils.daysBetween(dateQry.value[0],dateQry.value[1]);
  if(props.accountEmails.length > 3){
    customqry_current_account.value = props.accountEmails.length + " " + browser.i18n.getMessage("EmailAddresses");
    customqry_current_account_tooltip.value = props.accountEmails.join(" ");
  } else {
    customqry_current_account.value = props.accountEmails.join(", ");
    customqry_current_account_tooltip.value = "";
  }
  do_run.value = true;
  await nextTick(); 
  i18n.updateDocument();
  updateData();
}

async function updateData() {
    while(props.updated == false){
        await new Promise(r => setTimeout(r, 100));
    }
    let accounts_adv_settings = await TS_prefs.getPref("accounts_adv_settings");
    tsCore = new thunderStastsCore({do_debug: tsStore.do_debug, _involved_num: _involved_num, accounts_adv_settings: accounts_adv_settings});
    tsLog.log("props.accountEmails: " + JSON.stringify(props.accountEmails));
    tsLog.log("dateQry: " + JSON.stringify(dateQry.value));
    await getCustomQryData();
    let chart_container_width = document.querySelector('.chart_customqry').clientWidth;
    let chart_ipotetic_width = graphdata_customqry_labels.value.length * 30;
    if(chart_container_width < chart_ipotetic_width){
      chart_width.value = String(chart_ipotetic_width) + "px";
    } else {
      chart_width.value = String(chart_container_width) + "px";
    }
    chartData_Sent.value.datasets = [];
    chartData_Sent.value.datasets.push({
        label: 'Sent',
        data: graphdata_customqry_sent.value,
        borderColor: '#4682B4',
        backgroundColor: '#4682B4',
        borderWidth: 2,
        pointRadius: 1,
        //maxBarThickness: 15,
        minBarThickness: 15,
    });
    tsLog.log("graphdata_customqry_sent.value: " + JSON.stringify(graphdata_customqry_sent.value));
    chartData_Sent.value.labels = graphdata_customqry_labels.value;
    chartData_Rcvd.value.datasets = [];
    chartData_Rcvd.value.datasets.push({
        label: 'Received',
        data: graphdata_customqry_rcvd.value,
        borderColor: '#4682B4',
        backgroundColor: '#4682B4',
        borderWidth: 2,
        pointRadius: 1,
        //maxBarThickness: 15,
        minBarThickness: 15,
    });
    tsLog.log("graphdata_customqry_rcvd.value: " + JSON.stringify(graphdata_customqry_rcvd.value));
    chartData_Rcvd.value.labels = graphdata_customqry_labels.value;
    nextTick(() => {
        i18n.updateDocument();
    });
};

 // get many days data
    function getCustomQryData () {
        return new Promise(async (resolve) => {
            let start_time = performance.now();
            let fromDate = dateQry.value[0];
            let toDate = dateQry.value[1];
            let result_customqry = await tsCore.getCustomQryData(fromDate, toDate, props.activeAccount, props.accountEmails, doOnlyBD.value);
            tsLog.log("result_manydays_data: " + JSON.stringify(result_customqry, null, 2));
            //top senders list
            show_table_involved_senders.value =  Object.keys(result_customqry.senders).length > 0;
            table_involved_senders.value = result_customqry.senders;
            is_loading_involved_table_senders.value = false;
            //top recipients list
            show_table_involved_recipients.value =  Object.keys(result_customqry.recipients).length > 0;
            table_involved_recipients.value = result_customqry.recipients;
            is_loading_involved_table_recipients.value = false;
            //sent and received counters
            sent_total.value = result_customqry.sent;
            rcvd_total.value = result_customqry.received;
            tsLog.log("sent_total: " + sent_total.value + " rcvd_total: " + rcvd_total.value);
            is_loading_counter_sent_rcvd.value = false;
            //aggregated data
            let aggregate = result_customqry.aggregate;
            tsLog.log("dates: " + JSON.stringify(result_customqry.dates, null, 2));
            tsLog.log("aggregate: " + JSON.stringify(aggregate, null, 2));
            counter_customqry_rcvd_max.value = aggregate.max_received;
            counter_customqry_rcvd_min.value = aggregate.min_received;
            counter_customqry_rcvd_avg.value = aggregate.avg_received;
            counter_customqry_sent_max.value = aggregate.max_sent;
            counter_customqry_sent_min.value = aggregate.min_sent;
            counter_customqry_sent_avg.value = aggregate.avg_sent;
            is_loading_counter_customqry.value = false;
            // sent and received graphs
            const customqry_data = tsCoreUtils.transformCountDataToDataset(result_customqry.dates, false, true);
            tsLog.log("customqry_data: " + JSON.stringify(customqry_data));
            graphdata_customqry_labels.value = customqry_data.labels;
            // sent graph
            graphdata_customqry_sent.value = customqry_data.dataset_sent;
            is_loading_sent_graph.value = false;
            // received graph
            graphdata_customqry_rcvd.value = customqry_data.dataset_rcvd;
            is_loading_rcvd_graph.value = false;
            let stop_time = performance.now();
            updateElapsed(stop_time - start_time);
            resolve(true);
        });
    };

function loadingDo(){
    is_loading_counter_sent_rcvd.value = true;
    is_loading_counter_customqry.value = true;
    is_loading_involved_table_recipients.value = true;
    is_loading_involved_table_senders.value = true;
    is_loading_sent_graph.value = true;
    is_loading_rcvd_graph.value = true;
}

function updateElapsed(elapsed) {
    tsLog.log("updateElapsed: " + elapsed);
    emit('updateElapsed', elapsed);
}

function showEmailListTooltip(){
  emailListTooltipVisible.value = (customqry_current_account_tooltip.value != "");
}

function hideEmailListTooltip(){
  emailListTooltipVisible.value = false;
}

defineExpose({ doQry });

</script>


<style scoped>
.square_container {
    margin-top: 4.6em;
}
</style>