import './assets/options.css';
import './assets/tabs-component.css';

import { createApp } from 'vue';
import {Tabs, Tab} from 'vue3-tabs-component';
import App_Options from './App_Options.vue';

createApp(App_Options)
    .component('tabs', Tabs)
    .component('tab', Tab)
    .mount('#app');