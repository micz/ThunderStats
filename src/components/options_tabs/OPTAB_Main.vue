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
    <div>__MSG_GlobalDescSettingTab__</div>
    
  <label>__MSG_StartupAccount__:
    <SelectAccount v-model="current_account" id="startup_account" name="startup_account" class="option-input"/>
  </label>
  <br>
  <label>
    <input type="checkbox" id="_time_graph_progressive" name="_time_graph_progressive" class="option-input" />
     &nbsp;<span class="dims_label">__MSG_TimeGraphProgressive__</span>
  </label>
  <br>
  <label>
    <input type="checkbox" id="inbox0_openFolderInFirstTab" name="inbox0_openFolderInFirstTab" class="option-input" />
     &nbsp;<span class="dims_label">__MSG_folderspreadgraph_openinfirsttab__</span>
  </label>
  <br>
  <label>
    <input type="checkbox" id="always_reload_tab_data" name="always_reload_tab_data" class="option-input" />
     &nbsp;<span class="dims_label">__MSG_prefs_always_reload_tab_data__</span>
  </label>
  <br>
  <label>
    <input type="checkbox" id="remember_last_tab" name="remember_last_tab" class="option-input" />
     &nbsp;<span class="dims_label">__MSG_prefs_remember_last_tab__</span>
  </label>

  <br><br><br><br>
      <div id="miczDescription">
        <h1>__MSG_prefsInfoTitle__</h1>
        <p>__MSG_prefsInfoDesc_1__<br/>
          __MSG_prefsInfoDesc_2__<br/>
          __MSG_prefsInfoDesc_3__</p>
      </div>
</template>


<script setup>
  import { onMounted, onUnmounted, ref } from 'vue'
  import SelectAccount from '@/components/SelectAccount.vue';
  import { tsLogger } from '@statslib/mzts-logger';
  import { tsStore } from '@statslib/mzts-store';
  
  let current_account = ref(0);
  let tsLog = null;
  
  onMounted(() => {
    tsLog = new tsLogger("OPTAB_Main", tsStore.do_debug);
    /*TS_prefs.restoreOptions();
    i18n.updateDocument();
    document.querySelectorAll(".option-input").forEach(element => {
      element.addEventListener("change", TS_prefs.saveOptions);
    });*/
    tsLog.log("onMounted");
  });
  
  onUnmounted(() => {
    /*document.querySelectorAll('.option-input').forEach(element => {
      element.removeEventListener('change', TS_prefs.saveOptions);
    });*/
    tsLog.log("onUnmounted");
  });
  
</script>


<style scoped>

</style>