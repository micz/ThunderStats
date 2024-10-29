<template>
    <div>
      <CounterInbox 
        :is_loading="is_loading_counter_inbox" 
        :inbox_total="counter_inbox_total" 
        :inbox_unread="counter_inbox_unread" 
      />
      <CounterInboxPercent v-if="!show_extended"
        :is_loading="is_loading_counter_inbox_percent" 
        :inbox_percent="counter_inbox_percent" 
      />
      <div class="chart_inbox0_info" v-if="!show_extended">
        <p class="chart_info">
          __MSG_FolderLocation__ 
          <InfoTooltip 
            :showAnchor="showFolderLocationNoteAnchor" 
            :noteText="folderLocationNote_text" 
          />
        </p>
        <p 
          class="chart_info_nomail" 
          v-if="!is_loading_counter_sent_rcvd && (counter_rcvd == 0)" 
          v-text="no_mails_received"
        ></p>
      </div>
      <div class="chart_inbox0" v-if="!show_extended">
        <ChartInboxZeroFolders 
          :chartData="chartData_InboxZeroFolders" 
          :openFolderInFirstTab="inbox0_openFolderInFirstTab" 
          :is_loading="is_loading_inbox_chart_folders" 
        />
      </div>
      <div class="chart_inbox0_datemsg" v-if="!show_extended">
        <p class="chart_info">__MSG_InboxMailsDateSpreading__</p>
        <p 
          class="chart_info_nomail" 
          v-if="!is_loading_counter_inbox && (counter_inbox_total == 0)" 
          v-text="no_mails_inbox"
        ></p>
        <ChartInboxZeroDates 
          :chartData="chartData_InboxZeroDates" 
          :is_loading="is_loading_inbox_chart_dates"
        />
        <div class="chart_inbox0_extended_btn" ><button type="button" @click="doShowExtended" v-if="!is_loading_inbox_chart_folders" class="btn" >__MSG_ViewDetails__</button></div>
      </div>
      <table class="chart_inbox0_extended_table" v-if="show_extended">
        <tr>
          <td class="chart_inbox0_extended_title">
            __MSG_InboxMailsDateSpreadingExtended__
          </td>
          <td class="chart_inbox0_extended_orderby">
            __MSG_OrderBy__:&nbsp;&nbsp;<span class="chart_inbox0_orderbtn" @click="doOrderExtendedDate">__MSG_Date__</span>&nbsp;<img src="@public/images/mzts-arrow-sort-active-down.png" class="chart_inbox0_extended_sorticon" v-if="orderType == 'date' && orderDate == 'asc'" /><img src="@public/images/mzts-arrow-sort-active-up.png" class="chart_inbox0_extended_sorticon" v-if="orderType == 'date' && orderDate == 'desc'" />&nbsp;|&nbsp;&nbsp;<span class="chart_inbox0_orderbtn" @click="doOrderExtendedMails">__MSG_Mails__</span>&nbsp;<img src="@public/images/mzts-arrow-sort-active-down.png" class="chart_inbox0_extended_sorticon" v-if="orderType == 'mails' && orderMails == 'asc'" /><img src="@public/images/mzts-arrow-sort-active-up.png" class="chart_inbox0_extended_sorticon" v-if="orderType == 'mails' && orderMails == 'desc'" />
          </td>
      </tr>
    </table>
      <div class="chart_inbox0_extended" :id="chart_inbox0_extended_id" v-if="show_extended">
        <ChartInboxZeroDatesExtended 
          :chartData="chartData_InboxZeroDates_extended"
          :chart_height="chart_inbox0_extended_height"
          :is_loading="false"
          :key = "key"
        />
      </div>
      <div class="chart_inbox0_extended_close_btn" v-if="show_extended"><button type="button" @click="doHideExtended" class="btn" >__MSG_Close__</button></div>
    </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import CounterInboxPercent from '../counters/CounterInboxPercent.vue';
import ChartInboxZeroFolders from '../charts/ChartInboxZeroFolders.vue';
import ChartInboxZeroDates from '../charts/ChartInboxZeroDates.vue';
import CounterInbox from '../counters/CounterInbox.vue';
import InfoTooltip from '../InfoTooltip.vue';
import ChartInboxZeroDatesExtended from '../charts/ChartInboxZeroDatesExtended.vue';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import { tsStore } from '@statslib/mzts-store';
import { i18n } from '@statslib/mzts-i18n';


const props = defineProps({
  is_loading_counter_inbox: {
    type: Boolean,
    default: false,
  },
  counter_inbox_total: {
    type: Number,
    default: 0,
  },
  counter_inbox_unread: {
    type: Number,
    default: 0,
  },
  is_loading_counter_inbox_percent: {
    type: Boolean,
    default: false,
  },
  counter_inbox_percent: {
    type: Number,
    default: 0,
  },
  showFolderLocationNoteAnchor: {
    type: Boolean,
    default: false,
  },
  folderLocationNote_text: {
    type: String,
    default: '',
  },
  is_loading_counter_sent_rcvd: {
    type: Boolean,
    default: false,
  },
  counter_rcvd: {
    type: Number,
    default: 0,
  },
  chartData_InboxZeroFolders: {
    type: Object,
    default: () => ({}),
    required: true,
  },
  inbox0_openFolderInFirstTab: {
    type: Boolean,
    default: false,
  },
  is_loading_inbox_chart_folders: {
    type: Boolean,
    default: false,
  },
  no_mails_inbox: {
    type: String,
    default: '',
  },
  no_mails_received: {
    type: String,
    default: '',
  },
  chartData_InboxZeroDates: {
    type: Object,
    default: () => ({}),
    required: true,
  },
  chartData_InboxZeroDates_extended: {
    type: Object,
    default: () => ({}),
    required: true,
  },
  is_loading_inbox_chart_dates: {
    type: Boolean,
    default: false,
  }
});

let show_extended = ref(false);
let chart_inbox0_extended_height = ref("275px");

let chartData_InboxZeroDates_extended = ref({
  labels: [],
  datasets: []
})

let chart_inbox0_extended_id = computed(() => {
  return "chart_inbox0_extended_" + tsStore.currentTab;
});

let force_rand = ref(Math.floor(Math.random() * 101));
let key = computed(() => String(force_rand.value));

let chartData_OrdinableArray = ref([]);
let orderDate = 'asc';
let orderMails = 'asc';
let orderType = 'date';

// let chartData_InboxZeroDates_extended = computed(() => {
//   let data_trasf = tsCoreUtils.transformInboxZeroDatesExtendedDataToDataset(props.chartData_InboxZeroDates_extended, true);
//   let output = {};
//   output.labels = data_trasf.labels;
//   output.datasets = [data_trasf.dataset];
//   chartData_OrdinableArray.value = tsCoreUtils.sortInboxZeroDatesExtendedDatasetOrdinableArray(tsCoreUtils.transformInboxZeroDatesExtendedDatasetToOrdinableArray(output));
//   tsCoreUtils.updateInboxZeroDatesExtendedDataset(output, chartData_OrdinableArray.value);
//   console.log(">>>>>>>>>>>>>> props.chartData_InboxZeroDates_extended: " + JSON.stringify(props.chartData_InboxZeroDates_extended));
//   console.log(">>>>>>>>>>>>>> chartData_InboxZeroDates_extended: " + JSON.stringify(output));
//   return output;
// });

watch(() => props.is_loading_inbox_chart_dates, (newData) => {
  if(newData){
    doHideExtended();
  }
})

async function doShowExtended() {
  let data_trasf = tsCoreUtils.transformInboxZeroDatesExtendedDataToDataset(props.chartData_InboxZeroDates_extended, true);
  let output = {};
  output.labels = data_trasf.labels;
  output.datasets = [data_trasf.dataset];
  chartData_OrdinableArray.value = tsCoreUtils.transformInboxZeroDatesExtendedDatasetToOrdinableArray(output);
  chartData_InboxZeroDates_extended.value = output;
  orderInboxZeroFoldersExtended('date','desc');
  orderDate = 'desc';
  show_extended.value = true;
  await nextTick();
  let dom_element = document.getElementById(chart_inbox0_extended_id.value);
  if(dom_element != null){
    let container_height = dom_element.clientHeight;
    let ipotetic_height = chartData_InboxZeroDates_extended.value.labels.length * 30;
    // console.log(">>>>>>>>>>>>> chart_inbox0_height container_height: " + container_height + " ipotetic_height: " + ipotetic_height);
    if(container_height < ipotetic_height){
      chart_inbox0_extended_height.value = String(ipotetic_height) + "px";
    } else {
      chart_inbox0_extended_height.value = String(container_height) + "px";
    }
    // console.log(">>>>>>>>>>>>>> chart_inbox0_extended_height.value: " + chart_inbox0_extended_height.value);
    force_rand.value = Math.floor(Math.random() * 101);
  }else{
    console.error("[ThunderStats] Extended inbox0 chart DOM element not found!");
  }
  i18n.updateDocument();
}

async function doHideExtended() {
  show_extended.value = false;
  await nextTick();
  i18n.updateDocument();
}

function orderInboxZeroFoldersExtended(type = 'date', order = 'asc') {
  console.log(">>>>>>>>>>>>>> orderInboxZeroFoldersExtended type: " + type + " order: " + order);
  chartData_OrdinableArray.value = tsCoreUtils.sortInboxZeroDatesExtendedDatasetOrdinableArray(chartData_OrdinableArray.value,type,order);
  console.log(">>>>>>>>>>>>>> orderInboxZeroFoldersExtended chartData_OrdinableArray: " + JSON.stringify(chartData_OrdinableArray.value));
  tsCoreUtils.updateInboxZeroDatesExtendedDataset(chartData_InboxZeroDates_extended.value, chartData_OrdinableArray.value);
  console.log(">>>>>>>>>>>>>> orderInboxZeroFoldersExtended chartData_InboxZeroDates_extended: " + JSON.stringify(chartData_InboxZeroDates_extended.value));
  force_rand.value = Math.floor(Math.random() * 101);
}

function doOrderExtendedDate() {
  let order = orderDate === 'asc' ? 'desc' : 'asc';
  orderDate = order;
  orderMails = 'asc';
  orderType = 'date';
  orderInboxZeroFoldersExtended(orderType, order);
}

function doOrderExtendedMails() {
  let order = orderMails === 'asc' ? 'desc' : 'asc';
  orderMails = order;
  orderDate = 'asc';
  orderType = 'mails';
  orderInboxZeroFoldersExtended(orderType, order);
}

</script>

<style scoped>

</style>