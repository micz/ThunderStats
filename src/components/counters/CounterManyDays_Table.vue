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
<table>
    <tr>
        <td><span class="additional_info_text"><span class="_many_days" v-html="_many_days_text"></span> <span class="count_sent">__MSG_sent__</span>:</span></td>
        <td><span class="additional_info_text"><span v-if="!is_loading">{{ sent_max }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="is_loading"/> __MSG_max__ / <span v-if="!is_loading">{{ sent_min }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="is_loading"/> __MSG_min__ / <span v-if="!is_loading">{{ sent_avg }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="is_loading"/> __MSG_average__</span></td>
    </tr>
    <tr>
        <td class="align_end"><span class="additional_info_text"><span class="invisible_text"></span><span class="count_rcvd">__MSG_received__</span>:</span></td>
        <td><span class="additional_info_text"><span v-if="!is_loading">{{ rcvd_max }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="is_loading"/> __MSG_max__ / <span v-if="!is_loading">{{ rcvd_min }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="is_loading"/> __MSG_min__ / <span v-if="!is_loading">{{ rcvd_avg }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="is_loading"/> __MSG_average__</span></td>
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