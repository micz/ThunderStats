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
    </table>
    <table class="miczPrefs">
    <tr>
      <td colspan="2" class="grouptitle">__MSG_CustomQryTabGroupbox__</td>
    </tr>
    <tr>
      <td>
        <label><input type="checkbox" id="customqry_loaddata_when_selectingrange" name="customqry_loaddata_when_selectingrange" class="option-input" /></label>
      </td>
      <td>
        <span class="dims_label">__MSG_CustomQueryBookmarkImmediateUpdate__</span>
      </td>
    </tr>
    </table>
    <table class="miczPrefs">
    <tr>
      <td colspan="2" class="grouptitle">__MSG_InboxZeroGraph__</td>
    </tr>
    <tr>
      <td>
        <label><input type="checkbox" id="inbox0_openFolderInFirstTab" name="inbox0_openFolderInFirstTab" class="option-input" /></label>
      </td>
      <td>
     <label><span class="dims_label">__MSG_folderspreadgraph_openinfirsttab__</span></label>
      </td>
    </tr>
    </table>
    <table class="miczPrefs" style="margin-top: 50px;">
    <tr>
      <td colspan="2" class="grouptitle">__MSG_Other__</td>
    </tr>
    <tr>
      <td class="td_padding_right">
        <label>
        <select id="first_day_week" name="first_day_week" class="option-input">
          <option value="0">__MSG_WeekDay0__</option>
          <option value="1">__MSG_WeekDay1__</option>
          <option value="6">__MSG_WeekDay6__</option>
        </select>
        </label>
      </td>
      <td>
        <span class="dims_label">__MSG_prefs_FirstDayWeek__</span>
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
    <tr>
      <td>
        <label><input type="checkbox" id="do_debug" name="do_debug" class="option-input" /></label>
      </td>
      <td>
        <span class="dims_label">__MSG_ActivateDebug__</span>
      </td>
    </tr>
  </table>
  
  <div class="intro_change_warn" v-if="new_changes" v-text="reopenTabDesc"></div>
  
  </template>


<script setup>
  import { onMounted, onUnmounted, ref } from 'vue'
  import { tsLogger } from '@statslib/mzts-logger';
  import { tsStore } from '@statslib/mzts-store';

  let tsLog = null;
  let new_changes = ref(false);
  let reopenTabDesc = ref('');

  onMounted(() => {
    tsLog = new tsLogger("OPTAB_Advanced", tsStore.do_debug);
    /*TS_prefs.restoreOptions();
    i18n.updateDocument();
    document.querySelectorAll(".option-input").forEach(element => {
      element.addEventListener("change", TS_prefs.saveOptions);
    });*/
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('click', somethingChanged);
    });
    document.getElementById('first_day_week').addEventListener('change', somethingChanged);
    reopenTabDesc.value = browser.i18n.getMessage("ReopenTabDesc");
    tsLog.log("onMounted");
  });
  
  onUnmounted(() => {
   /* document.querySelectorAll('.option-input').forEach(element => {
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