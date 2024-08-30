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
<p class="chart_info">__MSG_FolderLocation_percent_handled__: <span class="inbox0_inboxmsg" v-if="!is_loading">{{ inbox_percent }}</span><img class="spinner_small" src="@/assets/images/mzts-wait_line.svg" alt="__MSG_Loading__..." v-if="is_loading" /><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." v-if="is_loading"/></p>
</template>

<script setup>
import { computed } from 'vue';

let props = defineProps({
    inbox_percent: {
        type: Number,
        default: 0
    },
    is_loading: {
        type: Boolean,
        default: true
    }
});

let inbox_percent = computed(() => {
    return props.inbox_percent
})
let is_loading = computed(() => {
    return props.is_loading
})

</script>



<style scoped>

</style>