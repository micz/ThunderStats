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
    <h1 class="opt-section-title">{{ t('TabSettings.label') }}</h1>
    <div class="opt-section-desc">{{ t('GlobalDescSettingTab') }}</div>
  </div>

  <section class="opt-card">
    <div class="opt-card-head"><div class="opt-card-title">{{ t('Opt_Startup') }}</div></div>
    <OptRow :label="t('StartupAccount')" :hint="t('Opt_StartupAccountHint')" :disabled="!!prefs.values.remember_last_account">
      <select class="opt-input" :value="String(prefs.values.startup_account)" :disabled="!!prefs.values.remember_last_account" :aria-label="t('StartupAccount')" @change="prefs.set('startup_account', $event.target.value)">
        <option v-for="account in accounts" :key="account.id" :value="String(account.id)">{{ account.name }}</option>
      </select>
    </OptRow>
    <OptRow pref="remember_last_account" :label="t('prefs_remember_last_account')" :hint="t('Opt_RememberLastAccountHint')" @change="onRememberLastAccountChange"/>
  </section>

  <section class="opt-card">
    <div class="opt-card-head"><div class="opt-card-title">{{ t('Opt_LoadingData') }}</div></div>
    <OptRow pref="load_data_changing_account" :label="t('prefs_load_data_changing_account')"/>
    <OptRow pref="always_reload_tab_data" :label="t('prefs_always_reload_tab_data')"/>
    <OptRow pref="remember_last_tab" :label="t('prefs_remember_last_tab')"/>
    <OptRow pref="customqry_loaddata_when_opening_addon" :label="t('prefs_customqry_loaddata_when_opening_addon')" :hint="t('Opt_LoadCustomFirstTabHint')"/>
    <OptRow pref="customqry_loaddata_when_selectingrange" :label="t('CustomQueryBookmarkImmediateUpdate')" :hint="t('Opt_LoadCustomOnRangeHint')"/>
    <OptRow pref="customqry_always_open_adv_filters" :label="t('prefs_customqry_always_open_adv_filters')"/>
  </section>

  <section class="opt-card">
    <div class="opt-card-head"><div class="opt-card-title">{{ t('TimeChart') }}</div></div>
    <OptRow pref="today_time_chart_show_yesterday" :label="t('TodayTimeChartShowYesterday')"/>
    <OptRow pref="_time_chart_progressive" :label="t('TimeChartProgressive')"/>
    <OptRow pref="today_time_chart_do_no_show_future" :label="t('TimeChartNoFutureHours')" :hint="t('Opt_TodayOnly')"/>
  </section>

  <section class="opt-card">
    <div class="opt-card-head"><div class="opt-card-title">{{ t('Opt_ManyDaysCustom') }}</div></div>
    <OptRow :label="t('ManyDays')" :hint="t('Opt_ManyDaysNumHint')">
      <OptNumber pref="_many_days" :min="2" :max="365" :label="t('ManyDays')"/>
      {{ t('days') }}
    </OptRow>
    <OptRow :label="t('DatePickerLocale')" :hint="t('Opt_DatePickerLocaleHint')">
      <input type="text" class="opt-input opt-locale" :value="prefs.values.datepicker_locale" :aria-label="t('DatePickerLocale')" @input="prefs.set('datepicker_locale', $event.target.value.trim(), true)"/>
      <button type="button" class="opt-btn" @click="prefs.set('datepicker_locale', ui_language)">{{ t('SetDefault') }}</button>
    </OptRow>
  </section>

  <section class="opt-card">
    <div class="opt-card-head"><div class="opt-card-title">{{ t('InboxZero') }}</div></div>
    <OptRow pref="many_days_show_inbox" :label="t('ManyDaysShowInbox')" :hint="t('Opt_MarkInboxBarsHint')"/>
    <OptRow pref="inbox0_openFolderInFirstTab" :label="t('folderspreadchart_openinfirsttab')"/>
  </section>

  <section class="opt-card">
    <div class="opt-card-head"><div class="opt-card-title">{{ t('Opt_InternalMail') }}</div></div>
    <OptRow pref="show_internal_mail_percent" :label="t('prefs_show_internal_mail_percent')" :disabled="!has_internal_domains && !prefs.values.show_internal_mail_percent">
      <template #hint>{{ t('Opt_ShowInternalShareHint') }} <button type="button" class="opt-link" @click="goto('identities')">{{ t('Opt_SetInternalDomains') }}</button></template>
    </OptRow>
  </section>

  <section class="opt-card">
    <div class="opt-card-head"><div class="opt-card-title">{{ t('Appearance') }}</div></div>
    <OptRow :label="t('prefs_theme_mode')" :hint="t('Opt_ThemeHint')">
      <select class="opt-input" :value="prefs.values.theme_mode" :aria-label="t('prefs_theme_mode')" @change="prefs.set('theme_mode', $event.target.value)">
        <option value="auto">{{ t('ThemeAuto') }}</option>
        <option value="light">{{ t('ThemeLight') }}</option>
        <option value="dark">{{ t('ThemeDark') }}</option>
      </select>
    </OptRow>
  </section>
</template>


<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { tsLogger } from '@statslib/mzts-logger';
import { tsStore } from '@statslib/mzts-store';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import OptRow from '@/components/options/OptRow.vue';
import OptNumber from '@/components/options/OptNumber.vue';

const t = (key, subs) => browser.i18n.getMessage(key, subs);

const prefs = inject('optPrefs');
const goto = inject('optGoto');
const ui_language = browser.i18n.getUILanguage();

let accounts = ref([]);
let tsLog = null;

// the internal mail share needs at least one internal domain in some account
let has_internal_domains = computed(() => {
  let domains = prefs.values.internal_domains || {};
  return Object.values(domains).some(list => Array.isArray(list) && list.length > 0);
});

onMounted(async () => {
  tsLog = new tsLogger("OPTAB_Main", tsStore.do_debug);
  accounts.value = await tsCoreUtils.getAccountsList(false);
  tsLog.log("onMounted");
});

function onRememberLastAccountChange(remember) {
  // start remembering from the current startup account
  if(remember) prefs.set("_last_account_id", prefs.values.startup_account);
}
</script>


<style scoped>
.opt-locale {
  width: 96px;
}
</style>
