<template>
<table>
    <tr>
        <td>
            <label><input type="checkbox" id="bday_use_last_business_day" name="bday_use_last_business_day" class="option-input" /></label>
        </td>
        <td>
            <label><span class="dims_label" @click="toggle_options">__MSG_Label_bday_use_last_business_day__</span></label>
        </td>
    </tr>
    <tr>
        <td>
            <label><input type="checkbox" id="bday_default_only" name="bday_default_only" class="option-input" /></label>
        </td>
        <td>
            <label><span class="dims_label" @click="toggle_options">__MSG_Label_bday_default_only__</span></label>
        </td>
    </tr>
</table>
<table class="table_panel">
    <tr>
      <td class="grouptitle">__MSG_Weekdays__</td>
    </tr>
    <tr>
      <div class="weekdays">
        <label v-for="day in days" :key="day" class="day-checkbox">
          <input type="checkbox" v-model="selectedDays" :value="day.idx" class="option-input" :id="`bday_weekdays_${day.idx}`">
            {{ day.label }}
        </label>
      </div>
    </tr>
</table>
<table class="table_panel">
    <tr>
      <td class="grouptitle" colspan="2">__MSG_Non-BDays__</td>
    </tr>
    <tr><td>
        <table class="bday_table">
            <tr>
                <th>__MSG_Year__</th>
                <th>__MSG_Month__</th>
                <th>__MSG_Day__</th>
                <th>__MSG_Description__</th>
            </tr>
            <tr
            v-for="day in customNBusinessDays"
            :key="day.id"
            @click="nbDaySelectDay(day)"
            :class="{ selected: nbDayRowSelected && selectedNBDay.id === day.id }"
            >
                <td>{{ day.year == 'every_year' ? '__MSG_Yearly__' : day.year }}</td>
                <td>{{ day.month + 1 }}</td>
                <td>{{ day.day }}</td>
                <td>{{ day.description }}</td>
            </tr>
        </table>
    </td>
      <td style="text-align: right; vertical-align: top;">
        <button class="bday_btn" @click="nbDaysShowDialogNew">__MSG_New__...</button><br>
        <button class="bday_btn" :disabled="!nbDayRowSelected" @click="nbDaysShowDialogEdit">__MSG_Edit__...</button><br>
        <button class="bday_btn" :disabled="!nbDayRowSelected" @click="nbDaysDelete">__MSG_Delete__</button>
      </td>
    </tr>
    <tr>
        <td colspan="2">
            <label><input type="checkbox" id="bday_easter" name="bday_easter" class="option-input" /></label>&nbsp;
            <label><span class="dims_label" @click="toggle_options">__MSG_EasterNoBusinessDay__</span></label>
        </td>
    </tr>
</table>

<div v-if="nbDayShowDialogNew" class="modal" @click="nbDaysHideDialogNew" >
  <div class="modal-content" @click.stop>
    <table class="miczPrefs bday_table_new">
      <tr>
      <td colspan="2" class="grouptitle">__MSG_New__ __MSG_Non-Business_Day__</td>
      </tr>
        <tr>
      <td>
        <label><span class="dims_label" >__MSG_Description__</span></label>
      </td>
      <td>
        <input type="text" v-model="nbday_new_description"/>
      </td>
    </tr>
    <tr>
      <td>
        <label><span class="dims_label" >__MSG_Date__</span></label>
      </td>
      <td>
        <VueDatePicker v-model="nbday_new_date" :enable-time-picker="false" :clearable="false" auto-apply :dark="isDark" :format="datepickerFormat" :locale="prefLocale" ></VueDatePicker>
      </td>
    </tr>
    <tr>
      <td>
        <label><span class="dims_label" >__MSG_Yearly__</span></label>
      </td>
      <td>
        <label><input type="checkbox" v-model="nbday_new_yearly"/> __MSG_Yearly_Desc__</label>
      </td>
    </tr>
    </table>
    <div class="bday_btns_new">
        <button type="button" label="Save" @click="nbDaysSaveNew" :disabled="nbday_new_date === null">__MSG_Save__</button>
        <button type="button" label="Cancel" severity="secondary" @click="nbDaysHideDialogNew">__MSG_Cancel__</button>
    </div>
  </div>
</div>

<div v-if="nbDayShowDialogEdit" class="modal" @click="nbDaysHideDialogEdit">
  <div class="modal-content" @click.stop>
    <table class="miczPrefs bday_table_new">
      <tr>
      <td colspan="2" class="grouptitle">__MSG_Edit__ __MSG_Non-Business_Day__</td>
      </tr>
        <tr>
      <td>
        <label><span class="dims_label" >__MSG_Description__</span></label>
      </td>
      <td>
        <input type="text" v-model="nbday_edit_description"/>
      </td>
    </tr>
    <tr>
      <td>
        <label><span class="dims_label" >__MSG_Date__</span></label>
      </td>
      <td>
        <VueDatePicker v-model="nbday_edit_date" :enable-time-picker="false" :clearable="false" auto-apply :dark="isDark" :format="datepickerFormat" :locale="prefLocale" ></VueDatePicker>
      </td>
    </tr>
    <tr>
      <td>
        <label><span class="dims_label" >__MSG_Yearly__</span></label>
      </td>
      <td>
        <label><input type="checkbox" v-model="nbday_edit_yearly"/> __MSG_Yearly_Desc__</label>
      </td>
    </tr>
    </table>
    <div class="bday_btns_new">
        <button type="button" label="Save" @click="nbDaysSaveEdit" :disabled="nbday_edit_date === null">__MSG_Save__</button>
        <button type="button" label="Cancel" severity="secondary" @click="nbDaysHideDialogEdit">__MSG_Cancel__</button>
    </div>
  </div>
</div>

</template>

<script setup>
import { ref, onBeforeMount, onMounted, nextTick } from 'vue';
import { TS_prefs } from '@statslib/mzts-options';
import { tsLogger } from '@statslib/mzts-logger';
import { tsStore } from '@statslib/mzts-store';
import { tsUtils } from '@statslib/mzts-utils';
import { i18n } from "@statslib/mzts-i18n.js";
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'


let tsLog = null;

const firstDayWeek = ref(1);

const days = [
  {idx: 1, label: browser.i18n.getMessage('WeekDay1')},
  {idx: 2, label: browser.i18n.getMessage('WeekDay2')},
  {idx: 3, label: browser.i18n.getMessage('WeekDay3')},
  {idx: 4, label: browser.i18n.getMessage('WeekDay4')},
  {idx: 5, label: browser.i18n.getMessage('WeekDay5')},
  {idx: 6, label: browser.i18n.getMessage('WeekDay6')},
  {idx: 0, label: browser.i18n.getMessage('WeekDay0')}
];

const emit = defineEmits(['new_changes']);

let new_changes = ref(false);
const selectedDays = ref([]);
const selectedNBDay = ref(null);
const customNBusinessDays = ref([]);
const nbDayRowSelected = ref(false);
const nbDayShowDialogNew = ref(false);
const nbday_new_description = ref("");
const nbday_new_date = ref(null);
const nbday_new_yearly = ref(false);
const nbDayShowDialogEdit = ref(false);
const nbday_edit_description = ref("");
const nbday_edit_date = ref(null);
const nbday_edit_yearly = ref(false);
let isDark = ref(false);
let datepickerFormat = ref("dd-MM-yyyy");
let prefLocale = ref("en-GB");


onBeforeMount(async () => {
  tsLog = new tsLogger("OPTAB_BusinessDays", tsStore.do_debug);
  TS_prefs.logger = tsLog;
  prefLocale.value = await TS_prefs.getPref("datepicker_locale");
  datepickerFormat.value = tsUtils.formatDateStringLocale(prefLocale.value);
  if(tsStore.darkmode === undefined) {
    tsStore.darkmode = tsUtils.isDarkMode();
  }
  isDark.value = tsStore.darkmode;
})

onMounted(async () => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('change', somethingChanged);
    });
    
    const prefs = await TS_prefs.getPrefs(["bday_custom_days","bday_weekdays_0", "bday_weekdays_1", "bday_weekdays_2", "bday_weekdays_3", "bday_weekdays_4", "bday_weekdays_5", "bday_weekdays_6", "first_day_week"]);

    customNBusinessDays.value = prefs.bday_custom_days;
    
    selectedDays.value = [];
    days.forEach(day => {
        if (prefs[`bday_weekdays_${day.idx}`]) {
            selectedDays.value.push(day.idx);
        }
    });
        
    firstDayWeek.value = prefs.first_day_week;
    if (firstDayWeek.value == 0) {
        days.sort((a, b) => a.idx - b.idx);
    }
    else if (firstDayWeek.value == 6) {
        days.sort((a, b) => {
            if (a.idx === 6) return -1;
            if (b.idx === 6) return 1;
            if (a.idx === 0) return -1;
            if (b.idx === 0) return 1;
            return a.idx - b.idx;
        });
    }
    tsLog.log("onMounted");
    nextTick(() => {
        i18n.updateDocument();
    })
});

async function somethingChanged() {
    new_changes.value = true;
    emit('new_changes', new_changes.value);
  }

function nbDaySelectDay(day){
  selectedNBDay.value = day;
  nbDayRowSelected.value = true;
}

function nbDaysOnRowUnselect(event) {
    nbDayRowSelected.value = false;
}

function nbDaysShowDialogNew() {
    nbDayShowDialogNew.value = true;
    nextTick(() => {
        i18n.updateDocument();
    })
}

function nbDaysHideDialogNew() {
    nbDayShowDialogNew.value = false;
    nbday_new_description.value ="";
    nbday_new_date.value = null;
    nbday_new_yearly.value = false;
}

function nbDaysSaveNew() {
    let date = new Date(nbday_new_date.value);
    let description = nbday_new_description.value;
    let yearly = nbday_new_yearly.value;
    nbDaysHideDialogNew();
    let year = yearly ? 'every_year' : date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    customNBusinessDays.value.push({id: nbDaysCreateId(), year: year, month: month, day: day, description: description});
    //save bday_custom_days pref
    TS_prefs.setPref("bday_custom_days", customNBusinessDays.value);
    somethingChanged();
    nextTick(() => {
        i18n.updateDocument();
    })
}

function nbDaysCreateId() {
    let max_id = 0;
    customNBusinessDays.value.forEach(elem => {
        if (elem.id > max_id) max_id = elem.id;
    });
    return max_id + 1;
}

function nbDaysShowDialogEdit() {
    nbday_edit_description.value = selectedNBDay.value.description;
    nbday_edit_date.value = new Date(selectedNBDay.value.year == 'every_year' ? new Date().getFullYear() : selectedNBDay.value.year, selectedNBDay.value.month, selectedNBDay.value.day);
    nbday_edit_yearly.value = selectedNBDay.value.year == 'every_year';
    nbDayShowDialogEdit.value = true;
    nextTick(() => {
        i18n.updateDocument();
    })
}

function nbDaysHideDialogEdit() {
    nbDayShowDialogEdit.value = false;
    nbday_edit_description.value ="";
    nbday_edit_date.value = null;
    nbday_edit_yearly.value = false;
}

function nbDaysSaveEdit() {
    let date = new Date(nbday_edit_date.value);
    selectedNBDay.value.description = nbday_edit_description.value;
    selectedNBDay.value.yearly = nbday_edit_yearly.value;
    nbDaysHideDialogEdit();
    selectedNBDay.value.year = selectedNBDay.value.yearly ? 'every_year' : date.getFullYear();
    selectedNBDay.value.month = date.getMonth();
    selectedNBDay.value.day = date.getDate();
    const index = customNBusinessDays.value.findIndex(item => item.id === selectedNBDay.value.id);
    if (index !== -1) {
        customNBusinessDays.value[index] = selectedNBDay.value;
    }
    //save bday_custom_days pref
    TS_prefs.setPref("bday_custom_days", customNBusinessDays.value);
    somethingChanged();
    nextTick(() => {
        i18n.updateDocument();
    })
}

function nbDaysDelete() {
    if(!confirm(browser.i18n.getMessage("deletePromptNBD_text"))) return;

    customNBusinessDays.value = customNBusinessDays.value.filter(obj => obj.id !== selectedNBDay.value.id);
    //save bday_custom_days pref
    TS_prefs.setPref("bday_custom_days", customNBusinessDays.value);
    somethingChanged();
    nbDaysOnRowUnselect(null);
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