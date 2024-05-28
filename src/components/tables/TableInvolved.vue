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
    <table class='mzts-tinvolved' >
        <tr class='mzts-thead'>
            <td class='mzts-row-num'>#</td>
            <td>__MSG_Name__</td>
            <td>__MSG_Mail__</td>
            <td>__MSG_Total__</td>
        </tr>
        <tr v-for="(element, email, index) in tableData" :key="email" class='mzts-trow'>
            <td class='mzts-row-num'>{{ index + 1 }}</td>
            <td>{{element.name}}</td>
            <td>{{email}}</td>
            <td>{{element.count}}</td>
        </tr>
    </table>
    <div class="circle_wait" v-if="is_loading"><img src="@/assets/images/mzts-wait_circle.gif" alt="__MSG_Loading__..." /></div>
</template>



<script setup>
import { computed } from 'vue'

let props = defineProps({
    tableData: {
        type: Array,
        default: []
    },
    is_loading: {
        type: Boolean,
        default: true
    },
    do_debug: {
        type: Boolean,
        default: false
    }
});

let is_loading = computed(() => props.is_loading)
let tableData = computed(() => props.tableData)

</script>




<style scoped>

</style>