<template>
  <OptionsView />
</template>


<script setup>
import { onMounted } from 'vue'
import { i18n } from "../statslib/mzts-i18n.js";
import OptionsView from './views/OptionsView.vue';
  
onMounted(async () => {
  i18n.updateDocument();
});
</script>


<style scoped>

</style>
