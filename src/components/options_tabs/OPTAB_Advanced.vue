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
  <table class="miczPrefs">
    <tr>
      <td colspan="2" class="grouptitle">__MSG_ManyDaysGraph__</td>
    </tr>
    <tr>
      <td class="td_padding_right">
        <label><input type="number" id="_many_days" name="_many_days" class="option-input" /></label>
      </td>
      <td>
        <span class="dims_label">__MSG_ManyDays__</span>
      </td>
    </tr>
    <tr>
      <td class="td_padding_right">
        <label><input type="number" id="_involved_num" name="_involved_num" class="option-input" /></label>
      </td>
      <td>
        <span class="dims_label">__MSG_InvolvedNum__</span>
      </td>
    </tr>
    </table>
    <table class="miczPrefs" style="margin-top: 50px;">
    <tr>
      <td>
        <label><input type="checkbox" id="do_debug" name="do_debug" class="option-input" /></label>
      </td>
      <td>
        <span class="dims_label">__MSG_ActivateDebug__</span>
      </td>
    </tr>
  </table>
  
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