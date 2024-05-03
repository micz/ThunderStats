<template>
    <div id="heading_wrapper">
		  <div id="mzts-idnt_sel">__MSG_ChooseAccount__:&nbsp;
          <SelectAccount id="identities_selector" :do_debug="props.do_debug" v-model="current_idn" ref="SelectAccount_ref"/>
			<button type="button" @click="update()">__MSG_Update__</button>
		  </div>
		<div id="mzts-setup_icon">
			<img src="@/assets/images/mzts-setup.png" alt="__MSG_Setup__" title="__MSG_Setup__" class="tooltip" @click="openOptions()"/>
		</div>
		<div id="mzts-updates">
			<div id="mzts-last_run"></div>
			<div id="mzts-last_msg"></div>
		</div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { tsLogger } from "@statslib/mzts-logger.js";
import { TS_prefs } from "@statslib/mzts-options.js";
import SelectAccount from './SelectAccount.vue';

const emit = defineEmits(['chooseAccount']);

const props = defineProps({
  do_debug: {
    type: Boolean,
    default: false
  }
});

let current_idn = ref(0);
let SelectAccount_ref = ref(null);

const tsLog = new tsLogger("HeadingNAV", props.do_debug);

onMounted(async () => {
  current_idn.value = await TS_prefs.getPref("startup_account");
  tsLog.log("onMounted: " + current_idn.value);
  SelectAccount_ref.value.updateCurrentIdn(current_idn.value);
});

function update(){
  tsLog.log("update: " + current_idn.value);
  emit('chooseAccount', current_idn.value);
}

function openOptions(){
  // check if the tab is already there
    browser.tabs.query({url: browser.runtime.getURL("./index.options.html")}).then((tabs) => {
      if (tabs.length > 0) {
        // if the tab is already there, focus it
        browser.tabs.update(tabs[0].id, {active: true});
      } else {
        // if the tab is not there, create it
        browser.tabs.create({url: browser.runtime.getURL("./index.options.html")});
      }
    })
}

function getCurrentIdn(){
  return current_idn.value;
}

defineExpose({ getCurrentIdn });
</script>


<style scoped>

</style>