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
    <div class="intro_main">__MSG_GlobalDescSettingTab__</div>
  <table class="miczPrefs">
    <tr>
      <td style="padding-right: 10px;">
        <label>__MSG_StartupAccount__:</label>
      </td>
      <td>
        <label><SelectAccount v-model="current_account" id="startup_account" name="startup_account" class="option-input"/></label>
      </td>
    </tr>
  </table>
    <table class="miczPrefs" style="margin-top: 10px;">
    <tr>
      <td>
        <label><input type="checkbox" id="_time_graph_progressive" name="_time_graph_progressive" class="option-input" /></label>
      </td>
      <td>
     <label><span class="dims_label">__MSG_TimeGraphProgressive__</span></label>
      </td>
    </tr>
    <tr>
      <td>
        <label><input type="checkbox" id="today_time_graph_show_yesterday" name="today_time_graph_show_yesterday" class="option-input" /></label>
      </td>
      <td>
     <label><span class="dims_label">__MSG_TodayTimeGraphShowYesterday__</span></label>
      </td>
    </tr>
    <tr>
      <td>
        <label><input type="checkbox" id="inbox0_openFolderInFirstTab" name="inbox0_openFolderInFirstTab" class="option-input" /></label>
      </td>
      <td>
     <label><span class="dims_label">__MSG_folderspreadgraph_openinfirsttab__</span></label>
      </td>
    </tr>
    <tr>
     <td>
        <label><input type="checkbox" id="always_reload_tab_data" name="always_reload_tab_data" class="option-input" /></label>
      </td>
      <td>
     <label><span class="dims_label">__MSG_prefs_always_reload_tab_data__</span></label>
      </td>
    </tr>
    <tr>
      <td>
        <label><input type="checkbox" id="remember_last_tab" name="remember_last_tab" class="option-input" /></label>
      </td>
      <td>
     <label><span class="dims_label">__MSG_prefs_remember_last_tab__</span></label>
      </td>
    </tr>
  </table>
  <div class="intro_change_warn" v-if="new_changes" v-text="reopenTabDesc"></div>

 <!--<br><br><br><br>
      <div id="miczDescription">
        <h1>__MSG_prefsInfoTitle__</h1>
        <p>__MSG_prefsInfoDesc_1__<br/>
          __MSG_prefsInfoDesc_2__<br/>
          __MSG_prefsInfoDesc_3__</p>
      </div>-->
</template>


<script setup>
  import { onMounted, onUnmounted, ref } from 'vue'
  import SelectAccount from '@/components/SelectAccount.vue';
  import { tsLogger } from '@statslib/mzts-logger';
  import { tsStore } from '@statslib/mzts-store';
  
  let current_account = ref(0);
  let tsLog = null;
  let new_changes = ref(false);
  let reopenTabDesc = ref('');
  
  onMounted(() => {
    tsLog = new tsLogger("OPTAB_Main", tsStore.do_debug);
    /*TS_prefs.restoreOptions();
    i18n.updateDocument();
    document.querySelectorAll(".option-input").forEach(element => {
      element.addEventListener("change", TS_prefs.saveOptions);
    });*/
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('click', somethingChanged);
    });
    reopenTabDesc.value = browser.i18n.getMessage("ReopenTabDesc");
    tsLog.log("onMounted");
  });
  
  onUnmounted(() => {
    /*document.querySelectorAll('.option-input').forEach(element => {
      element.removeEventListener('change', TS_prefs.saveOptions);
    });*/
    tsLog.log("onUnmounted");
  });

  async function somethingChanged() {
    new_changes.value = true;
  }
  
</script>


<style scoped>

</style>