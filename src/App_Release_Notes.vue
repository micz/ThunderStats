<template>
  <ReleaseNotesView />
</template>


<script setup>
import { onMounted } from 'vue'
import { i18n } from "../statslib/mzts-i18n.js";
import ReleaseNotesView from './views/ReleaseNotesView.vue';
  
onMounted(async () => {
  i18n.updateDocument();
});
</script>


<style scoped>

</style>
