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
    <HeadingNAV @chooseAccount="updateStats" :is_loading="is_loading" :elapsed_time="elapsed_time" :last_exec_datetime="last_exec_datetime" :currentTab="currentTab" ref="HeadingNAV_ref"/>
  
    <main>
      <tabs :options="{ defaultTabHash: 'tab-today', storageKey: 'tabs-storage-key' }" :cache-lifetime="cache_lifetime"  @changed="tabChanged" ref="statsTabs_ref">
        <tab id="tab-today" name="__MSG_Today__">
            <TAB_Today :accountEmails="accountEmails" @updateElapsed="updateElapsed" @updateYesterdayTabName="updateYesterdayTabName" ref="TAB_Today_ref" />
        </tab>
        <tab id="tab-yesterday" :name="_yesterday_text">
          <TAB_Yesterday :accountEmails="accountEmails" @updateElapsed="updateElapsed" @updateTabName="updateYesterdayTabName" ref="TAB_Yesterday_ref" />
        </tab>
        <tab id="tab-manydays" :name="_many_days_text">
          <TAB_ManyDays :accountEmails="accountEmails" @updateElapsed="updateElapsed" ref="TAB_ManyDays_ref" />
        </tab>
        <tab id="tab-customqry" name="__MSG_CustomQry__">
          <TAB_CustomQry @updateCustomQry="updateCustomQry" :accountEmails="accountEmails" @updateElapsed="updateElapsed" @customQryUserCancelled="customQryUserCancelled" ref="TAB_CustomQry_ref" />
        </tab>
        <tab id="tab-info" name="__MSG_Info__">
            <TAB_Info />
        </tab>
    </tabs>
    </main>
  </template>
  
  
<script setup>
import { ref, onMounted, nextTick, onBeforeMount } from 'vue'
import HeadingNAV from "@/components/HeadingNAV.vue";
import TAB_Info from "@/components/tabs/TAB_Info.vue";
import TAB_Today from '@/components/tabs/TAB_Today.vue';
import TAB_Yesterday from '@/components/tabs/TAB_Yesterday.vue';
import TAB_ManyDays from '@/components/tabs/TAB_ManyDays.vue';
import TAB_CustomQry from '@/components/tabs/TAB_CustomQry.vue';
import { thunderStastsCore } from "@statslib/mzts-statscore.js";
import { i18n } from "@statslib/mzts-i18n.js";
import { tsPrefs } from '@statslib/mzts-options.js';
import { tsLogger } from "@statslib/mzts-logger.js";
import { tsStore } from '@statslib/mzts-store';
import { tsUtils } from '@statslib/mzts-utils';

  let statsTabs_ref = ref(null);
  let TAB_Today_ref = ref(null);
  let TAB_Yesterday_ref = ref(null);
  let TAB_ManyDays_ref = ref(null);
  let TAB_CustomQry_ref = ref(null);
  let HeadingNAV_ref = ref(null);
  
  let activeAccount = ref(0);
  let accountEmails = ref([]);
  let _many_days_text = ref("");
  let _yesterday_text = ref("__MSG_Yesterday__");
  let cache_lifetime = ref(120000);
  let elapsed_time = ref(0);
  let last_exec_datetime = ref([]);
  let is_loading = ref(false);
  let currentTab = ref("tab-today");

  var tsLog = null;
  let tsCore = null
  let remember_last_tab = false;
  let always_reload_tab_data = false;
  let mounted_ok = false;
  let last_account_id = -1;

  let stats_done = {
    "tab-today": false,
    "tab-yesterday": false,
    "tab-manydays": false,
    "tab-customqry": false,
  }
  
  function statsDone(id) {
    stats_done[id] = true;
  }

  // function resetStatsDone() {
  //   stats_done = {
  //     "tab-today": false,
  //     "tab-yesterday": false,
  //     "tab-manydays": false,
  //     "tab-customqry": false,
  //   }
  // }

  onBeforeMount(async () => {
//    console.log(">>>>>>>>>>>> ThunderStatsView onBeforeMount tsStore.do_debug: " + tsStore.do_debug);
    tsLog = new tsLogger("ThunderStatsView", tsStore.do_debug);
    tsPrefs.logger = tsLog;
    let prefs = await tsPrefs.getPrefs([
      "remember_last_tab",
      "always_reload_tab_data",
      "bday_default_only",
      "bday_easter",
      "bday_custom_days",
      "bday_weekdays_0",
      "bday_weekdays_1",
      "bday_weekdays_2",
      "bday_weekdays_3",
      "bday_weekdays_4",
      "bday_weekdays_5",
      "bday_weekdays_6",
    ]);
    remember_last_tab = prefs.remember_last_tab;
    always_reload_tab_data = prefs.always_reload_tab_data;
    tsStore.businessdays_only = prefs.bday_default_only;
    tsStore.bday_easter = prefs.bday_easter;
    tsStore.bday_custom_days = prefs.bday_custom_days;
    tsStore.bday_weekdays_0 = prefs.bday_weekdays_0;
    tsStore.bday_weekdays_1 = prefs.bday_weekdays_1;
    tsStore.bday_weekdays_2 = prefs.bday_weekdays_2;
    tsStore.bday_weekdays_3 = prefs.bday_weekdays_3;
    tsStore.bday_weekdays_4 = prefs.bday_weekdays_4;
    tsStore.bday_weekdays_5 = prefs.bday_weekdays_5;
    tsStore.bday_weekdays_6 = prefs.bday_weekdays_6;
    if(remember_last_tab) {
      cache_lifetime.value = 120000;
    } else {
      cache_lifetime.value = 0;
      localStorage.removeItem('tabs-storage-key');
      // localStorage.setItem('tabs-storage-key', JSON.stringify({ value: 'tab-today', expires: 10 }));
    }
    // console.log(">>>>>>>>>>>>>>>>> cache_lifetime: " + cache_lifetime.value);
    // console.log(">>>>>>>>>>>>>>>>> tabs-storage-key: " + JSON.stringify(localStorage.getItem('tabs-storage-key')));
    if(tsStore.darkmode === undefined) {
      tsStore.darkmode = tsUtils.isDarkMode();
    }
  });

  onMounted(async () => {
    // console.log(">>>>>>>>>>>> ThunderStatsView onMounted");
    // console.log(">>>>>>>>>>>>> ThunderStatsView onMounted statsTabs_ref.value.activeTabHash: " + JSON.stringify(statsTabs_ref.value.activeTabHash));
    let prefs_onmounted = await tsPrefs.getPrefs(["remember_last_tab","customqry_loaddata_when_opening_addon"]);
    remember_last_tab = prefs_onmounted.remember_last_tab;
    if(!remember_last_tab) {
      statsTabs_ref.value.selectTab('#tab-today');
      tsStore.currentTab = "tab-today";
    }else {
      tsStore.currentTab = statsTabs_ref.value.activeTabHash.substring(1);
    }
    // console.log(">>>>>>>>>>>>>> ThunderStatsView onMounted tsStore.currentTab: " + tsStore.currentTab);
    let _many_days = await tsPrefs.getPref("_many_days");
    _many_days_text.value = browser.i18n.getMessage("LastNumDays", _many_days);
    tsCore = new thunderStastsCore({do_debug: tsStore.do_debug});
    i18n.updateDocument();
    if((tsStore.currentTab != "tab-customqry")||(prefs_onmounted.customqry_loaddata_when_opening_addon)) {
      updateStats(HeadingNAV_ref.value.getCurrentIdn());
    }
    mounted_ok = true;
  });
  

  async function updateStats(account_id) {
    // console.log(">>>>>>>>>>>> ThunderStatsView updateStats tsStore.do_debug: " + tsStore.do_debug);
    if(tsLog == null) {
      tsLog = new tsLogger("ThunderStatsView", tsStore.do_debug);
    }
    if(tsCore == null) {
      tsCore = new thunderStastsCore({do_debug: tsStore.do_debug});
    }
    //elapsed_time.value = 0;
    updateElapsed(0);
    last_exec_datetime.value[currentTab.value] = '';
    tsLog.log("updateStats", account_id);
    activeAccount.value = account_id;
    accountEmails.value = await tsCore.getAccountEmails(account_id);
    tsLog.log("accountEmails: " + JSON.stringify(accountEmails.value));
//    resetStatsDone();
    nextTick(() => {
      // console.log(">>>>>>>>>>>>>> ThunderStatsView updateStats statsTabs_ref.value.activeTabHash: " + statsTabs_ref.value.activeTabHash);
      tsStore.currentTab = statsTabs_ref.value.activeTabHash.substring(1);
      tsLog.log("tsStore.currentTab: " + tsStore.currentTab);
      is_loading.value = true;
      switch(tsStore.currentTab) {
        case "tab-today":
          TAB_Today_ref.value.updateData();
          break;
        case "tab-yesterday":
          TAB_Yesterday_ref.value.updateData();
          break;
        case "tab-manydays":
          TAB_ManyDays_ref.value.updateData();
          break;
        case "tab-customqry":
          TAB_CustomQry_ref.value.doQry();
          break;
      }
      statsDone(tsStore.currentTab);
    });
  }

  async function tabChanged(id) {
    //console.log(">>>>>>>>>>>>> tabChanged: " + JSON.stringify(id) + " stats_done[id.tab.computedId]: " + stats_done[id.tab.computedId]);
    //console.log(">>>>>>>>>>>> ThunderStatsView tabChanged tsStore.do_debug: " + tsStore.do_debug);
    //console.log(">>>>>>>>>>>> ThunderStatsView tabChanged tsLog: " + JSON.stringify(tsLog));
    currentTab.value = id.tab.computedId;
    tsStore.currentTab = id.tab.computedId;
    if(!mounted_ok) { return; }
    updateElapsed(0);
    is_loading.value = false;
    if(last_account_id != activeAccount.value) {
      last_account_id = activeAccount.value;
      stats_done[id.tab.computedId] = false;
    }
    // console.log(">>>>>>>>>>>>> tabChanged: " + JSON.stringify(id));
     //console.log(">>>>>>>>>>>>> tabChanged always_reload_tab_data: " + JSON.stringify(always_reload_tab_data));
    tsLog.log("tabChanged: " + JSON.stringify(id.tab.computedId));
    //console.log(">>>>>>>>>>>>>> tabChanged: " + JSON.stringify(id.tab.computedId));
     //console.log(">>>>>>>>>>>>> stats_done[id.tab.computedId]: " + stats_done[id.tab.computedId]);
    if((id.tab.computedId != "tab-customqry") && (id.tab.computedId != "tab-info") && ((!stats_done[id.tab.computedId]) || always_reload_tab_data)) {
      tsLog.log("tabChanged ==> Loading Data...");
      // console.log(">>>>>>>>>>>>>> tabChanged ==> Loading Data...");
      await updateStats(HeadingNAV_ref.value.getCurrentIdn());  //TODO use the new tsStore
      //statsDone(id.tab.computedId);
    }
    if(id.tab.computedId == "tab-customqry"){
      await nextTick();
      TAB_CustomQry_ref.value.updateAdvFiltersPosition();
    }
  }

  async function updateCustomQry() {
    //console.log(">>>>>>>>>>>>> stats_done[id.tab.computedId]: " + stats_done["tab-customqry"]);
    stats_done["tab-customqry"] = false;
    await updateStats(HeadingNAV_ref.value.getCurrentIdn());
    statsDone("tab-customqry");
  }

  function updateElapsed(elapsed) {
    tsLog.log("updateElapsed: " + elapsed);
    // console.log(">>>>>>>>>>>>> updateElapsed elapsed: " + elapsed);
    // console.log(">>>>>>>>>>>>> updateElapsed elapsed_time.value: " + elapsed_time.value);
    //if(elapsed_time.value < elapsed) elapsed_time.value = elapsed;
    elapsed_time.value = elapsed;
    if(elapsed > 0) last_exec_datetime.value[currentTab.value] = (new Date()).toLocaleTimeString();
  }

  function customQryUserCancelled() {
    tsLog.log("The user cancelled the custom query when asked about too many days.");
    is_loading.value = false;
  }

  function updateYesterdayTabName(name) {
    _yesterday_text.value = name;
  }

  </script>
  
  
  
  
  <style scoped>
  main{
    position: relative;
    top: 28px;
  }
  </style>
  
