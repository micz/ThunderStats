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
  