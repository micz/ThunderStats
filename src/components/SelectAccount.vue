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
    <select v-model="current_idn" v-bind="$attrs">
        <option v-for="item in identities_options" v-bind:value="item.id">{{item.text}}</option>
    </select>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { tsLogger } from "@statslib/mzts-logger.js";

const props = defineProps({
  do_debug: {
    type: Boolean,
    default: false
  },
  current_idn: {
    type: String,
    default: 0
  }
});

let identities_options = ref([]);
let current_idn = ref(props.current_idn);

const tsLog = new tsLogger("SelectAccount", props.do_debug);

onMounted(async () => {
  tsLog.log("onMounted");
  identities_options.value.push({ id: 0, text: browser.i18n.getMessage('AllAccounts') });
  let accounts = await browser.accounts.list();
      for (let account of accounts) {
        identities_options.value.push({ id: account.id, text: account.name });
      }
      tsLog.log(JSON.stringify(identities_options.value));
});

const updateCurrentIdn = (new_value) => {
  current_idn.value = new_value;
};

defineExpose({ updateCurrentIdn });
</script>


<style scoped>

</style>