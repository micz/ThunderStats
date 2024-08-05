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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { TS_prefs } from '@statslib/mzts-options';
import { tsLogger } from '@statslib/mzts-logger';
import { tsStore } from '@statslib/mzts-store';

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

const selectedDays = ref([]);

onMounted(async () => {
    tsLog = new tsLogger("OPTAB_BusinessDays", tsStore.do_debug);
    
    const prefs = await TS_prefs.getPrefs(["bday_weekdays_0", "bday_weekdays_1", "bday_weekdays_2", "bday_weekdays_3", "bday_weekdays_4", "bday_weekdays_5", "bday_weekdays_6", "first_day_week"]);
    
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


function toggle_options(e) {
    let row = e.target.closest('tr');
    let checkbox = row.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
    checkbox.dispatchEvent(new Event('change', { 'bubbles': true }));
  }

</script>

<style scoped>

</style>