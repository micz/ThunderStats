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
    <div id="heading_wrapper">
		  <div id="mzts-account-sel">__MSG_ChooseAccount__:
          <SelectAccount id="account_selector" v-model="current_account" ref="SelectAccount_ref"/>
			<div id="mzts-btn-update"><button type="button" @click="update()">__MSG_Update__</button></div>
		  </div>
		<div id="mzts-setup_icon">
			<img src="@/assets/images/mzts-setup.png" alt="__MSG_Setup__" title="__MSG_Setup__" class="tooltip" @click="openOptions()"/>
		</div>
		<div id="mzts-updates">
			<div id="mzts-last_run"></div>
			<div id="mzts-last_msg"></div>
		</div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { tsLogger } from "@statslib/mzts-logger.js";
import { TS_prefs } from "@statslib/mzts-options.js";
import { tsStore } from "@statslib/mzts-store.js";
import SelectAccount from './SelectAccount.vue';

const emit = defineEmits(['chooseAccount']);

let current_account = ref(0);
let SelectAccount_ref = ref(null);

let tsLog = null;

onMounted(async () => {
  tsLog = new tsLogger("HeadingNAV", tsStore.do_debug);
  current_account.value = await TS_prefs.getPref("startup_account");
  tsLog.log("onMounted: " + current_account.value);
  SelectAccount_ref.value.updateCurrentAccount(current_account.value);
});

function update(){
  tsLog.log("update: " + current_account.value);
  emit('chooseAccount', current_account.value);
}

function openOptions(){
  // check if the tab is already there
    browser.tabs.query({url: browser.runtime.getURL("./index.ts-options.html")}).then((tabs) => {
      if (tabs.length > 0) {
        // if the tab is already there, focus it
        browser.tabs.update(tabs[0].id, {active: true});
      } else {
        // if the tab is not there, create it
        browser.tabs.create({url: browser.runtime.getURL("./index.ts-options.html")});
      }
    })
}

function getCurrentIdn(){
  return current_account.value;
}

defineExpose({ getCurrentIdn });
</script>


<style scoped>

</style>