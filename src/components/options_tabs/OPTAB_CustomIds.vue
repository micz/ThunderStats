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
<div class="intro_main">
    <b>__MSG_ManageCustomIdentitites__</b><br>
    __MSG_ManageCustomIdentititesDesc_1__<br>
    __MSG_ManageCustomIdentititesDesc_2__
</div>
<table>
    <tr>
        <td colspan="2">
            <b>__MSG_Account__:</b>
            <SelectAccount id="account_selector" v-model="current_account" :hide_AllAccount_option="true" ref="SelectAccount_ref" class="marginleft10" @change="accountChanged"/>
            <br>
            <div class="account_emails" v-text="account_emails"></div>
        </td>
    </tr>
    <tr><td colspan="2">&nbsp;</td></tr>
    <tr>
        <td colspan="2">
            <b>__MSG_CustomIdentititesAccount__</b><br>
            <textarea rows="6" cols="50" v-model="account_custom_ids" id="account_custom_ids"></textarea>
        </td>
    </tr>
    <tr>
        <td style="font-size: small;">
            __MSG_CustomIdentititesAccount.Info__
        </td>
        <td style="text-align:right">
            <button v-on:click="updateCustomIds">__MSG_Update__</button>
        </td>
    </tr>
</table>
<div class="intro_change_warn" v-if="new_changes"><span v-text="reopenTabDesc"></span><button v-on:click="reloadThunderStats" :disabled="current_account != 0" class="marginleft10">Reload ThunderStats</button></div>
</template>
  
  
  
<script setup>
import { ref, onMounted } from 'vue'
import SelectAccount from '../SelectAccount.vue';
import { TS_prefs } from '@statslib/mzts-options';
import { tsLogger } from '@statslib/mzts-logger';
import { tsStore } from '@statslib/mzts-store';
import { thunderStastsCore } from "@statslib/mzts-statscore.js";

let tsLog = null;
let tsCore = null;
let current_account = ref(0);
let SelectAccount_ref = ref(null);
let account_custom_ids = ref("");
let new_changes = ref(false);
let reopenTabDesc = ref('');
let account_emails = ref(browser.i18n.getMessage("Identities") + ": -");

let prefCustomIds = {};

onMounted(async () => {
    tsLog = new tsLogger("OPTAB_CustomIds", tsStore.do_debug);
    TS_prefs.logger = tsLog;
    tsCore = new thunderStastsCore({do_debug: tsStore.do_debug});
    document.getElementById('account_custom_ids').addEventListener('change', somethingChanged);
    reopenTabDesc.value = browser.i18n.getMessage("ReopenTabDesc");
    prefCustomIds = await TS_prefs.getPref("custom_identities");
    tsLog.log("prefCustomIds = " + JSON.stringify(prefCustomIds));
    tsLog.log("onMounted");
  });

function accountChanged(){
    tsLog.log("accountChanged: " + current_account.value);
    loadAccountEmails();
    loadCustomIds();
}

async function loadAccountEmails(){
    account_emails.value = browser.i18n.getMessage("Identities") + ": " + (await tsCore.getAccountEmails(current_account.value)).join(", ");
    tsLog.log("loadAccountEmails => account_emails.value: " + account_emails.value);
}

function loadCustomIds(){
    // console.log(">>>>>>>>>>> current_account: " + current_account.value);
    // console.log(">>>>>>>>>>> prefCustomIds: " + JSON.stringify(prefCustomIds));
    if(prefCustomIds.hasOwnProperty(current_account.value)){
        account_custom_ids.value = prefCustomIds[current_account.value].join("\n");
        tsLog.log("loadCustomIds => account_custom_ids.value: " + account_custom_ids.value);
    } else {
        account_custom_ids.value = "";
    }
    tsLog.log("loadCustomIds done!");
}

function updateCustomIds(){
    let current_custom_ids = account_custom_ids.value.split(/[\n,]+/);
    current_custom_ids = current_custom_ids.map(part => part.trim());
    tsLog.log("current_custom_ids: " + JSON.stringify(current_custom_ids));
    account_custom_ids.value = current_custom_ids.join("\n");
    prefCustomIds[current_account.value] = current_custom_ids;

    TS_prefs.setPref("custom_identities", prefCustomIds);
}

async function somethingChanged() {
    new_changes.value = true;
}

function reloadThunderStats() {
    browser.runtime.sendMessage({command: "reloadThunderStats" });
}

</script>
  
  
  
  
<style scoped>

</style>
