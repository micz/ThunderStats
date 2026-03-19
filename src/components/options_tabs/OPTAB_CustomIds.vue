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
<div class="intro_main">
    <b>__MSG_ManageCustomIdentitites__</b><br>
    __MSG_ManageCustomIdentititesDesc_1__<br>
    __MSG_ManageCustomIdentititesDesc_2__
</div>
<table>
    <tr>
        <td>
            <b>__MSG_Account__:</b>
            <SelectAccount id="account_selector" v-model="current_account" :hide_AllAccount_option="true" ref="SelectAccount_ref" class="marginleft10" @change="accountChanged"/>
            <br>
            <div class="account_emails" v-text="account_emails"></div>
        </td>
    </tr>
    <tr><td>&nbsp;</td></tr>
    <tr>
        <td>
            <b>__MSG_CustomIdentititesAccount__</b>
            <div class="custom-ids-container">
                <textarea rows="6" cols="50" v-model="account_custom_ids" id="account_custom_ids" :disabled="current_account == 0" :class="{'has-changes': new_custom_ids_changes}" @input="customIdsChanged"></textarea>
                <button v-on:click="updateCustomIds" class="save-btn" :disabled="!new_custom_ids_changes">__MSG_Save__</button>
            </div>
            <div style="font-size: small;">
                __MSG_CustomIdentititesAccount.Info__
            </div>
        </td>
    </tr>
    <tr><td><hr class="hr_light"></td></tr>
    <tr>
        <td>
            <b>__MSG_InternalDomainsAccount__</b>
            <div style="font-size: small; margin-bottom: 5px;">
                __MSG_InternalDomainsAccount.Desc__
            </div>
            <div class="custom-ids-container">
                <textarea rows="6" cols="50" v-model="account_internal_domains" id="account_internal_domains" :disabled="current_account == 0" :class="{'has-changes': new_internal_domains_changes}" @input="internalDomainsChanged"></textarea>
                <button v-on:click="updateInternalDomains" class="save-btn" :disabled="!new_internal_domains_changes">__MSG_Save__</button>
            </div>
            <div style="font-size: small;">
                __MSG_InternalDomainsAccount.Info__
            </div>
        </td>
    </tr>
</table>
</template>
  
  
  
<script setup>
import { ref, onMounted } from 'vue'
import SelectAccount from '../SelectAccount.vue';
import { tsPrefs } from '@statslib/mzts-options';
import { tsLogger } from '@statslib/mzts-logger';
import { tsStore } from '@statslib/mzts-store';
import { thunderStastsCore } from "@statslib/mzts-statscore.js";

const emit = defineEmits(['new_changes']);

let tsLog = null;
let tsCore = null;
let current_account = ref(0);
let SelectAccount_ref = ref(null);
let account_custom_ids = ref("");
let account_internal_domains = ref("");
let new_changes = ref(false);
let new_custom_ids_changes = ref(false);
let new_internal_domains_changes = ref(false);
let account_emails = ref(browser.i18n.getMessage("Identities") + ": -");

let prefCustomIds = {};
let prefInternalDomains = {};

onMounted(async () => {
    tsLog = new tsLogger("OPTAB_CustomIds", tsStore.do_debug);
    tsPrefs.logger = tsLog;
    tsCore = new thunderStastsCore({do_debug: tsStore.do_debug});
    prefCustomIds = await tsPrefs.getPref("custom_identities");
    prefInternalDomains = await tsPrefs.getPref("internal_domains");
    tsLog.log("prefCustomIds = " + JSON.stringify(prefCustomIds));
    tsLog.log("prefInternalDomains = " + JSON.stringify(prefInternalDomains));
    tsLog.log("onMounted");
  });

function accountChanged(){
    tsLog.log("accountChanged: " + current_account.value);
    loadAccountEmails();
    loadCustomIds();
    loadInternalDomains();
}

async function loadAccountEmails(){
    account_emails.value = browser.i18n.getMessage("Identities") + ": " + (await tsCore.getAccountEmails(current_account.value,true)).join(", ");
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
    let current_custom_ids = account_custom_ids.value.split(/[\n,]+/).filter(id => id.trim() !== '');;
    current_custom_ids = current_custom_ids.map(part => part.trim());
    tsLog.log("current_custom_ids: " + JSON.stringify(current_custom_ids));
    account_custom_ids.value = current_custom_ids.join("\n");
    prefCustomIds[current_account.value] = current_custom_ids;
    tsPrefs.setPref("custom_identities", prefCustomIds);
    new_custom_ids_changes.value = false;
    somethingChanged();
}

function customIdsChanged(){
    new_custom_ids_changes.value = true;
}

function loadInternalDomains(){
    if(prefInternalDomains.hasOwnProperty(current_account.value)){
        account_internal_domains.value = prefInternalDomains[current_account.value].join("\n");
        tsLog.log("loadInternalDomains => account_internal_domains.value: " + account_internal_domains.value);
    } else {
        account_internal_domains.value = "";
    }
    tsLog.log("loadInternalDomains done!");
}

function updateInternalDomains(){
    let current_internal_domains = account_internal_domains.value.split(/[\n,]+/).filter(d => d.trim() !== '');
    current_internal_domains = current_internal_domains.map(part => part.trim());
    tsLog.log("current_internal_domains: " + JSON.stringify(current_internal_domains));
    account_internal_domains.value = current_internal_domains.join("\n");
    prefInternalDomains[current_account.value] = current_internal_domains;
    tsPrefs.setPref("internal_domains", prefInternalDomains);
    new_internal_domains_changes.value = false;
    somethingChanged();
}

function internalDomainsChanged(){
    new_internal_domains_changes.value = true;
}

async function somethingChanged() {
    new_changes.value = true;
    emit('new_changes', new_changes.value);
}

</script>


<style scoped>
.has-changes {
    border: 1px solid blue;
}
.custom-ids-container {
    display: flex;
    align-items: flex-end;
    gap: 5px;
}
.save-btn {
    flex-shrink: 0;
}

hr.hr_light{
  color: #fff;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}
</style>
