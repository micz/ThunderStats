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
    <HeadingNAV @chooseAccount="updateStats" :do_debug="do_debug" ref="HeadingNAV_ref"/>
  
    <main>
      <tabs :options="{ defaultTabHash: 'tab-today' }"  cache-lifetime="120000"  @changed="tabChanged" ref="statsTabs">
        <tab id="tab-today" name="__MSG_Today__">
            <TAB_Today :activeAccount="activeAccount" :accountEmails="accountEmails" :do_debug="do_debug" ref="TAB_Today_ref" />
        </tab>
        <tab id="tab-yesterday" name="__MSG_Yesterday__">
          <TAB_Yesterday :activeAccount="activeAccount" :accountEmails="accountEmails" :do_debug="do_debug" ref="TAB_Yesterday_ref" />
        </tab>
        <tab id="tab-manydays" :name="_many_days_text">
          <TAB_ManyDays :activeAccount="activeAccount" :accountEmails="accountEmails" :do_debug="do_debug" ref="TAB_ManyDays_ref" />
        </tab>
        <tab id="tab-customqry" name="__MSG_CustomQry__">
          <TAB_CustomQry :activeAccount="activeAccount" :accountEmails="accountEmails" :do_debug="do_debug" ref="TAB_CustomQry_ref" />
        </tab>
        <tab id="tab-info" name="__MSG_Info__">
            <TAB_Info />
        </tab>
    </tabs>
    </main>
  </template>
  
  
<script setup>
import { ref, onMounted, nextTick } from 'vue'
import HeadingNAV from "@/components/HeadingNAV.vue";
import TAB_Info from "@/components/tabs/TAB_Info.vue";
import TAB_Today from '@/components/tabs/TAB_Today.vue';
import TAB_Yesterday from '@/components/tabs/TAB_Yesterday.vue';
import TAB_ManyDays from '@/components/tabs/TAB_ManyDays.vue';
import TAB_CustomQry from '@/components/tabs/TAB_CustomQry.vue';
import { thunderStastsCore } from "@statslib/mzts-statscore.js";
import { i18n } from "@statslib/mzts-i18n.js";
import { TS_prefs } from '@statslib/mzts-options.js';
import { tsLogger } from "@statslib/mzts-logger.js";

  let statsTabs = ref(null);
  let TAB_Today_ref = ref(null);
  let TAB_Yesterday_ref = ref(null);
  let TAB_ManyDays_ref = ref(null);
  let TAB_CustomQry_ref = ref(null);

  let HeadingNAV_ref = ref(null);
  
  let activeAccount = ref(0);
  let accountEmails = ref([]);
  let _many_days_text = ref("");

  let do_debug = ref(false);
  let tsLog = null;
  let tsCore = null

  // let stats_done = {
  //   "tab-today": false,
  //   "tab-yesterday": false,
  //   "tab-manydays": false,
  //   "tab-customqry": false,
  // }
  
  // function statsDone(id) {

  //   stats_done[id] = true;
  // }

  onMounted(async () => {
    //test_output.value = await thunderStatsCore.test_core_accounts();
    let _many_days = await TS_prefs.getPref("_many_days");
    _many_days_text.value = browser.i18n.getMessage("LastNumDays", _many_days);
    do_debug.value = await TS_prefs.getPref("do_debug");
    tsLog = new tsLogger("ThunderStatsView", do_debug.value);
    tsCore = new thunderStastsCore({do_debug: do_debug.value});
    i18n.updateDocument();
    updateStats(HeadingNAV_ref.value.getCurrentIdn());
  });
  

  async function updateStats(account_id) {
    if((tsLog == null) || (tsCore == null)) { do_debug.value = await TS_prefs.getPref("do_debug"); }
    if(tsLog == null) {
      tsLog = new tsLogger("ThunderStatsView", do_debug.value);
    }
    if(tsCore == null) {
      tsCore = new thunderStastsCore({do_debug: do_debug.value});
    }
    tsLog.log("updateStats", account_id);
    activeAccount.value = account_id;
    accountEmails.value = await tsCore.getAccountEmails(account_id);
    tsLog.log("accountEmails: " + JSON.stringify(accountEmails.value));
    nextTick(() => {
      let curr_tab = statsTabs.value.activeTabHash;
      console.log(">>>>>>>>>>> curr_tab: " + curr_tab);
      switch(curr_tab) {
        case "#tab-today":
          TAB_Today_ref.value.updateData();
          break;
        case "#tab-yesterday":
          TAB_Yesterday_ref.value.updateData();
          break;
        case "#tab-manydays":
          TAB_ManyDays_ref.value.updateData();
          break;
        case "#tab-customqry":
          break;
      }
    });
  }

  async function tabChanged(id) {
    console.log(">>>>>>>>>>>>>>>>> tabChanged: " + JSON.stringify(id));
    // if(!stats_done[id.tab.computedId]) {
      await updateStats(HeadingNAV_ref.value.getCurrentIdn());
    // }
    // stats_done[id.tab.computedId] = true;
  }
  
  </script>
  
  
  
  
  <style scoped>
  main{
    position: relative;
    top: 28px;
  }
  </style>
  