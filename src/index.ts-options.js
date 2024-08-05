import './assets/options.css';
import './assets/options-tabs-component.css';

import { createApp } from 'vue';
import {Tabs, Tab} from 'vue3-tabs-component';
import App_Options from './App_Options.vue';
import { tsStore } from '@statslib/mzts-store.js';
import { TS_prefs } from '@statslib/mzts-options';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

async function main() {

    tsStore.do_debug = await TS_prefs.getPref("do_debug");

    createApp(App_Options)
        .use(PrimeVue, {
            // Default theme configuration
            theme: {
                preset: Aura,
                options: {
                    prefix: 'p',
                    darkModeSelector: 'system',
                    cssLayer: false
                }
            }
         })
        .component('tabs', Tabs)
        .component('tab', Tab)
        .mount('#app');

}

main();