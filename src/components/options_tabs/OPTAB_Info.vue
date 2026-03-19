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
    <OptionDonationHeader />
    <div>
      <h1>ThunderStats Release Notes</h1>
      <div v-html="changelogV2"></div>
    </div>
    <div v-if="!show_v1"><button type="button" @click="show_v1 = true">__MSG_ShowRelNotes1x__</button></div>
    <div v-if="show_v1" v-html="changelogV1"></div>
</template>
  
  
  
<script setup>
import { ref } from 'vue'
import OptionDonationHeader from '../OptionDonationHeader.vue'
import changelogV2Raw from '../../../CHANGELOG.md?raw'
import changelogV1Raw from '../../../CHANGELOG_v1.md?raw'

let show_v1 = ref(false)

function extractHtmlContent(raw) {
  const firstH3 = raw.indexOf('<h3')
  if (firstH3 === -1) return ''
  const lastUl = raw.lastIndexOf('</ul>')
  if (lastUl === -1) return raw.substring(firstH3)
  return raw.substring(firstH3, lastUl + 5)
}

const changelogV2 = extractHtmlContent(changelogV2Raw)
const changelogV1 = extractHtmlContent(changelogV1Raw)

</script>
  
  
  
  
<style scoped>

</style>
