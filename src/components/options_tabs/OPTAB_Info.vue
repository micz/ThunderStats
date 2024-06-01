<!--
/*
 *  ThunderStats [https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/]
 *  Copyright (C) 2024  Mic (m@micz.it)

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
    <div>
      <h1>ThunderStats Release Notes</h1>
      <h2>Version 2.0 - ??/??/2024</h2>
      <ul>
       <li>First release of the new ThunderStats 2.0.</li>
      </ul>
      <p>This is a complete rewrite of the original addon as a MailExtension, using Vue.js.</p>
    </div>
</template>
  
  
  
<script setup>
import { onMounted } from 'vue'
import { i18n } from "@statslib/mzts-i18n.js";

onMounted(() => { 
  i18n.updateDocument();
});

</script>
  
  
  
  
<style scoped>

</style>
