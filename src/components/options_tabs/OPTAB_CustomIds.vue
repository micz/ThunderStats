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
    <h1 class="opt-section-title">{{ t('TabCustomIdentities.label') }}</h1>
    <div class="opt-section-desc">{{ t('Opt_IdentitiesDesc') }}</div>
  </div>

  <div class="opt-acct-switch" v-if="accounts.length > 0">
    <span class="opt-acct-label">{{ t('Account') }}</span>
    <div class="opt-pills" role="group" :aria-label="t('Account')">
      <button type="button" v-for="account in accounts" :key="account.id" :class="{ 'is-active': account.id == current_account }" :aria-pressed="account.id == current_account ? 'true' : 'false'" @click="selectAccount(account.id)">{{ account.name }}</button>
    </div>
  </div>

  <section class="opt-card opt-card-padded">
    <div class="opt-card-head">
      <div class="opt-card-title">{{ t('Identities') }}</div>
      <div class="opt-card-desc">{{ t('Opt_AccountIdentitiesDesc') }}</div>
    </div>
    <div class="opt-id-list" v-if="account_emails.length > 0">
      <span class="opt-id-chip" v-for="email in account_emails" :key="email">{{ email }}</span>
    </div>
    <div class="opt-id-empty" v-else>{{ t('Opt_NoIdentities') }}</div>
  </section>

  <section class="opt-card opt-card-padded">
    <div class="opt-card-head">
      <div class="opt-card-title">{{ t('CustomIdentititesAccount') }}</div>
      <div class="opt-card-desc">{{ t('ManageCustomIdentititesDesc_1') }}</div>
    </div>
    <OptTagInput :key="'ids-' + current_account" :modelValue="custom_ids" variant="accent" :placeholder="t('Opt_AddAddress')" :validate="isValidIdentity" :invalidMessage="t('Opt_InvalidAddress')" :disabled="!current_account" @update:modelValue="saveList('custom_identities', $event)"/>
    <div class="opt-id-hint"><template v-for="(part, idx) in withCode('CustomIdentititesAccount.Info', ['*@example.com', '@example.com'])" :key="idx"><code v-if="part.code">{{ part.text }}</code><template v-else>{{ part.text }}</template></template></div>
  </section>

  <section class="opt-card opt-card-padded">
    <div class="opt-card-head">
      <div class="opt-card-title">{{ t('InternalDomainsAccount') }}</div>
      <div class="opt-card-desc">{{ t('InternalDomainsAccount.Desc') }}</div>
    </div>
    <OptTagInput :key="'dom-' + current_account" :modelValue="internal_domains" variant="good" :placeholder="t('Opt_AddDomain')" :validate="isValidDomain" :invalidMessage="t('Opt_InvalidDomain')" :disabled="!current_account" @update:modelValue="saveList('internal_domains', $event)"/>
    <div class="opt-id-hint"><template v-for="(part, idx) in withCode('InternalDomainsAccount.Info', ['*.example.com'])" :key="idx"><code v-if="part.code">{{ part.text }}</code><template v-else>{{ part.text }}</template></template></div>
  </section>
</template>



<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { tsLogger } from '@statslib/mzts-logger';
import { tsStore } from '@statslib/mzts-store';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import OptTagInput from '@/components/options/OptTagInput.vue';

const t = (key, subs) => browser.i18n.getMessage(key, subs);

const prefs = inject('optPrefs');

let tsLog = null;
let accounts = ref([]);
let current_account = ref(null);
let account_emails = ref([]);

let custom_ids = computed(() => listOf('custom_identities'));
let internal_domains = computed(() => listOf('internal_domains'));

onMounted(async () => {
  tsLog = new tsLogger("OPTAB_CustomIds", tsStore.do_debug);
  accounts.value = await tsCoreUtils.getAccountsList(true);
  if (accounts.value.length > 0) selectAccount(accounts.value[0].id);
  tsLog.log("onMounted");
});

async function selectAccount(account_id) {
  current_account.value = account_id;
  account_emails.value = [];
  let emails = await tsCoreUtils.getAccountEmails(account_id, true);
  if (current_account.value === account_id) account_emails.value = emails;
}

function listOf(pref) {
  let lists = prefs.values[pref] || {};
  return Array.isArray(lists[current_account.value]) ? lists[current_account.value] : [];
}

function saveList(pref, list) {
  let lists = { ...(prefs.values[pref] || {}) };
  lists[current_account.value] = list.map(v => v.toLowerCase());
  tsLog.log(() => pref + ": " + JSON.stringify(lists));
  prefs.set(pref, lists);
}

// Splits a message whose $1, $2... are code samples into text and code parts
function withCode(key, codes) {
  let message = t(key, codes.map((_, idx) => '\u0001' + idx + '\u0001'));
  return message.split('\u0001').map((text, idx) => (idx % 2 == 1) ? { code: true, text: codes[Number(text)] } : { code: false, text: text }).filter(part => part.text !== '');
}

// an address, a pattern with * or a whole domain (@example.com)
function isValidIdentity(value) {
  return /^[^\s@]*@[^\s@]+$/.test(value);
}

// a hostname, optionally with * wildcards (*.example.com)
function isValidDomain(value) {
  return /^[a-z0-9*]([a-z0-9*.-]*[a-z0-9*])?$/i.test(value) && /[.*]/.test(value);
}
</script>


<style scoped>
.opt-acct-switch {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.opt-acct-label {
  font-size: 13px;
  color: var(--text2);
}

.opt-id-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.opt-id-chip {
  padding: 5px 11px;
  border-radius: 14px;
  background: var(--surface2);
  border: 1px solid var(--line);
  font-size: 13px;
  color: var(--text2);
}

.opt-id-empty {
  font-size: 13px;
  color: var(--text3);
}

.opt-id-hint {
  font-size: 12.5px;
  color: var(--text3);
}

.opt-id-hint code {
  font-family: ui-monospace, "Cascadia Mono", monospace;
  font-size: .95em;
  color: var(--text2);
}
</style>
