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
    <select v-model="current_account" v-bind="$attrs">
        <option v-for="item in accounts_options" v-bind:value="item.id">{{item.name}}</option>
    </select>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { tsLogger } from "@statslib/mzts-logger.js";
import { tsStore } from '@statslib/mzts-store';
import { tsCoreUtils } from "@statslib/mzts-statscore.utils";

const props = defineProps({
  current_account: {
    type: String,
    default: 0
  },
  hide_AllAccount_option: {
    type: Boolean,
    default: false
  }
});

let accounts_options = ref([]);
let current_account = ref(props.current_account);
let hide_AllAccount = computed(() => props.hide_AllAccount_option);

const tsLog = new tsLogger("SelectAccount", tsStore.do_debug);

onMounted(async () => {
    tsLog.log("onMounted");
    accounts_options.value = await tsCoreUtils.getAccountsList(hide_AllAccount.value);
    tsLog.log(JSON.stringify(accounts_options.value));
});

const updateCurrentAccount = (new_value) => {
  current_account.value = new_value;
};

defineExpose({ updateCurrentAccount });
</script>


<style scoped>

</style>