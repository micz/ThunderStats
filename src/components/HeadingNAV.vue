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
          <SelectAccount id="account_selector" @change="accountSelected()" v-model="current_account" ref="SelectAccount_ref"/>
			<div id="mzts-btn-update">
        <button type="button" @click="update()">__MSG_Update__</button>
      </div>
      <div id="mzts-warn-msg" v-if="warn_message != ''">
        {{ warn_message }}
      </div>
      <div class="mzts-execution-time" v-if="is_loading && currentTab != 'tab-info'">
        <span v-text="elapsed_time_label"></span>: <span v-text="elapsed_time_string" v-if="elapsed_time != 0"></span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small_absolute" alt="__MSG_Loading__..." v-if="elapsed_time == 0"/>
      </div>
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
import { ref, onMounted, computed } from 'vue';
import { tsLogger } from "@statslib/mzts-logger.js";
import { TS_prefs } from "@statslib/mzts-options.js";
import { tsStore } from "@statslib/mzts-store.js";
import { tsUtils } from "@statslib/mzts-utils.js";
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import SelectAccount from './SelectAccount.vue';

const emit = defineEmits(['chooseAccount']);

const props = defineProps({
  elapsed_time: { type: Number, default:0 },
  currentTab: { type: String, default:'' },
  is_loading: { type: Boolean, default:false }
})

let current_account = ref(0);
let SelectAccount_ref = ref(null);

let elapsed_time = computed(() => {
  return props.elapsed_time;
})

let elapsed_time_string = computed(() => {
  return tsUtils.convertFromMilliseconds(props.elapsed_time);
})

let currentTab = computed(() => {
  return props.currentTab;
})

let is_loading = computed(() => {
  return props.is_loading;
})

let elapsed_time_label = ref("");
let warn_message = ref("");


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
  doAgain();
}

async function accountSelected(){
  tsLog.log("accountSelected: " + current_account.value);
  if(await TS_prefs.getPref("load_data_changing_account")){
    emit('chooseAccount', current_account.value);
    doAgain();
  }
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
  doAgain();
  return current_account.value;
}

async function doAgain(){
  is_loading.value = true;
  elapsed_time_label.value = await browser.i18n.getMessage("ExecutionTime");
  props.elapsed_time = 0;
  let account_emails = await tsCoreUtils.getAccountEmails(current_account.value);
  warn_message.value = "";
  if(account_emails.length == 0){
    warn_message.value = await browser.i18n.getMessage("AccountWithNoEmails");
  }
}

defineExpose({ getCurrentIdn });
</script>


<style scoped>

</style>