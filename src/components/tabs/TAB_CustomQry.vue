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
    <ExportMenu ref="ExportMenu_ref" :export_data="_export_data" :currentTab="tabId" :showInternalExternal="show_internal_mail_percent" v-if="job_done" :singleDay="singleDay" />
    <div class="ts-dashboard-stack">
        <!-- query panel -->
        <div class="ts-card ts-query-panel">
            <div class="ts-query-fields">
                <div class="ts-query-field">
                    <div class="ts-section-label">{{ labels.period }}</div>
                    <VueDatePicker v-model="dateQry" @update:model-value="rangeChoosen" :dark="isDark" :format="datepickerFormat" :locale="prefLocale" :range="{ partialRange: false }" :max-date="new Date()" :multi-calendars="{ solo: false, static: true }" :enable-time-picker="false" :clearable="false" :text-input="{ selectOnFocus: true, enterSubmit: true, tabSubmit: false }" class="ts-query-date"></VueDatePicker>
                </div>
                <div class="ts-query-field" v-if="compareEnabled && !single_day_selected">
                    <div class="ts-section-label">{{ labels.period_b }}</div>
                    <div class="ts-query-b">
                        <VueDatePicker v-model="dateQryB_start" @update:model-value="periodBChoosen" :dark="isDark" :format="datepickerFormat" :locale="prefLocale" :max-date="maxDateB" :enable-time-picker="false" :clearable="false" :auto-apply="true" :text-input="{ selectOnFocus: true, enterSubmit: true, tabSubmit: false }" class="ts-query-date ts-query-date-b" />
                        <span class="ts-query-b-end" v-if="dateQryB_end">&rarr; {{ formatDate(dateQryB_end) }}</span>
                    </div>
                </div>
                <label class="ts-switch" :class="{ 'is-disabled': single_day_selected }" :title="single_day_selected ? labels.compare_single_day : ''">
                    <input type="checkbox" v-model="compareEnabled" :disabled="single_day_selected" />
                    <span class="ts-switch-track"><span class="ts-switch-knob"></span></span>{{ labels.compare }}
                </label>
                <label class="ts-switch" :class="{ 'is-disabled': single_day_selected }">
                    <input type="checkbox" v-model="doOnlyBD" :disabled="single_day_selected" />
                    <span class="ts-switch-track"><span class="ts-switch-knob"></span></span>{{ labels.only_bd }}
                </label>
                <div class="ts-spacer"></div>
                <button type="button" class="ts-primary-btn" @click="update">{{ labels.run }}</button>
            </div>

            <div class="ts-chip-row">
                <span class="ts-chip-label">{{ labels.quick_ranges }}</span>
                <button type="button" class="ts-chip" v-for="preset in presets" :key="preset.id" :class="{ 'is-active': active_preset == preset.id }" @click="setPeriod(preset.id)">{{ preset.label }}</button>
                <span class="ts-chip-sep"></span>
                <span class="ts-chip-label">{{ labels.filters }}</span>
                <span class="ts-chip ts-chip-filter" v-for="filter in active_filters" :key="filter.id">{{ filter.text }}<button type="button" class="ts-chip-remove" :title="labels.remove_filter" @click="filter.clear()">&times;</button></span>
                <button type="button" class="ts-chip ts-chip-add" @click="toggleAdvancedFilters">{{ show_advanced_filters ? labels.close_filters : labels.add_filter }}</button>
            </div>

            <div class="ts-adv-filters" v-if="show_advanced_filters">
                <div class="ts-adv-field ts-adv-folders">
                    <div class="ts-section-label">{{ labels.folders }}<span v-if="tsStore.current_account_id == 0"> ({{ labels.folders_need_account }})</span></div>
                    <Multiselect
                        v-model="filterFolder"
                        id="filterFolder"
                        name="filterFolder"
                        :options="folderList"
                        :searchable="true"
                        :close-on-select="true"
                        :show-labels="false"
                        :allow-empty="true"
                        :create-option="false"
                        mode="tags"
                        :disabled="tsStore.current_account_id == 0"
                        :placeholder="labels.folders_placeholder"
                        ref="filterFolder_ref"
                    ></Multiselect>
                    <label class="ts-adv-check"><input type="checkbox" v-model="filterFolder_do_subfolders" /> {{ labels.subfolders }}</label>
                </div>
                <div class="ts-adv-field">
                    <div class="ts-section-label">{{ labels.subject }}</div>
                    <input type="text" id="filterSubject" class="ts-input" v-model="filterSubject" @input="updateAdvFiltersSet" />
                    <div class="ts-adv-hint">{{ labels.case_sensitive }}</div>
                </div>
                <div class="ts-adv-field">
                    <div class="ts-section-label">{{ labels.read_status }}</div>
                    <select id="filterReadUnread" class="ts-input" v-model="filterReadUnread" @change="updateAdvFiltersSet">
                        <option value="0">{{ labels.all }}</option>
                        <option value="1">{{ labels.only_read }}</option>
                        <option value="2">{{ labels.only_unread }}</option>
                    </select>
                </div>
                <div class="ts-adv-field">
                    <div class="ts-section-label">{{ labels.flag_status }}</div>
                    <select id="filterFlaggedUnflagged" class="ts-input" v-model="filterFlaggedUnflagged" @change="updateAdvFiltersSet">
                        <option value="0">{{ labels.all }}</option>
                        <option value="1">{{ labels.only_flagged }}</option>
                        <option value="2">{{ labels.only_unflagged }}</option>
                    </select>
                </div>
                <div class="ts-adv-actions">
                    <button type="button" class="ts-link-btn" :disabled="!advanced_filters_set" @click="resetAdvFilters">{{ labels.reset_filters }}</button>
                </div>
            </div>

            <div class="ts-query-info" v-if="do_run">
                {{ labels.data_for }}: <span class="email_list_container" @mouseover="showEmailListTooltip" @mouseleave="hideEmailListTooltip"><span v-text="customqry_current_account" :class="props.accountEmails.length > max_direct_accounts ? 'email_list_span' : ''"></span><span class="email_list_tooltip_text" v-if="emailListTooltipVisible" v-text="customqry_current_account_tooltip"></span></span>
                &middot; {{ labels.total_days }}: {{ customqry_totaldays_num }}
            </div>
        </div>

        <!-- results -->
        <template v-if="do_run">
            <WidgetDayDashboard v-if="do_single_day" v-bind="day_model" :loading="day_loading">
                <template #bottom>
                    <WidgetInboxAge :inbox_dates="result_inbox ? result_inbox.dates : {}" :is_loading="is_loading_inbox" />
                </template>
            </WidgetDayDashboard>
            <WidgetPeriodDashboard v-else v-bind="period_model" :loading="period_loading" :aggregations="aggregation_choices" :aggregation="aggregation" @aggregation="aggregation = $event" />
        </template>
        <div class="ts-card ts-query-empty" v-else>{{ labels.choose_period }}</div>
    </div>
</template>


<script setup>
import { ref, onMounted, onBeforeMount, nextTick, computed, watch } from 'vue';
import { tsLogger } from '@statslib/mzts-logger';
import { thunderStastsCore } from '@statslib/mzts-statscore';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import { tsUtils } from '@statslib/mzts-utils';
import ExportMenu from '../ExportMenu.vue';
import { tsPrefs } from '@statslib/mzts-options';
import { i18n } from "@statslib/mzts-i18n.js";
import { tsStore } from '@statslib/mzts-store';
import { tsExport } from '@statslib/mzts-export';
import { tsDayModel } from '@statslib/mzts-daymodel';
import { tsPeriodModel } from '@statslib/mzts-periodmodel';
import { BASELINE_WEEKS } from '@statslib/mzts-insights';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import Multiselect from '@vueform/multiselect';
import '@vueform/multiselect/themes/default.css';
import WidgetDayDashboard from '../widgets/WidgetDayDashboard.vue';
import WidgetPeriodDashboard from '../widgets/WidgetPeriodDashboard.vue';
import WidgetInboxAge from '../widgets/WidgetInboxAge.vue';


const emit = defineEmits(['updateCustomQry', 'updateElapsed', 'customQryUserCancelled']);

const props = defineProps({
    accountEmails: {
        type: Array,
        default: []
    },
    internalDomains: {
        type: Array,
        default: () => []
    },
});

const msg = (key, subs) => browser.i18n.getMessage(key, subs);

const labels = {
    period: msg("DateRange"),
    period_b: msg("PeriodB"),
    compare: msg("ComparePeriods"),
    compare_single_day: msg("CompareNotOnSingleDay"),
    only_bd: msg("OnlyBDCustomQry"),
    run: msg("UpdateCustomQry"),
    quick_ranges: msg("Bookmarks_Menu"),
    filters: msg("AdvFilters"),
    add_filter: msg("AddFilter"),
    close_filters: msg("CloseFilters"),
    remove_filter: msg("RemoveFilter"),
    folders: msg("ChooseFoldersFilter"),
    folders_need_account: msg("ChooseAccountToFilterFolders"),
    folders_placeholder: msg("FilterFoldersPlaceholder"),
    subfolders: msg("FilterFoldersIncludeSubfolders"),
    subject: msg("FilterSubject"),
    case_sensitive: msg("WarnSearchCaseSensitive"),
    read_status: msg("ReadStatus"),
    flag_status: msg("FlagStatus"),
    all: msg("FilterFoldersAll"),
    only_read: msg("FilterFoldersOnlyRead"),
    only_unread: msg("FilterFoldersOnlyUnread"),
    only_flagged: msg("FilterFoldersOnlyFlagged"),
    only_unflagged: msg("FilterFoldersOnlyUnflagged"),
    reset_filters: msg("ResetAdvFilters"),
    data_for: msg("CustomQryDataMsg"),
    total_days: msg("TotalDays"),
    choose_period: msg("ChoosePeriodAndRun"),
};

const presets = [
    { id: "yesterday", label: msg("Yesterday") },
    { id: "currentweek", label: msg("CurrentWeek") },
    { id: "lastweek", label: msg("LastWeek") },
    { id: "last2week", label: msg("Last2Week") },
    { id: "currentmonth", label: msg("CurrentMonth") },
    { id: "lastmonth", label: msg("LastMonth") },
    { id: "currentyear", label: msg("CurrentYear") },
    { id: "lastyear", label: msg("LastYear") },
    { id: "allemails", label: msg("AllEmails") },
];

const aggregation_choices = [
    { id: 'day', label: msg("AggregationDays") },
    { id: 'week', label: msg("AggregationWeeks") },
    { id: 'month', label: msg("AggregationMonths") },
    { id: 'year', label: msg("AggregationYears") },
];

let filterFolder_ref = ref(null);

let max_direct_accounts = 1;
let doing_update = false;

let tsLog = null;
var tsCore = null;

let tabId = ref("tab-customqry");

let dateQry = ref();
let active_preset = ref("");
let do_run = ref(false);
let do_single_day = ref(false);
let singleDay = ref(null);
let customqry_current_account = ref("");
let customqry_current_account_tooltip = ref("");
let customqry_totaldays_num = ref(0);
let isDark = computed(() => tsStore.darkmode);
let emailListTooltipVisible = ref(false);
let aggregation = ref('day');

// advanced filters
let show_advanced_filters = ref(false);
let advanced_filters_set = ref(false);
let folderList = ref([]);
let filterFolder = ref([]);
let filterFolder_do_subfolders = ref(true);
let filterReadUnread = ref(0); // 0: all, 1: read, 2: unread
let filterFlaggedUnflagged = ref(0); // 0: all, 1: flagged, 2: unflagged
let filterSubject = ref("");

let datepickerFormat = ref("dd-MM-yyyy");
let prefLocale = ref("en-GB");

let doOnlyBD = ref(false);
let show_internal_mail_percent = ref(false);
let internal_sent_percent = ref('0.00%');
let internal_rcvd_percent = ref('0.00%');
let do_progressive = ref(false);
let show_inbox_in_bars = ref(true);
let inbox0_openFolderInFirstTab = ref(false);
let filter_duplicates = ref(false);
let first_day_week = ref(1);
let _involved_num = 10;

// comparison mode
let compareEnabled = ref(false);
let dateQryB_start = ref(null);

// raw results used to build the dashboards
let result_qry = ref(null);
let result_B = ref(null);
let result_inbox = ref(null);
let baseline_days = ref(null);
let result_prev_days = ref(null);
let query_days = ref([]);
let query_filtered = ref(false);

let is_loading_data = ref(true);
let is_loading_inbox = ref(true);
let is_loading_extra = ref(true);     // single day: baseline and previous days

let _export_data = ref({});

let elapsed = {
    'getCustomQryData': 0,
    'getInboxZeroData': 0,
    'getExtraData': 0,
}

let ExportMenu_ref = ref(null);

// Period B end date auto-calculation (using calendar days to avoid DST/ms drift)
const periodDays = computed(() => {
  if (!dateQry.value?.[0] || !dateQry.value?.[1]) return 0;
  return tsUtils.daysBetween(dateQry.value[0], dateQry.value[1]);
});
const single_day_selected = computed(() => periodDays.value == 1);
const dateQryB_end = computed(() => {
  if (!dateQryB_start.value || !periodDays.value) return null;
  const end = new Date(dateQryB_start.value);
  end.setDate(end.getDate() + periodDays.value - 1);
  return end;
});
const maxDateB = computed(() => {
  if (!periodDays.value) return new Date();
  const max = new Date();
  max.setDate(max.getDate() - periodDays.value + 1);
  return max;
});
const compareIsReady = computed(() => {
  return compareEnabled.value && !single_day_selected.value && dateQryB_start.value != null;
});

let job_done = computed(() => do_run.value && !is_loading_data.value && !is_loading_inbox.value && !is_loading_extra.value);

// active filters shown as removable chips
let active_filters = computed(() => {
    let output = [];
    if(filterFolder.value.length > 0) {
        let names = filterFolder.value.map(id => {
            let folder = folderList.value.find(f => f.value == id);
            return folder ? folder.label : id;
        });
        output.push({ id: 'folders', text: msg("FilterChipFolders", [names.join(", ")]), clear: () => { filterFolder_ref.value ? filterFolder_ref.value.clear() : (filterFolder.value = []); } });
    }
    if(filterSubject.value.trim().length > 0) {
        output.push({ id: 'subject', text: msg("FilterChipSubject", [filterSubject.value.trim()]), clear: () => { filterSubject.value = ""; updateAdvFiltersSet(); } });
    }
    if(filterReadUnread.value > 0) {
        output.push({ id: 'read', text: filterReadUnread.value == 1 ? labels.only_read : labels.only_unread, clear: () => { filterReadUnread.value = 0; updateAdvFiltersSet(); } });
    }
    if(filterFlaggedUnflagged.value > 0) {
        output.push({ id: 'flagged', text: filterFlaggedUnflagged.value == 1 ? labels.only_flagged : labels.only_unflagged, clear: () => { filterFlaggedUnflagged.value = 0; updateAdvFiltersSet(); } });
    }
    return output;
});

let day_model = computed(() => tsDayModel.build({
    kind: 'day',
    day: singleDay.value ? new Date(singleDay.value) : new Date(),
    result: result_qry.value,
    inbox: result_inbox.value,
    // the usual day is not filtered, so it is not compared with a filtered query
    baseline_days: query_filtered.value ? [] : baseline_days.value,
    prev_days: result_prev_days.value,
    prev_days_num: 7,
    progressive: do_progressive.value,
    hide_future: false,
    cmp: null,
    internal: { enabled: show_internal_mail_percent.value, sent_percent: internal_sent_percent.value, rcvd_percent: internal_rcvd_percent.value },
    involved_num: _involved_num,
    first_day_week: first_day_week.value,
    duplicates_note: filter_duplicates.value,
    open_folder_in_first_tab: inbox0_openFolderInFirstTab.value,
    neutral_badge: true,
}));

let day_loading = computed(() => ({
    strip: is_loading_data.value,
    chart: is_loading_data.value || is_loading_extra.value,
    involved: is_loading_data.value,
    domains: is_loading_data.value,
    folders: is_loading_data.value,
}));

let period_model = computed(() => tsPeriodModel.build({
    kind: 'custom',
    days: query_days.value,
    stat_days: query_days.value,
    today_key: null,
    result: result_qry.value,
    inbox: result_inbox.value,
    prev: null,
    aggregate: result_qry.value ? result_qry.value.aggregate : null,
    only_businessdays: doOnlyBD.value,
    show_inbox: show_inbox_in_bars.value,
    internal: { enabled: show_internal_mail_percent.value, sent_percent: internal_sent_percent.value, rcvd_percent: internal_rcvd_percent.value },
    involved_num: _involved_num,
    first_day_week: first_day_week.value,
    duplicates_note: filter_duplicates.value,
    open_folder_in_first_tab: inbox0_openFolderInFirstTab.value,
    aggregation: aggregation.value,
    cmp_result: result_B.value,
}));

let period_loading = computed(() => ({
    strip: is_loading_data.value,
    chart: is_loading_data.value,
    involved: is_loading_data.value,
    domains: is_loading_data.value,
    folders: is_loading_data.value,
}));

watch(() => tsStore.current_account_id, async (newValue, oldValue) => {
  if(newValue == 0) {
    filterFolder.value = [];
    if(filterFolder_ref.value) filterFolder_ref.value.clear();
    updateAdvFiltersSet();
  }else{
    folderList.value = await tsCoreUtils.getAccountFoldersNames(tsStore.current_account_id);
  }
});

watch(() => filterFolder.value, async (newValue, oldValue) => {
  updateAdvFiltersSet();
});

onBeforeMount(async () => {
  tsLog = new tsLogger("TAB_CustomQry", tsStore.do_debug);
  tsPrefs.logger = tsLog;
  prefLocale.value = await tsPrefs.getPref("datepicker_locale");
  datepickerFormat.value = tsUtils.formatDateStringLocale(prefLocale.value);
})

onMounted(async () => {
    const endDate = new Date();
    const startDate = new Date(new Date().setDate(endDate.getDate() - 6));
    dateQry.value = [startDate, endDate];
    let prefs = await tsPrefs.getPrefs(["first_day_week", "_involved_num", "bday_default_only", "customqry_always_open_adv_filters"]);
    if(prefs.customqry_always_open_adv_filters) show_advanced_filters.value = true;
    first_day_week.value = Number(prefs.first_day_week);
    _involved_num = prefs._involved_num;
    doOnlyBD.value = prefs.bday_default_only;
    if(tsStore.current_account_id != 0) {
      folderList.value = await tsCoreUtils.getAccountFoldersNames(tsStore.current_account_id);
    }
});

function update(){
  if(doing_update){
    tsLog.log("Update already in progress...");
    return;
  }
  doing_update = true;
  tsLog.log("Update requested");
  emit('updateCustomQry');
}

async function rangeChoosen(modelData){
  active_preset.value = "";
  if(await tsPrefs.getPref("customqry_loaddata_when_selectingrange")){
    update();
  }
}

async function periodBChoosen(){
  if(do_run.value && await tsPrefs.getPref("customqry_loaddata_when_selectingrange")){
    update();
  }
}

function toggleAdvancedFilters(){
  show_advanced_filters.value = !show_advanced_filters.value;
}

const updateAdvFiltersSet = () => {
  advanced_filters_set.value = (filterFolder.value.length > 0) || (filterReadUnread.value > 0) || (filterFlaggedUnflagged.value > 0) || (filterSubject.value.length > 0);
}

function resetAdvFilters() {
  if(filterFolder_ref.value) filterFolder_ref.value.clear();
  filterFolder.value = [];
  filterSubject.value = "";
  filterReadUnread.value = 0;
  filterFlaggedUnflagged.value = 0;
  updateAdvFiltersSet();
}

async function setPeriod(period){
    switch(period){
        case "yesterday":
            let yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            dateQry.value = [yesterday, new Date(yesterday)];
            break;
        case "currentweek":
            dateQry.value = [tsUtils.getLastWeekday(first_day_week.value), new Date()];
            break;
        case "lastweek":
            let last_weekday = tsUtils.getLastWeekday(first_day_week.value);
            last_weekday = new Date(last_weekday.setDate(last_weekday.getDate() - 1));
            dateQry.value = [tsUtils.getPreviousWeekday(last_weekday, first_day_week.value), last_weekday];
            break;
        case "last2week":
            let last_weekday2 = tsUtils.getLastWeekday(first_day_week.value);
            last_weekday2 = new Date(last_weekday2.setDate(last_weekday2.getDate() - 1));
            dateQry.value = [tsUtils.getPreviousWeekday(last_weekday2, first_day_week.value), new Date()];
            break;
        case "currentmonth":
            dateQry.value = [tsUtils.getFirstDayOfCurrentMonth(), new Date()];
            break;
        case "lastmonth":
            dateQry.value = [tsUtils.getFirstDayOfLastMonth(), tsUtils.getLastDayOfLastMonth()];
            break;
        case "currentyear":
            dateQry.value = [tsUtils.getFirstDayOfCurrentYear(), new Date()];
            break;
        case "lastyear":
            dateQry.value = [tsUtils.getFirstDayOfLastYear(), tsUtils.getLastDayOfLastYear()];
            break;
        case "allemails":
            dateQry.value = [new Date(0), new Date()];
            break;
    }
    active_preset.value = period;
    if(await tsPrefs.getPref("customqry_loaddata_when_selectingrange")){
      update();
    }
}

// Default grouping of the main chart for the length of the range
function defaultAggregation(num_days) {
  if(num_days <= 62) return 'day';
  if(num_days <= 190) return 'week';
  if(num_days <= 1100) return 'month';
  return 'year';
}

function dayKeys(from_date, to_date) {
  let keys = [];
  let day = new Date(from_date);
  day.setHours(12, 0, 0, 0);
  let last = new Date(to_date);
  last.setHours(12, 0, 0, 0);
  while(day <= last) {
    keys.push(tsUtils.dateToYYYYMMDD(day));
    day.setDate(day.getDate() + 1);
  }
  return keys;
}

async function doQry(){
  if(tsStore.current_account_id == 0) {
    filterFolder.value = [];
    if(filterFolder_ref.value) filterFolder_ref.value.clear();
  }
  tsLog.log(() => "filterFolder.value: "+JSON.stringify(filterFolder.value));
  customqry_totaldays_num.value = tsUtils.daysBetween(dateQry.value[0],dateQry.value[1]);
  let pref_warn_days = await tsPrefs.getPref("customqry_warn_onlongperiod_days");
  if(pref_warn_days > 0 && customqry_totaldays_num.value > pref_warn_days){
    if(!confirm(browser.i18n.getMessage("CustomViewTooMuchDaysText",customqry_totaldays_num.value))){
      emit('customQryUserCancelled');
      doing_update = false;
      return;
    }
  }
  loadingDo();
  do_single_day.value = (customqry_totaldays_num.value == 1);
  aggregation.value = defaultAggregation(customqry_totaldays_num.value);
  query_days.value = dayKeys(dateQry.value[0], dateQry.value[1]);
  query_filtered.value = advanced_filters_set.value;
  tabId.value = "tab-customqry";
  if(do_single_day.value){
    tsLog.log("Doing single day view...");
    tabId.value = "tab-customqry-single-day";
    singleDay.value = dateQry.value[0];
  }
  if(props.accountEmails.length > max_direct_accounts){
    customqry_current_account.value = props.accountEmails.length + " " + browser.i18n.getMessage("EmailAddresses");
    customqry_current_account_tooltip.value = props.accountEmails.join(" ");
  } else {
    customqry_current_account.value = props.accountEmails.join(", ");
    customqry_current_account_tooltip.value = "";
  }
  do_run.value = true;
  await updateData();
}

async function updateData() {
    let prefs = await tsPrefs.getPrefs(["_time_chart_progressive", "accounts_adv_settings", "show_internal_mail_percent", "many_days_show_inbox", "inbox0_openFolderInFirstTab", "first_day_week"]);
    do_progressive.value = prefs._time_chart_progressive;
    show_inbox_in_bars.value = prefs.many_days_show_inbox;
    inbox0_openFolderInFirstTab.value = prefs.inbox0_openFolderInFirstTab;
    first_day_week.value = Number(prefs.first_day_week);
    show_internal_mail_percent.value = prefs.show_internal_mail_percent && props.internalDomains.length > 0;
    filter_duplicates.value = await tsCoreUtils.getFilterDuplicatesPreference(tsStore.current_account_id);
    tsCore = new thunderStastsCore({do_debug: tsStore.do_debug, _involved_num: _involved_num, accounts_adv_settings: prefs.accounts_adv_settings});
    tsLog.log(() => "props.accountEmails: " + JSON.stringify(props.accountEmails));
    tsLog.log(() => "dateQry: " + JSON.stringify(dateQry.value));
    // main data first, then the secondary queries: every query runs on Thunderbird's main thread
    await getCustomQryData();
    getInboxZeroData();
    if(do_single_day.value) {
      getExtraData();
    } else {
      is_loading_extra.value = false;
      updateElapsed('getExtraData', 1);
    }
    nextTick(() => {
        i18n.updateDocument();
    });
};

    function getCustomQryData () {
        return new Promise(async (resolve) => {
            let start_time = performance.now();
            let fromDate = new Date(dateQry.value[0]);
            let toDate = new Date(dateQry.value[1]);
            let advFilters = {
              folders: filterFolder.value,
              folders_do_subfolders: filterFolder_do_subfolders.value,
              read_unread: filterReadUnread.value,
              flagged_unflagged: filterFlaggedUnflagged.value,
              filterSubject: filterSubject.value.trim(),
            };
            tsLog.log(() => "advFilters: " + JSON.stringify(advFilters, null, 2));
            let result = await tsCore.getCustomQryData(fromDate, toDate, tsStore.current_account_id, props.accountEmails, doOnlyBD.value, advFilters, props.internalDomains);
            tsLog.log(() => "result_customqry: " + JSON.stringify(result, null, 2));
            // export data
            if(!do_single_day.value){
              _export_data.value[tsExport.export.daily_mails.type] = result.dates;
              _export_data.value[tsExport.export.weekdays.type] = result.msg_weekdays;
              _export_data.value[tsExport.export.weekly_mails.type] = result.dates_weeks;
              _export_data.value[tsExport.export.monthly_mails.type] = result.dates_months;
              _export_data.value[tsExport.export.yearly_mails.type] = result.dates_years;
            }
            _export_data.value[tsExport.export.time_emails.type] = result.msg_hours;
            _export_data.value[tsExport.export.correspondents.type] = tsExport.mergeRecipientsAndSenders(result.senders, result.recipients);
            _export_data.value[tsExport.export.tags.type] = result.tags;
            _export_data.value[tsExport.export.folders.type] = result.folders;
            _export_data.value[tsExport.export.domains.type] = result.domains;
            if(show_internal_mail_percent.value) {
                let internalData = tsCoreUtils.getInternalMailLabel(result.domains);
                internal_sent_percent.value = internalData.sentPercent;
                internal_rcvd_percent.value = internalData.receivedPercent;
            }
            // Period B comparison data
            if (compareIsReady.value && dateQryB_end.value) {
              let fromDateB = new Date(dateQryB_start.value);
              fromDateB.setHours(0, 0, 0, 0);
              let toDateB = new Date(dateQryB_end.value);
              toDateB.setHours(23, 59, 59, 999);
              let result_period_b = await tsCore.getCustomQryData(fromDateB, toDateB, tsStore.current_account_id, props.accountEmails, doOnlyBD.value, advFilters, props.internalDomains);
              tsLog.log(() => "result_customqry_B: " + JSON.stringify(result_period_b, null, 2));
              // export comparison data
              _export_data.value['compare_' + tsExport.export.daily_mails.type] = result_period_b.dates;
              _export_data.value['compare_' + tsExport.export.weekdays.type] = result_period_b.msg_weekdays;
              _export_data.value['compare_' + tsExport.export.weekly_mails.type] = result_period_b.dates_weeks;
              _export_data.value['compare_' + tsExport.export.monthly_mails.type] = result_period_b.dates_months;
              _export_data.value['compare_' + tsExport.export.yearly_mails.type] = result_period_b.dates_years;
              _export_data.value['compare_' + tsExport.export.time_emails.type] = result_period_b.msg_hours;
              _export_data.value['compare_' + tsExport.export.tags.type] = result_period_b.tags;
              _export_data.value['compare_' + tsExport.export.folders.type] = result_period_b.folders;
              _export_data.value['compare_' + tsExport.export.domains.type] = result_period_b.domains;
              result_B.value = result_period_b;
            } else {
              for(let key of Object.keys(_export_data.value)) {
                if(key.startsWith('compare_')) delete _export_data.value[key];
              }
              result_B.value = null;
            }
            result_qry.value = result;
            is_loading_data.value = false;
            let stop_time = performance.now();
            updateElapsed('getCustomQryData', stop_time - start_time);
            doing_update = false;
            resolve(true);
        });
    };

    function getInboxZeroData () {
        return new Promise(async (resolve) => {
            let result = await tsCore.getInboxZeroDates(tsStore.current_account_id);
            result_inbox.value = result;
            is_loading_inbox.value = false;
            updateElapsed('getInboxZeroData', result.elapsed);
            resolve(true);
        });
    };

    // single day: the same weekday in the previous weeks and the previous days
    function getExtraData () {
        return new Promise(async (resolve) => {
            let day = new Date(dateQry.value[0]);
            day.setHours(0, 0, 0, 0);
            let [baseline, prev] = await Promise.all([
              tsCore.getWeekdayBaseline(new Date(day), tsStore.current_account_id, props.accountEmails, BASELINE_WEEKS),
              tsCore.getDaysBefore(new Date(day), 7, tsStore.current_account_id, props.accountEmails),
            ]);
            baseline_days.value = baseline.days;
            result_prev_days.value = prev.msg_days;
            is_loading_extra.value = false;
            updateElapsed('getExtraData', Math.max(baseline.elapsed, prev.elapsed));
            resolve(true);
        });
    };

function loadingDo(){
    is_loading_data.value = true;
    is_loading_inbox.value = true;
    is_loading_extra.value = true;
    result_qry.value = null;
    result_B.value = null;
    result_inbox.value = null;
    baseline_days.value = null;
    result_prev_days.value = null;
    elapsed = {
        'getCustomQryData': 0,
        'getInboxZeroData': 0,
        'getExtraData': 0,
    }
}

function updateElapsed(function_name, time) {
    elapsed[function_name] = time;
    const allNonZero = Object.values(elapsed).every(value => value !== 0);
    if (allNonZero) {
        emit('updateElapsed', Math.max(...Object.values(elapsed)));
    }
}

function formatDate(date) {
  if (!date) return '';
  return date.toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
}

function showEmailListTooltip(){
  emailListTooltipVisible.value = (customqry_current_account_tooltip.value != "");
}

function hideEmailListTooltip(){
  emailListTooltipVisible.value = false;
}

function openExportMenu(anchor_el) {
  if(ExportMenu_ref.value) ExportMenu_ref.value.openExportMenu(null, anchor_el);
}

defineExpose({ doQry, openExportMenu });

</script>

<style scoped>
.ts-dashboard-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ts-query-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 20px;
}

.ts-query-fields {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 14px 18px;
}

.ts-query-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ts-query-date {
  min-width: 250px;
}

.ts-query-date-b {
  min-width: 170px;
  max-width: 190px;
}

.ts-query-b {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ts-query-b-end {
  font-size: 13px;
  color: var(--text2);
  white-space: nowrap;
}

.ts-spacer {
  flex: 1;
}

.ts-switch {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 0;
  font-size: 13px;
  color: var(--text2);
  cursor: pointer;
}

.ts-switch.is-disabled {
  opacity: .5;
  cursor: default;
}

.ts-switch input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.ts-switch-track {
  width: 28px;
  height: 16px;
  border-radius: 8px;
  background: var(--surface3);
  display: flex;
  align-items: center;
  padding: 2px;
  box-sizing: border-box;
}

.ts-switch-knob {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background: var(--text3);
  transition: transform .15s;
}

.ts-switch input:checked + .ts-switch-track {
  background: var(--accent);
}

.ts-switch input:checked + .ts-switch-track .ts-switch-knob {
  background: #ffffff;
  transform: translateX(12px);
}

.ts-switch input:focus-visible + .ts-switch-track {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.ts-primary-btn {
  border: 0;
  padding: 9px 20px;
  border-radius: var(--radius-input);
  background: var(--accent);
  color: #ffffff;
  font: inherit;
  font-size: 13px;
  font-weight: 640;
  cursor: pointer;
}

.ts-primary-btn:hover {
  filter: brightness(1.08);
}

.ts-chip-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.ts-chip-label {
  font-size: 12px;
  color: var(--text3);
  margin-right: 4px;
}

.ts-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 11px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text2);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.ts-chip:hover {
  color: var(--text);
}

.ts-chip.is-active {
  border-color: transparent;
  background: var(--accentSoft);
  color: var(--accent);
  font-weight: 600;
}

.ts-chip-filter {
  padding-right: 6px;
  border-color: transparent;
  background: var(--surface3);
  color: var(--text);
  cursor: default;
}

.ts-chip-remove {
  border: 0;
  padding: 0 2px;
  background: transparent;
  color: var(--text3);
  font: inherit;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
}

.ts-chip-remove:hover {
  color: var(--warn);
}

.ts-chip-add {
  border-style: dashed;
  color: var(--accent);
  font-weight: 600;
}

.ts-chip-sep {
  width: 1px;
  height: 18px;
  margin: 0 6px;
  background: var(--line);
}

.ts-adv-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
  gap: 14px 18px;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-input);
  background: var(--surface);
}

.ts-adv-folders {
  grid-column: span 2;
}

@media (max-width: 760px) {
  .ts-adv-folders {
    grid-column: auto;
  }
}

.ts-adv-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.ts-adv-check {
  font-size: 12px;
  color: var(--text2);
  cursor: pointer;
}

.ts-adv-hint {
  font-size: 11px;
  color: var(--text3);
}

.ts-adv-actions {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.ts-adv-actions .ts-link-btn:disabled {
  color: var(--text3);
  cursor: default;
  text-decoration: none;
}

.ts-input {
  padding: 7px 10px;
  border: 1px solid var(--line);
  border-radius: var(--radius-input);
  background: var(--surface2);
  color: var(--text);
  font: inherit;
  font-size: 13px;
}

.ts-query-info {
  font-size: 12px;
  color: var(--text3);
}

.ts-query-empty {
  font-size: 13px;
  color: var(--text2);
}
</style>
