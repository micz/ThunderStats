<template>
    <select v-model="current_idn" v-bind="$attrs">
        <option v-for="item in identities_options" v-bind:value="item.id">{{item.text}}</option>
    </select>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { tsLogger } from "@statslib/mzts-logger.js";

const props = defineProps({
  do_debug: {
    type: Boolean,
    default: false
  },
  current_idn: {
    type: String,
    default: 0
  }
});

let identities_options = ref([]);
let current_idn = ref(props.current_idn);

const tsLog = new tsLogger("SelectAccount", props.do_debug);

onMounted(async () => {
  tsLog.log("onMounted");
  identities_options.value.push({ id: 0, text: browser.i18n.getMessage('AllAccounts') });
  let accounts = await browser.accounts.list();
      for (let account of accounts) {
        identities_options.value.push({ id: account.id, text: account.name });
      }
      tsLog.log(JSON.stringify(identities_options.value));
});

const updateCurrentIdn = (new_value) => {
  current_idn.value = new_value;
};

defineExpose({ updateCurrentIdn });
</script>


<style scoped>

</style>