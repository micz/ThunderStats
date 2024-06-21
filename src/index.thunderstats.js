import './assets/main.css'
import './assets/squared.css'

import { createApp } from 'vue'
import {Tabs, Tab} from 'vue3-tabs-component';
import App_ThunderStats from './App_ThunderStats.vue'
import { tsStore } from '@statslib/mzts-store.js';
import { TS_prefs } from '@statslib/mzts-options';

async function main() {

    tsStore.do_debug = await TS_prefs.getPref("do_debug");
    tsStore.darkmode = undefined;

    createApp(App_ThunderStats)
        .component('tabs', Tabs)
        .component('tab', Tab)
        .mount('#app');

}

main();