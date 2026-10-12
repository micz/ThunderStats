<!--
/*
 *  ThunderStats [https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/]
 *  Copyright (C) 2024 - 2026 Mic (m@micz.it)

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
  <div class="opt-section-head">
    <h1 class="opt-section-title">{{ t('TabAdvanced.label') }}</h1>
    <div class="opt-section-desc">{{ t('AdvancedSettingTabDesc') }}</div>
  </div>

  <section class="opt-card">
    <div class="opt-card-head">
      <div class="opt-card-title">{{ t('Opt_ArchiveFolders') }}</div>
      <div class="opt-card-desc">{{ t('ImportantInfoText_1') }}</div>
    </div>
    <OptRow pref="include_archive_multi_account" :label="t('prefs_include_archive_multi_account')"/>
    <OptRow pref="filter_duplicates_multi_account" :label="t('prefs_filter_duplicates_multi_account')" :hint="t('Opt_FilterDupHint')"/>
    <div class="opt-acct-grid opt-acct-head">
      <div>{{ t('Opt_PerAccount') }}</div><div>{{ t('IncludeArchive') }}</div><div>{{ t('FilterDuplicateMessages') }}</div>
    </div>
    <div class="opt-acct-grid opt-acct-row" v-for="account in accounts" :key="account.id">
      <div class="opt-acct-name" :title="account.name">{{ account.name }}</div>
      <div><OptSwitch :modelValue="account.include_archive" :label="account.name + ' — ' + t('IncludeArchive')" @update:modelValue="updateAccount(account, 'include_archive', $event)"/></div>
      <div><OptSwitch :modelValue="account.filter_duplicates" :label="account.name + ' — ' + t('FilterDuplicateMessages')" @update:modelValue="updateAccount(account, 'filter_duplicates', $event)"/></div>
    </div>
    <div class="opt-card-note">{{ t('Opt_ArchiveFoldersNote') }}</div>
  </section>

  <section class="opt-card">
    <div class="opt-card-head"><div class="opt-card-title">{{ t('Other') }}</div></div>
    <OptRow :label="t('prefs_FirstDayWeek')">
      <select class="opt-input" :value="Number(prefs.values.first_day_week)" :aria-label="t('prefs_FirstDayWeek')" @change="prefs.set('first_day_week', Number($event.target.value))">
        <option :value="1">{{ t('WeekDay1') }}</option>
        <option :value="0">{{ t('WeekDay0') }}</option>
        <option :value="6">{{ t('WeekDay6') }}</option>
      </select>
    </OptRow>
    <OptRow :label="t('InvolvedNum')" :hint="t('Opt_TopRowsHint')">
      <OptNumber pref="_involved_num" :min="3" :max="50" :label="t('InvolvedNum')"/>
    </OptRow>
    <OptRow :label="t('Opt_WarnLongPeriods')" :hint="t('CustmQryWarnOnLongPeriod_1') + ' (0: ' + t('CustmQryWarnOnLongPeriod_2') + ')'">
      <OptNumber pref="customqry_warn_onlongperiod_days" :min="0" :max="3650" :label="t('Opt_WarnLongPeriods')"/>
      {{ t('days') }}
    </OptRow>
  </section>

  <section class="opt-card">
    <div class="opt-card-head">
      <div class="opt-card-title">{{ t('Opt_Performance') }}</div>
      <div class="opt-card-desc">{{ t('Opt_PerformanceDesc') }}</div>
    </div>
    <OptRow :label="t('Opt_ConcurrentQueries')" :hint="t('MaxConcurrentQueries')">
      <OptNumber pref="max_concurrent_queries" :min="1" :max="10" :label="t('Opt_ConcurrentQueries')"/>
    </OptRow>
    <OptRow :label="t('Opt_RecentDaysCache')" :hint="t('RecentDaysCacheDays_1') + ' ' + t('RecentDaysCacheDays_2')">
      <OptNumber pref="recent_days_cache_days" :min="43" :max="365" :label="t('Opt_RecentDaysCache')"/>
      {{ t('days') }}
    </OptRow>
    <OptRow pref="do_debug" :label="t('ActivateDebug')" :hint="t('Opt_DebugLogHint')"/>
  </section>
</template>


<script setup>
import { inject, onMounted, ref } from 'vue'
import { tsLogger } from '@statslib/mzts-logger';
import { tsStore } from '@statslib/mzts-store';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import OptRow from '@/components/options/OptRow.vue';
import OptSwitch from '@/components/options/OptSwitch.vue';
import OptNumber from '@/components/options/OptNumber.vue';

const t = (key, subs) => browser.i18n.getMessage(key, subs);

const prefs = inject('optPrefs');

let accounts = ref([]);
let tsLog = null;

onMounted(async () => {
  tsLog = new tsLogger("OPTAB_Advanced", tsStore.do_debug);
  let all_accounts = await tsCoreUtils.getAccountsList();
  accounts.value = await tsCoreUtils.mergeAccountsAdvSettings(all_accounts, prefs.values.accounts_adv_settings);
  tsLog.log(() => "accounts_adv_settings: " + JSON.stringify(accounts.value));
  tsLog.log("onMounted");
});

function updateAccount(account, key, value) {
  account[key] = value;
  prefs.set("accounts_adv_settings", accounts.value);
}
</script>


<style scoped>
.opt-acct-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 140px 140px;
  align-items: center;
  border-top: 1px solid var(--line);
}

.opt-acct-grid > div:not(:first-child) {
  display: flex;
  justify-content: center;
  text-align: center;
}

.opt-acct-head {
  padding: 10px 18px 8px;
  background: var(--surface2);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--text3);
}

.opt-acct-row {
  padding: 11px 18px;
}

.opt-acct-name {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 560px) {
  .opt-acct-grid {
    grid-template-columns: minmax(0, 1fr) 96px 96px;
  }
}
</style>
