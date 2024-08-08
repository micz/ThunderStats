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
    <div id="miczDonation">
        <div class="intro_change_warn" v-if="new_changes">
            <span v-text="reopenTabDesc"></span> <button v-on:click="reloadThunderStats" class="marginleft10">Reload ThunderStats</button>
        </div>
        <div v-if="!new_changes">
          __MSG_prefsDonation_1__<br/><a href="https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/donate/">__MSG_prefsDonation_2__</a>
        </div>
        <div id="thstats_ver_info">__MSG_Version__: {{ thstats_version }}</div>
    </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue';

let reopenTabDesc = ref('');

const props = defineProps({
    new_changes: {
        type: Boolean,
        default: false
    }
});

let new_changes = computed(() => {
    return props.new_changes
});

const thstats_version = ref("");

onMounted(() => {
    reopenTabDesc.value = browser.i18n.getMessage("ReopenTabDesc");
    const manifest = browser.runtime.getManifest();
    const version = manifest.version;
    thstats_version.value = version;
});

function reloadThunderStats() {
    browser.runtime.sendMessage({command: "reloadThunderStats" });
}
</script>


<style scoped>

</style>
