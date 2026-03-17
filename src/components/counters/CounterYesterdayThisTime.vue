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
<div class="comparison_day_wrapper" ref="datepickerWrapper">
<p class="additional_info_text"><span class="additional_info_text"><span :class="['comparison_day_label', { 'comparison_day_label_ready': props.is_job_done }]" @click="toggleDatePicker" :title="comparisonDayTitle" v-text="comparisonDayText"></span><span v-if="is_custom_comparison_day" class="reset_comparison_day" @click="resetDay" title="&#x2715;">&#x2715;</span> __MSG_YesterdayThisTime__: <span id="yesterday_incremental_sent" v-if="!is_loading">{{ sent }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading__..." id="yesterday_incremental_sent_wait" v-if="is_loading"/> __MSG_sent__ / <span id="yesterday_incremental_rcvd" v-if="!is_loading">{{ rcvd }}</span><img src="@/assets/images/mzts-wait_line.svg" class="spinner_small" alt="__MSG_Loading;..." id="yesterday_incremental_rcvd_wait" v-if="is_loading"/> __MSG_received__</span></p>
<div v-if="showDatePicker" class="comparison_datepicker_container">
  <VueDatePicker
    :model-value="null"
    @update:model-value="onDateSelected"
    :dark="is_dark"
    :format="datepicker_format"
    :locale="datepicker_locale"
    :enable-time-picker="false"
    :clearable="false"
    :auto-apply="true"
    :max-date="yesterdayDate"
    inline
  />
</div>
</div>
</template>


<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

let props = defineProps({
    sent: {
        type: Number,
        default: 0
    },
    rcvd: {
        type: Number,
        default: 0
    },
    is_loading: {
        type: Boolean,
        default: true
    },
    is_last_business_day: {
        type: Boolean,
        default: false
    },
    last_bday_date: {
        type: String,
        default: ''
    },
    is_custom_comparison_day: {
        type: Boolean,
        default: false
    },
    custom_comparison_day_text: {
        type: String,
        default: ''
    },
    datepicker_format: {
        type: String,
        default: 'dd-MM-yyyy'
    },
    datepicker_locale: {
        type: String,
        default: 'en-GB'
    },
    is_dark: {
        type: Boolean,
        default: false
    },
    is_job_done: {
        type: Boolean,
        default: false
    },
});

const emit = defineEmits(['customDaySelected']);

let showDatePicker = ref(false);
let datepickerWrapper = ref(null);

function onClickOutside(event) {
    if(datepickerWrapper.value && !datepickerWrapper.value.contains(event.target)) {
        showDatePicker.value = false;
    }
}

function onEscKey(event) {
    if(event.key === 'Escape') {
        showDatePicker.value = false;
    }
}

watch(showDatePicker, (val) => {
    if(val) {
        setTimeout(() => document.addEventListener('click', onClickOutside), 0);
        document.addEventListener('keydown', onEscKey);
    } else {
        document.removeEventListener('click', onClickOutside);
        document.removeEventListener('keydown', onEscKey);
    }
});

onBeforeUnmount(() => {
    document.removeEventListener('click', onClickOutside);
    document.removeEventListener('keydown', onEscKey);
});

let sent = computed(() => {
    return props.sent
})
let rcvd = computed(() => {
    return props.rcvd
})
let is_loading = computed(() => {
    return props.is_loading
})
let is_last_business_day = computed(() => {
    return props.is_last_business_day
})
let is_custom_comparison_day = computed(() => {
    return props.is_custom_comparison_day
})

let comparisonDayText = computed(() => {
    if(is_custom_comparison_day.value) {
        return props.custom_comparison_day_text;
    }
    if(is_last_business_day.value) {
        return browser.i18n.getMessage("LastBusinessDay")
    }
    return browser.i18n.getMessage("Yesterday")
})

let comparisonDayTitle = computed(() => {
    if(!props.is_job_done) {
        return browser.i18n.getMessage("WaitForProcessing");
    }
    if(is_custom_comparison_day.value) {
        return browser.i18n.getMessage("ClickToChangeComparisonDay");
    }
    if(props.last_bday_date) {
        return props.last_bday_date + ' - ' + browser.i18n.getMessage("ClickToChangeComparisonDay");
    }
    return browser.i18n.getMessage("ClickToChangeComparisonDay");
})

let yesterdayDate = computed(() => {
    let d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
})

function toggleDatePicker() {
    if(!props.is_job_done) return;
    showDatePicker.value = !showDatePicker.value;
}

function onDateSelected(date) {
    showDatePicker.value = false;
    emit('customDaySelected', date);
}

function resetDay() {
    if(!props.is_job_done) return;
    showDatePicker.value = false;
    emit('customDaySelected', null);
}

</script>




<style scoped>
.comparison_day_label {
    cursor: default;
}
.comparison_day_label_ready {
    cursor: pointer;
    text-decoration: underline;
    text-decoration-style: dotted;
}
.comparison_day_label_ready:hover {
    text-decoration-style: solid;
}
.reset_comparison_day {
    cursor: pointer;
    margin-left: 4px;
    font-size: 0.8em;
    opacity: 0.7;
}
.reset_comparison_day:hover {
    opacity: 1;
}
.comparison_day_wrapper {
    position: relative;
}
.comparison_datepicker_container {
    position: absolute;
    z-index: 100;
    margin-top: 5px;
}
</style>
