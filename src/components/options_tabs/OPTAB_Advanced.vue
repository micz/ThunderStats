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
  <h2>__MSG_TabAdvanced.label__</h2>
  <p>__MSG_ManyDaysGraph__
    <br>
  <label>
    <input type="textbox" id="_many_days" name="_many_days" class="option-input" />
     &nbsp;<span class="dims_label">__MSG_ManyDays__</span>
  </label>
  </p>
  <p>
  <label>
    <input type="textbox" id="_involved_num" name="_involved_num" class="option-input" />
     &nbsp;<span class="dims_label">__MSG_InvolvedNum__</span>
  </label>
  </p>
  <br>
  
  
  <br><br><br><br>
      <div id="miczDonation">__MSG_prefsDonation_1__<br/><a href="https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/donate/">__MSG_prefsDonation_2__</a></div>
  </template>


<script setup>
  import { onMounted, onUnmounted } from 'vue'
  import { tsLogger } from '@statslib/mzts-logger';
  import { tsStore } from '@statslib/mzts-store';

  let tsLog = null;

  onMounted(() => {
    tsLog = new tsLogger("OPTAB_Advanced", tsStore.do_debug);
    /*TS_prefs.restoreOptions();
    i18n.updateDocument();
    document.querySelectorAll(".option-input").forEach(element => {
      element.addEventListener("change", TS_prefs.saveOptions);
    });*/
    tsLog.log("onMounted");
  });
  
  onUnmounted(() => {
   /* document.querySelectorAll('.option-input').forEach(element => {
      element.removeEventListener('change', TS_prefs.saveOptions);
    });*/
    tsLog.log("onUnmounted");
  });
  
</script>
      

<style scoped>

</style>