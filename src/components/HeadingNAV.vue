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
  <header id="heading_wrapper">
    <div class="ts-head-left">
      <div class="ts-brand"><span class="ts-brand-mark"></span>ThunderStats</div>

      <div class="ts-account-pill" :title="choose_account_label">
        <SelectAccount id="account_selector" @change="accountSelected()" v-model="current_account" ref="SelectAccount_ref"/>
      </div>

      <span class="bday_icon" v-if="businessdays_only"><img src="@/assets/images/mzts-businessdays.png" alt="__MSG_BusinessDayOnlyWarning__" title="__MSG_BusinessDayOnlyWarning__"/></span>
    </div>

    <nav class="ts-segmented" role="tablist">
      <button type="button" role="tab" v-for="tab in tabs" :key="tab.id" :class="{ 'is-active': tab.id == currentTab }" :aria-selected="tab.id == currentTab" @click="emit('selectTab', tab.id)">{{ tab.label }}</button>
    </nav>

    <div class="ts-head-right">
      <div id="mzts-warn-msg" v-if="warn_message != ''">{{ warn_message }}</div>

      <div class="ts-status" v-if="currentTab != 'tab-info'" :title="status_title">
        <template v-if="is_loading && elapsed_time == 0"><img src="@/assets/images/mzts-wait_line.svg" class="ts-status-spinner" alt=""/>{{ loading_label }}…</template>
        <template v-else-if="last_exec_datetime != ''">{{ updated_label }} {{ last_exec_datetime }}</template>
      </div>

      <div class="ts-icon-group">
        <button type="button" class="ts-icon-btn" :title="refresh_label" :disabled="currentTab == 'tab-info'" @click="update()">
          <svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7"></path><path d="M20 4v7h-7"></path></svg>
        </button>
        <button type="button" class="ts-icon-btn" :title="export_label" :disabled="currentTab == 'tab-info'" @click="emit('exportData', $event.currentTarget)">
          <svg viewBox="0 0 24 24"><path d="M12 4v11"></path><path d="M7.5 10.5 12 15l4.5-4.5"></path><path d="M5 19h14"></path></svg>
        </button>
        <button type="button" class="ts-icon-btn" :title="settings_label" @click="openOptions()">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"></path></svg>
        </button>
        <button type="button" class="ts-icon-btn" :class="{ 'is-active': currentTab == 'tab-info' }" :title="info_label" @click="emit('selectTab', 'tab-info')">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5"></path><path d="M12 7.5v.01"></path></svg>
        </button>
      </div>

      <ThemeToggle/>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { tsLogger } from "@statslib/mzts-logger.js";
import { tsPrefs } from "@statslib/mzts-options.js";
import { tsStore } from "@statslib/mzts-store.js";
import { tsUtils } from "@statslib/mzts-utils.js";
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import SelectAccount from './SelectAccount.vue';
import ThemeToggle from './ThemeToggle.vue';

const emit = defineEmits(['chooseAccount', 'selectTab', 'exportData']);

const props = defineProps({
  elapsed_time: { type: Number, default:0 },
  last_exec_datetime: { type: Array, default: '' },
  currentTab: { type: String, default:'' },
  is_loading: { type: Boolean, default:false },
  tabs: { type: Array, default: () => [] },
})

let current_account = ref(0);
let SelectAccount_ref = ref(null);

let businessdays_only = computed(() => {
  if((props.currentTab != "tab-info") && (props.currentTab != "tab-customqry")){
    return tsStore.businessdays_only;
  }else{
    return false;
  }
})

let currentTab = computed(() => {
  return props.currentTab;
})

let last_exec_datetime = computed(() => {
  if(props.last_exec_datetime[currentTab.value] == undefined){
    return "";
  }
  return props.last_exec_datetime[currentTab.value];
})

let elapsed_time = computed(() => {
  return props.elapsed_time;
})

let is_loading = computed(() => {
  return props.is_loading;
})

let status_title = computed(() => {
  if(props.elapsed_time == 0) return "";
  return execution_time_label + ": " + tsUtils.convertFromMilliseconds(props.elapsed_time);
})

const choose_account_label = browser.i18n.getMessage("ChooseAccount");
const refresh_label = browser.i18n.getMessage("Update");
const export_label = browser.i18n.getMessage("ExportData");
const settings_label = browser.i18n.getMessage("Setup");
const info_label = browser.i18n.getMessage("Info");
const updated_label = browser.i18n.getMessage("LastExecution");
const loading_label = browser.i18n.getMessage("Loading");
const execution_time_label = browser.i18n.getMessage("ExecutionTime");

let warn_message = ref("");

let tsLog = null;

onMounted(async () => {
  tsLog = new tsLogger("HeadingNAV", tsStore.do_debug);
  let prefs = await tsPrefs.getPrefs(["startup_account", "remember_last_account", "_last_account_id"]);
  let account_to_load = prefs.startup_account;
  if (prefs.remember_last_account && prefs._last_account_id !== undefined) {
    account_to_load = prefs._last_account_id;
  }
  current_account.value = account_to_load;
  tsStore.current_account_id = current_account.value;
  tsLog.log("onMounted: " + current_account.value);
  SelectAccount_ref.value.updateCurrentAccount(current_account.value);
});

function update(){
  tsLog.log("update: " + current_account.value);
  emit('chooseAccount', current_account.value);
  checkAccountEmails();
}

async function accountSelected(){
  tsStore.current_account_id = current_account.value;
  tsLog.log("accountSelected: " + current_account.value);
  if(await tsPrefs.getPref("remember_last_account")){
    await tsPrefs.setPref("_last_account_id", current_account.value);
  }
  if(await tsPrefs.getPref("load_data_changing_account")){
    emit('chooseAccount', current_account.value);
    checkAccountEmails();
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
  checkAccountEmails();
  tsStore.current_account_id = current_account.value;
  return current_account.value;
}

async function checkAccountEmails(){
  let account_emails = await tsCoreUtils.getAccountEmails(current_account.value);
  warn_message.value = "";
  if(account_emails.length == 0){
    warn_message.value = browser.i18n.getMessage("AccountWithNoEmails");
  }
}

defineExpose({ getCurrentIdn });
</script>


<style scoped>
#heading_wrapper {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 10px 14px;
  padding: 10px 18px;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
  color: var(--text);
}

.ts-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 14px;
  font-weight: 660;
}

.ts-brand-mark {
  display: block;
  width: 9px;
  height: 9px;
  border-radius: 3px;
  background: var(--accent);
}

.ts-account-pill {
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 20px;
  background: var(--surface2);
}

.ts-account-pill::after {
  content: "\25BE";
  position: absolute;
  right: 12px;
  color: var(--text3);
  font-size: 13px;
  pointer-events: none;
}

.ts-account-pill :deep(select) {
  appearance: none;
  border: 0;
  border-radius: 20px;
  padding: 6px 30px 6px 12px;
  max-width: 260px;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  text-overflow: ellipsis;
}

.ts-head-left,
.ts-head-right {
  display: flex;
  align-items: center;
  gap: 10px 14px;
  min-width: 0;
}

.ts-head-right {
  justify-content: flex-end;
}

@media (max-width: 900px) {
  #heading_wrapper {
    display: flex;
    flex-wrap: wrap;
  }

  .ts-head-right {
    margin-left: auto;
  }
}

.ts-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text3);
  white-space: nowrap;
}

.ts-status-spinner {
  height: 12px;
}

.ts-icon-group {
  display: flex;
  gap: 6px;
}

.ts-icon-btn.is-active {
  color: var(--accent);
  background: var(--accentSoft);
}

.bday_icon {
  display: flex;
  align-items: center;
}

.bday_icon img {
  width: 16px;
  height: 16px;
}

#mzts-warn-msg {
  padding: 4px 12px;
  border-radius: 20px;
  background: var(--warn);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
}
</style>
