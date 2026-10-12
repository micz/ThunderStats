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
    <h1 class="opt-section-title">{{ t('Opt_About') }}</h1>
    <div class="opt-section-desc">ThunderStats {{ version }} · {{ t('Opt_ByAuthor') }}</div>
  </div>

  <div class="opt-donate-banner">
    <div class="opt-donate-banner-text">{{ t('Opt_DonateBanner') }}</div>
    <a :href="donation_url" class="opt-btn-accent opt-donate-banner-btn">{{ t('Opt_MakeDonation') }}</a>
  </div>

  <section class="opt-card">
    <div class="opt-notes-head">
      <div class="opt-card-title">{{ t('Opt_ReleaseNotes') }}</div>
      <a :href="changelog_url" class="opt-notes-link">{{ t('Opt_FullChangelog') }}</a>
    </div>
    <div class="opt-note" v-for="note in notes" :key="note.version">
      <button type="button" class="opt-note-toggle" :aria-expanded="isOpen(note) ? 'true' : 'false'" @click="toggle(note)">
        <span class="opt-note-version">{{ note.version }}</span>
        <span class="opt-note-date">{{ note.date }}</span>
        <span class="opt-note-spacer"></span>
        <span class="opt-note-count">{{ note.items.length == 1 ? t('Opt_OneChange') : t('Opt_NChanges', [note.items.length]) }}</span>
        <svg viewBox="0 0 24 24" class="opt-note-chevron" :class="{ 'is-open': isOpen(note) }"><path d="m6 9 6 6 6-6"></path></svg>
      </button>
      <ul class="opt-note-items" v-if="isOpen(note)">
        <li v-for="(item, idx) in note.items" :key="idx" v-html="item"></li>
      </ul>
    </div>
    <div class="opt-card-note" v-if="!show_v1">
      <button type="button" class="opt-btn" @click="show_v1 = true">{{ t('ShowRelNotes1x') }}</button>
    </div>
  </section>

  <section class="opt-card opt-card-padded">
    <div class="opt-license-head">
      <div class="opt-card-head">
        <div class="opt-card-title">{{ t('License') }}</div>
        <div class="opt-card-desc">{{ t('Opt_LicenseName') }} · © 2024 Mic</div>
      </div>
      <button type="button" class="opt-btn opt-license-btn" :aria-expanded="license_open ? 'true' : 'false'" @click="license_open = !license_open">{{ license_open ? t('Opt_HideFullText') : t('Opt_ShowFullText') }}</button>
    </div>
    <div class="opt-license-summary">{{ t('Opt_LicenseSummary') }}</div>
    <div class="opt-license-text" v-if="license_open">ThunderStats [https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/]
Copyright (C) 2024 Mic (m@micz.it)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <a href="http://www.gnu.org/licenses/">http://www.gnu.org/licenses/</a>.</div>
    <div class="opt-license-attrib">{{ t('Opt_Attributions') }} <a :href="attributions_url">{{ attributions_url }}</a></div>
  </section>
</template>



<script setup>
import { ref, computed } from 'vue'
import changelogV2Raw from '../../../CHANGELOG.md?raw'
import changelogV1Raw from '../../../CHANGELOG_v1.md?raw'

const props = defineProps({
  version: {
    type: String,
    default: ''
  },
  donation_url: {
    type: String,
    default: ''
  }
});

const t = (key, subs) => browser.i18n.getMessage(key, subs);

const changelog_url = "https://github.com/micz/ThunderStats/blob/master/CHANGELOG.md";
const attributions_url = "https://github.com/micz/ThunderStats/blob/master/README.md#attributions";

const date_fmt = new Intl.DateTimeFormat(browser.i18n.getUILanguage(), { day: 'numeric', month: 'short', year: 'numeric' });

// The changelogs are markdown files holding HTML: one <h3>Version x - dd/mm/yyyy</h3> followed by its <ul>
function parseChangelog(raw) {
  let notes = [];
  let re = /<h3>\s*Version\s+([^\s<]+)\s*-\s*([^<]*)<\/h3>\s*<ul>([\s\S]*?)<\/ul>/g;
  let match;
  while ((match = re.exec(raw)) !== null) {
    let items = [...match[3].matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => m[1].trim()).filter(item => item !== '' && item !== '...');
    // skip the placeholder entry of a version still in development
    if (items.length > 0) notes.push({ version: match[1], date: formatDate(match[2].trim()), items: items });
  }
  return notes;
}

function formatDate(text) {
  let parts = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!parts) return text.includes('?') ? t('Opt_InDevelopment') : text;
  return date_fmt.format(new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1])));
}

const notes_v2 = parseChangelog(changelogV2Raw);
const notes_v1 = parseChangelog(changelogV1Raw);

let show_v1 = ref(false);
let license_open = ref(false);
// the latest version is open by default
let open_versions = ref(notes_v2.length > 0 ? [notes_v2[0].version] : []);

let notes = computed(() => show_v1.value ? [...notes_v2, ...notes_v1] : notes_v2);

function isOpen(note) {
  return open_versions.value.includes(note.version);
}

function toggle(note) {
  open_versions.value = isOpen(note) ? open_versions.value.filter(v => v !== note.version) : [...open_versions.value, note.version];
}
</script>



<style scoped>
.opt-donate-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 20px;
  padding: 18px 20px;
  border-radius: var(--radius-card);
  background: var(--accentSoft);
}

.opt-donate-banner-text {
  flex: 1 1 300px;
  font-size: 14px;
  line-height: 1.5;
  text-wrap: pretty;
}

.opt-donate-banner-btn {
  padding: 9px 18px;
}

.opt-notes-head {
  display: flex;
  align-items: center;
  padding: 14px 18px 12px;
}

.opt-notes-head .opt-card-title {
  flex: 1;
}

.opt-notes-link {
  font-size: 12.5px;
}

.opt-note {
  border-top: 1px solid var(--line);
}

.opt-note-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border: 0;
  background: transparent;
  color: var(--text);
  text-align: left;
  cursor: pointer;
}

.opt-note-version {
  font-size: 14px;
  font-weight: 640;
  font-variant-numeric: tabular-nums;
}

.opt-note-date {
  font-size: 12.5px;
  color: var(--text3);
}

.opt-note-spacer {
  flex: 1;
}

.opt-note-count {
  font-size: 12px;
  color: var(--text3);
}

.opt-note-chevron {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: var(--text3);
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 150ms ease;
}

.opt-note-chevron.is-open {
  transform: rotate(180deg);
}

.opt-note-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0 18px 16px 18px;
  list-style: none;
}

.opt-note-items li {
  position: relative;
  padding-left: 15px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text2);
  text-wrap: pretty;
}

.opt-note-items li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 5px;
  height: 5px;
  border-radius: 3px;
  background: var(--text3);
}

.opt-note-items li :deep(a) {
  font-variant-numeric: tabular-nums;
}

.opt-license-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.opt-license-head .opt-card-head {
  flex: 1;
}

.opt-license-btn {
  font-weight: 400;
}

.opt-license-summary {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text2);
  text-wrap: pretty;
}

.opt-license-text {
  padding: 14px 16px;
  border-radius: var(--radius-input);
  background: var(--surface2);
  font-family: ui-monospace, "Cascadia Mono", monospace;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text2);
  white-space: pre-wrap;
}

.opt-license-attrib {
  font-size: 12.5px;
  color: var(--text3);
}

@media (prefers-reduced-motion: reduce) {
  .opt-note-chevron {
    transition: none;
  }
}
</style>
