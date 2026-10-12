<!--
/*
 *  ThunderStats [https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/]
 *  Copyright (C) 2024 - 2026 Mic (m@micz.it)

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
    <ExportMenu ref="ExportMenu_ref" :export_data="_export_data" currentTab="tab-yesterday" :showInternalExternal="show_internal_mail_percent" v-if="job_done" />
    <WidgetDayDashboard v-bind="day_model" :loading="dashboard_loading">
        <template #rail>
            <div class="ts-card ts-rail-card">
                <div class="ts-rail-title" v-text="previous_days_title"></div>
                <CounterManyDays_Table :is_loading="is_loading_counter_many_days" :sent_total="counter_many_days_sent_total" :sent_max="counter_many_days_sent_max" :sent_min="counter_many_days_sent_min" :sent_avg="counter_many_days_sent_avg" :rcvd_total="counter_many_days_rcvd_total" :rcvd_max="counter_many_days_rcvd_max" :rcvd_min="counter_many_days_rcvd_min" :rcvd_avg="counter_many_days_rcvd_avg" />
            </div>
        </template>
        <template #bottom>
            <div class="ts-card">
                <div class="ts-card-head"><div class="ts-card-title">{{ inbox_details_title }}</div></div>
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
                    :inbox_percent_show_remaining="inbox_percent_remaining"
                    :is_loading_inbox_chart_folders="is_loading_inbox_chart_folders"
                    :no_mails_inbox="no_mails_inbox"
                    :chartData_InboxZeroDates="chartData_InboxZeroDates"
                    :chartData_InboxZeroDates_extended = "chartdata_inboxzero_dates"
                    :is_loading_inbox_chart_dates="is_loading_inbox_chart_dates"
                    :no_mails_received="no_mails_received_yesterday"
                />
            </div>
        </template>
    </WidgetDayDashboard>
</template>


<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { tsLogger } from '@statslib/mzts-logger';
import { thunderStastsCore } from '@statslib/mzts-statscore';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import { tsUtils } from '@statslib/mzts-utils';
import CounterManyDays_Table from '../counters/CounterManyDays_Table.vue';
import ExportMenu from '../ExportMenu.vue';
import { tsPrefs } from '@statslib/mzts-options';
import { i18n } from "@statslib/mzts-i18n.js";
import { tsStore } from '@statslib/mzts-store';
import { tsExport } from '@statslib/mzts-export';
import { tsDayModel } from '@statslib/mzts-daymodel';
import { BASELINE_WEEKS } from '@statslib/mzts-insights';
import WidgetInboxZero from '../widgets/WidgetInboxZero.vue';
import WidgetDayDashboard from '../widgets/WidgetDayDashboard.vue';


const props = defineProps({
    accountEmails: {
        type: Array,
        default: []
    },
    internalDomains: {
        type: Array,
        default: () => []
    },
});

const emit = defineEmits(['updateElapsed','updateTabName']);

let tsLog = null;
var tsCore = null;

let shown_day = ref(yesterdayMidnight());
let no_mails_received_yesterday = ref("");
let no_mails_inbox = ref("");
let previous_days_title = ref("");
const inbox_details_title = browser.i18n.getMessage("InboxDetailsTitle");
let is_last_business_day = ref(false);

let do_progressive = ref(false);
let inbox0_openFolderInFirstTab = ref(false);
let inbox_percent_remaining = ref(false);
let showFolderLocationNoteAnchor = ref(false);
let folderLocationNote_text = ref("");
let first_day_week = ref(1);

let elapsed = {
    'getManyDaysData':0,
    'getInboxZeroData':0,
    'getYesterdayData':0,
    'getBaselineData':0,
}

let is_loading_counter_sent_rcvd = ref(true);
let is_loading_counter_inbox = ref(true);
let is_loading_counter_inbox_percent = ref(true);
let is_loading_inbox_chart_folders = ref(true);
let is_loading_inbox_chart_dates = ref(true);
let is_loading_counter_many_days = ref(true);
let is_loading_baseline = ref(true);

let counter_yesterday_rcvd = ref(0);
let show_internal_mail_percent = ref(false);
let internal_sent_percent = ref('0.00%');
let internal_rcvd_percent = ref('0.00%');
let counter_many_days_sent_total = ref(0);
let counter_many_days_sent_max = ref(0);
let counter_many_days_sent_min = ref(0);
let counter_many_days_sent_avg = ref(0);
let counter_many_days_rcvd_total = ref(0);
let counter_many_days_rcvd_max = ref(0);
let counter_many_days_rcvd_min = ref(0);
let counter_many_days_rcvd_avg = ref(0);
let counter_inbox_percent = ref(0);

let _export_data = ref({});

let counter_inbox_total = ref(0);
let counter_inbox_unread = ref(0);

let _involved_num = 10;
let _many_days = 7;

// raw results used to build the dashboard
let result_day = ref(null);
let result_inbox = ref(null);
let result_prev_days = ref(null);
let baseline_days = ref(null);

let chartData_InboxZeroFolders = ref({
    labels: [],
    datasets: []
});

let chartData_InboxZeroDates = ref({
    labels: [],
    datasets: []
});

let chartdata_inboxzero_folders = ref([]);
let chartdata_inboxzero_dates = ref([]);

let ExportMenu_ref = ref(null);

let job_done = computed(() => {
    return !is_loading_counter_sent_rcvd.value &&
    !is_loading_counter_inbox.value &&
    !is_loading_counter_inbox_percent.value &&
    !is_loading_inbox_chart_folders.value &&
    !is_loading_inbox_chart_dates.value &&
    !is_loading_counter_many_days.value &&
    !is_loading_baseline.value;
})

let day_model = computed(() => tsDayModel.build({
    kind: is_last_business_day.value ? 'day' : 'yesterday',
    day: shown_day.value,
    result: result_day.value,
    inbox: result_inbox.value,
    baseline_days: baseline_days.value,
    prev_days: result_prev_days.value,
    prev_days_num: _many_days,
    progressive: do_progressive.value,
    hide_future: false,
    cmp: null,
    internal: { enabled: show_internal_mail_percent.value, sent_percent: internal_sent_percent.value, rcvd_percent: internal_rcvd_percent.value },
    involved_num: _involved_num,
    first_day_week: first_day_week.value,
}));

let dashboard_loading = computed(() => ({
    strip: is_loading_counter_sent_rcvd.value,
    chart: is_loading_counter_sent_rcvd.value || is_loading_baseline.value,
    involved: is_loading_counter_sent_rcvd.value,
    domains: is_loading_counter_sent_rcvd.value,
    folders: is_loading_counter_sent_rcvd.value,
}));

onMounted(async () => {
    tsLog = new tsLogger("TAB_Yesterday", tsStore.do_debug);
    tsPrefs.logger = tsLog;
    _involved_num = await tsPrefs.getPref("_involved_num");
    no_mails_received_yesterday.value = browser.i18n.getMessage("NoMailsReceived")+" "+browser.i18n.getMessage("yesterday_small");
    no_mails_inbox.value = browser.i18n.getMessage("NoMailsInbox");
    folderLocationNote_text.value = browser.i18n.getMessage("InboxZeroFolderLocationNote");
    previous_days_title.value = browser.i18n.getMessage("PreviousDaysTitle", [_many_days]);
});

function yesterdayMidnight() {
    let day = new Date();
    day.setDate(day.getDate() - 1);
    day.setHours(0, 0, 0, 0);
    return day;
}

async function updateData() {
    loadingDo();
    let prefs = await tsPrefs.getPrefs(["_time_chart_progressive", "accounts_adv_settings", "inbox_percent_remaining", "show_internal_mail_percent", "first_day_week", "bday_use_last_business_day"]);
    do_progressive.value = prefs._time_chart_progressive;
    inbox_percent_remaining.value = prefs.inbox_percent_remaining;
    first_day_week.value = Number(prefs.first_day_week);
    show_internal_mail_percent.value = prefs.show_internal_mail_percent && props.internalDomains.length > 0;
    tsCore = new thunderStastsCore({do_debug: tsStore.do_debug, _involved_num: _involved_num, _many_days: _many_days, accounts_adv_settings: prefs.accounts_adv_settings});

    // the day shown: yesterday, or the last business day when the option is on and yesterday was not one
    let day = yesterdayMidnight();
    is_last_business_day.value = false;
    if(prefs.bday_use_last_business_day && !tsCoreUtils.checkBusinessDay(tsUtils.dateToYYYYMMDD(day))) {
        is_last_business_day.value = true;
        day = tsCoreUtils.findPreviousBusinessDay(day);
        day.setHours(0, 0, 0, 0);
        emit('updateTabName', browser.i18n.getMessage("LastBusinessDay"));
        tsLog.log("using last business day: " + JSON.stringify(day, null, 2));
    }
    shown_day.value = day;

    getManyDaysData();
    getInboxZeroData();
    getBaselineData(day);
    await getDayData(day);
    // chart inbox zero folders
    let given_folders = tsCoreUtils.filterReceivedFolders(chartdata_inboxzero_folders.value);
    let folders_data = tsCoreUtils.getFoldersLabelsColors(given_folders);
    chartData_InboxZeroFolders.value.folder_paths = folders_data.folder_paths;
    if("folders" in folders_data){
        chartData_InboxZeroFolders.value.folders = folders_data.folders;
    }
    chartData_InboxZeroFolders.value.labels = folders_data.labels;
    chartData_InboxZeroFolders.value.datasets = [];
    chartData_InboxZeroFolders.value.datasets.push({data:tsCoreUtils.getFoldersCounts(given_folders), backgroundColor: folders_data.colors, borderColor: folders_data.colors});
    tsLog.log("chartData_InboxZeroFolders.value: " + JSON.stringify(chartData_InboxZeroFolders.value));
    inbox0_openFolderInFirstTab.value = await tsPrefs.getPref("inbox0_openFolderInFirstTab");

    nextTick(async () => {
        is_loading_inbox_chart_folders.value = false;
        showFolderLocationNoteAnchor.value = await tsCoreUtils.getFilterDuplicatesPreference(tsStore.current_account_id);
        await nextTick();
        i18n.updateDocument();
    });
};

    // get the data of the shown day
    function getDayData (day) {
        return new Promise(async (resolve) => {
            let result = await tsCore.getSingleDay(new Date(day), tsStore.current_account_id, props.accountEmails, props.internalDomains);
            tsLog.log("result_yesterday: " + JSON.stringify(result, null, 2));
            counter_yesterday_rcvd.value = result.received;
            if(show_internal_mail_percent.value) {
                let internalData = tsCoreUtils.getInternalMailLabel(result.domains);
                internal_sent_percent.value = internalData.sentPercent;
                internal_rcvd_percent.value = internalData.receivedPercent;
            }
            // export data
            _export_data.value[tsExport.export.time_emails.type] = result.msg_hours;
            _export_data.value[tsExport.export.correspondents.type] = tsExport.mergeRecipientsAndSenders(result.senders, result.recipients);
            _export_data.value[tsExport.export.tags.type] = result.tags;
            _export_data.value[tsExport.export.folders.type] = result.folders;
            _export_data.value[tsExport.export.domains.type] = result.domains;
            // inbox zero folders
            chartdata_inboxzero_folders.value = result.folders;
            if(result.received > 0){
                let ratio = inbox_percent_remaining.value ? (result.count_in_inbox / result.received) : (1 - (result.count_in_inbox / result.received));
                counter_inbox_percent.value = (Math.round(ratio * 10000) / 100).toFixed(2) + '%';
            }else{
                counter_inbox_percent.value = '0%';
            }
            is_loading_counter_inbox_percent.value = false;
            result_day.value = result;
            is_loading_counter_sent_rcvd.value = false;
            updateElapsed('getYesterdayData', result.elapsed);
            resolve(true);
        });
    };

    function getInboxZeroData () {
        return new Promise(async (resolve) => {
            let result = await tsCore.getInboxZeroDates(tsStore.current_account_id, props.accountEmails);
            counter_inbox_total.value = result.total;
            counter_inbox_unread.value = result.unread;
            // inbox zero dates
            chartdata_inboxzero_dates.value = result.dates;
            result_inbox.value = result;
            is_loading_counter_inbox.value = false;
            chartData_InboxZeroDates.value.labels = ['date'];
            chartData_InboxZeroDates.value.datasets = [];
            chartData_InboxZeroDates.value.datasets = tsCoreUtils.transformInboxZeroDatesDataToDataset(chartdata_inboxzero_dates.value);
            tsLog.log("chartData_InboxZeroDates.value: " + JSON.stringify(chartData_InboxZeroDates.value));
            nextTick(() => {
                is_loading_inbox_chart_dates.value = false;
            });
            updateElapsed('getInboxZeroData', result.elapsed);
            resolve(true);
        });
    };

    // the same weekday in the previous weeks, for the "usual day"
    function getBaselineData (day) {
        return new Promise(async (resolve) => {
            let result = await tsCore.getWeekdayBaseline(new Date(day), tsStore.current_account_id, props.accountEmails, BASELINE_WEEKS);
            baseline_days.value = result.days;
            is_loading_baseline.value = false;
            updateElapsed('getBaselineData', result.elapsed);
            resolve(true);
        });
    };

  // get the previous days data
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
            result_prev_days.value = result_many_days.msg_days;
            is_loading_counter_many_days.value = false;
            updateElapsed('getManyDaysData', result_many_days.elapsed);
            resolve(true);
        });
    };


function loadingDo(){
    is_loading_counter_sent_rcvd.value = true;
    is_loading_counter_inbox.value = true;
    is_loading_counter_inbox_percent.value = true;
    is_loading_inbox_chart_folders.value = true;
    is_loading_inbox_chart_dates.value = true;
    is_loading_counter_many_days.value = true;
    is_loading_baseline.value = true;
    result_day.value = null;
    result_inbox.value = null;
    result_prev_days.value = null;
    baseline_days.value = null;
    elapsed = {
            'getManyDaysData':0,
            'getInboxZeroData':0,
            'getYesterdayData':0,
            'getBaselineData':0,
        }
}

function updateElapsed(function_name, time) {
    elapsed[function_name] = time;
    const allNonZero = Object.values(elapsed).every(value => value !== 0);
    if (allNonZero) {
        emit('updateElapsed', Math.max(...Object.values(elapsed)));
    }
}

function openExportMenu(anchor_el) {
  if(ExportMenu_ref.value) ExportMenu_ref.value.openExportMenu(null, anchor_el);
}

defineExpose({ updateData, openExportMenu });

</script>


<style scoped>
</style>
