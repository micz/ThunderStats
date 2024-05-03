<template>
<p class="additional_info_text"><span class="additional_info_text">__MSG_YesterdayThisTime__: <span id="yesterday_incremental_sent" v-if="!is_loading">{{ sent }}</span><img src="@/assets/images/mzts-wait_line.gif" alt="__MSG_Loading__..." id="yesterday_incremental_sent_wait" v-if="is_loading"/> __MSG_sent__ / <span id="yesterday_incremental_rcvd" v-if="!is_loading">{{ rcvd }}</span><img src="@/assets/images/mzts-wait_line.gif" alt="__MSG_Loading;..." id="yesterday_incremental_rcvd_wait" v-if="is_loading"/> __MSG_received__</span></p>
</template>


<script setup>
import { computed } from 'vue';

let props = defineProps({
    sent: {
        type: Number,
        default: 0
    },
    rcvd: {
        type: Number,
        default: 0
    },
    is_loading: {
        type: Boolean,
        default: true
    }
});

let sent = computed(() => {
    return props.sent
})
let rcvd = computed(() => {
    return props.rcvd
})
let is_loading = computed(() => {
    return props.is_loading
})

</script>




<style scoped>

</style>