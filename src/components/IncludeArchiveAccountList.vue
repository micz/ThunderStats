<template>
    <div class="checkbox-container">
      <table class="checkbox-table">
        <tr>
          <th style="text-align:left;">__MSG_Account__</th>
          <th>__MSG_IncludeArchive__</th>
        </tr>
        <tr v-for="account in accounts" :key="account.accountID" class="checkbox-item">
          <td>
            <label :for="account.accountID">{{ account.name }}</label>
          </td>
          <td class="td_checkbox">
            <input
              type="checkbox"
              :id="account.id"
              :checked="account.include_archive"
              @change="updateCheckbox(account.id, $event)"
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

  const emit = defineEmits(['updateIncludeArchive']);
  
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
  const updateCheckbox = (accountID, event) => {
    const index = localAccounts.value.findIndex((acc) => acc.id === accountID);
    if (index !== -1) {
      localAccounts.value[index].include_archive = event.target.checked;
      emit('updateIncludeArchive', localAccounts.value);
      console.log(">>>>>>>>>>>>> updateCheckbox => localAccounts.value[index].include_archive: " + JSON.stringify(localAccounts.value[index].include_archive));
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
  