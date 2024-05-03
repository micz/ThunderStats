import './assets/main.css'
import './assets/squared.css'

import { createApp } from 'vue'
import {Tabs, Tab} from 'vue3-tabs-component';
import App_ThunderStats from './App_ThunderStats.vue'

createApp(App_ThunderStats)
    .component('tabs', Tabs)
    .component('tab', Tab)
    .mount('#app');