<template>
<p><span>__MSG_SentMails__: </span><span id="today_sent"  v-if="!is_loading">{{ today_sent }}</span><img src="@/assets/images/mzts-wait_line.gif" alt="__MSG_Loading__..." id="today_sent_wait" v-if="is_loading"/></p>
<p><span>__MSG_ReceivedMails__: </span><span id="today_rcvd"  v-if="!is_loading">{{ today_rcvd }}</span><img src="@/assets/images/mzts-wait_line.gif" alt="__MSG_Loading__..." id="today_rcvd_wait"  v-if="is_loading"/></p>
</template>


<script setup>
import { computed } from 'vue';

let props = defineProps({
    today_sent: {
        type: Number,
        default: 0
    },
    today_rcvd: {
        type: Number,
        default: 0
    },
    is_loading: {
        type: Boolean,
        default: true
    }
});

let today_sent = computed(() => {
    return props.today_sent
})
let today_rcvd = computed(() => {
    return props.today_rcvd
})
let is_loading = computed(() => {
    return props.is_loading
})

</script>



<style scoped>

</style>