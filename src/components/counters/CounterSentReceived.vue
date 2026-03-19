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
<p><span>__MSG_SentMails__: </span><span  v-if="!is_loading">{{ _sent }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="is_loading"/></p>
<p v-if="show_internal_percent" class="internal-percent"><span>{{ internalLabel }}: </span><span v-if="!is_loading">{{ internal_sent_percent }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="is_loading"/></p>
<p><span>__MSG_ReceivedMails__: </span><span  v-if="!is_loading">{{ _rcvd }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="is_loading"/></p>
<p v-if="show_internal_percent" class="internal-percent"><span>{{ internalLabel }}: </span><span v-if="!is_loading">{{ internal_rcvd_percent }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="is_loading"/></p>
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
    },
    show_internal_percent: {
        type: Boolean,
        default: false
    },
    internal_sent_percent: {
        type: String,
        default: '0.00%'
    },
    internal_rcvd_percent: {
        type: String,
        default: '0.00%'
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
let show_internal_percent = computed(() => {
    return props.show_internal_percent
})
let internal_sent_percent = computed(() => {
    return props.internal_sent_percent
})
let internal_rcvd_percent = computed(() => {
    return props.internal_rcvd_percent
})
const internalLabel = browser.i18n.getMessage("InternalMailPercent");

</script>



<style scoped>
.internal-percent {
    font-size: smaller;
    color: #555;
    margin-top: -2px;
}
</style>