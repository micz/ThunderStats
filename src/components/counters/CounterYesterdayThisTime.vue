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