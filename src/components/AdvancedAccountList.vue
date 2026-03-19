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
    <div class="checkbox-container">
      <table class="checkbox-table">
        <tr>
          <th style="text-align:left;">__MSG_Account__</th>
          <th>__MSG_IncludeArchive__</th>
          <th>__MSG_FilterDuplicateMessages__</th>
        </tr>
        <tr v-for="account in accounts" :key="account.accountID" class="checkbox-item">
          <td>
            <label :for="account.accountID"><span class="dims_label">{{ account.name }}</span></label>
          </td>
          <td class="td_checkbox">
            <input
              type="checkbox"
              :id="account.id"
              :checked="account.include_archive"
              @change="updateCheckbox(account.id, $event, 'include_archive')"
            />
          </td>
          <td class="td_checkbox">
            <input
              type="checkbox"
              :id="account.id"
              :checked="account.filter_duplicates"
              @change="updateCheckbox(account.id, $event, 'filter_duplicates')"
            />
          </td>
        </tr>
      </table>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  
  // Props
  const props = defineProps({
    accounts: {
      type: Array,
      required: true,
    },
  });

  const emit = defineEmits(['updateAccounts']);
  
  // Local state
  const localAccounts = ref([...props.accounts]);
  
  // Watch for changes in the props.accounts and update localAccounts
  watch(
    () => props.accounts,
    (newAccounts) => {
      localAccounts.value = [...newAccounts];
    }
  );
  
  // Update checkbox state
  const updateCheckbox = (accountID, event, type) => {
    const index = localAccounts.value.findIndex((acc) => acc.id === accountID);
    if (index !== -1) {
      localAccounts.value[index][type] = event.target.checked;
      emit('updateAccounts', localAccounts.value);
    }
  };

 </script>
  
  <style scoped>
  .checkbox-container {
    max-height: 200px; /* Adjust this value to set the number of visible rows */
    overflow-y: auto;
    padding: 10px;
    width: max-content;
  }
  
  .td_checkbox  {
    text-align: center;
  }


  .checkbox-list {
    display: flex;
    flex-direction: column;
  }
  
  .checkbox-item {
    margin-bottom: 5px;
  }
  </style>
  