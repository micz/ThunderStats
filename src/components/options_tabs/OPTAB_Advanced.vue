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
  <div class="intro_main">
    __MSG_AdvancedSettingTabDesc__
  </div>
    <table class="miczPrefs">
    <tr>
      <td colspan="2" class="grouptitle">__MSG_AdvancedAccountList__
      </td>
    </tr>
    <tr>
      <td colspan="2">__MSG_ImportantInfoText_1__ __MSG_AdvancedAccountList_Desc__
      </td>
    </tr>
    <tr>
      <td>
        <label><input type="checkbox" id="include_archive_multi_account" name="include_archive_multi_account" class="option-input" /></label>
      </td>
      <td>
     <label><span class="dims_label" @click="toggle_options">__MSG_prefs_include_archive_multi_account__</span></label>
      </td>
    </tr>
    <tr>
      <td>
        <label><input type="checkbox" id="filter_duplicates_multi_account" name="filter_duplicates_multi_account" class="option-input" /></label>
      </td>
      <td>
     <label><span class="dims_label" @click="toggle_options">__MSG_prefs_filter_duplicates_multi_account__</span></label>
      </td>
    </tr>
    <tr>
      <td colspan="2">
        <AdvancedAccountList :accounts="accounts_adv_settings" ref="AccountList_ref" @updateAccounts="accountListChanged"/>
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
      <td class="td_padding_right">
        <label><input type="number" id="customqry_warn_onlongperiod_days" name="customqry_warn_onlongperiod_days" class="option-input" /></label>
      </td>
      <td>
        <span class="dims_label">__MSG_CustmQryWarnOnLongPeriod_1__<br>__MSG_CustmQryWarnOnLongPeriod_2__</span>
      </td>
    </tr>
    <tr>
      <td>
        <label><input type="checkbox" id="do_debug" name="do_debug" class="option-input" /></label>
      </td>
      <td>
        <span class="dims_label" @click="toggle_options">__MSG_ActivateDebug__</span>
      </td>
    </tr>
  </table>
</template>


<script setup>
  import { onMounted, onUnmounted, ref } from 'vue'
  import { tsLogger } from '@statslib/mzts-logger';
  import { tsStore } from '@statslib/mzts-store';
  import { tsPrefs } from "@statslib/mzts-options";
  import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
  import AdvancedAccountList from '../AdvancedAccountList.vue';

  const emit = defineEmits(['new_changes']);

  let tsLog = null;
  let new_changes = ref(false);
  let accounts_adv_settings = ref([]);

  onMounted(async () => {
    tsLog = new tsLogger("OPTAB_Advanced", tsStore.do_debug);
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('change', somethingChanged);
    });
    document.getElementById('first_day_week').addEventListener('change', somethingChanged);
    let archive_accounts = await tsPrefs.getPref("accounts_adv_settings");
    let all_accounts = await tsCoreUtils.getAccountsList();
    accounts_adv_settings.value = await tsCoreUtils.mergeAccountsAdvSettings(all_accounts, archive_accounts);
    tsLog.log("accounts_adv_settings: " + JSON.stringify(accounts_adv_settings.value));
    tsLog.log("onMounted");
  });
  
  onUnmounted(() => {
    tsLog.log("onUnmounted");
  });

  async function somethingChanged() {
    new_changes.value = true;
    emit('new_changes', new_changes.value);
  }

  function toggle_options(e) {
    let row = e.target.closest('tr');
    let checkbox = row.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
    checkbox.dispatchEvent(new Event('change', { 'bubbles': true }));
  }

  function accountListChanged(accountsList) {
    tsPrefs.setPref("accounts_adv_settings", accountsList);
    somethingChanged();
  }
  
</script>
      

<style scoped>

</style>