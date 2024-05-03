<template>
<div>__MSG_TotalInbox__: <span class="inbox0_inboxmsg" v-if="!is_loading">{{ inbox_total }}</span><img src="@/assets/images/mzts-wait_line.gif" alt="__MSG_Loading__..." v-if="is_loading" /><span class="inbox0_inboxmsg_unread">&nbsp;&nbsp;&nbsp;&nbsp;__MSG_TotalInboxUnread__: <span class="inbox0_inboxmsg_unread" v-if="!is_loading">{{ inbox_unread }}</span></span><img src="@/assets/images/mzts-wait_line.gif" alt="__MSG_Loading__..." v-if="is_loading"/></div>
</template>


<script setup>
import { computed } from 'vue';

let props = defineProps({
    inbox_total: {
        type: Number,
        default: 0
    },
    inbox_unread: {
        type: Number,
        default: 0
    },
    is_loading: {
        type: Boolean,
        default: true
    }
});

let inbox_total = computed(() => {
    return props.inbox_total
})
let inbox_unread = computed(() => {
    return props.inbox_unread
})
let is_loading = computed(() => {
    return props.is_loading
})

</script>



<style scoped>

</style>