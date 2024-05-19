<template>
    <HeadingNAV @chooseAccount="updateStats" :do_debug="do_debug" ref="HeadingNAV_ref"/>
  
    <main>
      <tabs :options="{ defaultTabHash: 'tab-today' }"  cache-lifetime="0">
        <tab id="tab-today" name="__MSG_Today__">
            <TAB_Today :activeAccount="activeAccount" :accountEmails="accountEmails" :do_debug="do_debug" ref="TAB_Today_ref" />
            <div v-html="test_output"></div>
        </tab>
        <tab id="tab-yesterday" name="__MSG_Yesterday__">
            Yesterday content
        </tab>
        <tab id="tab-manydays" :name="_many_days_text">
            Many Days content
        </tab>
        <tab id="tab-customqry" name="__MSG_CustomQry__">
            CustomQry content
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
  import { thunderStastsCore } from "@statslib/mzts-statscore.js";
  import { i18n } from "@statslib/mzts-i18n.js";
  import { TS_prefs } from '@statslib/mzts-options.js';
  import { tsLogger } from "@statslib/mzts-logger.js";

  let TAB_Today_ref = ref(null);
  let HeadingNAV_ref = ref(null);
  
  let activeAccount = ref(0);
  let accountEmails = ref([]);
  let _many_days = 0;
  let test_output = ref("");
  let _many_days_text = ref("");

  let do_debug = ref(false);
  let tsLog = null;
  let tsCore = null
    

  onMounted(async () => {
    //test_output.value = await thunderStatsCore.test_core_accounts();
    _many_days = await TS_prefs.getPref("_many_days");
    _many_days_text.value = browser.i18n.getMessage("LastNumDays", _many_days);
    do_debug.value = await TS_prefs.getPref("do_debug");
    tsLog = new tsLogger("ThunderStatsView", do_debug.value);
    tsCore = new thunderStastsCore(do_debug.value);
    i18n.updateDocument();
    updateStats(HeadingNAV_ref.value.getCurrentIdn());
  });
  

  async function updateStats(account_id) {
    tsLog.log("updateStats", account_id);
    //test_output.value = await tsCore.test_core_messages(account_id);
    activeAccount.value = account_id;
    accountEmails.value = await tsCore.getAccountEmails(account_id);
    tsLog.log("accountEmails: " + JSON.stringify(accountEmails.value));
    nextTick(() => {
      TAB_Today_ref.value.updateData();
    });
  }

  
  </script>
  
  
  
  
  <style scoped>
  main{
    position: relative;
    top: 28px;
  }
  </style>
  