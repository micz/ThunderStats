import './assets/options.css';
import './assets/tabs-component.css';

import { createApp } from 'vue';
import {Tabs, Tab} from 'vue3-tabs-component';
import App_Options from './App_Options.vue';
import { tsStore } from '@statslib/mzts-store.js';
import { TS_prefs } from '@statslib/mzts-options';

async function main() {

    tsStore.do_debug = await TS_prefs.getPref("do_debug");

    createApp(App_Options)
        .component('tabs', Tabs)
        .component('tab', Tab)
        .mount('#app');

}

main();