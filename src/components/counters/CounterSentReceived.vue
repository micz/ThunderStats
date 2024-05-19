<template>
<p><span>__MSG_SentMails__: </span><span  v-if="!is_loading">{{ _sent }}</span><img src="@/assets/images/mzts-wait_line.gif" alt="__MSG_Loading__..." v-if="is_loading"/></p>
<p><span>__MSG_ReceivedMails__: </span><span  v-if="!is_loading">{{ _rcvd }}</span><img src="@/assets/images/mzts-wait_line.gif" alt="__MSG_Loading__..." v-if="is_loading"/></p>
</template>


<script setup>
import { computed } from 'vue';

let props = defineProps({
    _sent: {
        type: Number,
        default: 0
    },
    _rcvd: {
        type: Number,
        default: 0
    },
    is_loading: {
        type: Boolean,
        default: true
    }
});

let _sent = computed(() => {
    return props._sent
})
let _rcvd = computed(() => {
    return props._rcvd
})
let is_loading = computed(() => {
    return props.is_loading
})

</script>



<style scoped>

</style>