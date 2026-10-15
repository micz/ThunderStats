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
    <ExportMenu ref="ExportMenu_ref" :export_data="_export_data" currentTab="tab-today" :showInternalExternal="show_internal_mail_percent" v-if="job_done" />
    <WidgetDayDashboard v-bind="day_model" :loading="dashboard_loading" :inbox_dates="result_inbox ? result_inbox.dates : {}" :inbox_loading="is_loading_counter_inbox">
        <template #rail>
            <div class="ts-card ts-rail-card" v-if="today_time_chart_show_yesterday">
                <div class="ts-rail-title">{{ comparison_card_title }}</div>
                <CounterYesterdayThisTime :is_loading="is_loading_counter_yesterday_thistime" :sent="counter_yesterday_thistime_sent" :rcvd="counter_yesterday_thistime_rcvd" :is_last_business_day="is_last_business_day" :last_bday_date="last_bday_text" :is_custom_comparison_day="is_custom_comparison_day" :custom_comparison_day_text="custom_comparison_day_text" :datepicker_format="datepickerFormat" :datepicker_locale="prefLocale" :is_dark="tsStore.darkmode" :is_job_done="job_done" @customDaySelected="onCustomComparisonDaySelected" />
            </div>
            <div class="ts-card ts-rail-card">
                <div class="ts-rail-title" v-text="previous_days_title"></div>
                <CounterManyDays_Table :is_loading="is_loading_counter_many_days" :sent_total="counter_many_days_sent_total" :sent_max="counter_many_days_sent_max" :sent_min="counter_many_days_sent_min" :sent_avg="counter_many_days_sent_avg" :rcvd_total="counter_many_days_rcvd_total" :rcvd_max="counter_many_days_rcvd_max" :rcvd_min="counter_many_days_rcvd_min" :rcvd_avg="counter_many_days_rcvd_avg" />
            </div>
        </template>
    </WidgetDayDashboard>
</template>


<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { tsLogger } from '@statslib/mzts-logger';
import { thunderStastsCore } from '@statslib/mzts-statscore';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import CounterYesterdayThisTime from '../counters/CounterYesterdayThisTime.vue';
import CounterManyDays_Table from '../counters/CounterManyDays_Table.vue';
import ExportMenu from '../ExportMenu.vue';
import { tsPrefs } from '@statslib/mzts-options';
import { i18n } from "@statslib/mzts-i18n.js";
import { tsStore } from '@statslib/mzts-store';
import { tsUtils } from '@statslib/mzts-utils';
import { tsExport } from '@statslib/mzts-export';
import { tsDayModel } from '@statslib/mzts-daymodel';
import { BASELINE_WEEKS } from '@statslib/mzts-insights';
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

const emit = defineEmits(['updateElapsed','updateYesterdayTabName']);

let tsLog = null;
var tsCore = null;

let previous_days_title = ref("");
const comparison_card_title = browser.i18n.getMessage("ComparisonCardTitle");
let is_last_business_day = ref(false);
let last_bday_text = ref("");
let customComparisonDay = ref(null);
let is_custom_comparison_day = ref(false);
let custom_comparison_day_text = ref("");
let datepickerFormat = ref("dd-MM-yyyy");
let prefLocale = ref("en-GB");

let do_progressive = ref(false);
let hide_future_hours = ref(true);
let today_time_chart_show_yesterday = ref(true);
let inbox0_openFolderInFirstTab = ref(false);
let filter_duplicates = ref(false);
let first_day_week = ref(1);

let elapsed = {
    'getManyDaysData':0,
    'getInboxZeroData':0,
    'getTodayData':0,
    'getYesterdayData':0,
    'getBaselineData':0,
}

let is_loading_counter_sent_rcvd = ref(true);
let is_loading_counter_yesterday_thistime = ref(true);
let is_loading_counter_many_days = ref(true);
let is_loading_counter_inbox = ref(true);
let is_loading_baseline = ref(true);

let show_internal_mail_percent = ref(false);
let internal_sent_percent = ref('0.00%');
let internal_rcvd_percent = ref('0.00%');
let counter_yesterday_thistime_sent = ref(0);
let counter_yesterday_thistime_rcvd = ref(0);
let counter_many_days_sent_total = ref(0);
let counter_many_days_sent_max = ref(0);
let counter_many_days_sent_min = ref(0);
let counter_many_days_sent_avg = ref(0);
let counter_many_days_rcvd_total = ref(0);
let counter_many_days_rcvd_max = ref(0);
let counter_many_days_rcvd_min = ref(0);
let counter_many_days_rcvd_avg = ref(0);

let _export_data = ref({});

let _involved_num = 10;
let _many_days = 7;

// raw results used to build the dashboard
let result_today = ref(null);
let result_inbox = ref(null);
let result_prev_days = ref(null);
let result_comparison_day = ref(null);
let baseline_days = ref(null);

let ExportMenu_ref = ref(null);

let job_done = computed(() => {
    return !is_loading_counter_sent_rcvd.value &&
    !is_loading_counter_yesterday_thistime.value &&
    !is_loading_counter_many_days.value &&
    !is_loading_counter_inbox.value &&
    !is_loading_baseline.value;
})

let comparison_day_label = computed(() => {
    if(is_custom_comparison_day.value) return custom_comparison_day_text.value;
    return browser.i18n.getMessage(is_last_business_day.value ? "LastBusinessDay" : "Yesterday");
});

let day_model = computed(() => tsDayModel.build({
    kind: 'today',
    day: new Date(),
    result: result_today.value,
    inbox: result_inbox.value,
    baseline_days: baseline_days.value,
    prev_days: result_prev_days.value,
    prev_days_num: _many_days,
    progressive: do_progressive.value,
    hide_future: hide_future_hours.value,
    cmp: (today_time_chart_show_yesterday.value && result_comparison_day.value) ? { msg_hours: result_comparison_day.value.msg_hours, label: comparison_day_label.value } : null,
    internal: { enabled: show_internal_mail_percent.value, sent_percent: internal_sent_percent.value, rcvd_percent: internal_rcvd_percent.value },
    involved_num: _involved_num,
    first_day_week: first_day_week.value,
    duplicates_note: filter_duplicates.value,
    open_folder_in_first_tab: inbox0_openFolderInFirstTab.value,
}));

let dashboard_loading = computed(() => ({
    strip: is_loading_counter_sent_rcvd.value,
    chart: is_loading_counter_sent_rcvd.value || is_loading_baseline.value,
    involved: is_loading_counter_sent_rcvd.value,
    domains: is_loading_counter_sent_rcvd.value,
    folders: is_loading_counter_sent_rcvd.value,
}));

onMounted(async () => {
    tsLog = new tsLogger("TAB_Today", tsStore.do_debug);
    tsPrefs.logger = tsLog;
    _involved_num = await tsPrefs.getPref("_involved_num");
    previous_days_title.value = browser.i18n.getMessage("PreviousDaysTitle", [_many_days]);
    prefLocale.value = await tsPrefs.getPref("datepicker_locale");
    datepickerFormat.value = tsUtils.formatDateStringLocale(prefLocale.value);
});


async function updateData() {
    loadingDo();
    let prefs = await tsPrefs.getPrefs(["_time_chart_progressive", "today_time_chart_show_yesterday", "today_time_chart_do_no_show_future", "accounts_adv_settings", "inbox0_openFolderInFirstTab", "show_internal_mail_percent", "first_day_week"]);
    do_progressive.value = prefs._time_chart_progressive;
    today_time_chart_show_yesterday.value = prefs.today_time_chart_show_yesterday;
    hide_future_hours.value = prefs.today_time_chart_do_no_show_future;
    inbox0_openFolderInFirstTab.value = prefs.inbox0_openFolderInFirstTab;
    first_day_week.value = Number(prefs.first_day_week);
    show_internal_mail_percent.value = prefs.show_internal_mail_percent && props.internalDomains.length > 0;
    filter_duplicates.value = await tsCoreUtils.getFilterDuplicatesPreference(tsStore.current_account_id);
    tsCore = new thunderStastsCore({do_debug: tsStore.do_debug, _involved_num: _involved_num, _many_days: _many_days, accounts_adv_settings: prefs.accounts_adv_settings});
    tsLog.log(() => "props.accountEmails: " + JSON.stringify(props.accountEmails));
    // main data first, then the secondary queries: every query runs on Thunderbird's main thread.
    // Today, yesterday, the previous days and the baseline all come from the one scan of the recent days cache
    await Promise.all([getTodayData(), getYesterdayData()]);
    getManyDaysData();
    getInboxZeroData();
    getBaselineData();
    nextTick(() => {
        i18n.updateDocument();
    });
};

    // get Today
    function getTodayData () {
        return new Promise(async (resolve) => {
            let result = await tsCore.getToday(tsStore.current_account_id, props.accountEmails, props.internalDomains);
            tsLog.log(() => "result_today: " + JSON.stringify(result, null, 2));
            if(show_internal_mail_percent.value) {
                let internalData = tsCoreUtils.getInternalMailLabel(result.domains);
                internal_sent_percent.value = internalData.sentPercent;
                internal_rcvd_percent.value = internalData.receivedPercent;
            }
            // export data
            _export_data.value[tsExport.export.time_emails.type] = result.msg_hours;
            _export_data.value[tsExport.export.correspondents.type] = tsExport.mergeSendersAndRecipients(result.senders, result.recipients);
            _export_data.value[tsExport.export.tags.type] = result.tags;
            _export_data.value[tsExport.export.folders.type] = result.folders;
            _export_data.value[tsExport.export.domains.type] = result.domains;
            result_today.value = result;
            is_loading_counter_sent_rcvd.value = false;
            updateElapsed('getTodayData', result.elapsed);
            resolve(true);
        });
    };

    function getInboxZeroData () {
        return new Promise(async (resolve) => {
            let result = await tsCore.getInboxZeroDates(tsStore.current_account_id);
            result_inbox.value = result;
            is_loading_counter_inbox.value = false;
            updateElapsed('getInboxZeroData', result.elapsed);
            resolve(true);
        });
    };

    // the same weekday in the previous weeks, for the "usual day"
    function getBaselineData () {
        return new Promise(async (resolve) => {
            let today = new Date();
            today.setHours(0, 0, 0, 0);
            let result = await tsCore.getWeekdayBaseline(today, tsStore.current_account_id, props.accountEmails, BASELINE_WEEKS);
            baseline_days.value = result.days;
            is_loading_baseline.value = false;
            updateElapsed('getBaselineData', result.elapsed);
            resolve(true);
        });
    };

    // get yesterday (or the comparison day) data
    async function getYesterdayData () {
        if(!today_time_chart_show_yesterday.value) {
            is_loading_counter_yesterday_thistime.value = false;
            updateElapsed('getYesterdayData', 1);
            return;
        }
        return new Promise(async (resolve) => {
            let result_yesterday = null;

            if(customComparisonDay.value != null) {
                // User chose a custom comparison day
                is_custom_comparison_day.value = true;
                is_last_business_day.value = false;
                let customDay = new Date(customComparisonDay.value);
                customDay.setHours(0, 0, 0, 0);
                result_yesterday = await tsCore.getToday_SingleDayData(customDay, tsStore.current_account_id, props.accountEmails);
                custom_comparison_day_text.value = customDay.toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
                tsLog.log(() => "using custom comparison day: " + JSON.stringify(customDay, null, 2));
            } else {
                // Default logic
                is_custom_comparison_day.value = false;
                custom_comparison_day_text.value = "";
                let yesterday_date = new Date();
                yesterday_date.setDate(yesterday_date.getDate() - 1);
                yesterday_date.setHours(0, 0, 0, 0);
                // check Business Days
                let prefs_bday_use_last_business_day = await tsPrefs.getPref("bday_use_last_business_day");
                if(prefs_bday_use_last_business_day == true){
                    if(tsCoreUtils.checkBusinessDay(tsUtils.dateToYYYYMMDD(yesterday_date)) == true){
                        is_last_business_day.value = false;
                        result_yesterday = await tsCore.getToday_YesterdayData(tsStore.current_account_id, props.accountEmails);
                    }else{
                        is_last_business_day.value = true;
                        emit('updateYesterdayTabName', browser.i18n.getMessage("LastBusinessDay"));
                        let last_bday = tsCoreUtils.findPreviousBusinessDay(yesterday_date);
                        result_yesterday = await tsCore.getToday_SingleDayData(last_bday,tsStore.current_account_id, props.accountEmails);
                        tsLog.log(() => "using last business day: " + JSON.stringify(last_bday, null, 2));
                        last_bday_text.value = browser.i18n.getMessage("LastBusinessDayIs") + " " + last_bday.toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
                    }
                }else{
                    is_last_business_day.value = false;
                    result_yesterday = await tsCore.getToday_YesterdayData(tsStore.current_account_id, props.accountEmails);
                }
            }

            tsLog.log(() => "result_today_yesterday_data: " + JSON.stringify(result_yesterday, null, 2));
            counter_yesterday_thistime_rcvd.value = result_yesterday.received;
            counter_yesterday_thistime_sent.value = result_yesterday.sent;
            result_comparison_day.value = result_yesterday;
            is_loading_counter_yesterday_thistime.value = false;
            updateElapsed('getYesterdayData', result_yesterday.elapsed);
            resolve(true);
        });
    };

  // get the previous days data
    async function getManyDaysData () {
        return new Promise(async (resolve) => {
            let result_many_days = await tsCore.getToday_manyDaysData(tsStore.current_account_id, props.accountEmails);
            tsLog.log(() => "result_today_manydays_data: " + JSON.stringify(result_many_days, null, 2));
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
    is_loading_counter_yesterday_thistime.value = true;
    is_loading_counter_many_days.value = true;
    is_loading_counter_inbox.value = true;
    is_loading_baseline.value = true;
    result_today.value = null;
    result_inbox.value = null;
    result_prev_days.value = null;
    result_comparison_day.value = null;
    baseline_days.value = null;
    elapsed = {
            'getManyDaysData':0,
            'getInboxZeroData':0,
            'getTodayData':0,
            'getYesterdayData':0,
            'getBaselineData':0,
        }
}

async function onCustomComparisonDaySelected(date) {
    customComparisonDay.value = date;
    if(date != null) {
        let d = new Date(date);
        d.setHours(0, 0, 0, 0);
        is_custom_comparison_day.value = true;
        custom_comparison_day_text.value = d.toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
    } else {
        is_custom_comparison_day.value = false;
        custom_comparison_day_text.value = "";
    }
    is_loading_counter_yesterday_thistime.value = true;
    await getYesterdayData();
}

function updateElapsed(function_name, time) {
    elapsed[function_name] = time;
    //console.log(">>>>>>>>>>>>> updateElapsed: " + JSON.stringify(elapsed));
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
