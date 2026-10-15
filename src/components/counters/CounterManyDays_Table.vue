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
<div class="md_grid">
    <span></span>
    <span class="md_head">__MSG_Total__</span>
    <span class="md_head">__MSG_average__</span>
    <span class="md_head">__MSG_max__</span>
    <span class="md_head">__MSG_min__</span>

    <span class="md_label"><span class="md_dot md_dot_sent"></span>__MSG_sent__</span>
    <span class="md_total md_total_sent"><span v-if="!is_loading">{{ sent_total }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-else/></span>
    <span class="md_value"><span v-if="!is_loading">{{ sent_avg }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-else/></span>
    <span class="md_value"><span v-if="!is_loading">{{ sent_max }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-else/></span>
    <span class="md_value"><span v-if="!is_loading">{{ sent_min }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-else/></span>

    <span class="md_label"><span class="md_dot md_dot_rcvd"></span>__MSG_received__</span>
    <span class="md_total md_total_rcvd"><span v-if="!is_loading">{{ rcvd_total }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-else/></span>
    <span class="md_value"><span v-if="!is_loading">{{ rcvd_avg }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-else/></span>
    <span class="md_value"><span v-if="!is_loading">{{ rcvd_max }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-else/></span>
    <span class="md_value"><span v-if="!is_loading">{{ rcvd_min }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-else/></span>
</div>
</template>

<script setup>
import { computed } from 'vue';

let props = defineProps({
    sent_total: {
        type: Number,
        default: 0
    },
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
    rcvd_total: {
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

let sent_total = computed(() => {
    return props.sent_total
})
let sent_max = computed(() => {
    return props.sent_max
})
let sent_min = computed(() => {
    return props.sent_min
})
let sent_avg = computed(() => {
    return props.sent_avg
})
let rcvd_total = computed(() => {
    return props.rcvd_total
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

</script>

<style scoped>
.md_grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) repeat(4, auto);
    align-items: baseline;
    column-gap: 14px;
    row-gap: 8px;
    font-variant-numeric: tabular-nums;
}
.md_head {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .04em;
    color: var(--text3);
    text-align: end;
}
.md_label {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    font-size: 13px;
    color: var(--text2);
    text-transform: capitalize;
}
.md_dot {
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 2px;
}
.md_dot_sent {
    background: var(--sent);
}
.md_dot_rcvd {
    background: var(--rcvd);
}
.md_total {
    font-size: 20px;
    font-weight: 660;
    text-align: end;
}
.md_total_sent {
    color: var(--sent);
}
.md_total_rcvd {
    color: var(--rcvd);
}
.md_value {
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    text-align: end;
}
</style>
