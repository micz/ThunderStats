<template>
  <div>__MSG_GlobalDescSettingTab__</div>
<div id="miczRelNotes"><a href="/index.release_notes.html">__MSG_prefs_OptionText_release_notes__</a></div>

<label>__MSG_StartupAccount__:
  <SelectAccount v-model="current_idn" id="startup_account" name="startup_account" class="option-input"/>
</label>
<br>
<label>
  <input type="checkbox" id="do_debug" name="do_debug" class="option-input" />
   &nbsp;<span class="dims_label">Debug</span>
</label>
<br>
<label>
  <input type="checkbox" id="_time_graph_progressive" name="_time_graph_progressive" class="option-input" />
   &nbsp;<span class="dims_label">__MSG_TimeGraphProgressive__</span>
</label>
<br>
<label>
  <input type="checkbox" id="inbox0_openFolderInFirstTab" name="inbox0_openFolderInFirstTab" class="option-input" />
   &nbsp;<span class="dims_label">__MSG_folderspreadgraph_openinfirsttab__</span>
</label>
<br><br><br><br>
<h2>__MSG_TabAdvanced.label__</h2>
<p>__MSG_ManyDaysGraph__
  <br>
<label>
  <input type="textbox" id="_many_days" name="_many_days" class="option-input" />
   &nbsp;<span class="dims_label">__MSG_ManyDays__</span>
</label>
</p>
<p>
<label>
  <input type="textbox" id="_involved_num" name="_involved_num" class="option-input" />
   &nbsp;<span class="dims_label">__MSG_InvolvedNum__</span>
</label>
</p>
<br>


<br><br><br><br>
    <div id="miczDescription">
      <h1>__MSG_prefsInfoTitle__</h1>
      <p>__MSG_prefsInfoDesc_1__<br/>
        __MSG_prefsInfoDesc_2__<br/>
        __MSG_prefsInfoDesc_3__</p>
    </div>
    <div id="miczDonation">__MSG_prefsDonation_1__<br/><a href="https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/donate/">__MSG_prefsDonation_2__</a></div>
</template>
    
    
    
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { i18n } from "@statslib/mzts-i18n.js";
import { TS_prefs } from "@statslib/mzts-options.js";
import SelectAccount from '@/components/SelectAccount.vue';

let current_idn = ref(0);

onMounted(() => { 
  TS_prefs.restoreOptions();
  i18n.updateDocument();
  document.querySelectorAll(".option-input").forEach(element => {
    element.addEventListener("change", TS_prefs.saveOptions);
  });
});

onUnmounted(() => {
  document.querySelectorAll('.option-input').forEach(element => {
    element.removeEventListener('change', TS_prefs.saveOptions);
  });
});

</script>
    
    
    
    
<style scoped>
div#miczDescription{
    padding:0px 15px 0px 15px;
    font-size: 13px;
}

div#miczDescription h1{
    font-size: 15px;
}

div#miczDonation{
    width: 100%;
    text-align: center;
    font-size: 14px;
    font-weight: bold;
}

table#miczPrefs {
    font-size: 13px;
    padding: 10px;
    border-spacing: 0px;
    
}

table#miczPrefs td{
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    vertical-align: top;
    padding: 2px;
}

table#miczPrefs tr:first-child td {
    border-top: none;
}
  
table#miczPrefs  tr:last-child td {
    border-bottom: none;
}

div#miczRelNotes{
    position:absolute;
    right: 0px;
    bottom: 2px;
    padding: 2px 5px 0px 0px;
}

div#miczDescription h1{
    text-align: center;
    margin-bottom: 0px;
}

div#miczDescription p{
    text-align: justify;
    margin-top: 0px;
}

input#chatgpt_win_width{
    width: 100px;
}

input#chatgpt_win_height{
    width: 100px;
}

span.dims_label{
    display: inline-block;
}
</style>