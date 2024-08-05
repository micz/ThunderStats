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
        <DataTable v-model:selection="selectedBDay" :value="customBusinessDays" showGridlines stripedRows selectionMode="single" :metaKeySelection="false" dataKey="id" @rowSelect="bDaysOnRowSelect" @rowUnselect="bDaysOnRowUnselect">
            <Column field="date" header="__MSG_Date__"></Column>
            <Column field="description" header="__MSG_Description__"></Column>
        </DataTable>
    </td>
      <td style="text-align: right; vertical-align: top;">
        <button class="bday_btn" @click="bDaysShowDialogNew">__MSG_New__...</button><br>
        <button class="bday_btn" :disabled="!bDayRowSelected">__MSG_Edit__...</button><br>
        <button class="bday_btn" :disabled="!bDayRowSelected" @click="bDaysDelete">__MSG_Delete__</button>
      </td>
    </tr>
</table>

<Dialog v-model:visible="bDayShowDialogNew" modal header="__MSG_New__ __MSG_Non-Business_Day__" :style="{ width: '25rem' }">
    <table class="miczPrefs bday_table_new">
        <tr>
      <td>
        <label><span class="dims_label" >__MSG_Description__</span></label>
      </td>
      <td>
        <input type="text" v-model="bday_new_description"/>
      </td>
    </tr>
    <tr>
      <td>
        <label><span class="dims_label" >__MSG_Date__</span></label>
      </td>
      <td>
        <DatePicker v-model="nbday_new_date" showIcon />
      </td>
    </tr>
    <tr>
      <td>
        <label><span class="dims_label" >__MSG_Yearly__</span></label>
      </td>
      <td>
        <label><input type="checkbox" v-model="bday_new_yearly"/> __MSG_Yearly_Desc__</label>
      </td>
    </tr>
    </table>
    <div class="bday_btns_new">
        <button type="button" label="Save" @click="bDaysSaveNew" :disabled="nbday_new_date === null">__MSG_Save__</button>
        <button type="button" label="Cancel" severity="secondary" @click="bDaysHideDialogNew">__MSG_Cancel__</button>
    </div>
</Dialog>

</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { TS_prefs } from '@statslib/mzts-options';
import { tsLogger } from '@statslib/mzts-logger';
import { tsStore } from '@statslib/mzts-store';
import { i18n } from "@statslib/mzts-i18n.js";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import DatePicker from 'primevue/datepicker';

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
const customBusinessDays = ref([]);
const bDayRowSelected = ref(false);
const bDayShowDialogNew = ref(false);
const bday_new_description = ref("");
const nbday_new_date = ref(null);
const bday_new_yearly = ref(false);
const selectedBDay = ref(null);


onMounted(async () => {
    tsLog = new tsLogger("OPTAB_BusinessDays", tsStore.do_debug);

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('change', somethingChanged);
    });
    
    const prefs = await TS_prefs.getPrefs(["bday_custom_days","bday_weekdays_0", "bday_weekdays_1", "bday_weekdays_2", "bday_weekdays_3", "bday_weekdays_4", "bday_weekdays_5", "bday_weekdays_6", "first_day_week"]);

    console.log(">>>>>> BDays onMounted: prefs: " + JSON.stringify(prefs));
    customBusinessDays.value = prefs.bday_custom_days;
    
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
});

async function somethingChanged() {
    new_changes.value = true;
    emit('new_changes', new_changes.value);
  }

function bDaysOnRowSelect(event) {
    bDayRowSelected.value = true;
}

function bDaysOnRowUnselect(event) {
    bDayRowSelected.value = false;
}

function bDaysShowDialogNew() {
    bDayShowDialogNew.value = true;
    nextTick(() => {
        i18n.updateDocument();
    })
}

function bDaysHideDialogNew() {
    bDayShowDialogNew.value = false;
    bday_new_description.value ="";
    nbday_new_date.value = null;
    bday_new_yearly.value = false;
}

function bDaysSaveNew() {
    let date = new Date(nbday_new_date.value);
    let description = bday_new_description.value;
    let yearly = bday_new_yearly.value;
    bDaysHideDialogNew();
    let date_output = '';
    if (yearly === false) {
        date_output = date.toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
    }else{
        date_output = date.toLocaleDateString(undefined, {day: '2-digit', month: '2-digit'}) + '/year';
    }
    customBusinessDays.value.push({id: bDaysCreateId(), date: date_output, description: description});
    //save bday_custom_days pref
    TS_prefs.setPref("bday_custom_days", customBusinessDays.value);
    somethingChanged();
}

function bDaysCreateId() {
    let max_id = 0;
    customBusinessDays.value.forEach(elem => {
        if (elem.id > max_id) max_id = elem.id;
    });
    return max_id + 1;
}

function bDaysDelete() {
    if(!confirm(browser.i18n.getMessage("deletePromptNBD_text"))) return;

    customBusinessDays.value.splice(selectedBDay.value, 1);
    //save bday_custom_days pref
    TS_prefs.setPref("bday_custom_days", customBusinessDays.value);
    somethingChanged();
    bDaysOnRowUnselect(null);
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