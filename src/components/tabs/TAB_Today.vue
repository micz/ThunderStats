<template>
    <div class="square_container">
    <div class="square_item"><div class="list_heading_wrapper"><h2 class="list_heading cropped">__MSG_Mails__</h2>
        <span id="today_date" class="list_heading_date" v-html="today_date"></span></div>
        <CounterSentReceived :is_loading="is_loading_counter_sent_rcvd" :today_sent="counter_today_sent" :today_rcvd="counter_today_rcvd" />
        <CounterYesterdayThisTime :is_loading="is_loading_counter_yesterday_thistime" :sent="counter_yesterday_thistime_sent" :rcvd="counter_yesterday_thistime_rcvd" />
        <CounterManyDays :is_loading="is_loading_counter_many_days" :sent_max="counter_many_days_sent_max" :sent_min="counter_many_days_sent_min" :sent_avg="counter_many_days_sent_avg" :rcvd_max="counter_many_days_rcvd_max" :rcvd_min="counter_many_days_rcvd_min" :rcvd_avg="counter_many_days_rcvd_avg" />
        <GraphToday :chartData="chartData_Today" :is_loading="is_loading_today_graph" />
    </div>
    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped">__MSG_InboxZeroStatus__</h2>
					  </div>
					  <CounterInbox :is_loading="is_loading_counter_inbox" :inbox_total="counter_inbox_total" :inbox_unread="counter_inbox_unread" />
                      <div class="chart_inbox0">
                        <p class="chart_info">__MSG_FolderLocation__</p><p class="chart_info_nomail" id="today_inbox0_folder_spread_nomails" v-if="!is_loading_counter_sent_rcvd && (counter_today_rcvd == 0)">__MSG_NoMailsReceived__</p>
                        <GraphInboxZeroFolders :chartData="chartData_InboxZeroFolders" :is_loading="is_loading_inbox_graph_folders" />
                      </div>
                      <div class="chart_inbox0_datemsg">
                        <p class="chart_info">__MSG_InboxMailsDateSpreading__</p><p class="chart_info_nomail" id="today_inbox0_datemsg_nomails" v-if="!is_loading_counter_inbox && (counter_inbox_total == 0)">__MSG_NoMailsInbox__</p>
                        <GraphInboxZeroDates :chartData="chartData_InboxZeroDates" :is_loading="is_loading_inbox_graph_dates" />
                      </div>
                    </div>
    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped">__MSG_TopRecipients__</h2>
					  </div>
					  <TableInvolved :is_loading="is_loading_involved_table_recipients" :tableData="table_involved_recipients" />
                    </div>
    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped">__MSG_TopSenders__</h2>
					  </div>
                      <TableInvolved :is_loading="is_loading_involved_table_senders" :tableData="table_involved_senders"/></div>
  </div>
</template>



<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { tsLogger } from '@statslib/mzts-logger';
import { thunderStastsCore } from '@statslib/mzts-statscore';
import { tsUtils } from '@statslib/mzts-utils';
import CounterSentReceived from '../counters/CounterSentReceived.vue';
import CounterYesterdayThisTime from '../counters/CounterYesterdayThisTime.vue';
import CounterManyDays from '../counters/CounterManyDays.vue';
import GraphToday from '../graphs/GraphToday.vue';
import GraphInboxZeroFolders from '../graphs/GraphInboxZeroFolders.vue';
import GraphInboxZeroDates from '../graphs/GraphInboxZeroDates.vue';
import TableInvolved from '../tables/TableInvolved.vue';
import CounterInbox from '../counters/CounterInbox.vue';
import { TS_prefs } from '@statslib/mzts-options';
import { i18n } from "@statslib/mzts-i18n.js";

const props = defineProps({
    activeAccount: {
        type: Number,
        default: 0
    },
    accountEmails: {
        type: Array,
        default: []
    },
    do_debug: {
        type: Boolean,
        default: false
    }
});


let tsLog = null;
var tsCore = null;

let today_date = ref("");

let do_progressive = true;

let is_loading_counter_sent_rcvd = ref(true);
let is_loading_counter_yesterday_thistime = ref(true);
let is_loading_counter_many_days = ref(true);
let is_loading_today_graph = ref(true);
let is_loading_involved_table_recipients = ref(true);
let is_loading_involved_table_senders = ref(true);
let is_loading_counter_inbox = ref(true);
let is_loading_inbox_graph_folders = ref(true);
let is_loading_inbox_graph_dates = ref(true);

let counter_today_sent = ref(0);
let counter_today_rcvd = ref(0);
let counter_yesterday_thistime_sent = ref(0);
let counter_yesterday_thistime_rcvd = ref(0);
let counter_many_days_sent_max = ref(0);
let counter_many_days_sent_min = ref(0);
let counter_many_days_sent_avg = ref(0);
let counter_many_days_rcvd_max = ref(0);
let counter_many_days_rcvd_min = ref(0);
let counter_many_days_rcvd_avg = ref(0);

let table_involved_recipients = ref([]);
let table_involved_senders = ref([]);

let counter_inbox_total = ref(0);
let counter_inbox_unread = ref(0);


let chartData_Today = ref({
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

let graphdata_today_hours_sent = ref([]);
let graphdata_today_hours_rcvd = ref([]);
let graphdata_yesterday_hours_sent = ref([]);
let graphdata_yesterday_hours_rcvd = ref([]);
let graphdata_inboxzero_folders = ref([]);
let graphdata_inboxzero_dates = ref([]);

onMounted(async () => {
    today_date.value = new Date().toLocaleDateString();
});


async function updateData() {
    loadingDo();
    do_progressive = await TS_prefs.getPref("today_time_graph_progressive");
    while(props.updated == false){
        await new Promise(r => setTimeout(r, 100));
    }
    tsCore = new thunderStastsCore(props.do_debug);
    tsLog = new tsLogger("TAB_Today", props.do_debug);
    tsLog.log("props.accountEmails: " + JSON.stringify(props.accountEmails));
    getManyDaysData();
    await Promise.all([getTodayData(), getYesterdayData(), getInboxZeroData()]);
    tsLog.log("graphdata_today_hours_sent.value: " + JSON.stringify(graphdata_today_hours_sent.value));
    tsLog.log("graphdata_today_hours_rcvd.value: " + JSON.stringify(graphdata_today_hours_rcvd.value));
    chartData_Today.value.datasets = [];
    chartData_Today.value.datasets.push({
        tsID: 'ts',
        label: 'today sent',
        data: graphdata_today_hours_sent.value,
        borderColor: '#1f77b4',
        backgroundColor: '#1f77b4',
        order: 1,
        borderWidth: 2,
        pointRadius: 1,
    })
    chartData_Today.value.datasets.push({
        tsID: 'tr',
        label: 'today received',
        data: graphdata_today_hours_rcvd.value,
        borderColor: '#ff7f0e',
        backgroundColor: '#ff7f0e',
        order: 1,
        borderWidth: 2,
        pointRadius: 1,
    })
    chartData_Today.value.datasets.push({
        tsID: 'ys',
        label: 'yesterday sent',
        data: graphdata_yesterday_hours_sent.value,
        borderColor: '#17becf',
        backgroundColor: '#17becf',
        borderDash: [12, 3, 3],
        pointStyle: false,
        borderWidth: 2,
    })
    chartData_Today.value.datasets.push({
        tsID: 'yr',
        label: 'yesterday received',
        data: graphdata_yesterday_hours_rcvd.value,
        borderColor: '#ffbb78',
        backgroundColor: '#ffbb78',
        borderDash: [12, 3, 3],
        pointStyle: false,
        borderWidth: 2,
    })
    // graph inbox zero folders
    let folders_data = tsUtils.getFoldersLabelsColors(graphdata_inboxzero_folders.value);
    chartData_InboxZeroFolders.value.labels = folders_data.labels;
    chartData_InboxZeroFolders.value.datasets = [];
    chartData_InboxZeroFolders.value.datasets.push({data:tsUtils.getFoldersCounts(graphdata_inboxzero_folders.value), backgroundColor: folders_data.colors, borderColor: folders_data.colors});
    tsLog.log("chartData_InboxZeroFolders.value: " + JSON.stringify(chartData_InboxZeroFolders.value));
    // graph inbox zero dates
    chartData_InboxZeroDates.value.labels = ['date'];
    chartData_InboxZeroDates.value.datasets = [];
    chartData_InboxZeroDates.value.datasets = tsUtils.transformDatesDataToDataset(graphdata_inboxzero_dates.value);
    tsLog.log("chartData_InboxZeroDates.value: " + JSON.stringify(chartData_InboxZeroDates.value));
    nextTick(() => {
        is_loading_today_graph.value = false;
        is_loading_inbox_graph_folders.value = false;
        is_loading_inbox_graph_dates.value = false;
        i18n.updateDocument();
    });
};

    // get Today
    function getTodayData () {
        return new Promise(async (resolve) => {
            let result_today = await tsCore.getToday(props.activeAccount, props.accountEmails);
            tsLog.log("result_today: " + JSON.stringify(result_today, null, 2));
            counter_today_rcvd.value = result_today.received;
            counter_today_sent.value = result_today.sent;
            is_loading_counter_sent_rcvd.value = false;
            // graph today hours
            const today_hours_data = tsUtils.transformHoursDataToDataset(result_today.msg_hours, do_progressive);
            graphdata_today_hours_sent.value = today_hours_data.dataset_sent;
            graphdata_today_hours_rcvd.value = today_hours_data.dataset_rcvd;
            //top senders list
            table_involved_senders.value = result_today.senders;
            is_loading_involved_table_senders.value = false;
            //top recipients list
            table_involved_recipients.value = result_today.recipients;
            is_loading_involved_table_recipients.value = false;
            // inbox zero folders
            graphdata_inboxzero_folders.value = result_today.folders;
            resolve(true);
        });
    };

    function getInboxZeroData () {
        return new Promise(async (resolve) => {
            let result_inbox = await tsCore.getInboxZeroData(props.activeAccount, props.accountEmails);
            counter_inbox_total.value = result_inbox.total;
            counter_inbox_unread.value = result_inbox.unread;
            // inbox zero dates
            graphdata_inboxzero_dates.value = result_inbox.dates;
            is_loading_counter_inbox.value = false;
            resolve(true);
        });
    };

    // get yesterday data
    function getYesterdayData () {
        return new Promise(async (resolve) => {
            let result_yesterday = await tsCore.getToday_YesterdayData(props.activeAccount, props.accountEmails);
            tsLog.log("result_today_yesterday_data: " + JSON.stringify(result_yesterday, null, 2));
            counter_yesterday_thistime_rcvd.value = result_yesterday.received;
            counter_yesterday_thistime_sent.value = result_yesterday.sent;
            is_loading_counter_yesterday_thistime.value = false;
            // graph yesterday hours
            const yesterday_hours_data = tsUtils.transformHoursDataToDataset(result_yesterday.msg_hours, do_progressive);
            graphdata_yesterday_hours_sent.value = yesterday_hours_data.dataset_sent;
            graphdata_yesterday_hours_rcvd.value = yesterday_hours_data.dataset_rcvd;
            resolve(true);
        });
    };

  // get 7 days data
    function getManyDaysData () {
        return new Promise(async (resolve) => {
            let result_many_days = await tsCore.getToday_manyDaysData(props.activeAccount, props.accountEmails);
            tsLog.log("result_today_manydays_data: " + JSON.stringify(result_many_days, null, 2));
            counter_many_days_rcvd_max.value = result_many_days.max_received;
            counter_many_days_rcvd_min.value = result_many_days.min_received;
            counter_many_days_rcvd_avg.value = result_many_days.avg_received;
            counter_many_days_sent_max.value = result_many_days.max_sent;
            counter_many_days_sent_min.value = result_many_days.min_sent;
            counter_many_days_sent_avg.value = result_many_days.avg_sent;
            is_loading_counter_many_days.value = false;
            resolve(true);
        });
    };


function loadingDo(){
    is_loading_counter_sent_rcvd.value = true;
    is_loading_counter_yesterday_thistime.value = true;
    is_loading_counter_many_days.value = true;
    is_loading_today_graph.value = true;
    is_loading_involved_table_recipients.value = true;
    is_loading_involved_table_senders.value = true;
    is_loading_counter_inbox.value = true;
    is_loading_inbox_graph_folders.value = true;
    is_loading_inbox_graph_dates.value = true;
}

defineExpose({ updateData });

</script>




<style scoped>

</style>