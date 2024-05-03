<template>
    <table class='mzts-tinvolved' >
        <tr class='mzts-thead'>
            <td class='mzts-row-num'>#</td>
            <!--<td>__MSG_Name__</td>-->
            <td>__MSG_Mail__</td>
            <td>__MSG_Total__</td>
        </tr>
        <tr v-for="(count, email, index) in tableData" :key="email" class='mzts-trow'>
            <td class='mzts-row-num'>{{ index + 1 }}</td>
            <!--<td></td>-->
            <td>{{email}}</td>
            <td>{{count}}</td>
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