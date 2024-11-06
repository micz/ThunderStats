import './assets/main.css'
import './assets/squared.css'

import { createApp } from 'vue'
import {Tabs, Tab} from 'vue3-tabs-component';
import App_ThunderStats from './App_ThunderStats.vue'
import { tsStore } from '@statslib/mzts-store.js';
import { tsPrefs } from '@statslib/mzts-options';
import { tsUtils } from '@statslib/mzts-utils';

async function main() {

    tsStore.do_debug = await tsPrefs.getPref("do_debug");
    tsStore.isTB128plus = await tsUtils.isThunderbird128OrGreater();
    tsStore.darkmode = undefined;
    tsStore.currentTab = "tab-today";

    createApp(App_ThunderStats)
        .component('tabs', Tabs)
        .component('tab', Tab)
        .mount('#app');

}

main();