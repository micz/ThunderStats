<template>
<table>
    <tr>
        <td><span class="additional_info_text"><span class="_many_days" v-html="_many_days_text"></span> __MSG_sent__:</span></td>
        <td><span class="additional_info_text"><span id="aggregate_max_sent" v-if="!is_loading">{{ sent_max }}</span><img src="@/assets/images/mzts-wait_line.gif" alt="__MSG_Loading__..." id="aggregate_max_sent_wait" v-if="is_loading"/> __MSG_max__ / <span id="aggregate_min_sent" v-if="!is_loading">{{ sent_min }}</span><img src="@/assets/images/mzts-wait_line.gif" alt="__MSG_Loading__..." id="aggregate_min_sent_wait" v-if="is_loading"/> __MSG_min__ / <span id="aggregate_avg_sent" v-if="!is_loading">{{ sent_avg }}</span><img src="@/assets/images/mzts-wait_line.gif" alt="__MSG_Loading__..." id="aggregate_avg_sent_wait" v-if="is_loading"/> __MSG_average__</span></td>
    </tr>
    <tr>
        <td><span class="additional_info_text"><span class="invisible_text"></span>__MSG_received__:</span></td>
        <td><span class="additional_info_text"><span id="aggregate_max_rcvd" v-if="!is_loading">{{ rcvd_max }}</span><img src="@/assets/images/mzts-wait_line.gif" alt="__MSG_Loading__..." id="aggregate_max_rcvd_wait" v-if="is_loading"/> __MSG_max__ / <span id="aggregate_min_rcvd" v-if="!is_loading">{{ rcvd_min }}</span><img src="@/assets/images/mzts-wait_line.gif" alt="__MSG_Loading__..." id="aggregate_min_rcvd_wait" v-if="is_loading"/> __MSG_min__ / <span id="aggregate_avg_rcvd" v-if="!is_loading">{{ rcvd_avg }}</span><img src="@/assets/images/mzts-wait_line.gif" alt="__MSG_Loading__..." id="aggregate_avg_rcvd_wait" v-if="is_loading"/> __MSG_average__</span></td>
    </tr>
</table>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { TS_prefs } from '@statslib/mzts-options';

let props = defineProps({
    sent_max: {
        type: Number,
        default: 0
    },
    sent_min: {
        type: Number,
        default: 0
    },
    sent_avg: {
        type: Number,
        default: 0
    },
    rcvd_max: {
        type: Number,
        default: 0
    },
    rcvd_min: {
        type: Number,
        default: 0
    },
    rcvd_avg: {
        type: Number,
        default: 0
    },
    is_loading: {
        type: Boolean,
        default: true
    },
});

let sent_max = computed(() => {
    return props.sent_max
})
let sent_min = computed(() => {
    return props.sent_min
})
let sent_avg = computed(() => {
    return props.sent_avg
})
let rcvd_max = computed(() => {
    return props.rcvd_max
})
let rcvd_min = computed(() => {
    return props.rcvd_min
})
let rcvd_avg = computed(() => {
    return props.rcvd_avg
})
let is_loading = computed(() => {
    return props.is_loading
})

let _many_days_text = ref("");

onMounted(async () => {
    let _many_days = await TS_prefs.getPref("_many_days");
    _many_days_text.value = browser.i18n.getMessage("InTheLastNumDays", _many_days);
})

</script>


<style scoped>

</style>