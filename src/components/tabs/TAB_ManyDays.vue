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
    <ExportMenu ref="ExportMenu_ref" :export_data="_export_data" currentTab="tab-manydays" :showInternalExternal="show_internal_mail_percent" v-if="job_done" />
    <WidgetPeriodDashboard v-bind="period_model" :loading="dashboard_loading" />
</template>



<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { tsLogger } from '@statslib/mzts-logger';
import { thunderStastsCore } from '@statslib/mzts-statscore';
import { tsUtils } from '@statslib/mzts-utils';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import ExportMenu from '../ExportMenu.vue';
import { tsPrefs } from '@statslib/mzts-options';
import { i18n } from "@statslib/mzts-i18n.js";
import { tsStore } from '@statslib/mzts-store';
import { tsExport } from '@statslib/mzts-export';
import { tsPeriodModel } from '@statslib/mzts-periodmodel';
import WidgetPeriodDashboard from '../widgets/WidgetPeriodDashboard.vue';


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

const emit = defineEmits(['updateElapsed']);

let tsLog = null;
var tsCore = null;

let show_internal_mail_percent = ref(false);
let internal_sent_percent = ref('0.00%');
let internal_rcvd_percent = ref('0.00%');

let is_loading_data = ref(true);
let is_loading_inbox = ref(true);
let is_loading_prev = ref(true);

let _export_data = ref({});

let _involved_num = 10;
let _many_days = ref(7);
let _many_days_show_inbox = ref(true);
let first_day_week = ref(1);

// raw results used to build the dashboard
let result_period = ref(null);
let result_inbox = ref(null);
let result_prev = ref(null);
let aggregate = ref(null);

let elapsed = {
    'getManyDaysData': 0,
    'getInboxZeroData': 0,
    'getPreviousPeriodData': 0,
}

let ExportMenu_ref = ref(null);

let job_done = computed(() => {
    return !is_loading_data.value && !is_loading_inbox.value && !is_loading_prev.value;
})

// the last _many_days days plus today, oldest first
let period_days = computed(() => {
    let keys = [];
    for(let i = _many_days.value; i >= 0; i--) {
        let day = new Date();
        day.setDate(day.getDate() - i);
        keys.push(tsUtils.dateToYYYYMMDD(day));
    }
    return keys;
});

let today_key = computed(() => period_days.value[period_days.value.length - 1]);

let period_model = computed(() => tsPeriodModel.build({
    kind: 'manydays',
    days: period_days.value,
    stat_days: period_days.value.slice(0, -1),
    today_key: today_key.value,
    result: result_period.value,
    inbox: result_inbox.value,
    prev: result_prev.value,
    aggregate: aggregate.value,
    only_businessdays: tsStore.businessdays_only,
    show_inbox: _many_days_show_inbox.value,
    internal: { enabled: show_internal_mail_percent.value, sent_percent: internal_sent_percent.value, rcvd_percent: internal_rcvd_percent.value },
    involved_num: _involved_num,
    first_day_week: first_day_week.value,
}));

let dashboard_loading = computed(() => ({
    strip: is_loading_data.value,
    chart: is_loading_data.value,
    involved: is_loading_data.value,
    domains: is_loading_data.value,
    folders: is_loading_data.value,
}));

onMounted(async () => {
    tsLog = new tsLogger("TAB_ManyDays", tsStore.do_debug);
    tsPrefs.logger = tsLog;
    let prefs = await tsPrefs.getPrefs(["_involved_num", "_many_days", "first_day_week", "many_days_show_inbox"]);
    _involved_num = prefs._involved_num;
    _many_days.value = prefs._many_days;
    _many_days_show_inbox.value = prefs.many_days_show_inbox;
    first_day_week.value = Number(prefs.first_day_week);
    tsStore.first_day_week = prefs.first_day_week;
});

async function updateData() {
    loadingDo();
    let prefs = await tsPrefs.getPrefs(["accounts_adv_settings", "show_internal_mail_percent", "_many_days", "many_days_show_inbox", "first_day_week"]);
    _many_days.value = prefs._many_days;
    _many_days_show_inbox.value = prefs.many_days_show_inbox;
    first_day_week.value = Number(prefs.first_day_week);
    show_internal_mail_percent.value = prefs.show_internal_mail_percent && props.internalDomains.length > 0;
    tsCore = new thunderStastsCore({do_debug: tsStore.do_debug, _involved_num: _involved_num, _many_days: _many_days.value, accounts_adv_settings: prefs.accounts_adv_settings});
    tsLog.log("props.accountEmails: " + JSON.stringify(props.accountEmails));
    getInboxZeroData();
    getPreviousPeriodData();
    await getManyDaysData();
    nextTick(() => {
        i18n.updateDocument();
    });
};

    // get many days data
    function getManyDaysData () {
        return new Promise(async (resolve) => {
            let result = await tsCore.getManyDaysData(tsStore.current_account_id, props.accountEmails, props.internalDomains);
            tsLog.log("result_manydays_data: " + JSON.stringify(result, null, 2));
            // export data
            _export_data.value[tsExport.export.time_emails.type] = result.msg_hours;
            _export_data.value[tsExport.export.daily_mails.type] = result.dates;
            _export_data.value[tsExport.export.correspondents.type] = tsExport.mergeRecipientsAndSenders(result.senders, result.recipients);
            _export_data.value[tsExport.export.tags.type] = result.tags;
            _export_data.value[tsExport.export.folders.type] = result.folders;
            _export_data.value[tsExport.export.domains.type] = result.domains;
            _export_data.value[tsExport.export.weekdays.type] = result.msg_weekdays;
            if(show_internal_mail_percent.value) {
                let internalData = tsCoreUtils.getInternalMailLabel(result.domains);
                internal_sent_percent.value = internalData.sentPercent;
                internal_rcvd_percent.value = internalData.receivedPercent;
            }
            // total / max / min / average without today (business days only with the bday_default_only pref)
            let dates_without_today = Object.assign({}, result.dates);
            delete dates_without_today[tsUtils.dateToYYYYMMDD(new Date())];
            aggregate.value = await tsCore.aggregateData(dates_without_today);
            tsLog.log("aggregate: " + JSON.stringify(aggregate.value, null, 2));
            result_period.value = result;
            is_loading_data.value = false;
            updateElapsed('getManyDaysData', result.elapsed);
            resolve(true);
        });
    };

    function getInboxZeroData () {
        return new Promise(async (resolve) => {
            let result = await tsCore.getInboxZeroDates(tsStore.current_account_id);
            result_inbox.value = result;
            is_loading_inbox.value = false;
            updateElapsed('getInboxZeroData', result.elapsed);
            resolve(true);
        });
    };

    // the same number of days before the period, for the KPI changes
    function getPreviousPeriodData () {
        return new Promise(async (resolve) => {
            let result = await tsCore.getManyDaysPreviousPeriod(tsStore.current_account_id, props.accountEmails);
            result_prev.value = { sent: result.sent, received: result.received };
            is_loading_prev.value = false;
            updateElapsed('getPreviousPeriodData', result.elapsed);
            resolve(true);
        });
    };


function loadingDo(){
    is_loading_data.value = true;
    is_loading_inbox.value = true;
    is_loading_prev.value = true;
    result_period.value = null;
    result_inbox.value = null;
    result_prev.value = null;
    aggregate.value = null;
    elapsed = {
        'getManyDaysData': 0,
        'getInboxZeroData': 0,
        'getPreviousPeriodData': 0,
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
