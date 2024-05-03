<template>
    <div id="miczBackPrefs"><a href="/index.options.html">__MSG_backToOptionsText__</a></div>
    <div id="miczRelNotes"><h1>ThunderStats Release Notes</h1>
      <h2>Version 2.0 - ??/??/2024</h2>
      <ul>
       <li>First release of the new ThunderStats 2.0.</li>
      </ul>
      <p>This is a complete rewrite of the original addon as a MailExtension, using Vue.js.</p>
    </div>
</template>
  
  
  
<script setup>
import { onMounted } from 'vue'
import { i18n } from "../../statslib/mzts-i18n.js";

onMounted(() => { 
  i18n.updateDocument();
});

</script>
  
  
  
  
<style scoped>

</style>
