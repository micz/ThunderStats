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
    <div class="square_container">
    <div class="square_item"><div class="list_heading_wrapper"><h2 class="list_heading cropped">__MSG_Mails__</h2>
        </div>
        <span id="yesterday_date" class="list_heading_date" v-html="yesterday_date_str"></span>
        <CounterSentReceived :is_loading="is_loading_counter_sent_rcvd" :_sent="counter_yesterday_sent" :_rcvd="counter_yesterday_rcvd" />
        <div id="yesterday_spacing"></div>
        <CounterManyDays_Table :is_loading="is_loading_counter_many_days" :sent_total="counter_many_days_sent_total" :sent_max="counter_many_days_sent_max" :sent_min="counter_many_days_sent_min" :sent_avg="counter_many_days_sent_avg" :rcvd_total="counter_many_days_rcvd_total" :rcvd_max="counter_many_days_rcvd_max" :rcvd_min="counter_many_days_rcvd_min" :rcvd_avg="counter_many_days_rcvd_avg" />
        <GraphYesterday :chartData="chartData_Yesterday" :is_loading="is_loading_yesterday_graph" />
    </div>
    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped">__MSG_InboxZeroStatus__</h2>
					  </div>
					  <CounterInbox :is_loading="is_loading_counter_inbox" :inbox_total="counter_inbox_total" :inbox_unread="counter_inbox_unread" />
                      <div class="chart_inbox0">
                        <p class="chart_info">__MSG_FolderLocation__ <InfoTooltip :showAnchor="showFolderLocationNoteAnchor" :noteText="folderLocationNote_text"></InfoTooltip></p><p class="chart_info_nomail" id="yesteday_inbox0_folder_spread_nomails" v-if="!is_loading_counter_sent_rcvd && (counter_yesterday_rcvd == 0)" v-text="no_mails_received_yesterday"></p>
                        <GraphInboxZeroFolders :chartData="chartData_InboxZeroFolders" :openFolderInFirstTab="inbox0_openFolderInFirstTab" :is_loading="is_loading_inbox_graph_folders" />
                      </div>
                      <div class="chart_inbox0_datemsg">
                        <p class="chart_info">__MSG_InboxMailsDateSpreading__</p><p class="chart_info_nomail" id="yesterday_inbox0_datemsg_nomails" v-if="!is_loading_counter_inbox && (counter_inbox_total == 0)" v-text="no_mails_inbox"></p>
                        <GraphInboxZeroDates :chartData="chartData_InboxZeroDates" :is_loading="is_loading_inbox_graph_dates" />
                      </div>
    </div>
    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped lowercase" v-text="top_recipients_title"></h2>
                        <ExportButton :export_data="table_involved_recipients" :export_name="_involved_recipients_export_name" />
					  </div>
					  <TableInvolved :is_loading="is_loading_involved_table_recipients" :tableData="table_involved_recipients" v-if="is_loading_involved_table_recipients || show_table_involved_recipients" />
                    <p class="chart_info_nomail" v-if="!is_loading_involved_table_recipients && !show_table_involved_recipients" v-text="no_mails_sent_yesterday"></p>
    </div>
    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped lowercase" v-text="top_senders_title"></h2>
                        <ExportButton :export_data="table_involved_senders" :export_name="_involved_senders_export_name" />
					  </div>
                      <TableInvolved :is_loading="is_loading_involved_table_senders" :tableData="table_involved_senders" v-if="is_loading_involved_table_senders || show_table_involved_senders"/>
                      <p class="chart_info_nomail" v-if="!is_loading_involved_table_senders && !show_table_involved_senders" v-text="no_mails_received_yesterday"></p>
    </div>
  </div>
</template>



<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { tsLogger } from '@statslib/mzts-logger';
import { thunderStastsCore } from '@statslib/mzts-statscore';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import { tsUtils } from '@statslib/mzts-utils';
import CounterSentReceived from '../counters/CounterSentReceived.vue';
import GraphYesterday from '../graphs/GraphYesterday.vue';
import GraphInboxZeroFolders from '../graphs/GraphInboxZeroFolders.vue';
import GraphInboxZeroDates from '../graphs/GraphInboxZeroDates.vue';
import TableInvolved from '../tables/TableInvolved.vue';
import CounterInbox from '../counters/CounterInbox.vue';
import { TS_prefs } from '@statslib/mzts-options';
import { i18n } from "@statslib/mzts-i18n.js";
import { tsStore } from '@statslib/mzts-store';
import CounterManyDays_Table from '../counters/CounterManyDays_Table.vue';
import InfoTooltip from '../InfoTooltip.vue';
import ExportButton from '../ExportButton.vue';

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

const emit = defineEmits(['updateElapsed','updateTabName']);

let tsLog = null;
var tsCore = null;

let yesterday_date = ref(new Date(Date.now() - (1000 * 60 * 60 * 24)));
let yesterday_date_str = ref("");
let top_recipients_title = ref("");
let top_senders_title = ref("");
let no_mails_sent_yesterday = ref("");
let no_mails_received_yesterday = ref("");
let no_mails_inbox = ref("");

let do_progressive = true;
let inbox0_openFolderInFirstTab = ref(false);
let showFolderLocationNoteAnchor = ref(false);
let folderLocationNote_text = ref("");

let elapsed = {
    'getManyDaysData':0,
    'getInboxZeroData':0,
    'getYesterdayData':0
}

let is_loading_counter_sent_rcvd = ref(true);
let is_loading_yesterday_graph = ref(true);
let is_loading_involved_table_recipients = ref(true);
let is_loading_involved_table_senders = ref(true);
let is_loading_counter_inbox = ref(true);
let is_loading_inbox_graph_folders = ref(true);
let is_loading_inbox_graph_dates = ref(true);
let is_loading_counter_many_days = ref(true);

let counter_yesterday_sent = ref(0);
let counter_yesterday_rcvd = ref(0);
let counter_many_days_sent_total = ref(0);
let counter_many_days_sent_max = ref(0);
let counter_many_days_sent_min = ref(0);
let counter_many_days_sent_avg = ref(0);
let counter_many_days_rcvd_total = ref(0);
let counter_many_days_rcvd_max = ref(0);
let counter_many_days_rcvd_min = ref(0);
let counter_many_days_rcvd_avg = ref(0);

let table_involved_recipients = ref([]);
let table_involved_senders = ref([]);
let show_table_involved_recipients = ref(false);
let show_table_involved_senders = ref(false);
let _involved_recipients_export_name = ref('');
let _involved_senders_export_name = ref('');

let counter_inbox_total = ref(0);
let counter_inbox_unread = ref(0);

let _involved_num = 10;
let _many_days = 7;

let chartData_Yesterday = ref({
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

let graphdata_yesterday_hours_sent = ref([]);
let graphdata_yesterday_hours_rcvd = ref([]);
let graphdata_inboxzero_folders = ref([]);
let graphdata_inboxzero_dates = ref([]);

onMounted(async () => {
    tsLog = new tsLogger("TAB_Yesterday", tsStore.do_debug);
    TS_prefs.logger = tsLog;
    yesterday_date_str.value = yesterday_date.value.toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
    _involved_num = await TS_prefs.getPref("_involved_num");
    top_recipients_title.value = browser.i18n.getMessage("TopRecipients", _involved_num);
    top_senders_title.value = browser.i18n.getMessage("TopSenders", _involved_num);
    _involved_recipients_export_name.value = top_recipients_title.value;
    _involved_senders_export_name.value = top_senders_title.value;
    no_mails_sent_yesterday.value = browser.i18n.getMessage("NoMailsSent")+" "+browser.i18n.getMessage("yesterday_small");
    no_mails_received_yesterday.value = browser.i18n.getMessage("NoMailsReceived")+" "+browser.i18n.getMessage("yesterday_small");
    no_mails_inbox.value = browser.i18n.getMessage("NoMailsInbox");
    folderLocationNote_text.value = browser.i18n.getMessage("InboxZeroFolderLocationNote");
});


async function updateData() {
    loadingDo();
    let prefs = await TS_prefs.getPrefs(["_time_graph_progressive", "accounts_adv_settings"]);
    do_progressive = prefs._time_graph_progressive;
    while(props.updated == false){
        await new Promise(r => setTimeout(r, 100));
    }
    let accounts_adv_settings = prefs.accounts_adv_settings;
    tsCore = new thunderStastsCore({do_debug: tsStore.do_debug, _involved_num: _involved_num, _many_days: _many_days, accounts_adv_settings: accounts_adv_settings});
    tsLog.log("props.accountEmails: " + JSON.stringify(props.accountEmails));
    getManyDaysData();
    getInboxZeroData();
    await Promise.all([getYesterdayData()]);
    tsLog.log("graphdata_yesterday_hours_sent.value: " + JSON.stringify(graphdata_yesterday_hours_sent.value));
    tsLog.log("graphdata_yesterday_hours_rcvd.value: " + JSON.stringify(graphdata_yesterday_hours_rcvd.value));
    chartData_Yesterday.value.datasets = [];
    chartData_Yesterday.value.datasets.push({
        label: 'ysent',
        data: graphdata_yesterday_hours_sent.value,
        borderColor: '#1f77b4',
        backgroundColor: '#1f77b4',
        borderWidth: 2,
        pointRadius: 1,
    })
    chartData_Yesterday.value.datasets.push({
        label: 'yrcvd',
        data: graphdata_yesterday_hours_rcvd.value,
        borderColor: '#ff7f0e',
        backgroundColor: '#ff7f0e',
        borderWidth: 2,
        pointRadius: 1,
    })
    // graph inbox zero folders
    let given_folders = tsCoreUtils.filterReceivedFolders(graphdata_inboxzero_folders.value);
    let folders_data = tsCoreUtils.getFoldersLabelsColors(given_folders);
    chartData_InboxZeroFolders.value.folder_paths = folders_data.folder_paths;
    chartData_InboxZeroFolders.value.labels = folders_data.labels;
    chartData_InboxZeroFolders.value.datasets = [];
    chartData_InboxZeroFolders.value.datasets.push({data:tsCoreUtils.getFoldersCounts(given_folders), backgroundColor: folders_data.colors, borderColor: folders_data.colors});
    tsLog.log("chartData_InboxZeroFolders.value: " + JSON.stringify(chartData_InboxZeroFolders.value));
    // graph inbox zero dates
    inbox0_openFolderInFirstTab.value = await TS_prefs.getPref("inbox0_openFolderInFirstTab");
    // chartData_InboxZeroDates.value.labels = ['date'];
    // chartData_InboxZeroDates.value.datasets = [];
    // chartData_InboxZeroDates.value.datasets = tsCoreUtils.transformInboxZeroDatesDataToDataset(graphdata_inboxzero_dates.value);
    // tsLog.log("chartData_InboxZeroDates.value: " + JSON.stringify(chartData_InboxZeroDates.value));
    nextTick(async () => {
        is_loading_yesterday_graph.value = false;
        is_loading_inbox_graph_folders.value = false;
        // is_loading_inbox_graph_dates.value = false;
        showFolderLocationNoteAnchor.value = await tsCoreUtils.getFilterDuplicatesPreference(props.activeAccount)
        i18n.updateDocument();
    });
};

    // get Yesterday
    function getYesterdayData () {
        return new Promise(async (resolve) => {
            let result_yesterday = null;
            // check Business Days
            let prefs_bday_use_last_business_day = await TS_prefs.getPref("bday_use_last_business_day");
            if(prefs_bday_use_last_business_day == true){
                if(tsCoreUtils.checkBusinessDay(tsUtils.dateToYYYYMMDD(yesterday_date.value)) == true){
                    result_yesterday = await tsCore.getYesterday(props.activeAccount, props.accountEmails);
                }else{
                    let last_bday = tsCoreUtils.findPreviousBusinessDay(yesterday_date.value);
                    yesterday_date_str.value = last_bday.toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
                    emit('updateTabName', browser.i18n.getMessage("LastBusinessDay"));
                    result_yesterday = await tsCore.getSingleDay(last_bday,props.activeAccount, props.accountEmails);
                    tsLog.log("using last business day: " + JSON.stringify(last_bday, null, 2));
                }
            }else{
                result_yesterday = await tsCore.getYesterday(props.activeAccount, props.accountEmails);
            }
            tsLog.log("result_yesterday: " + JSON.stringify(result_yesterday, null, 2));
            counter_yesterday_rcvd.value = result_yesterday.received;
            counter_yesterday_sent.value = result_yesterday.sent;
            is_loading_counter_sent_rcvd.value = false;
            // graph yesterday hours
            const yesterday_hours_data = tsCoreUtils.transformCountDataToDataset(result_yesterday.msg_hours, do_progressive);
            graphdata_yesterday_hours_sent.value = yesterday_hours_data.dataset_sent;
            graphdata_yesterday_hours_rcvd.value = yesterday_hours_data.dataset_rcvd;
            //top senders list
            show_table_involved_senders.value =  Object.keys(result_yesterday.senders).length > 0;
            table_involved_senders.value = result_yesterday.senders;
            is_loading_involved_table_senders.value = false;
            //top recipients list
            show_table_involved_recipients.value =  Object.keys(result_yesterday.recipients).length > 0;
            table_involved_recipients.value = result_yesterday.recipients;
            is_loading_involved_table_recipients.value = false;
            // inbox zero folders
            graphdata_inboxzero_folders.value = result_yesterday.folders;
            updateElapsed('getYesterdayData', result_yesterday.elapsed);
            resolve(true);
        });
    };

    function getInboxZeroData () {
        return new Promise(async (resolve) => {
            let result_inbox = await tsCore.getInboxZeroDates(props.activeAccount, props.accountEmails);
            counter_inbox_total.value = result_inbox.total;
            counter_inbox_unread.value = result_inbox.unread;
            // inbox zero dates
            graphdata_inboxzero_dates.value = result_inbox.dates;
            is_loading_counter_inbox.value = false;
            chartData_InboxZeroDates.value.labels = ['date'];
            chartData_InboxZeroDates.value.datasets = [];
            chartData_InboxZeroDates.value.datasets = tsCoreUtils.transformInboxZeroDatesDataToDataset(graphdata_inboxzero_dates.value);
            tsLog.log("chartData_InboxZeroDates.value: " + JSON.stringify(chartData_InboxZeroDates.value));
            nextTick(() => {
                is_loading_inbox_graph_dates.value = false;
            });
            updateElapsed('getInboxZeroData', result_inbox.elapsed);
            resolve(true);
        });
    };

    // get 7 days data
    async function getManyDaysData () {
        return new Promise(async (resolve) => {
            let result_many_days = await tsCore.getToday_manyDaysData(props.activeAccount, props.accountEmails);
            tsLog.log("result_today_manydays_data: " + JSON.stringify(result_many_days, null, 2));
            counter_many_days_rcvd_total.value = result_many_days.aggregate.total_received;
            counter_many_days_rcvd_max.value = result_many_days.aggregate.max_received;
            counter_many_days_rcvd_min.value = result_many_days.aggregate.min_received;
            counter_many_days_rcvd_avg.value = result_many_days.aggregate.avg_received;
            counter_many_days_sent_total.value = result_many_days.aggregate.total_sent;
            counter_many_days_sent_max.value = result_many_days.aggregate.max_sent;
            counter_many_days_sent_min.value = result_many_days.aggregate.min_sent;
            counter_many_days_sent_avg.value = result_many_days.aggregate.avg_sent;
            is_loading_counter_many_days.value = false;
            updateElapsed('getManyDaysData', result_many_days.elapsed);
            resolve(true);
        });
    };

function loadingDo(){
    is_loading_counter_sent_rcvd.value = true;
    is_loading_yesterday_graph.value = true;
    is_loading_involved_table_recipients.value = true;
    is_loading_involved_table_senders.value = true;
    is_loading_counter_inbox.value = true;
    is_loading_inbox_graph_folders.value = true;
    is_loading_inbox_graph_dates.value = true;
    is_loading_counter_many_days.value = true;
    elapsed = {
            'getManyDaysData':0,
            'getInboxZeroData':0,
            'getYesterdayData':0
        }
}

function updateElapsed(function_name, time) {
    elapsed[function_name] = time;
    const allNonZero = Object.values(elapsed).every(value => value !== 0);
    if (allNonZero) {
        emit('updateElapsed', Math.max(...Object.values(elapsed)));
    }
}


defineExpose({ updateData });

</script>




<style scoped>

</style>