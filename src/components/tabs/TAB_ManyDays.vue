<template>
    <div class="square_container">
    <div class="square_item"><div class="list_heading_wrapper"><h2 class="list_heading cropped">__MSG_Mails__</h2></div>
        SENT MAILS GRAPH
    </div>

    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped">__MSG_Mails__</h2>
					  </div>
					  RCVD MAILS GRAPH
    </div>

    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped" v-text="top_recipients_title"></h2>
					  </div>
					  <TableInvolved :is_loading="is_loading_involved_table_recipients" :tableData="table_involved_recipients" v-if="is_loading_involved_table_recipients || show_table_involved_recipients" />
                    <p class="chart_info_nomail" v-if="!is_loading_involved_table_recipients && !show_table_involved_recipients">__MSG_NoMailsSent__!</p>
    </div>
    
    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped" v-text="top_senders_title"></h2>
					  </div>
                      <TableInvolved :is_loading="is_loading_involved_table_senders" :tableData="table_involved_senders" v-if="is_loading_involved_table_senders || show_table_involved_senders"/>
                      <p class="chart_info_nomail" v-if="!is_loading_involved_table_senders && !show_table_involved_senders">__MSG_NoMailsReceived__!</p>
    </div>
  </div>
</template>



<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { tsLogger } from '@statslib/mzts-logger';
import { thunderStastsCore } from '@statslib/mzts-statscore';
import { tsUtils } from '@statslib/mzts-utils';
import TableInvolved from '../tables/TableInvolved.vue';
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

let top_recipients_title = ref("");
let top_senders_title = ref("");

let is_loading_counter_sent_rcvd = ref(true);
let is_loading_counter_many_days = ref(true);
let is_loading_involved_table_recipients = ref(true);
let is_loading_involved_table_senders = ref(true);

let counter_many_days_sent_max = ref(0);
let counter_many_days_sent_min = ref(0);
let counter_many_days_sent_avg = ref(0);
let counter_many_days_rcvd_max = ref(0);
let counter_many_days_rcvd_min = ref(0);
let counter_many_days_rcvd_avg = ref(0);

let table_involved_recipients = ref([]);
let table_involved_senders = ref([]);
let show_table_involved_recipients = ref(false);
let show_table_involved_senders = ref(false);

let _involved_num = 10;
let _many_days = 7;


// let chartData_ManyDays = ref({
//     labels: Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')),
//     datasets: []
// });

onMounted(async () => {
    today_date.value = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
    _involved_num = await TS_prefs.getPref("_involved_num");
    _many_days = await TS_prefs.getPref("_many_days");
    top_recipients_title.value = browser.i18n.getMessage("TopRecipients", _involved_num);
    top_senders_title.value = browser.i18n.getMessage("TopSenders", _involved_num);
});


async function updateData() {
    loadingDo();
    while(props.updated == false){
        await new Promise(r => setTimeout(r, 100));
    }
    tsCore = new thunderStastsCore({do_debug: props.do_debug, _involved_num: _involved_num, _many_days: _many_days});
    tsLog = new tsLogger("TAB_ManyDays", props.do_debug);
    tsLog.log("props.accountEmails: " + JSON.stringify(props.accountEmails));
    await Promise.all([getManyDaysData()]);
    // chartData_Today.value.datasets = [];
    // chartData_Today.value.datasets.push({
    //     label: 'tsent',
    //     data: graphdata_today_hours_sent.value,
    //     borderColor: '#1f77b4',
    //     backgroundColor: '#1f77b4',
    //     borderWidth: 2,
    //     pointRadius: 1,
    // })
    // chartData_Today.value.datasets.push({
    //     label: 'trcvd',
    //     data: graphdata_today_hours_rcvd.value,
    //     borderColor: '#ff7f0e',
    //     backgroundColor: '#ff7f0e',
    //     borderWidth: 2,
    //     pointRadius: 1,
    // })
    // chartData_Today.value.datasets.push({
    //     label: 'ysent',
    //     data: graphdata_yesterday_hours_sent.value,
    //     borderColor: '#17becf',
    //     backgroundColor: '#17becf',
    //     borderDash: [12, 3, 3],
    //     pointStyle: false,
    //     borderWidth: 2,
    // })
    // chartData_Today.value.datasets.push({
    //     label: 'yrcvd',
    //     data: graphdata_yesterday_hours_rcvd.value,
    //     borderColor: '#ffbb78',
    //     backgroundColor: '#ffbb78',
    //     borderDash: [12, 3, 3],
    //     pointStyle: false,
    //     borderWidth: 2,
    // })
    nextTick(() => {
        i18n.updateDocument();
    });
};

 // get many days data
    function getManyDaysData () {
        return new Promise(async (resolve) => {
            let result_many_days = await tsCore.getManyDaysData(props.activeAccount, props.accountEmails);
            tsLog.log("result_manydays_data: " + JSON.stringify(result_many_days, null, 2));
            counter_many_days_rcvd_max.value = result_many_days.aggregate.max_received;
            counter_many_days_rcvd_min.value = result_many_days.aggregate.min_received;
            counter_many_days_rcvd_avg.value = result_many_days.aggregate.avg_received;
            counter_many_days_sent_max.value = result_many_days.aggregate.max_sent;
            counter_many_days_sent_min.value = result_many_days.aggregate.min_sent;
            counter_many_days_sent_avg.value = result_many_days.aggregate.avg_sent;
            //top senders list
            show_table_involved_senders.value =  Object.keys(result_many_days.senders).length > 0;
            table_involved_senders.value = result_many_days.senders;
            is_loading_involved_table_senders.value = false;
            //top recipients list
            show_table_involved_recipients.value =  Object.keys(result_many_days.recipients).length > 0;
            table_involved_recipients.value = result_many_days.recipients;
            is_loading_involved_table_recipients.value = false;

            is_loading_counter_many_days.value = false;
            resolve(true);
        });
    };


function loadingDo(){
    is_loading_counter_sent_rcvd.value = true;
    is_loading_counter_many_days.value = true;
    is_loading_involved_table_recipients.value = true;
    is_loading_involved_table_senders.value = true;
}

defineExpose({ updateData });

</script>




<style scoped>

</style>