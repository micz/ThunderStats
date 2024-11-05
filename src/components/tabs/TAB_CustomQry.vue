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
        <ExportMenu :export_data="_export_data" :currentTab="tabId" v-if="job_done" :singleDay="singleDay" />
        <div id="customqry_dashboard">
            <div id="customqry_menu">
                <img src="@/assets/images/mzts-customqry-view.png" @click="openBookmarkMenu" @contextmenu="openBookmarkMenu" title="__MSG_Bookmarks_Menu__" class="bookmarkmenu"/>
            </div>
                <span style="margin: 0px 10px;">__MSG_DateRange__</span> <VueDatePicker v-model="dateQry" @update:model-value="rangeChoosen" :dark="isDark" :format="datepickerFormat" :locale="prefLocale" :range="{ partialRange: false }" :max-date="new Date()" :multi-calendars="{ solo: false, static: true }" :enable-time-picker="false" :clearable="false" ></VueDatePicker>
                <img :src="advanced_filters_icon" @click="toggleAdvancedFilters" title="__MSG_ShowAdvFilters__" class="filters_btn"/>
                <button type="button" id="customqry_update_btn" @click="update">__MSG_UpdateCustomQry__</button>
                <input type="checkbox" id="customqry_only_bd" v-model="doOnlyBD" :disabled="customqry_only_bd_disabled" /> __MSG_OnlyBDCustomQry__
                <div id="customqry_datamsg" v-if="do_run">__MSG_CustomQryDataMsg__: <div class="email_list_container" @mouseover="showEmailListTooltip" @mouseleave="hideEmailListTooltip"><span v-text="customqry_current_account" :class="props.accountEmails.length > max_direct_accounts ? 'email_list_span' : ''"></span><span class="email_list_tooltip_text" v-if="emailListTooltipVisible" v-text="customqry_current_account_tooltip"></span></div> - __MSG_TotalDays__: <span v-text="customqry_totaldays_num"></span></div>
                <div id="customqry_adv_filters" v-if="show_advanced_filters">
                  <div class="adv_filters_main_title">__MSG_AdvFilters__</div>
                  <table id="customqry_adv_filters_table">
                    <tr>
                      <td>
                        <div id="filterFolder_container">
                          <span class="adv_filters_title">__MSG_ChooseFoldersFilter__<span v-if="tsStore.current_account_id == 0"> (__MSG_ChooseAccountToFilterFolders__)</span></span>
                          <br><Multiselect
                            v-model="filterFolder"
                            id="filterFolder"
                            name="filterFolder"
                            :options="folderList"
                            :searchable="true"
                            :close-on-select="true"
                            :show-labels="false"
                            :allow-empty="true"
                            :create-option="false"
                            mode="tags"
                            :disabled="tsStore.current_account_id == 0"
                            :placeholder="folderFiltersPlaceholder"
                            ref="filterFolder_ref"
                          >
                          </Multiselect>
                          <div style="margin-top:2px;">
                            <input type="checkbox" id="filterFolder_do_subfolders" v-model="filterFolder_do_subfolders" /><span @click="filterFolder_do_subfolders = !filterFolder_do_subfolders" style="cursor: pointer;"> __MSG_FilterFoldersIncludeSubfolders__</span>
                          </div>
                        </div>
                      </td>
                      <td colspan="2">
                        <span class="adv_filters_title">__MSG_FilterSubject__</span>
                      <br><input type="text" id="filterSubject" name="filterSubject" v-model="filterSubject" @input="updateAdvFiltersSet" @change="updateAdvFiltersPosition" />
                      <br>__MSG_WarnSearchCaseSensitive__
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td class="td-30">
                        <span class="adv_filters_title">__MSG_ReadStatus__</span><br>
                        <select id="filterReadUnread" v-model="filterReadUnread" @change="updateAdvFiltersSet">
                          <option value="0">__MSG_FilterFoldersAll__</option>
                          <option value="1">__MSG_FilterFoldersOnlyRead__</option>
                          <option value="2">__MSG_FilterFoldersOnlyUnread__</option>
                        </select>
                      </td>
                      <td class="td-30">
                        <span class="adv_filters_title">__MSG_FlagStatus__</span><br>
                        <select id="filterFlaggedUnflagged" v-model="filterFlaggedUnflagged" @change="updateAdvFiltersSet">
                          <option value="0">__MSG_FilterFoldersAll__</option>
                          <option value="1">__MSG_FilterFoldersOnlyFlagged__</option>
                          <option value="2">__MSG_FilterFoldersOnlyUnflagged__</option>
                        </select>
                    </td>
                    </tr>
                  </table>
                </div>
            </div>
    <div class="square_container" id="customqry_square_container">
    <div v-if="!do_single_day" class="square_item"><div class="list_heading_wrapper">
                        <h2 class="list_heading cropped">__MSG_SentMails__: <span v-if="do_run && !is_loading_counter_sent_rcvd">{{ sent_total }}<InfoTooltip :showAnchor="doOnlyBD" :noteText="totalInfoTooltip_text"></InfoTooltip></span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="do_run && is_loading_counter_sent_rcvd"/></h2>
                        <CounterManyDays_Row v-if="do_run" :is_loading="is_loading_counter_customqry" :_total="counter_customqry_sent_total" :_max="counter_customqry_sent_max" :_min="counter_customqry_sent_min" :_avg="counter_customqry_sent_avg" :showTotalInfoTooltip="doOnlyBD" :totalBDInfoTooltip_text="totalBDInfoTooltip_text"/>
                      </div>
                      <ChartCustomQry v-if="do_run" :chartData="chartData_Sent" :chart_width="chart_width" :is_loading="is_loading_sent_chart" :key="chartData_Sent_length"/>
    </div>
    <div v-if="do_single_day" class="square_item"><div class="list_heading_wrapper"><h2 class="list_heading cropped">__MSG_Mails__</h2>
        </div>
        <span class="list_heading_date" v-html="singleday_date_str"></span>
        <CounterSentReceived :is_loading="is_loading_counter_sent_rcvd" :_sent="sent_total" :_rcvd="rcvd_total" />
        <div class="singleday_spacing"></div>
        <ChartTime :chartData="chartData_SingleDay" :is_loading="is_loading_singleday_chart" :day_type="1" />
    </div>
    <div v-if="!do_single_day" class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped">__MSG_ReceivedMails__: <span v-if="do_run && !is_loading_counter_sent_rcvd">{{ rcvd_total }}<InfoTooltip :showAnchor="doOnlyBD" :noteText="totalInfoTooltip_text"></InfoTooltip></span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="do_run && is_loading_counter_sent_rcvd"/></h2>
                        <CounterManyDays_Row v-if="do_run" :is_loading="is_loading_counter_customqry" :_total="counter_customqry_rcvd_total" :_max="counter_customqry_rcvd_max" :_min="counter_customqry_rcvd_min" :_avg="counter_customqry_rcvd_avg" :showTotalInfoTooltip="doOnlyBD" :totalBDInfoTooltip_text="totalBDInfoTooltip_text"/>
					  </div>
					  <ChartCustomQry v-if="do_run" :chartData="chartData_Rcvd" :chart_width="chart_width" :is_loading="is_loading_rcvd_chart"  :key="chartData_Rcvd_length"/>
    </div>
    <div v-if="do_single_day" class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped">__MSG_InboxZeroStatus__</h2>
					  </div>
            <WidgetInboxZero
              :is_loading_counter_inbox="is_loading_counter_inbox"
              :counter_inbox_total="counter_inbox_total"
              :counter_inbox_unread="counter_inbox_unread"
              :is_loading_counter_inbox_percent="is_loading_counter_inbox_percent"
              :counter_inbox_percent="counter_inbox_percent"
              :showFolderLocationNoteAnchor="showFolderLocationNoteAnchor"
              :folderLocationNote_text="folderLocationNote_text"
              :is_loading_counter_sent_rcvd="is_loading_counter_sent_rcvd"
              :counter_rcvd="rcvd_total"
              :chartData_InboxZeroFolders="chartData_InboxZeroFolders"
              :inbox0_openFolderInFirstTab="inbox0_openFolderInFirstTab"
              :is_loading_inbox_chart_folders="is_loading_inbox_chart_folders"
              :no_mails_inbox="no_mails_inbox"
              :chartData_InboxZeroDates="chartData_InboxZeroDates"
              :chartData_InboxZeroDates_extended = "chartdata_inboxzero_dates"
              :is_loading_inbox_chart_dates="is_loading_inbox_chart_dates"
              :no_mails_received="no_mails_received"
            />
    </div>
    <div v-if="!do_single_day" class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped lowercase">__MSG_TimeDay__</h2>
					  </div>
            <ChartTime v-if="do_run" :chartData="chartData_TimeDay" :is_loading="is_loading_timeday_chart" :day_type="1"/>
    </div>
    <div v-if="!do_single_day" class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped lowercase">__MSG_Weekdays__</h2>
					  </div>
					<WidgetWeekDay v-if="do_run" :weekday_chartData="chartData_WeekDays" :is_loading="is_loading_weekdays_chart" />
    </div>
    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped lowercase">__MSG_Domains__</h2>
					  </div>
           <WidgetDomains v-if="do_run" :chartData="chartData_Domains" chart_id="chart_domains_customqry" :chart_height="domains_chart_height" :is_loading="is_loading_domains_chart" />
    </div>
    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped lowercase">__MSG_Tags__</h2>
                    </div>
                    <WidgetFoldersTags v-if="do_run" :chartData="chartData_Tags" chart_id="chart_tags_customqry" :chart_height="tags_chart_height" :is_loading="is_loading_tags_chart" />
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
import { ref, onMounted, onBeforeMount, nextTick, computed, watch } from 'vue';
import { tsLogger } from '@statslib/mzts-logger';
import { thunderStastsCore } from '@statslib/mzts-statscore';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import { tsUtils } from '@statslib/mzts-utils';
import TableInvolved from '../tables/TableInvolved.vue';
import ChartCustomQry from '../charts/ChartCustomQry.vue';
import CounterManyDays_Row from '../counters/CounterManyDays_Row.vue';
import ExportMenu from '../ExportMenu.vue';
import InfoTooltip from '../InfoTooltip.vue';
import { tsPrefs } from '@statslib/mzts-options';
import { i18n } from "@statslib/mzts-i18n.js";
import { tsStore } from '@statslib/mzts-store';
import { tsExport } from '@statslib/mzts-export';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import ContextMenu from '@imengyu/vue3-context-menu'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import CounterSentReceived from '../counters/CounterSentReceived.vue';
import ChartTime from '../charts/ChartTime.vue';
import Multiselect from '@vueform/multiselect';
import '@vueform/multiselect/themes/default.css';
import advancedFiltersIconPath from '@/assets/images/mzts-customqry_adv_filters.svg';
import advancedFiltersIconPath_Set from '@/assets/images/mzts-customqry_adv_filters_set.svg';
import WidgetWeekDay from '../widgets/WidgetWeekDay.vue';
import WidgetDomains from '../widgets/WidgetDomains.vue';
import WidgetInboxZero from '../widgets/WidgetInboxZero.vue';
import WidgetFoldersTags from '../widgets/WidgetFoldersTags.vue';


const emit = defineEmits(['updateCustomQry'],['updateElapsed']['customQryUserCancelled']);

const props = defineProps({
    accountEmails: {
        type: Array,
        default: []
    },
});

let filterFolder_ref = ref(null);

let max_direct_accounts = 3;

let tsLog = null;
var tsCore = null;

let tabId = ref("tab-customqry");

let dateQry = ref();
let do_run = ref(false);
let customqry_current_account = ref("");
let customqry_current_account_tooltip = ref("");
let customqry_totaldays_num = ref(0);
let isDark = ref(false);
let chart_width = ref("1500px");
let emailListTooltipVisible = ref(false);
let show_advanced_filters = ref(false);
let advanced_filters_set = ref(false)
let folderList = ref([]);
let advanced_filters_icon = ref(advancedFiltersIconPath);
let customqry_only_bd_disabled = ref(false);
let filterFolder = ref([]);
let filterFolder_do_subfolders = ref(true);
let filterReadUnread = ref(0); // 0: all, 1: read, 2: unread
let filterFlaggedUnflagged = ref(0); // 0: all, 1: flagged, 2: unflagged
let filterSubject = ref("");

// single day view
let do_progressive = true;
let inbox0_openFolderInFirstTab = ref(false);
let do_single_day = ref(false);
let singleDay = ref(null);
let singleday_date_str = ref("");
let no_mails_received = ref("");

let is_loading_singleday_chart = ref(true);
let is_loading_inbox_chart_folders = ref(true);
let is_loading_inbox_chart_dates = ref(true);
let is_loading_counter_inbox = ref(true);
let is_loading_counter_inbox_percent = ref(true);
let is_loading_timeday_chart = ref(true);
let is_loading_weekdays_chart = ref(true);

let counter_inbox_total = ref(0);
let counter_inbox_unread = ref(0);
let counter_inbox_percent = ref(0);

let chartData_SingleDay = ref({
    labels: Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')),
    datasets: []
});

let chartData_InboxZeroFolders = ref({
    labels: [],
    datasets: []
});
let chartData_InboxZeroDates = ref({
    labels: [],
    datasets: []
});

let chartData_Domains = ref({
    labels: [],
    datasets: []
});

let chartdata_singleday_hours_sent = ref([]);
let chartdata_singleday_hours_rcvd = ref([]);
let chartdata_inboxzero_folders = ref([]);
let chartdata_inboxzero_dates = ref([]);

let showFolderLocationNoteAnchor = ref(false);
let folderLocationNote_text = ref("");
// single day view - END

let datepickerFormat = ref("dd-MM-yyyy");
let prefLocale = ref("en-GB");

let folderFiltersPlaceholder = ref("");

let top_recipients_title = ref("");
let top_senders_title = ref("");

let sent_total = ref(0);
let rcvd_total = ref(0);

let is_loading_counter_sent_rcvd = ref(true);
let is_loading_counter_customqry = ref(true);
let is_loading_involved_table_recipients = ref(true);
let is_loading_involved_table_senders = ref(true);
let is_loading_sent_chart = ref(true);
let is_loading_rcvd_chart = ref(true);
let is_loading_domains_chart = ref(true);
let is_loading_tags_chart = ref(true);

let counter_customqry_sent_total = ref(0);
let counter_customqry_sent_max = ref(0);
let counter_customqry_sent_min = ref(0);
let counter_customqry_sent_avg = ref(0);
let counter_customqry_rcvd_total = ref(0);
let counter_customqry_rcvd_max = ref(0);
let counter_customqry_rcvd_min = ref(0);
let counter_customqry_rcvd_avg = ref(0);

let table_involved_recipients = ref([]);
let table_involved_senders = ref([]);
let show_table_involved_recipients = ref(false);
let show_table_involved_senders = ref(false);

let chartdata_customqry_sent = ref([]);
let chartdata_customqry_rcvd = ref([]);
let chartdata_customqry_labels = ref([]);
let chartdata_customqry_hours_sent = ref([]);
let chartdata_customqry_hours_rcvd = ref([]);
let chartdata_customqry_weekdays_sent = ref([]);
let chartdata_customqry_weekdays_rcvd = ref([]);
let chartdata_domains_sent = ref([]);
let chartdata_domains_rcvd = ref([]);
let chartdata_domains_labels = ref([]);
let chartdata_tags_sent = ref([]);
let chartdata_tags_rcvd = ref([]);
let chartdata_tags_labels = ref([]);

let domains_chart_height = ref("275px");
let tags_chart_height = ref("275px");

let _export_data = ref({});

let _involved_num = 10;
let first_day_week = 1;

let totalInfoTooltip_text = ref("");
let totalBDInfoTooltip_text = ref("");

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

let chartData_TimeDay = ref({
    labels: Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')),
    datasets: []
});

let chartData_TimeDay_length = computed(() => (chartData_TimeDay.value.datasets.length + Math.floor(Math.random() * 101)));

let chartData_WeekDays = ref({
    labels: Array.from({length: 7}, (_, i) => i),
    datasets: []
});

let chartData_WeekDays_length = computed(() => (chartData_WeekDays.value.datasets.length + Math.floor(Math.random() * 101)));

let chartData_Tags = ref({
    labels: [],
    datasets: []
});

let elapsed = {
    'getCustomQryData':0,
}

let job_done = computed(() => {
  if(!do_single_day.value){
    return !(is_loading_counter_sent_rcvd.value &&
    is_loading_counter_customqry.value &&
    is_loading_involved_table_recipients.value &&
    is_loading_involved_table_senders.value &&
    is_loading_sent_chart.value &&
    is_loading_rcvd_chart.value &&
    is_loading_timeday_chart.value &&
    is_loading_weekdays_chart.value &&
    is_loading_domains_chart.value &&
    is_loading_tags_chart.value);
  }else{
    return !(is_loading_counter_sent_rcvd.value &&
    is_loading_singleday_chart.value &&
    is_loading_involved_table_recipients.value &&
    is_loading_involved_table_senders.value &&
    is_loading_counter_inbox.value &&
    is_loading_counter_inbox_percent.value &&
    is_loading_inbox_chart_folders.value &&
    is_loading_inbox_chart_dates.value &&
    is_loading_domains_chart.value &&
    is_loading_tags_chart.value);
  }
});

watch(() => tsStore.current_account_id, async (newValue, oldValue) => {
  if(newValue == 0) {
    filterFolder_ref.value.clear();
    await nextTick();
    i18n.updateDocument();
  }else{
    folderList.value = await tsCoreUtils.getAccountFoldersNames(tsStore.current_account_id);
  }
});

watch(() => advanced_filters_set.value, async (newValue, oldValue) => {
  updateAdvFiltersIcon();
});

watch(() => filterFolder.value, async (newValue, oldValue) => {
  updateAdvFiltersSet();
});

watch(() => do_single_day.value, async (newValue, oldValue) => {
  if(newValue == true){
    doOnlyBD.value = false;
    customqry_only_bd_disabled.value = true;
  }else{
    customqry_only_bd_disabled.value = false;
  }
})

onBeforeMount(async () => {
  tsLog = new tsLogger("TAB_CustomQry", tsStore.do_debug);
  tsPrefs.logger = tsLog;
  prefLocale.value = await tsPrefs.getPref("datepicker_locale");
  datepickerFormat.value = tsUtils.formatDateStringLocale(prefLocale.value);
  if(tsStore.darkmode === undefined) {
    tsStore.darkmode = tsUtils.isDarkMode();
  }
  isDark.value = tsStore.darkmode;
})

onMounted(async () => {
    const endDate = new Date();
    const startDate = new Date(new Date().setDate(endDate.getDate() - 6));
    dateQry.value = [startDate, endDate];
    let prefs = await tsPrefs.getPrefs(["first_day_week", "_involved_num", "bday_default_only", "customqry_always_open_adv_filters"]);
    //console.log(">>>>>>>>>>> prefs: " + JSON.stringify(prefs));
    if(prefs.customqry_always_open_adv_filters) toggleAdvancedFilters();
    first_day_week = prefs.first_day_week;
    _involved_num = prefs._involved_num;
    top_recipients_title.value = browser.i18n.getMessage("TopRecipients", _involved_num);
    top_senders_title.value = browser.i18n.getMessage("TopSenders", _involved_num);
    doOnlyBD.value = prefs.bday_default_only;
    totalInfoTooltip_text.value = browser.i18n.getMessage("InfoTotal_AllMails");
    totalBDInfoTooltip_text.value = browser.i18n.getMessage("InfoTotal_BDMails_Only");
    folderLocationNote_text.value = browser.i18n.getMessage("InboxZeroFolderLocationNote");
    folderFiltersPlaceholder.value = browser.i18n.getMessage("FilterFoldersPlaceholder");
    if(tsStore.current_account_id != 0) {
      folderList.value = await tsCoreUtils.getAccountFoldersNames(tsStore.current_account_id);
    }
    no_mails_received.value = browser.i18n.getMessage("NoMailsReceived");
});

function update(){
  tsLog.log("Update requested");
  emit('updateCustomQry');
}

async function rangeChoosen(modelData){
  //console.log(">>>>>>>>>>>>>>> rangeChoosen: " + JSON.stringify(modelData));
  if(await tsPrefs.getPref("customqry_loaddata_when_selectingrange")){
    update();
  }
}

const updateAdvFiltersIcon = () => {
  advanced_filters_icon.value = advanced_filters_set.value ? advancedFiltersIconPath_Set : advancedFiltersIconPath;
}

const updateAdvFiltersSet = () => {
  let out_value = false;

  if(filterFolder.value.length > 0){
    out_value = true;
  }
  if(filterReadUnread.value > 0){
    out_value = true;
  }
  if(filterFlaggedUnflagged.value > 0){
    out_value = true;
  }
  if(filterSubject.value.length > 0){
    out_value = true;
  }

  advanced_filters_set.value = out_value;
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
            dateQry.value = [tsUtils.getPreviousWeekday(last_weekday, tsStore.first_day_week), last_weekday];
            break;
        case "last2week":
            let last_weekday2 = tsUtils.getLastWeekday(first_day_week);
            last_weekday2 = new Date(last_weekday2.setDate(last_weekday2.getDate() - 1));
            dateQry.value = [tsUtils.getPreviousWeekday(last_weekday2, tsStore.first_day_week), new Date()];
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
    if(await tsPrefs.getPref("customqry_loaddata_when_selectingrange")){
      update();
    }
}

async function doQry(){
  if(tsStore.current_account_id == 0) filterFolder_ref.value.clear();
  tsLog.log("filterFolder.value: "+JSON.stringify(filterFolder.value));
  customqry_totaldays_num.value = tsUtils.daysBetween(dateQry.value[0],dateQry.value[1]);
  let pref_warn_days = await tsPrefs.getPref("customqry_warn_onlongperiod_days");
  if(pref_warn_days > 0 && customqry_totaldays_num.value > pref_warn_days){
    if(!confirm(browser.i18n.getMessage("CustomViewTooMuchDaysText",customqry_totaldays_num.value))){
      do_run.value = false;
      customqry_totaldays_num.value = 0;
      emit('customQryUserCancelled');
      return;
    }
  }
  loadingDo();
  do_single_day.value = (customqry_totaldays_num.value == 1);
  elapsed.getInboxZeroData = 1;
  if(do_single_day.value){
    tsLog.log("Doing single day view...");
    tabId.value = "tab-customqry-single-day";
    singleDay.value = dateQry.value[0];
    singleday_date_str.value = singleDay.value.toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
    elapsed.getInboxZeroData = 0;
  }
  if(props.accountEmails.length > max_direct_accounts){
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
    let prefs = await tsPrefs.getPrefs(["_time_chart_progressive", "accounts_adv_settings"]);
    do_progressive = prefs._time_chart_progressive;
    let accounts_adv_settings = prefs.accounts_adv_settings;
    tsCore = new thunderStastsCore({do_debug: tsStore.do_debug, _involved_num: _involved_num, accounts_adv_settings: accounts_adv_settings});
    tsLog.log("props.accountEmails: " + JSON.stringify(props.accountEmails));
    tsLog.log("dateQry: " + JSON.stringify(dateQry.value));
    await getCustomQryData();
    if(!do_single_day.value){
      let chart_container_width = document.querySelector('.chart_customqry').clientWidth;
      let chart_ipotetic_width = chartdata_customqry_labels.value.length * 60;
      if(chart_container_width < chart_ipotetic_width){
        chart_width.value = String(chart_ipotetic_width) + "px";
      } else {
        chart_width.value = String(chart_container_width) + "px";
      }
      chartData_Sent.value.datasets = [];
      chartData_Sent.value.datasets.push({
          label: 'Sent',
          data: chartdata_customqry_sent.value,
          borderColor: tsStore.chart_colors.many_days_default,
          backgroundColor: tsStore.chart_colors.many_days_default,
          borderWidth: 2,
          pointRadius: 1,
          //maxBarThickness: 15,
          minBarThickness: 15,
      });
      tsLog.log("chartdata_customqry_sent.value: " + JSON.stringify(chartdata_customqry_sent.value));
      chartData_Sent.value.labels = chartdata_customqry_labels.value;
      chartData_Rcvd.value.datasets = [];
      chartData_Rcvd.value.datasets.push({
          label: 'Received',
          data: chartdata_customqry_rcvd.value,
          borderColor: tsStore.chart_colors.many_days_default,
          backgroundColor: tsStore.chart_colors.many_days_default,
          borderWidth: 2,
          pointRadius: 1,
          //maxBarThickness: 15,
          minBarThickness: 15,
      });
      tsLog.log("chartdata_customqry_rcvd.value: " + JSON.stringify(chartdata_customqry_rcvd.value));
      chartData_Rcvd.value.labels = chartdata_customqry_labels.value;
      tsLog.log("chartdata_customqry_hours_sent.value: " + JSON.stringify(chartdata_customqry_hours_sent.value));
      tsLog.log("chartdata_customqry_hours_rcvd.value: " + JSON.stringify(chartdata_customqry_hours_rcvd.value));
      chartData_TimeDay.value.datasets = [];
      chartData_TimeDay.value.datasets.push({
          label: 'ysent',
          data: chartdata_customqry_hours_sent.value,
          borderColor: tsStore.chart_colors._time_sent,
          backgroundColor: tsStore.chart_colors._time_sent,
          borderWidth: 2,
          pointRadius: 1,
      });
      chartData_TimeDay.value.datasets.push({
          label: 'yrcvd',
          data: chartdata_customqry_hours_rcvd.value,
          borderColor: tsStore.chart_colors._time_rcvd,
          backgroundColor: tsStore.chart_colors._time_rcvd,
          borderWidth: 2,
          pointRadius: 1,
      });
      // week days
      tsLog.log("chartdata_customqry_hours_sent.value: " + JSON.stringify(chartdata_customqry_weekdays_rcvd.value));
      tsLog.log("chartdata_customqry_hours_rcvd.value: " + JSON.stringify(chartdata_customqry_weekdays_sent.value));
      chartData_WeekDays.value.datasets = [];
      chartData_WeekDays.value.datasets.push({
          label: 'ysent',
          data: chartdata_customqry_weekdays_sent.value,
          borderColor: tsStore.chart_colors._weekday_sent,
          backgroundColor: tsStore.chart_colors._weekday_sent,
          borderWidth: 2,
          pointRadius: 1,
      })
      chartData_WeekDays.value.datasets.push({
          label: 'yrcvd',
          data: chartdata_customqry_weekdays_rcvd.value,
          borderColor: tsStore.chart_colors._weekday_rcvd,
          backgroundColor: tsStore.chart_colors._weekday_rcvd,
          borderWidth: 2,
          pointRadius: 1,
      })
    }else{    //single day
      getInboxZeroData();
      // chart single day hours
      tsLog.log("chartdata_singleday_hours_sent.value: " + JSON.stringify(chartdata_singleday_hours_sent.value));
      tsLog.log("chartdata_singleday_hours_rcvd.value: " + JSON.stringify(chartdata_singleday_hours_rcvd.value));
      chartData_SingleDay.value.datasets = [];
      chartData_SingleDay.value.datasets.push({
          label: 'ysent',
          data: chartdata_singleday_hours_sent.value,
          borderColor: tsStore.chart_colors._time_sent,
          backgroundColor: tsStore.chart_colors._time_sent,
          borderWidth: 2,
          pointRadius: 1,
      })
      chartData_SingleDay.value.datasets.push({
          label: 'yrcvd',
          data: chartdata_singleday_hours_rcvd.value,
          borderColor: tsStore.chart_colors._time_rcvd,
          backgroundColor: tsStore.chart_colors._time_rcvd,
          borderWidth: 2,
          pointRadius: 1,
      })
      // chart inbox zero folders
      let given_folders = tsCoreUtils.filterReceivedFolders(chartdata_inboxzero_folders.value);
      let folders_data = tsCoreUtils.getFoldersLabelsColors(given_folders);
      if("folders" in folders_data){
        chartData_InboxZeroFolders.value.folders = folders_data.folders;
      }
      chartData_InboxZeroFolders.value.folder_paths = folders_data.folder_paths;
      chartData_InboxZeroFolders.value.labels = folders_data.labels;
      chartData_InboxZeroFolders.value.datasets = [];
      chartData_InboxZeroFolders.value.datasets.push({data:tsCoreUtils.getFoldersCounts(given_folders), backgroundColor: folders_data.colors, borderColor: folders_data.colors});
      tsLog.log("chartData_InboxZeroFolders.value: " + JSON.stringify(chartData_InboxZeroFolders.value));
      // chart inbox zero dates
      inbox0_openFolderInFirstTab.value = await tsPrefs.getPref("inbox0_openFolderInFirstTab");
    }

    // chart domains
    let chart_container_height = document.getElementById('chart_domains_customqry').clientHeight;
    let chart_ipotetic_height = chartdata_domains_labels.value.length * 60;
    if(chart_container_height < chart_ipotetic_height){
        domains_chart_height.value = String(chart_ipotetic_height) + "px";
    } else {
        domains_chart_height.value = String(chart_container_height) + "px";
    }
    chartData_Domains.value.labels = chartdata_domains_labels.value;
    chartData_Domains.value.datasets = [];
    chartData_Domains.value.datasets.push({
        label: 'tsent',
        data: chartdata_domains_sent.value,
        borderColor: tsStore.chart_colors._time_sent,
        backgroundColor: tsStore.chart_colors._time_sent,
        borderWidth: 2,
        pointRadius: 1,
    });
    chartData_Domains.value.datasets.push({
        label: 'trcvd',
        data: chartdata_domains_rcvd.value,
        borderColor: tsStore.chart_colors._time_rcvd,
        backgroundColor: tsStore.chart_colors._time_rcvd,
        borderWidth: 2,
        pointRadius: 1,
    });
    tsLog.log("chartData_Domains.value: " + JSON.stringify(chartData_Domains.value));
    tsLog.log("chartData_Domains.value.labels: " + JSON.stringify(chartData_Domains.value.labels));

     // chart tags
     let tags_container_height = document.getElementById('chart_tags_customqry').clientHeight;
    let tags_ipotetic_height = chartdata_tags_labels.value.length * 60;
    if(tags_container_height < tags_ipotetic_height){
        tags_chart_height.value = String(tags_ipotetic_height) + "px";
    } else {
        tags_chart_height.value = String(tags_container_height) + "px";
    }
    chartData_Tags.value.labels = chartdata_tags_labels.value;
    chartData_Tags.value.datasets = [];
    chartData_Tags.value.datasets.push({
        label: 'tsent',
        data: chartdata_tags_sent.value,
        borderColor: tsStore.chart_colors._time_sent,
        backgroundColor: tsStore.chart_colors._time_sent,
        borderWidth: 2,
        pointRadius: 1,
    });
    chartData_Tags.value.datasets.push({
        label: 'trcvd',
        data: chartdata_tags_rcvd.value,
        borderColor: tsStore.chart_colors._time_rcvd,
        backgroundColor: tsStore.chart_colors._time_rcvd,
        borderWidth: 2,
        pointRadius: 1,
    });
    tsLog.log("chartData_Tags.value: " + JSON.stringify(chartData_Tags.value));
    tsLog.log("chartData_Tags.value.labels: " + JSON.stringify(chartData_Tags.value.labels));

    nextTick(async () => {
        if(do_single_day.value){
          is_loading_singleday_chart.value = false;
          is_loading_inbox_chart_folders.value = false;
          // is_loading_inbox_chart_dates.value = false;
          showFolderLocationNoteAnchor.value = await tsCoreUtils.getFilterDuplicatesPreference(tsStore.current_account_id);
          await nextTick();
        }
        i18n.updateDocument();
    });
};

 // get many days data
    function getCustomQryData () {
        return new Promise(async (resolve) => {
            let start_time = performance.now();
            let fromDate = dateQry.value[0];
            let toDate = dateQry.value[1];
            let advFilters = {};
            advFilters.folders = filterFolder.value;
            advFilters.folders_do_subfolders = filterFolder_do_subfolders.value;
            advFilters.read_unread = filterReadUnread.value;
            advFilters.flagged_unflagged = filterFlaggedUnflagged.value;
            advFilters.filterSubject = filterSubject.value.trim();
            tsLog.log("advFilters: " + JSON.stringify(advFilters, null, 2));
            let result_customqry = await tsCore.getCustomQryData(fromDate, toDate, tsStore.current_account_id, props.accountEmails, doOnlyBD.value, advFilters);
            tsLog.log("result_customqry: " + JSON.stringify(result_customqry, null, 2));
            // export data
            if(!do_single_day.value){
              _export_data.value[tsExport.export.daily_mails.type] = result_customqry.dates;
            }else{
              _export_data.value[tsExport.export.time_emails.type] = result_customqry.msg_hours;
            }
            _export_data.value[tsExport.export.correspondents.type] = tsExport.mergeRecipientsAndSenders(result_customqry.senders, result_customqry.recipients);
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
            if(!do_single_day.value){
              // chart day hours
              const _hours_data = tsCoreUtils.transformCountDataToDataset(result_customqry.msg_hours, false); // the false is to not to it progressive
              chartdata_customqry_hours_sent.value = _hours_data.dataset_sent;
              chartdata_customqry_hours_rcvd.value = _hours_data.dataset_rcvd;
              is_loading_timeday_chart.value = false;
              //aggregated data
              let aggregate = result_customqry.aggregate;
              tsLog.log("dates: " + JSON.stringify(result_customqry.dates, null, 2));
              tsLog.log("aggregate: " + JSON.stringify(aggregate, null, 2));
              counter_customqry_rcvd_total.value = aggregate.total_received;
              counter_customqry_rcvd_max.value = aggregate.max_received;
              counter_customqry_rcvd_min.value = aggregate.min_received;
              counter_customqry_rcvd_avg.value = aggregate.avg_received;
              counter_customqry_sent_total.value = aggregate.total_sent;
              counter_customqry_sent_max.value = aggregate.max_sent;
              counter_customqry_sent_min.value = aggregate.min_sent;
              counter_customqry_sent_avg.value = aggregate.avg_sent;
              is_loading_counter_customqry.value = false;
              // sent and received charts
              const customqry_data = tsCoreUtils.transformCountDataToDataset(result_customqry.dates, false, true);
              tsLog.log("customqry_data: " + JSON.stringify(customqry_data));
              chartdata_customqry_labels.value = customqry_data.labels;
              // sent chart
              chartdata_customqry_sent.value = customqry_data.dataset_sent;
              is_loading_sent_chart.value = false;
              // received chart
              chartdata_customqry_rcvd.value = customqry_data.dataset_rcvd;
              is_loading_rcvd_chart.value = false;
              // chart weekdays
              let first_day_week = tsStore.first_day_week;
              const _weekdays_data = tsCoreUtils.transformCountDataToDataset(tsUtils.sortWeekdays(first_day_week, result_customqry.msg_weekdays), false); // the false is to not do it progressive
              chartdata_customqry_weekdays_sent.value = _weekdays_data.dataset_sent;
              chartdata_customqry_weekdays_rcvd.value = _weekdays_data.dataset_rcvd;
              is_loading_weekdays_chart.value = false;
            }else{  // single day view
              // console.log(">>>>>>>>>>>>>> count_total_rcvd: " + result_customqry.received);
              // console.log(">>>>>>>>>>>>>> count_in_inbox: " + result_customqry.count_in_inbox);
              if(result_customqry.received > 0){
                counter_inbox_percent.value = (Math.round((1 - (result_customqry.count_in_inbox / result_customqry.received)) * 10000) / 100).toFixed(2) + '%';
              }else{
                counter_inbox_percent.value = '0%';
              }
              is_loading_counter_inbox_percent.value = false;
              const singleday_hours_data = tsCoreUtils.transformCountDataToDataset(result_customqry.msg_hours, do_progressive);
              chartdata_singleday_hours_sent.value = singleday_hours_data.dataset_sent;
              chartdata_singleday_hours_rcvd.value = singleday_hours_data.dataset_rcvd;
              is_loading_singleday_chart.value = false;
              // inbox zero folders
              chartdata_inboxzero_folders.value = result_customqry.folders;
            }
            // domains
            const domains_data = tsCoreUtils.transformCountDataToDataset(result_customqry.domains, false, true);
            // console.log(">>>>>>>>>>>>> domains_data: " + JSON.stringify(domains_data, null, 2));
            chartdata_domains_sent.value = domains_data.dataset_sent;
            chartdata_domains_rcvd.value = domains_data.dataset_rcvd;
            chartdata_domains_labels.value = domains_data.labels;
            is_loading_domains_chart.value = false;
            // tags
            const tags_data = tsCoreUtils.transformCountDataToDataset(result_customqry.tags, false, true);
            //  console.log(">>>>>>>>>>>>> tags_data: " + JSON.stringify(tags_data, null, 2));
            chartdata_tags_sent.value = tags_data.dataset_sent;
            chartdata_tags_rcvd.value = tags_data.dataset_rcvd;
            chartdata_tags_labels.value = await tsCoreUtils.transformTagsLabels(tags_data.labels);
            is_loading_tags_chart.value = false;
            let stop_time = performance.now();
            updateElapsed('getCustomQryData', stop_time - start_time);
            resolve(true);
        });
    };

    function getInboxZeroData () {
        return new Promise(async (resolve) => {
            let result_inbox = await tsCore.getInboxZeroDates(tsStore.current_account_id, props.accountEmails);
            counter_inbox_total.value = result_inbox.total;
            counter_inbox_unread.value = result_inbox.unread;
            // inbox zero dates
            chartdata_inboxzero_dates.value = result_inbox.dates;
            is_loading_counter_inbox.value = false;
            chartData_InboxZeroDates.value.labels = ['date'];
            chartData_InboxZeroDates.value.datasets = [];
            chartData_InboxZeroDates.value.datasets = tsCoreUtils.transformInboxZeroDatesDataToDataset(chartdata_inboxzero_dates.value);
            tsLog.log("chartData_InboxZeroDates.value: " + JSON.stringify(chartData_InboxZeroDates.value));
            nextTick(() => {
                is_loading_inbox_chart_dates.value = false;
            });
            updateElapsed('getInboxZeroData', result_inbox.elapsed);
            resolve(true);
        });
    };

function loadingDo(){
    is_loading_counter_sent_rcvd.value = true;
    is_loading_counter_customqry.value = true;
    is_loading_involved_table_recipients.value = true;
    is_loading_involved_table_senders.value = true;
    is_loading_sent_chart.value = true;
    is_loading_rcvd_chart.value = true;
    is_loading_singleday_chart.value = true;
    is_loading_counter_inbox.value = true;
    is_loading_counter_inbox_percent.value = true;
    is_loading_inbox_chart_folders.value = true;
    is_loading_inbox_chart_dates.value = true;
    is_loading_timeday_chart.value = true;
    is_loading_weekdays_chart.value = true;
    is_loading_domains_chart.value = true;
    is_loading_tags_chart.value = true;
}

function updateElapsed(function_name, time) {
    elapsed[function_name] = time;
    //console.log(">>>>>>>>>>>>> updateElapsed: " + JSON.stringify(elapsed));
    const allNonZero = Object.values(elapsed).every(value => value !== 0);
    if (allNonZero) {
        emit('updateElapsed', Math.max(...Object.values(elapsed)));
    }
}

async function toggleAdvancedFilters(){
  // let container = document.getElementById('customqry_square_container');
  // let currentMarginTop = window.getComputedStyle(container).marginTop;
  // let currentMarginTopValue = parseFloat(currentMarginTop);
  show_advanced_filters.value = !show_advanced_filters.value;
  await nextTick();
  updateAdvFiltersPosition();
  // if(show_advanced_filters.value){
  //   let adv_filters = document.getElementById('customqry_adv_filters');
  //   if(adv_filters) {
  //     // let heightOfElementA = adv_filters.offsetHeight;
  //     let height = adv_filters.offsetHeight;
  //     let style = getComputedStyle(adv_filters);
  //     let marginTop = parseFloat(style.marginTop);
  //     let marginBottom = parseFloat(style.marginBottom);
  //     let totalHeight = height + marginTop + marginBottom;
  //     container.style.marginTop = `${currentMarginTopValue - totalHeight}px`;
  //     show_advanced_filters.value = false;
  //     console.log(">>>>>>>>>>>>> totalHeight: " + totalHeight);
  //     console.log(">>>>>>>>>>>>> container.style.marginTop: " + container.style.marginTop);
  //     console.log(">>>>>>>>>>>>> height: " + height + " marginTop: " + marginTop + " marginBottom: " + marginBottom);
  //   }
  // }else{
  //   show_advanced_filters.value = true;
  //   await nextTick();
  //   let adv_filters = document.getElementById('customqry_adv_filters');
  //   if(adv_filters) {
  //     // let heightOfElementA = adv_filters.offsetHeight;
  //     let height = adv_filters.offsetHeight;
  //     let style = getComputedStyle(adv_filters);
  //     let marginTop = parseFloat(style.marginTop);
  //     let marginBottom = parseFloat(style.marginBottom);
  //     let totalHeight = height + marginTop + marginBottom;
  //     container.style.marginTop = `${currentMarginTopValue + totalHeight}px`;
  //     console.log(">>>>>>>>>>>>> totalHeight: " + totalHeight);
  //     console.log(">>>>>>>>>>>>> container.style.marginTop: " + container.style.marginTop);
  //     console.log(">>>>>>>>>>>>> height: " + height + " marginTop: " + marginTop + " marginBottom: " + marginBottom);
  //   }
    i18n.updateDocument();
  // }
}

function updateAdvFiltersPosition(){
  let container = document.getElementById('customqry_square_container');
  let customqry_adv_filters = document.getElementById('customqry_adv_filters');
  container.style.marginTop = '4.6em';  //if you change this, change it also in the computed style at the bottom of this file.
  if(show_advanced_filters.value){
    let currentMarginTop = window.getComputedStyle(container).marginTop;
    let currentMarginTopValue = parseFloat(currentMarginTop);
    let height = customqry_adv_filters.offsetHeight;
    let style = getComputedStyle(customqry_adv_filters);
    let marginTop = parseFloat(style.marginTop);
    let marginBottom = parseFloat(style.marginBottom);
    let totalHeight = height + marginTop + marginBottom;
    container.style.marginTop = `${currentMarginTopValue + totalHeight + 10}px`;
  }
}

function showEmailListTooltip(){
  emailListTooltipVisible.value = (customqry_current_account_tooltip.value != "");
}

function hideEmailListTooltip(){
  emailListTooltipVisible.value = false;
}

defineExpose({ doQry, updateAdvFiltersPosition });

</script>

<style scoped>
.square_container {
    margin-top: 4.6em;
}
:deep(.chart_inbox0_percent){
  top: 5.2em;
}
</style>