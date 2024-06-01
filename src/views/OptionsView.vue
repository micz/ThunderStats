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
    <tabs :options="{ defaultTabHash: 'tab-main' }"  cache-lifetime="0"  @changed="tabChanged" ref="optionsTabs">
      <tab id="tab-main" name="__MSG_TabSettings.label__">
          <OPTAB_Main :do_debug="do_debug" ref="OPTAB_Main_ref"/>
      </tab>
      <tab id="tab-advanced" name="__MSG_TabAdvanced.label__">
        ADVANCED
      </tab>
      <tab id="tab-customids" name="__MSG_TabCustomIdentities.label__">
        CUSTOM IDENTITIES
      </tab>
      <tab id="tab-info" name="__MSG_Info__">
          <OPTAB_Info :do_debug="do_debug" ref="OPTAB_Info_ref"/>
      </tab>
      <tab id="tab-license" name="__MSG_License__">
          LICENSE
      </tab>
  </tabs>
  </main>
</template>


<script setup>
import { onMounted, ref } from 'vue'
import { i18n } from "@statslib/mzts-i18n.js";
import { TS_prefs } from "@statslib/mzts-options.js";
import { tsLogger } from "@statslib/mzts-logger.js";
import OPTAB_Main from '@/components/options_tabs/OPTAB_Main.vue';
//import OPTAB_Advanced from '@/components/options_tabs/OPTAB_Advanced.vue';
//import OPTAB_CustomIds from '@/components/options_tabs/OPTAB_CustomIds.vue';
import OPTAB_Info from '@/components/options_tabs/OPTAB_Info.vue';
//import OPTAB_License from '@/components/options_tabs/OPTAB_License.vue';

let optionsTabs = ref(null);
let OPTAB_Main_ref = ref(null);
//let OPTAB_Advanced_ref = ref(null);
//let OPTAB_CustomIds_ref = ref(null);
let OPTAB_Info_ref = ref(null);

let do_debug = ref(false);
let tsLog = null;
let tsCore = null

onMounted(async () => {
    do_debug.value = await TS_prefs.getPref("do_debug");
    tsLog = new tsLogger("OptionsView", do_debug.value);
    i18n.updateDocument();
  });

</script>


<style scoped>

</style>