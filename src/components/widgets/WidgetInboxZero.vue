<template>
    <div>
      <CounterInbox 
        :is_loading="is_loading_counter_inbox" 
        :inbox_total="counter_inbox_total" 
        :inbox_unread="counter_inbox_unread" 
      />
      <CounterInboxPercent 
        :is_loading="is_loading_counter_inbox_percent" 
        :inbox_percent="counter_inbox_percent" 
      />
      <div class="chart_inbox0_info">
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
      <div class="chart_inbox0">
        <ChartInboxZeroFolders 
          :chartData="chartData_InboxZeroFolders" 
          :openFolderInFirstTab="inbox0_openFolderInFirstTab" 
          :is_loading="is_loading_inbox_chart_folders" 
        />
      </div>
      <div class="chart_inbox0_datemsg">
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
      </div>
    </div>
</template>

<script setup>
// import { computed } from 'vue';
import CounterInboxPercent from '../counters/CounterInboxPercent.vue';
import ChartInboxZeroFolders from '../charts/ChartInboxZeroFolders.vue';
import ChartInboxZeroDates from '../charts/ChartInboxZeroDates.vue';
import CounterInbox from '../counters/CounterInbox.vue';
import InfoTooltip from '../InfoTooltip.vue';


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
  is_loading_inbox_chart_dates: {
    type: Boolean,
    default: false,
  }
});

// let is_loading_counter_inbox = computed(() => props.is_loading_counter_inbox);
// let counter_inbox_total = computed(() => props.counter_inbox_total);
// let counter_inbox_unread = computed(() => props.counter_inbox_unread);
// let is_loading_counter_inbox_percent = computed(() => props.is_loading_counter_inbox_percent);
// let counter_inbox_percent = computed(() => props.counter_inbox_percent);
// let showFolderLocationNoteAnchor = computed(() => props.showFolderLocationNoteAnchor);
// let folderLocationNote_text = computed(() => props.folderLocationNote_text);
// let is_loading_counter_sent_rcvd = computed(() => props.is_loading_counter_sent_rcvd);
// let counter_rcvd = computed(() => props.counter_rcvd);
// let chartData_InboxZeroFolders = computed(() => props.chartData_InboxZeroFolders);
// let inbox0_openFolderInFirstTab = computed(() => props.inbox0_openFolderInFirstTab);
// let is_loading_inbox_chart_folders = computed(() => props.is_loading_inbox_chart_folders);
// let no_mails_inbox = computed(() => props.no_mails_inbox);
// let no_mails_received = computed(() => props.no_mails_received);
// let chartData_InboxZeroDates = computed(() => props.chartData_InboxZeroDates);
// let is_loading_inbox_chart_dates = computed(() => props.is_loading_inbox_chart_dates);
</script>

<style scoped>

</style>