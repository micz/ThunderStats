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
    <div class="ts-involved" v-if="!is_loading">
        <div class="ts-involved-row" v-for="(element, email, index) in tableData" :key="email">
            <div class="ts-involved-rank">{{ index + 1 }}</div>
            <div class="ts-involved-who">
                <div class="ts-involved-name">{{ element.name || email }}</div>
                <div class="ts-involved-email">{{ email }}</div>
            </div>
            <div class="ts-involved-track"><div class="ts-involved-bar" :style="{ width: barWidth(element.count), background: bar_color }"></div></div>
            <div class="ts-involved-count">{{ element.count }}</div>
        </div>
    </div>
    <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.svg" alt="__MSG_Loading__..." /></div>
</template>

<script setup>
import { computed } from 'vue'

let props = defineProps({
    tableData: {
        type: [Object, Array],
        default: () => ({})
    },
    is_loading: {
        type: Boolean,
        default: true
    },
    kind: {             // 'sent' for recipients, 'rcvd' for senders
        type: String,
        default: 'rcvd'
    },
});

let bar_color = computed(() => props.kind == 'sent' ? 'var(--sent)' : 'var(--rcvd)');
let max_count = computed(() => Math.max(1, ...Object.values(props.tableData).map(e => e.count)));

function barWidth(count) {
    return (count / max_count.value * 100).toFixed(1) + '%';
}
</script>

<style scoped>
.ts-involved {
    display: flex;
    flex-direction: column;
}

.ts-involved-row {
    display: grid;
    grid-template-columns: 22px minmax(0, 1.3fr) minmax(0, 1fr) 34px;
    gap: 12px;
    align-items: center;
    padding: 9px 0;
    border-top: 1px solid var(--line);
}

.ts-involved-rank {
    font-size: 12px;
    color: var(--text3);
    font-variant-numeric: tabular-nums;
}

.ts-involved-who {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
}

.ts-involved-name {
    font-size: 13px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ts-involved-email {
    font-size: 12px;
    color: var(--text3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ts-involved-track {
    height: 8px;
    border-radius: 4px;
    background: var(--surface3);
}

.ts-involved-bar {
    height: 8px;
    border-radius: 4px;
}

.ts-involved-count {
    font-size: 13px;
    font-weight: 660;
    text-align: right;
    font-variant-numeric: tabular-nums;
}
</style>
