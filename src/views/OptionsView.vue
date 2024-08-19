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
  <main>
    <tabs :options="{ defaultTabHash: 'tab-main' }"  cache-lifetime="0"  @changed="tabChanged" ref="optionsTabs" class="paddingbottom30">
      <tab id="tab-main" name="__MSG_TabSettings.label__">
         <OPTAB_Main ref="OPTAB_Main_ref" v-on:new_changes="somethingChanged"/>
      </tab>
      <tab id="tab-advanced" name="__MSG_TabAdvanced.label__">
         <OPTAB_Advanced ref="OPTAB_Advanced_ref" v-on:new_changes="somethingChanged"/>
      </tab>
      <tab id="tab-businessdays" name="__MSG_TabBusinessDays.label__">
        <OPTAB_BusinessDays ref="OPTAB_BusinessDays_ref" v-on:new_changes="somethingChanged"/>
      </tab>
      <tab id="tab-customids" name="__MSG_TabCustomIdentities.label__">
        <OPTAB_CustomIds ref="OPTAB_CustomIds_ref" v-on:new_changes="somethingChanged"/>
      </tab>
      <tab id="tab-info" name="__MSG_Info__">
          <OPTAB_Info/>
      </tab>
      <tab id="tab-license" name="__MSG_License__">
        <OPTAB_License/>
      </tab>
  </tabs>
  <OptionDonationFooter :new_changes="new_changes"/>
  </main>
</template>


<script setup>
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import { i18n } from "@statslib/mzts-i18n.js";
import { tsPrefs } from "@statslib/mzts-options.js";
import { tsLogger } from "@statslib/mzts-logger.js";
import OPTAB_Main from '@/components/options_tabs/OPTAB_Main.vue';
import OPTAB_Advanced from '@/components/options_tabs/OPTAB_Advanced.vue';
import OPTAB_BusinessDays from '@/components/options_tabs/OPTAB_BusinessDays.vue';
import OPTAB_CustomIds from '@/components/options_tabs/OPTAB_CustomIds.vue';
import OPTAB_Info from '@/components/options_tabs/OPTAB_Info.vue';
import OPTAB_License from '@/components/options_tabs/OPTAB_License.vue';
import OptionDonationFooter from '@/components/OptionDonationFooter.vue';
import { tsStore } from '@statslib/mzts-store';

let optionsTabs = ref(null);
let OPTAB_Main_ref = ref(null);
let OPTAB_Advanced_ref = ref(null);
let OPTAB_BusinessDays_ref = ref(null);
let OPTAB_CustomIds_ref = ref(null);

let new_changes = ref(false);
let tsLog = null;

onMounted(async () => {
    //do_debug.value = await tsPrefs.getPref("do_debug");
    tsLog = new tsLogger("OptionsView", tsStore.do_debug);
    tsPrefs.logger = tsLog;
    tsPrefs.restoreOptions();
    document.querySelectorAll(".option-input").forEach(element => {
      element.addEventListener("change", tsPrefs.saveOptions);
    });
    await nextTick();
    i18n.updateDocument();
    tsLog.log("onMounted");
  });

onUnmounted(() => {
    document.querySelectorAll('.option-input').forEach(element => {
      element.removeEventListener('change', tsPrefs.saveOptions);
    });
    tsLog.log("onUnmounted");
  });

  function somethingChanged() {
    new_changes.value = true;
  }

</script>


<style scoped>

</style>