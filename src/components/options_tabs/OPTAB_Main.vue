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
  <table class="miczPrefs">
      <tr>
      <td colspan="2" class="grouptitle">__MSG_Miscellaneous__</td>
    </tr>
    <tr>
     <td>
        <label><input type="checkbox" id="load_data_changing_account" name="load_data_changing_account" class="option-input" /></label>
      </td>
      <td>
     <label><span class="dims_label" @click="toggle_options">__MSG_prefs_load_data_changing_account__</span></label>
      </td>
    </tr>
    <tr>
     <td>
        <label><input type="checkbox" id="always_reload_tab_data" name="always_reload_tab_data" class="option-input" /></label>
      </td>
      <td>
     <label><span class="dims_label" @click="toggle_options">__MSG_prefs_always_reload_tab_data__</span></label>
      </td>
    </tr>
    <tr>
      <td>
        <label><input type="checkbox" id="remember_last_tab" name="remember_last_tab" class="option-input" /></label>
      </td>
      <td>
     <label><span class="dims_label" @click="toggle_options">__MSG_prefs_remember_last_tab__</span></label>
      </td>
    </tr>
    <tr>
      <td>
        <label><input type="checkbox" id="customqry_always_open_adv_filters" name="customqry_always_open_adv_filters" class="option-input" /></label>
      </td>
      <td>
     <label><span class="dims_label" @click="toggle_options">__MSG_prefs_customqry_always_open_adv_filters__</span></label>
      </td>
    </tr>
  </table>
    <table class="miczPrefs" style="margin-top: 10px;">
      <tr>
      <td colspan="2" class="grouptitle">__MSG_TimeChart__</td>
    </tr>
    <tr>
      <td>
        <label><input type="checkbox" id="today_time_graph_show_yesterday" name="today_time_graph_show_yesterday" class="option-input" /></label>
      </td>
      <td>
     <label><span class="dims_label" @click="toggle_options">__MSG_TodayTimeChartShowYesterday__</span></label>
      </td>
    </tr>
      <tr>
      <td>
        <label><input type="checkbox" id="_time_graph_progressive" name="_time_graph_progressive" class="option-input" /></label>
      </td>
      <td>
     <label><span class="dims_label" @click="toggle_options">__MSG_TimeChartProgressive__</span></label>
      </td>
    </tr>
    <tr>
      <td>
        <label><input type="checkbox" id="today_time_graph_do_no_show_future" name="today_time_graph_do_no_show_future" class="option-input" /></label> 
      </td>
      <td>
        <label><span class="dims_label" @click="toggle_options">__MSG_TimeChartNoFutureHours__</span></label>
      </td>
    </tr>
    </table>
    <table class="miczPrefs">
    <tr>
      <td colspan="2" class="grouptitle">__MSG_InboxZeroChart__</td>
    </tr>
    <tr>
      <td>
        <label><input type="checkbox" id="inbox0_openFolderInFirstTab" name="inbox0_openFolderInFirstTab" class="option-input" /></label>
      </td>
      <td>
     <label><span class="dims_label" @click="toggle_options">__MSG_folderspreadchart_openinfirsttab__</span></label>
      </td>
    </tr>
    </table>
    <table class="miczPrefs">
    <tr>
      <td colspan="2" class="grouptitle">__MSG_ManyDaysChart__</td>
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
        <span class="dims_label" @click="toggle_options">__MSG_CustomQueryBookmarkImmediateUpdate__</span>
      </td>
    </tr>
    <tr>
      <td class="td_padding_right">
        <label><input type="text" id="datepicker_locale" name="datepicker_locale" class="option-input" /></label>
      </td>
      <td>
        <button type="button" @click="setDefaultDatePickerLocale" class="marginright10">__MSG_SetDefault__</button>
        <span class="dims_label">__MSG_DatePickerLocale__</span>
      </td>
    </tr>
    </table>
</template>


<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import SelectAccount from '@/components/SelectAccount.vue';
import { tsLogger } from '@statslib/mzts-logger';
import { tsStore } from '@statslib/mzts-store';
  
  const emit = defineEmits(['new_changes']);

  let current_account = ref(0);
  let tsLog = null;
  let new_changes = ref(false);
  
  onMounted(() => {
    tsLog = new tsLogger("OPTAB_Main", tsStore.do_debug);
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('change', somethingChanged);
    });
    tsLog.log("onMounted");
  });
  
  onUnmounted(() => {
    tsLog.log("onUnmounted");
  });

  async function somethingChanged() {
    new_changes.value = true;
    emit('new_changes', new_changes.value);
  }

  function setDefaultDatePickerLocale() {
    const datepicker = document.getElementById('datepicker_locale');
    datepicker.value = navigator.language;
    datepicker.dispatchEvent(new Event('change', { 'bubbles': true }));
  }

  function toggle_options(e) {
    let row = e.target.closest('tr');
    let checkbox = row.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
    checkbox.dispatchEvent(new Event('change', { 'bubbles': true }));
  }
</script>


<style scoped>

</style>