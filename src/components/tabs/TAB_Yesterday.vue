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
    <ExportMenu :export_data="_export_data" currentTab="tab-yesterday" v-if="job_done" />
    <div class="square_container">
    <div class="square_item"><div class="list_heading_wrapper"><h2 class="list_heading cropped">__MSG_Mails__</h2>
        </div>
        <span id="yesterday_date" class="list_heading_date" v-html="yesterday_date_str"></span>
        <CounterSentReceived :is_loading="is_loading_counter_sent_rcvd" :_sent="counter_yesterday_sent" :_rcvd="counter_yesterday_rcvd" />
        <div id="yesterday_spacing"></div>
        <CounterManyDays_Table :is_loading="is_loading_counter_many_days" :sent_total="counter_many_days_sent_total" :sent_max="counter_many_days_sent_max" :sent_min="counter_many_days_sent_min" :sent_avg="counter_many_days_sent_avg" :rcvd_total="counter_many_days_rcvd_total" :rcvd_max="counter_many_days_rcvd_max" :rcvd_min="counter_many_days_rcvd_min" :rcvd_avg="counter_many_days_rcvd_avg" />
        <ChartTime :chartData="chartData_Yesterday" :is_loading="is_loading_yesterday_chart" :is_last_business_day="is_last_business_day" :day_type="-1" />
    </div>
    <div class="square_item"><div class="list_heading_wrapper">
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
                        :counter_rcvd="counter_yesterday_rcvd"
                        :chartData_InboxZeroFolders="chartData_InboxZeroFolders"
                        :inbox0_openFolderInFirstTab="inbox0_openFolderInFirstTab"
                        :is_loading_inbox_chart_folders="is_loading_inbox_chart_folders"
                        :no_mails_inbox="no_mails_inbox"
                        :chartData_InboxZeroDates="chartData_InboxZeroDates"
                        :chartData_InboxZeroDates_extended = "chartdata_inboxzero_dates"
                        :is_loading_inbox_chart_dates="is_loading_inbox_chart_dates"
                        :no_mails_received="no_mails_received_yesterday"
                      />
    </div>
    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped lowercase">__MSG_Domains__</h2>
					  </div>
                      <WidgetDomains :chartData="chartData_Domains" chart_id="chart_domains_yesterday" :chart_height="domains_chart_height" :is_loading="is_loading_domains_chart" />
    </div>
    <div class="square_item">
                    <WidgetFoldersTags :chartDataFolders="chartData_Folders" :chartDataTags="chartData_Tags" :is_loading_folders="is_loading_folders_chart" :is_loading_tags="is_loading_tags_chart" />
    </div>
    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped lowercase" v-text="top_recipients_title"></h2>
					  </div>
					  <TableInvolved :is_loading="is_loading_involved_table_recipients" :tableData="table_involved_recipients" v-if="is_loading_involved_table_recipients || show_table_involved_recipients" />
                    <p class="chart_info_nomail" v-if="!is_loading_involved_table_recipients && !show_table_involved_recipients" v-text="no_mails_sent_yesterday"></p>
    </div>
    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped lowercase" v-text="top_senders_title"></h2>
					  </div>
                      <TableInvolved :is_loading="is_loading_involved_table_senders" :tableData="table_involved_senders" v-if="is_loading_involved_table_senders || show_table_involved_senders"/>
                      <p class="chart_info_nomail" v-if="!is_loading_involved_table_senders && !show_table_involved_senders" v-text="no_mails_received_yesterday"></p>
    </div>
  </div>
</template>



<script setup>
import { ref, onMounted, nextTick, computed} from 'vue';
import { tsLogger } from '@statslib/mzts-logger';
import { thunderStastsCore } from '@statslib/mzts-statscore';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import { tsUtils } from '@statslib/mzts-utils';
import CounterSentReceived from '../counters/CounterSentReceived.vue';
import ChartTime from '../charts/ChartTime.vue';
import TableInvolved from '../tables/TableInvolved.vue';
import { tsPrefs } from '@statslib/mzts-options';
import { i18n } from "@statslib/mzts-i18n.js";
import { tsStore } from '@statslib/mzts-store';
import { tsExport } from '@statslib/mzts-export';
import CounterManyDays_Table from '../counters/CounterManyDays_Table.vue';
import ExportMenu from '../ExportMenu.vue';
import WidgetDomains from '../widgets/WidgetDomains.vue';
import WidgetInboxZero from '../widgets/WidgetInboxZero.vue';
import WidgetFoldersTags from '../widgets/WidgetFoldersTags.vue';

const props = defineProps({
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
let is_last_business_day = ref(false);

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
let is_loading_yesterday_chart = ref(true);
let is_loading_involved_table_recipients = ref(true);
let is_loading_involved_table_senders = ref(true);
let is_loading_counter_inbox = ref(true);
let is_loading_counter_inbox_percent = ref(true);
let is_loading_inbox_chart_folders = ref(true);
let is_loading_inbox_chart_dates = ref(true);
let is_loading_counter_many_days = ref(true);
let is_loading_domains_chart = ref(true);
let is_loading_folders_chart = ref(true);
let is_loading_tags_chart = ref(true);

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
let counter_inbox_percent = ref(0);

let table_involved_recipients = ref([]);
let table_involved_senders = ref([]);
let show_table_involved_recipients = ref(false);
let show_table_involved_senders = ref(false);

let _export_data = ref({});

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

let chartData_Domains = ref({
    labels: [],
    datasets: []
});

let chartData_Folders = ref({
    labels: [],
    datasets: []
});

let chartData_Tags = ref({
    labels: [],
    datasets: []
});

let chartdata_yesterday_hours_sent = ref([]);
let chartdata_yesterday_hours_rcvd = ref([]);
let chartdata_inboxzero_folders = ref([]);
let chartdata_inboxzero_dates = ref([]);
let chartdata_domains_sent = ref([]);
let chartdata_domains_rcvd = ref([]);
let chartdata_domains_labels = ref([]);
let chartdata_folders_sent = ref([]);
let chartdata_folders_rcvd = ref([]);
let chartdata_folders_labels = ref([]);
let chartdata_tags_sent = ref([]);
let chartdata_tags_rcvd = ref([]);
let chartdata_tags_labels = ref([]);

let domains_chart_height = ref("275px");

let job_done = computed(() => {
    return !is_loading_counter_sent_rcvd.value &&
    !is_loading_yesterday_chart.value &&
    !is_loading_involved_table_recipients.value &&
    !is_loading_involved_table_senders.value &&
    !is_loading_counter_inbox.value &&
    !is_loading_counter_inbox_percent.value &&
    !is_loading_inbox_chart_folders.value &&
    !is_loading_inbox_chart_dates.value &&
    !is_loading_counter_many_days.value &&
    !is_loading_domains_chart.value &&
    !is_loading_tags_chart.value &&
    !is_loading_folders_chart.value;
})

onMounted(async () => {
    tsLog = new tsLogger("TAB_Yesterday", tsStore.do_debug);
    tsPrefs.logger = tsLog;
    yesterday_date_str.value = yesterday_date.value.toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
    _involved_num = await tsPrefs.getPref("_involved_num");
    top_recipients_title.value = browser.i18n.getMessage("TopRecipients", _involved_num);
    top_senders_title.value = browser.i18n.getMessage("TopSenders", _involved_num);
    no_mails_sent_yesterday.value = browser.i18n.getMessage("NoMailsSent")+" "+browser.i18n.getMessage("yesterday_small");
    no_mails_received_yesterday.value = browser.i18n.getMessage("NoMailsReceived")+" "+browser.i18n.getMessage("yesterday_small");
    no_mails_inbox.value = browser.i18n.getMessage("NoMailsInbox");
    folderLocationNote_text.value = browser.i18n.getMessage("InboxZeroFolderLocationNote");
});


async function updateData() {
    loadingDo();
    let prefs = await tsPrefs.getPrefs(["_time_chart_progressive", "accounts_adv_settings"]);
    do_progressive = prefs._time_chart_progressive;
    while(props.updated == false){
        await new Promise(r => setTimeout(r, 100));
    }
    let accounts_adv_settings = prefs.accounts_adv_settings;
    tsCore = new thunderStastsCore({do_debug: tsStore.do_debug, _involved_num: _involved_num, _many_days: _many_days, accounts_adv_settings: accounts_adv_settings});
    tsLog.log("props.accountEmails: " + JSON.stringify(props.accountEmails));
    getManyDaysData();
    getInboxZeroData();
    await Promise.all([getYesterdayData()]);
    tsLog.log("chartdata_yesterday_hours_sent.value: " + JSON.stringify(chartdata_yesterday_hours_sent.value));
    tsLog.log("chartdata_yesterday_hours_rcvd.value: " + JSON.stringify(chartdata_yesterday_hours_rcvd.value));
    chartData_Yesterday.value.datasets = [];
    chartData_Yesterday.value.datasets.push({
        label: 'ysent',
        data: chartdata_yesterday_hours_sent.value,
        borderColor: tsStore.chart_colors._time_sent,
        backgroundColor: tsStore.chart_colors._time_sent,
        borderWidth: 2,
        pointRadius: 1,
    })
    chartData_Yesterday.value.datasets.push({
        label: 'yrcvd',
        data: chartdata_yesterday_hours_rcvd.value,
        borderColor: tsStore.chart_colors._time_rcvd,
        backgroundColor: tsStore.chart_colors._time_rcvd,
        borderWidth: 2,
        pointRadius: 1,
    })
    // chart inbox zero folders
    let given_folders = tsCoreUtils.filterReceivedFolders(chartdata_inboxzero_folders.value);
    let folders_data = tsCoreUtils.getFoldersLabelsColors(given_folders);
    chartData_InboxZeroFolders.value.folder_paths = folders_data.folder_paths;
    chartData_InboxZeroFolders.value.labels = folders_data.labels;
    chartData_InboxZeroFolders.value.datasets = [];
    chartData_InboxZeroFolders.value.datasets.push({data:tsCoreUtils.getFoldersCounts(given_folders), backgroundColor: folders_data.colors, borderColor: folders_data.colors});
    tsLog.log("chartData_InboxZeroFolders.value: " + JSON.stringify(chartData_InboxZeroFolders.value));
    // chart inbox zero dates
    inbox0_openFolderInFirstTab.value = await tsPrefs.getPref("inbox0_openFolderInFirstTab");
    // chartData_InboxZeroDates.value.labels = ['date'];
    // chartData_InboxZeroDates.value.datasets = [];
    // chartData_InboxZeroDates.value.datasets = tsCoreUtils.transformInboxZeroDatesDataToDataset(chartdata_inboxzero_dates.value);
    // tsLog.log("chartData_InboxZeroDates.value: " + JSON.stringify(chartData_InboxZeroDates.value));
    // chart domains
    let chart_container_height = document.getElementById('chart_domains_yesterday').clientHeight;
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

    // chart folders
    chartData_Folders.value.labels = chartdata_folders_labels.value;
    chartData_Folders.value.datasets = [];
    chartData_Folders.value.datasets.push({
        label: 'tsent',
        data: chartdata_folders_sent.value,
        borderColor: tsStore.chart_colors._time_sent,
        backgroundColor: tsStore.chart_colors._time_sent,
        borderWidth: 2,
        pointRadius: 1,
    });
    chartData_Folders.value.datasets.push({
        label: 'trcvd',
        data: chartdata_folders_rcvd.value,
        borderColor: tsStore.chart_colors._time_rcvd,
        backgroundColor: tsStore.chart_colors._time_rcvd,
        borderWidth: 2,
        pointRadius: 1,
    });
    tsLog.log("chartData_Folders.value: " + JSON.stringify(chartData_Folders.value));
    tsLog.log("chartData_Folders.value.labels: " + JSON.stringify(chartData_Folders.value.labels));

    // chart tags
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
        is_loading_yesterday_chart.value = false;
        is_loading_inbox_chart_folders.value = false;
        // is_loading_inbox_chart_dates.value = false;
        showFolderLocationNoteAnchor.value = await tsCoreUtils.getFilterDuplicatesPreference(tsStore.current_account_id);
        await nextTick();
        i18n.updateDocument();
    });
};

    // get Yesterday
    function getYesterdayData () {
        return new Promise(async (resolve) => {
            let result_yesterday = null;
            // check Business Days
            let prefs_bday_use_last_business_day = await tsPrefs.getPref("bday_use_last_business_day");
            if(prefs_bday_use_last_business_day == true){
                if(tsCoreUtils.checkBusinessDay(tsUtils.dateToYYYYMMDD(yesterday_date.value)) == true){
                    is_last_business_day.value = false;
                    result_yesterday = await tsCore.getYesterday(tsStore.current_account_id, props.accountEmails);
                }else{
                    is_last_business_day.value = true;
                    let last_bday = tsCoreUtils.findPreviousBusinessDay(yesterday_date.value);
                    yesterday_date_str.value = last_bday.toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
                    emit('updateTabName', browser.i18n.getMessage("LastBusinessDay"));
                    result_yesterday = await tsCore.getSingleDay(last_bday,tsStore.current_account_id, props.accountEmails);
                    tsLog.log("using last business day: " + JSON.stringify(last_bday, null, 2));
                }
            }else{
                is_last_business_day.value = false;
                result_yesterday = await tsCore.getYesterday(tsStore.current_account_id, props.accountEmails);
            }
            tsLog.log("result_yesterday: " + JSON.stringify(result_yesterday, null, 2));
            counter_yesterday_rcvd.value = result_yesterday.received;
            counter_yesterday_sent.value = result_yesterday.sent;
            is_loading_counter_sent_rcvd.value = false;
            // export data
            _export_data.value[tsExport.export.time_emails.type] = result_yesterday.msg_hours;
            _export_data.value[tsExport.export.correspondents.type] = tsExport.mergeRecipientsAndSenders(result_yesterday.senders, result_yesterday.recipients);
            _export_data.value[tsExport.export.tags.type] = result_yesterday.tags;
            _export_data.value[tsExport.export.folders.type] = result_yesterday.folders;
            _export_data.value[tsExport.export.domains.type] = result_yesterday.domains;
            // chart yesterday hours
            const yesterday_hours_data = tsCoreUtils.transformCountDataToDataset(result_yesterday.msg_hours, do_progressive);
            chartdata_yesterday_hours_sent.value = yesterday_hours_data.dataset_sent;
            chartdata_yesterday_hours_rcvd.value = yesterday_hours_data.dataset_rcvd;
            //top senders list
            show_table_involved_senders.value =  Object.keys(result_yesterday.senders).length > 0;
            table_involved_senders.value = result_yesterday.senders;
            is_loading_involved_table_senders.value = false;
            //top recipients list
            show_table_involved_recipients.value =  Object.keys(result_yesterday.recipients).length > 0;
            table_involved_recipients.value = result_yesterday.recipients;
            is_loading_involved_table_recipients.value = false;
            // inbox zero folders
            chartdata_inboxzero_folders.value = result_yesterday.folders;
            if(result_yesterday.received > 0){
                counter_inbox_percent.value = (Math.round((1 - (result_yesterday.count_in_inbox / result_yesterday.received)) * 10000) / 100).toFixed(2) + '%';
            }else{
                counter_inbox_percent.value = '0%';
            }
            is_loading_counter_inbox_percent.value = false;
            // domains
            const domains_data = tsCoreUtils.transformCountDataToDataset(result_yesterday.domains, false, true);
            // console.log(">>>>>>>>>>>>> domains_data: " + JSON.stringify(domains_data, null, 2));
            chartdata_domains_sent.value = domains_data.dataset_sent;
            chartdata_domains_rcvd.value = domains_data.dataset_rcvd;
            chartdata_domains_labels.value = domains_data.labels;
            is_loading_domains_chart.value = false;
            // folders
            const folders_data = tsCoreUtils.transformCountDataToDataset(result_yesterday.folders, false, true);
            //  console.log(">>>>>>>>>>>>> folders_data: " + JSON.stringify(folders_data, null, 2));
            chartdata_folders_sent.value = folders_data.dataset_sent;
            chartdata_folders_rcvd.value = folders_data.dataset_rcvd;
            chartdata_folders_labels.value = folders_data.labels;
            is_loading_folders_chart.value = false;
            // tags
            const tags_data = tsCoreUtils.transformCountDataToDataset(result_yesterday.tags, false, true);
            //  console.log(">>>>>>>>>>>>> tags_data: " + JSON.stringify(tags_data, null, 2));
            chartdata_tags_sent.value = tags_data.dataset_sent;
            chartdata_tags_rcvd.value = tags_data.dataset_rcvd;
            chartdata_tags_labels.value = await tsCoreUtils.transformTagsLabels(tags_data.labels);
            is_loading_tags_chart.value = false;
            updateElapsed('getYesterdayData', result_yesterday.elapsed);
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

    // get 7 days data
    async function getManyDaysData () {
        return new Promise(async (resolve) => {
            let result_many_days = await tsCore.getToday_manyDaysData(tsStore.current_account_id, props.accountEmails);
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
    is_loading_yesterday_chart.value = true;
    is_loading_involved_table_recipients.value = true;
    is_loading_involved_table_senders.value = true;
    is_loading_counter_inbox.value = true;
    is_loading_counter_inbox_percent.value = true;
    is_loading_inbox_chart_folders.value = true;
    is_loading_inbox_chart_dates.value = true;
    is_loading_counter_many_days.value = true;
    is_loading_domains_chart.value = true;
    is_loading_folders_chart.value = true;
    is_loading_tags_chart.value = true;
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