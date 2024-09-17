import './assets/options.css';
import './assets/options-tabs-component.css';

import { createApp } from 'vue';
import {Tabs, Tab} from 'vue3-tabs-component';
import App_Options from './App_Options.vue';
import { tsStore } from '@statslib/mzts-store.js';
import { tsPrefs } from '@statslib/mzts-options';

async function main() {

    tsStore.do_debug = await tsPrefs.getPref("do_debug");
    tsStore.darkmode = undefined;

    createApp(App_Options)
        .component('tabs', Tabs)
        .component('tab', Tab)
        .mount('#app');

}

main();