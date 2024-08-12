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
    <div class="square_item"><div class="list_heading_wrapper">
                        <h2 class="list_heading cropped">__MSG_SentMails__: <span v-if="!is_loading_counter_sent_rcvd">{{ sent_total }}</span><span v-if="sent_today > 0"> (+<span>{{ sent_today }}</span> __MSG_today_small__)</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="is_loading_counter_sent_rcvd"/><InfoTooltip :showAnchor="showTotalInfoTooltip" :noteText="totalInfoTooltip_text"></InfoTooltip></h2>
                        <CounterManyDays_Row :is_loading="is_loading_counter_many_days" :_total="counter_many_days_sent_total" :_max="counter_many_days_sent_max" :_min="counter_many_days_sent_min" :_avg="counter_many_days_sent_avg" :showTotalInfoTooltip="showTotalInfoTooltip" :totalBDInfoTooltip_text="totalBDInfoTooltip_text"/>
                      </div>
                      <GraphManyDays :chartData="chartData_Sent" :is_loading="is_loading_sent_graph" :key="chartData_Sent_length" />
    </div>

    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped">__MSG_ReceivedMails__: <span v-if="!is_loading_counter_sent_rcvd">{{ rcvd_total }}</span><span v-if="rcvd_today > 0"> (+<span>{{ rcvd_today }}</span> __MSG_today_small__)</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="is_loading_counter_sent_rcvd"/><InfoTooltip :showAnchor="showTotalInfoTooltip" :noteText="totalInfoTooltip_text"></InfoTooltip></h2>
                        <CounterManyDays_Row :is_loading="is_loading_counter_many_days" :_total="counter_many_days_rcvd_total" :_max="counter_many_days_rcvd_max" :_min="counter_many_days_rcvd_min" :_avg="counter_many_days_rcvd_avg" :showTotalInfoTooltip="showTotalInfoTooltip" :totalBDInfoTooltip_text="totalBDInfoTooltip_text"/>
					  </div>
					  <GraphManyDays :chartData="chartData_Rcvd" :is_loading="is_loading_rcvd_graph" :key="chartData_Rcvd_length" />
    </div>

    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped lowercase" v-text="top_recipients_title"></h2>
					  </div>
					  <TableInvolved :is_loading="is_loading_involved_table_recipients" :tableData="table_involved_recipients" v-if="is_loading_involved_table_recipients || show_table_involved_recipients" />
                    <p class="chart_info_nomail" v-if="!is_loading_involved_table_recipients && !show_table_involved_recipients">__MSG_NoMailsSent__</p>
    </div>
    
    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped lowercase" v-text="top_senders_title"></h2>
					  </div>
                      <TableInvolved :is_loading="is_loading_involved_table_senders" :tableData="table_involved_senders" v-if="is_loading_involved_table_senders || show_table_involved_senders"/>
                      <p class="chart_info_nomail" v-if="!is_loading_involved_table_senders && !show_table_involved_senders">__MSG_NoMailsReceived__</p>
    </div>
  </div>
</template>



<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { tsLogger } from '@statslib/mzts-logger';
import { thunderStastsCore } from '@statslib/mzts-statscore';
import { tsUtils } from '@statslib/mzts-utils';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import TableInvolved from '../tables/TableInvolved.vue';
import GraphManyDays from '../graphs/GraphManyDays.vue';
import CounterManyDays_Row from '../counters/CounterManyDays_Row.vue';
import InfoTooltip from '../InfoTooltip.vue';
import { TS_prefs } from '@statslib/mzts-options';
import { i18n } from "@statslib/mzts-i18n.js";
import { tsStore } from '@statslib/mzts-store';

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

const emit = defineEmits(['updateElapsed']);


let tsLog = null;
var tsCore = null;

let top_recipients_title = ref("");
let top_senders_title = ref("");

let sent_total = ref(0);
let sent_today = ref(0);
let rcvd_total = ref(0);
let rcvd_today = ref(0);

let is_loading_counter_sent_rcvd = ref(true);
let is_loading_counter_many_days = ref(true);
let is_loading_involved_table_recipients = ref(true);
let is_loading_involved_table_senders = ref(true);
let is_loading_sent_graph = ref(true);
let is_loading_rcvd_graph = ref(true);

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

let graphdata_manydays_sent = ref([]);
let graphdata_manydays_rcvd = ref([]);
let graphdata_manydays_labels = ref([]);

let _involved_num = 10;
let _many_days = 7;

let showTotalInfoTooltip = ref(false);
let totalInfoTooltip_text = ref("");
let totalBDInfoTooltip_text = ref("");

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



onMounted(async () => {
    tsLog = new tsLogger("TAB_ManyDays", tsStore.do_debug);
    TS_prefs.logger = tsLog;
    today_date.value = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
    _involved_num = await TS_prefs.getPref("_involved_num");
    _many_days = await TS_prefs.getPref("_many_days");
    top_recipients_title.value = browser.i18n.getMessage("TopRecipients", _involved_num);
    top_senders_title.value = browser.i18n.getMessage("TopSenders", _involved_num);
    showTotalInfoTooltip.value = tsStore.businessdays_only;
    totalInfoTooltip_text.value = browser.i18n.getMessage("InfoTotal_AllMails");
    totalBDInfoTooltip_text.value = browser.i18n.getMessage("InfoTotal_BDMails_Only");
});


async function updateData() {
    loadingDo();
    while(props.updated == false){
        await new Promise(r => setTimeout(r, 100));
    }
    let accounts_adv_settings = await TS_prefs.getPref("accounts_adv_settings");
    tsCore = new thunderStastsCore({do_debug: tsStore.do_debug, _involved_num: _involved_num, _many_days: _many_days, accounts_adv_settings: accounts_adv_settings});
    tsLog.log("props.accountEmails: " + JSON.stringify(props.accountEmails));
    await Promise.all([getManyDaysData()]);
    chartData_Sent.value.datasets = [];
    chartData_Sent.value.datasets.push({
        label: 'Sent',
        data: graphdata_manydays_sent.value,
        borderColor: (ctx) => {
            return tsCoreUtils.getManyDaysBarColor(ctx, Object.keys(graphdata_manydays_sent.value).length);
        },
        backgroundColor:  (ctx) => {
            return tsCoreUtils.getManyDaysBarColor(ctx, Object.keys(graphdata_manydays_sent.value).length);
        },
        borderWidth: 2,
        pointRadius: 1,
    });
    tsLog.log("graphdata_manydays_sent.value: " + JSON.stringify(graphdata_manydays_sent.value));
    chartData_Sent.value.labels = graphdata_manydays_labels.value;
    chartData_Rcvd.value.datasets = [];
    chartData_Rcvd.value.datasets.push({
        label: 'Received',
        data: graphdata_manydays_rcvd.value,
        borderColor:  (ctx) => {
            return tsCoreUtils.getManyDaysBarColor(ctx, Object.keys(graphdata_manydays_rcvd.value).length);
        },
        backgroundColor: (ctx) => {
            return tsCoreUtils.getManyDaysBarColor(ctx, Object.keys(graphdata_manydays_rcvd.value).length);
        },
        borderWidth: 2,
        pointRadius: 1,
    });
    tsLog.log("graphdata_manydays_rcvd.value: " + JSON.stringify(graphdata_manydays_rcvd.value));
    chartData_Rcvd.value.labels = graphdata_manydays_labels.value;
    nextTick(() => {
        i18n.updateDocument();
    });
};

 // get many days data
    function getManyDaysData () {
        return new Promise(async (resolve) => {
            let start_time = performance.now();
            let result_many_days = await tsCore.getManyDaysData(props.activeAccount, props.accountEmails);
            tsLog.log("result_manydays_data: " + JSON.stringify(result_many_days, null, 2));
            //top senders list
            show_table_involved_senders.value =  Object.keys(result_many_days.senders).length > 0;
            table_involved_senders.value = result_many_days.senders;
            is_loading_involved_table_senders.value = false;
            //top recipients list
            show_table_involved_recipients.value =  Object.keys(result_many_days.recipients).length > 0;
            table_involved_recipients.value = result_many_days.recipients;
            is_loading_involved_table_recipients.value = false;
            //sent and received counters
            let today_date_string = tsUtils.dateToYYYYMMDD(new Date());
            if(result_many_days.dates[today_date_string] == undefined){
                sent_today.value = 0;
            } else {
                sent_today.value = result_many_days.dates[today_date_string].sent;
            }
            sent_total.value = result_many_days.sent - sent_today.value;
            if(result_many_days.dates[today_date_string] == undefined){
                rcvd_today.value = 0;
            } else {
                rcvd_today.value = result_many_days.dates[today_date_string].received;
            }
            rcvd_total.value = result_many_days.received - rcvd_today.value;
            tsLog.log("sent_total: " + sent_total.value + " rcvd_total: " + rcvd_total.value);
            is_loading_counter_sent_rcvd.value = false;
            //aggregated data
            // remove today from the dates
            let dates_copy = Object.assign({}, result_many_days.dates);
            delete dates_copy[today_date_string];
            let aggregate = await tsCore.aggregateData(dates_copy);
            tsLog.log("dates_copy: " + JSON.stringify(dates_copy, null, 2));
            tsLog.log("aggregate: " + JSON.stringify(aggregate, null, 2));
            counter_many_days_rcvd_total.value = aggregate.total_received;
            counter_many_days_rcvd_max.value = aggregate.max_received;
            counter_many_days_rcvd_min.value = aggregate.min_received;
            counter_many_days_rcvd_avg.value = aggregate.avg_received;
            counter_many_days_sent_total.value = aggregate.total_sent;
            counter_many_days_sent_max.value = aggregate.max_sent;
            counter_many_days_sent_min.value = aggregate.min_sent;
            counter_many_days_sent_avg.value = aggregate.avg_sent;
            is_loading_counter_many_days.value = false;
            // sent and received graphs
            const many_days_data = tsCoreUtils.transformCountDataToDataset(result_many_days.dates, false, true);
            tsLog.log("many_days_data: " + JSON.stringify(many_days_data));
            graphdata_manydays_labels.value = many_days_data.labels;
            // sent graph
            graphdata_manydays_sent.value = many_days_data.dataset_sent;
            is_loading_sent_graph.value = false;
            // received graph
            graphdata_manydays_rcvd.value = many_days_data.dataset_rcvd;
            is_loading_rcvd_graph.value = false;
            let stop_time = performance.now();
            updateElapsed(stop_time - start_time);
            resolve(true);
        });
    };


function loadingDo(){
    is_loading_counter_sent_rcvd.value = true;
    is_loading_counter_many_days.value = true;
    is_loading_involved_table_recipients.value = true;
    is_loading_involved_table_senders.value = true;
    is_loading_sent_graph.value = true;
    is_loading_rcvd_graph.value = true;
}

function updateElapsed(elapsed) {
    emit('updateElapsed', elapsed);
}

defineExpose({ updateData });

</script>




<style scoped>

</style>