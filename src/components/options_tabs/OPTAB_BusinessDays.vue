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
    <h1 class="opt-section-title">{{ t('TabBusinessDays.label') }}</h1>
    <div class="opt-section-desc">{{ t('Opt_BusinessDaysDesc') }}</div>
  </div>

  <section class="opt-card">
    <div class="opt-card-head opt-week-head">
      <div class="opt-card-title">{{ t('Opt_WorkingWeek') }}</div>
      <div class="opt-week">
        <button type="button" v-for="day in week_days" :key="day.idx" :class="{ 'is-on': prefs.values['bday_weekdays_' + day.idx] }" :aria-pressed="prefs.values['bday_weekdays_' + day.idx] ? 'true' : 'false'" :title="day.long" @click="prefs.set('bday_weekdays_' + day.idx, !prefs.values['bday_weekdays_' + day.idx])">{{ day.short }}</button>
      </div>
    </div>
    <OptRow pref="bday_default_only" :label="t('Label_bday_default_only')"/>
    <OptRow pref="bday_use_last_business_day" :label="t('Label_bday_use_last_business_day')"/>
  </section>

  <section class="opt-card">
    <div class="opt-hol-head">
      <div class="opt-row-text">
        <div class="opt-card-title">{{ t('Non-BDays') }}</div>
        <div class="opt-row-hint">{{ holidays_count }}</div>
      </div>
      <button type="button" class="opt-btn" @click="startAdd">
        <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
        {{ t('Opt_AddHoliday') }}
      </button>
    </div>

    <form class="opt-hol-form" v-if="draft" @submit.prevent="saveDraft">
      <label class="opt-field">
        <span class="opt-field-label">{{ t('Day') }}</span>
        <input type="number" class="opt-input opt-hol-day" :class="{ 'is-invalid': draft_invalid }" min="1" :max="draft_max_day" placeholder="1" v-model="draft.day" ref="day_input"/>
      </label>
      <label class="opt-field">
        <span class="opt-field-label">{{ t('Month') }}</span>
        <select class="opt-input" v-model.number="draft.month">
          <option v-for="(name, idx) in month_names" :key="idx" :value="idx">{{ name }}</option>
        </select>
      </label>
      <label class="opt-field opt-hol-name">
        <span class="opt-field-label">{{ t('Description') }}</span>
        <input type="text" class="opt-input" :placeholder="t('Opt_HolidayNamePlaceholder')" v-model="draft.description"/>
      </label>
      <div class="opt-seg" role="group">
        <button type="button" :class="{ 'is-active': draft.yearly }" :aria-pressed="draft.yearly ? 'true' : 'false'" @click="draft.yearly = true">{{ t('Yearly') }}</button>
        <button type="button" :class="{ 'is-active': !draft.yearly }" :aria-pressed="draft.yearly ? 'false' : 'true'" @click="draft.yearly = false">{{ t('Opt_YearOnly', [draft.year]) }}</button>
      </div>
      <div class="opt-hol-actions">
        <button type="button" class="opt-btn-text" @click="draft = null">{{ t('Cancel') }}</button>
        <button type="submit" class="opt-btn-accent">{{ draft.id === null ? t('Opt_Add') : t('Save') }}</button>
      </div>
    </form>

    <div class="opt-hol-row" v-for="holiday in sorted_holidays" :key="holiday.id" :class="{ 'is-editing': draft && draft.id === holiday.id }">
      <button type="button" class="opt-hol-edit" :title="t('Edit')" @click="startEdit(holiday)">
        <span class="opt-hol-badge">
          <span class="opt-hol-badge-month">{{ month_names[holiday.month] }}</span>
          <span class="opt-hol-badge-day">{{ holiday.day }}</span>
        </span>
        <span class="opt-hol-desc">{{ holiday.description || t('Non-Business_Day') }}</span>
        <span class="opt-hol-pill">{{ holiday.year == 'every_year' ? t('Yearly') : t('Opt_YearOnly', [holiday.year]) }}</span>
      </button>
      <button type="button" class="opt-hol-delete" :title="t('Delete')" :aria-label="t('Delete') + ' ' + (holiday.description || '')" @click="deleteHoliday(holiday)">
        <svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"></path></svg>
      </button>
    </div>

    <OptRow class="opt-easter" pref="bday_easter" :label="t('EasterNoBusinessDay')" :hint="easter_hint"/>
  </section>
</template>

<script setup>
import { ref, computed, inject, nextTick, watch } from 'vue';
import { tsUtils } from '@statslib/mzts-utils';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import OptRow from '@/components/options/OptRow.vue';

const t = (key, subs) => browser.i18n.getMessage(key, subs);

const prefs = inject('optPrefs');

const ui_language = browser.i18n.getUILanguage();
const current_year = new Date().getFullYear();

// 2024-01-07 is a Sunday: idx 0 = Sunday ... 6 = Saturday
const short_day_fmt = new Intl.DateTimeFormat(ui_language, { weekday: 'short' });
const long_day_fmt = new Intl.DateTimeFormat(ui_language, { weekday: 'long' });
const month_fmt = new Intl.DateTimeFormat(ui_language, { month: 'short' });
const easter_fmt = new Intl.DateTimeFormat(ui_language, { day: 'numeric', month: 'long' });

const month_names = Array.from({ length: 12 }, (_, idx) => month_fmt.format(new Date(2024, idx, 1)));

let week_days = computed(() => {
  let days = [1, 2, 3, 4, 5, 6, 0].map(idx => {
    let date = new Date(2024, 0, 7 + idx);
    return { idx: idx, short: short_day_fmt.format(date), long: long_day_fmt.format(date) };
  });
  return tsUtils.sortDays(prefs.values.first_day_week, days);
});

let holidays = computed(() => Array.isArray(prefs.values.bday_custom_days) ? prefs.values.bday_custom_days : []);

// month, day, then the recurring ones before the yearly ones
let sorted_holidays = computed(() => [...holidays.value].sort((a, b) => {
  if (a.month !== b.month) return a.month - b.month;
  if (a.day !== b.day) return a.day - b.day;
  const yearA = a.year === "every_year" ? 0 : a.year;
  const yearB = b.year === "every_year" ? 0 : b.year;
  return yearA - yearB;
}));

let holidays_count = computed(() => {
  let count = holidays.value.length;
  let text = count == 0 ? t('Opt_HolidaysNone') : (count == 1 ? t('Opt_HolidaysOne') : t('Opt_HolidaysCount', [count]));
  if (prefs.values.bday_easter) text += ' ' + t('Opt_PlusEaster');
  return text;
});

let easter_hint = computed(() => {
  let easter = tsCoreUtils.calculateEaster(current_year);
  let monday = new Date(easter);
  monday.setDate(easter.getDate() + 1);
  return t('Opt_EasterHint', [easter_fmt.format(easter), easter_fmt.format(monday), current_year]);
});

// Inline add/edit form
let draft = ref(null);
let draft_tried = ref(false);
let day_input = ref(null);

let draft_max_day = computed(() => {
  if (!draft.value) return 31;
  // a yearly holiday cannot fall on February 29th, so use a non-leap year
  let year = draft.value.yearly ? 2023 : draft.value.year;
  return new Date(year, draft.value.month + 1, 0).getDate();
});

// clamp the day when the month (or the year) changes to one with fewer days
watch(draft_max_day, (max_day) => {
  if (draft.value && Number(draft.value.day) > max_day) draft.value.day = max_day;
});

let draft_invalid = computed(() => draft_tried.value && !isDraftDayValid());

function isDraftDayValid() {
  let day = Number(draft.value.day);
  return Number.isInteger(day) && day >= 1 && day <= draft_max_day.value;
}

function openDraft(values) {
  draft.value = values;
  draft_tried.value = false;
  nextTick(() => day_input.value?.focus());
}

function startAdd() {
  openDraft({ id: null, day: '', month: draft.value ? draft.value.month : new Date().getMonth(), description: '', yearly: true, year: current_year });
}

function startEdit(holiday) {
  let yearly = holiday.year == 'every_year';
  openDraft({ id: holiday.id, day: holiday.day, month: holiday.month, description: holiday.description || '', yearly: yearly, year: yearly ? current_year : holiday.year });
}

function saveDraft() {
  draft_tried.value = true;
  if (!isDraftDayValid()) return;
  let d = draft.value;
  let holiday = {
    id: d.id,
    year: d.yearly ? 'every_year' : d.year,
    month: d.month,
    day: Number(d.day),
    description: (d.description || '').trim() || t('Non-Business_Day'),
  };
  let list = [...holidays.value];
  if (d.id === null) {
    holiday.id = list.reduce((max, elem) => Math.max(max, elem.id), 0) + 1;
    list.push(holiday);
  } else {
    list = list.map(elem => elem.id === d.id ? holiday : elem);
  }
  prefs.set("bday_custom_days", list);
  draft.value = null;
}

function deleteHoliday(holiday) {
  if (!confirm(t("deletePromptNBD_text"))) return;
  if (draft.value && draft.value.id === holiday.id) draft.value = null;
  prefs.set("bday_custom_days", holidays.value.filter(elem => elem.id !== holiday.id));
}
</script>

<style scoped>
.opt-week-head {
  gap: 12px;
}

.opt-week {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.opt-week button {
  min-width: 52px;
  padding: 8px 12px;
  border-radius: var(--radius-input);
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--text3);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.opt-week button.is-on {
  border-color: var(--accent);
  background: var(--accentSoft);
  color: var(--accent);
  font-weight: 620;
}

.opt-hol-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
}

.opt-hol-head .opt-row-text {
  flex: 1;
}

.opt-hol-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 10px 12px;
  padding: 14px 18px;
  border-top: 1px solid var(--line);
  background: var(--accentSoft);
}

.opt-hol-day {
  width: 64px !important;
}

.opt-hol-day.is-invalid {
  border-color: var(--warn);
}

.opt-hol-name {
  flex: 1 1 180px;
}

.opt-hol-name .opt-input {
  width: 100%;
}

.opt-hol-actions {
  display: flex;
  gap: 8px;
}

.opt-hol-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-top: 1px solid var(--line);
}

.opt-hol-row.is-editing {
  background: var(--surface2);
}

.opt-hol-edit {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text);
  text-align: left;
  cursor: pointer;
}

.opt-hol-badge {
  flex: none;
  width: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0;
  border-radius: var(--radius-input);
  background: var(--surface2);
  border: 1px solid var(--line);
}

.opt-hol-badge-month {
  font-size: 10px;
  font-weight: 640;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--warn);
}

.opt-hol-badge-day {
  font-size: 17px;
  font-weight: 680;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.opt-hol-desc {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.opt-hol-pill {
  flex: none;
  font-size: 12px;
  padding: 3px 9px;
  border-radius: 12px;
  background: var(--surface3);
  color: var(--text2);
}

.opt-hol-delete {
  flex: none;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: var(--text3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.opt-hol-delete:hover {
  background: var(--surface2);
  color: var(--warn);
}

.opt-hol-delete svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.opt-easter {
  background: var(--surface2);
}
</style>
