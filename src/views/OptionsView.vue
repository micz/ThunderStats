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
  <div class="opt-page">
    <header class="opt-header">
      <div class="opt-brand"><span class="opt-brand-mark"></span>ThunderStats</div>
      <div class="opt-crumb-sep">/</div>
      <div class="opt-crumb">{{ t('Opt_Options') }}</div>
      <div class="opt-spacer"></div>
      <div class="opt-saved">
        <svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></svg>
        {{ t('Opt_SavedAutomatically') }}
      </div>
      <button type="button" class="opt-btn" v-if="new_changes" :title="t('ReopenTabDesc')" @click="reloadThunderStats">{{ t('Opt_ReloadThunderStats') }}</button>
      <ThemeToggle/>
    </header>

    <div class="opt-body">
      <aside class="opt-sidebar">
        <nav class="opt-nav">
          <button type="button" v-for="item in sections" :key="item.id" :class="{ 'is-active': item.id == section }" :aria-current="item.id == section ? 'page' : null" @click="goto(item.id)">{{ item.label }}</button>
        </nav>
        <div class="opt-donate-card">
          <div class="opt-donate-text">{{ t('Opt_DonateSidebar') }}</div>
          <a :href="donation_url" class="opt-btn">
            <svg viewBox="0 0 24 24" class="opt-heart"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path></svg>
            {{ t('DonateLink') }}
          </a>
          <div class="opt-version">{{ t('Version') }} {{ version }}</div>
        </div>
      </aside>

      <main class="opt-content" v-if="loaded">
        <OPTAB_Main v-if="section == 'general'"/>
        <OPTAB_Advanced v-else-if="section == 'advanced'"/>
        <OPTAB_BusinessDays v-else-if="section == 'business'"/>
        <OPTAB_CustomIds v-else-if="section == 'identities'"/>
        <OPTAB_About v-else-if="section == 'about'" :version="version" :donation_url="donation_url"/>
      </main>
    </div>
  </div>
</template>


<script setup>
import { onMounted, onUnmounted, ref, reactive, provide } from 'vue'
import { tsPrefs } from "@statslib/mzts-options.js";
import { prefs_default } from "@statslib/mzts-options-default.js";
import { tsLogger } from "@statslib/mzts-logger.js";
import { tsTheme } from "@statslib/mzts-theme.js";
import { tsStore } from '@statslib/mzts-store';
import ThemeToggle from '@/components/ThemeToggle.vue';
import OPTAB_Main from '@/components/options_tabs/OPTAB_Main.vue';
import OPTAB_Advanced from '@/components/options_tabs/OPTAB_Advanced.vue';
import OPTAB_BusinessDays from '@/components/options_tabs/OPTAB_BusinessDays.vue';
import OPTAB_CustomIds from '@/components/options_tabs/OPTAB_CustomIds.vue';
import OPTAB_About from '@/components/options_tabs/OPTAB_About.vue';

const t = (key, subs) => browser.i18n.getMessage(key, subs);

const donation_url = "https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/donate/";
const SAVE_DELAY = 400;     // ms, debounce for the values typed in number and text inputs

const sections = [
  { id: 'general', label: t('TabSettings.label') },
  { id: 'advanced', label: t('TabAdvanced.label') },
  { id: 'business', label: t('TabBusinessDays.label') },
  { id: 'identities', label: t('TabCustomIdentities.label') },
  { id: 'about', label: t('Opt_About') },
];

let section = ref(sectionFromHash());
let loaded = ref(false);
let new_changes = ref(false);
let version = ref(browser.runtime.getManifest().version);
let tsLog = null;

// All the options of the page; every change is written to storage at once (or debounced)
const values = reactive({});
const save_timers = {};

function setPref(key, value, debounce = false) {
  values[key] = value;
  if(key === 'theme_mode') {
    // applies live to every open ThunderStats page, no reload needed
    tsTheme.setMode(value);
    return;
  }
  new_changes.value = true;
  clearTimeout(save_timers[key]);
  if(debounce) {
    save_timers[key] = setTimeout(() => savePref(key), SAVE_DELAY);
  } else {
    savePref(key);
  }
}

function savePref(key) {
  delete save_timers[key];
  // plain copy: storage cannot clone the reactive proxies
  tsPrefs.setPref(key, JSON.parse(JSON.stringify(values[key])));
}

provide('optPrefs', { values, set: setPref });
provide('optGoto', goto);

function onStorageChanged(changes, area) {
  if(area !== 'sync') return;
  for(let key in changes) {
    if(save_timers[key]) continue;  // a local edit is still pending
    if(changes[key].newValue !== undefined) values[key] = changes[key].newValue;
  }
}

function sectionFromHash() {
  let hash = window.location.hash.replace('#', '');
  return ['general', 'advanced', 'business', 'identities', 'about'].includes(hash) ? hash : 'general';
}

function goto(id) {
  section.value = id;
  history.replaceState(null, '', '#' + id);
  window.scrollTo(0, 0);
}

function onHashChange() {
  section.value = sectionFromHash();
}

onMounted(async () => {
  tsLog = new tsLogger("OptionsView", tsStore.do_debug);
  tsPrefs.logger = tsLog;
  Object.assign(values, await browser.storage.sync.get(prefs_default));
  loaded.value = true;
  browser.storage.onChanged.addListener(onStorageChanged);
  window.addEventListener('hashchange', onHashChange);
  tsLog.log("onMounted");
});

onUnmounted(() => {
  browser.storage.onChanged.removeListener(onStorageChanged);
  window.removeEventListener('hashchange', onHashChange);
  tsLog.log("onUnmounted");
});

async function reloadThunderStats() {
  // flush the pending debounced saves first
  for(let key in save_timers) {
    clearTimeout(save_timers[key]);
    savePref(key);
  }
  browser.runtime.sendMessage({command: "reloadThunderStats" });
  // close the current options tab
  const currentTab = await browser.tabs.getCurrent();
  if (currentTab) {
    browser.tabs.remove(currentTab.id);
  }
}

</script>


<style scoped>
.opt-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.opt-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 14px;
  padding: 10px 18px;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 10;
}

.opt-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 14px;
  font-weight: 660;
}

.opt-brand-mark {
  display: block;
  width: 9px;
  height: 9px;
  border-radius: 3px;
  background: var(--accent);
}

.opt-crumb-sep {
  font-size: 14px;
  color: var(--text3);
}

.opt-crumb {
  font-size: 14px;
  font-weight: 560;
}

.opt-spacer {
  flex: 1;
}

.opt-saved {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text3);
}

.opt-saved svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: var(--good);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.opt-body {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px 32px;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 24px 48px;
}

.opt-sidebar {
  flex: 0 1 220px;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 72px;
}

.opt-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.opt-nav button {
  border: 0;
  cursor: pointer;
  text-align: left;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  background: transparent;
  color: var(--text2);
}

.opt-nav button:hover {
  background: var(--surface2);
  color: var(--text);
}

.opt-nav button.is-active {
  background: var(--surface);
  color: var(--text);
  font-weight: 620;
}

.opt-donate-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 14px 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  background: var(--surface);
}

.opt-donate-text {
  font-size: 13px;
  line-height: 1.45;
  color: var(--text2);
  text-wrap: pretty;
}

.opt-donate-card .opt-btn {
  gap: 7px;
}

.opt-btn svg.opt-heart {
  width: 14px;
  height: 14px;
  stroke: var(--warn);
  stroke-width: 1.8;
}

.opt-version {
  font-size: 11.5px;
  color: var(--text3);
}

.opt-content {
  flex: 1 1 520px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* the sidebar wraps above the content: no sticky there */
@media (max-width: 820px) {
  .opt-sidebar {
    position: static;
  }
}
</style>
