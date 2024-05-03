<template>
  <ThunderStatsView />
</template>


<script setup>
import { onMounted } from 'vue'
import { i18n } from "../statslib/mzts-i18n.js";
import ThunderStatsView from './views/ThunderStatsView.vue';
  
onMounted(async () => {
  i18n.updateDocument();
});
</script>


<style scoped>

</style>
