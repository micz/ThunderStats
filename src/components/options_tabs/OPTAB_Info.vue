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
    <OptionDonationHeader />
    <div>
      <h1>ThunderStats Release Notes</h1>
      <h3>Version 2.0 - ??/??/2024</h3>
      <ul>
       <li>First release of the new ThunderStats 2.0.</li>
      </ul>
      <p>This is a complete rewrite of the original addon as a MailExtension, using Vue.js.</p>
    </div>
    <div v-if="!show_v1"><button type="button" @click="show_v1 = true">__MSG_ShowRelNotes1x__</button></div>
    <div v-if="show_v1">
<h3 id="version-1-4-5-16-12-2019">Version 1.4.5 - 16/12/2019</h3>
<ul>
<li>Update for 68+ changes</li>
<li>Compatibility 60, 68, 72(basic testing)</li>
<li>Note: Some issues with nbd focus
Possible identities issue
Please report issues!</li>
<li>Use flatpickr to replace date picker
<a href="https://github.com/flatpickr/flatpickr">https://github.com/flatpickr/flatpickr</a></li>
<li>Use listJs to replace Richlistbox
Jonny Strömberg
<a href="https://listjs.com/">https://listjs.com/</a></li>
<li>Create list controller for keyboard/mouse</li>
<li>Make custom identities case insensitive
(no solution yet for main identities)</li>
<li>Update deprecated elements</li>
<li>Add access keys for business days editor</li>
</ul>
<h3 id="version-1-4-4-22-02-2019">Version 1.4.4 - 22/02/2019</h3>
<ul>
<li>German (de) locale updated.</li>
<li>Italian (it) locale updated.</li>
<li>add manifest.json back</li>
<li>Change License, ChangeLog URLs</li>
</ul>
<h3 id="version-1-4-3-16-02-2019">Version 1.4.3 - 16/02/2019</h3>
<ul>
<li>Bump compatibility to TB60.*</li>
<li>Add Escape key warning window close.</li>
<li>German (de) locale updated.</li>
</ul>
<h3 id="version-1-4-2-15-04-2018">Version 1.4.2 - 15/04/2018</h3>
<ul>
<li>Debugger output improved.</li>
<li>Added compatibility with Thunderbird up to ### Version 60.0</li>
</ul>
<h3 id="version-1-4-1-05-02-2018">Version 1.4.1 - 05/02/2018</h3>
<ul>
<li>jQuery library update to ### Version 3.3.1. </li>
</ul>
<h3 id="version-1-4-03-02-2018">Version 1.4 - 03/02/2018</h3>
<ul>
<li>Debugger output improved.</li>
<li>Minor bugs fixed.</li>
<li>Added compatibility with Thunderbird 57.</li>
<li>Moment.js library update to ### Version 2.20.1.</li>
<li>d3.js library updated to ### Version 3.5.17.</li>
</ul>
<h3 id="version-1-3-2-02-01-2017">Version 1.3.2 - 02/01/2017</h3>
<ul>
<li>Debugger output improved.</li>
<li>Minor bugs fixed.</li>
</ul>
<h3 id="version-1-3-1-25-12-2016">Version 1.3.1 - 25/12/2016</h3>
<ul>
<li>Debugger output improved.</li>
<li>Added the &quot;Advanced&quot; tab in the settings window.</li>
<li>France (fr) locale added. Thanks to Goofy (from BabelZilla.org).</li>
</ul>
<h3 id="version-1-3-29-11-2016">Version 1.3 - 29/11/2016</h3>
<ul>
<li>Added an option to always show the account name in the top senders and recipients tables when the mail is associated with a Thunderbird account.</li>
<li>Added a debugger tool to create a report to be sent by email.</li>
</ul>
<h3 id="version-1-2-2-23-12-2015">Version 1.2.2 - 23/12/2015</h3>
<ul>
<li>Inbox Zero Folder Spread Graph label positioning fixed.</li>
<li>Inbox Zero Folder Spread Graph label lines are now colored.</li>
<li>Inbox Zero Folder Spread Graph labels now handles special chars with no errors.</li>
<li>&quot;Custom View&quot; single day query now shows the time graph and the Inbox Zero status for the selected day.</li>
</ul>
<h3 id="version-1-2-1-28-10-2015">Version 1.2.1 - 28/10/2015</h3>
<ul>
<li>Daylight Saving Time bug fixed in CustomView query.</li>
<li>Added the new &quot;Last Year&quot; and &quot;Current Year&quot; bookmarked views.</li>
<li>Added a warning in the CustomView query if the date interval is more than 99 days long.</li>
<li>Added an option to define the max number of senders and recipients to be shown in the &quot;Top&quot; tables.</li>
<li>The toolbar button is now added at first run.</li>
</ul>
<h3 id="version-1-2-10-09-2015">Version 1.2 - 10/09/2015</h3>
<ul>
<li>Added an option to set the Business Days and to show the last business day instead of yesterday.</li>
<li>German (de) locale added. Thanks to Real Raven (from BabelZilla.org).</li>
<li>In the custom query date interval is now possible to get the data considering only the business days.</li>
<li>Fixed a bug in the &quot;Folder Spread Graph&quot; when displaying more folders with the same name.</li>
<li>In the &quot;Folder Spread Graph&quot; Inbox folders have colors in the shades of red.</li>
<li>Open the folder clicking on its name in the &quot;Folder Spread Graph&quot;. There is also an option to choose between opening the folder always in the first tab or in a new tab.</li>
<li>Chinese (Simplified) (zh-CN) locale removed, because it&#39;s no more maintained.</li>
<li>&quot;Custom&quot; tab is now renamed to &quot;Custom View&quot; tab, in the default english locale.</li>
<li>Some graphical improvements.</li>
</ul>
<h3 id="version-1-1-06-08-2015">Version 1.1 - 06/08/2015</h3>
<ul>
<li>New Tab: Custom range date interval. Choose the dates range you want to get the statistics on.</li>
<li>Added max, min, average mails sent and received also in the &quot;Multiple Days&quot; tab.</li>
<li>In the &quot;Multiple Days&quot; tab the total sent and received mails are now shown without the today mails, that are shown separately.</li>
<li>In the &quot;Inbox Zero&quot; folder spread graph the inbox folders have now a label with bold text.</li>
<li>Fixed a bug in max, min, average mails sent and received over a period elaboration.</li>
</ul>
<h3 id="version-1-0-1-22-07-2015">Version 1.0.1 - 22/07/2015</h3>
<ul>
<li>License file added.</li>
<li>In the &quot;Multiple Days&quot; tab the stats of the choosen number of days are printed. Also today is printed in a different color.</li>
</ul>
<h3 id="version-1-0-14-07-2015">Version 1.0 - 14/07/2015</h3>
<ul>
<li>First stable release.</li>
<li>Release notes added in the preference info tab.</li>
<li>Added an option to show the time graphs with progressive data bars.</li>
<li>Time graph labels improved.</li>
<li>Added max, min, average mails sent and received over a period.</li>
<li>&quot;Last 7 Days&quot; tab now made dynamic. Choose the number of days to show from the addon option.</li>
<li>Chinese (Simplified) (zh-CN) locale added, thanks to yfdyh000 (from BabelZilla.org).</li>
</ul>
<h3 id="version-0-5-07-06-2015">Version 0.5 - 07/06/2015</h3>
<ul>
<li>Italian (it) locale added.</li>
<li>Inbox mails counting routine bug fixed.</li>
<li>Today time graph bars improved.</li>
<li>More efficent way to search for inbox mails, searching only in the current account inbox folders. Added an option to activate the old behaviour, searching always in all inbox folders of all accounts.</li>
<li>Now the tabs are updated all at once and not at tab switching. Added an option to switch to the old behaviour, updating a tab when switching to it.</li>
</ul>
<h3 id="version-0-4-31-05-2015">Version 0.4 - 31/05/2015</h3>
<ul>
<li>Inbox Zero Date Spread graph tooltip&#39;s position is now on the left.</li>
<li>Inbox Zero added unread mails count.</li>
<li>Graphical improvements.</li>
<li>Added a new time graph for the today and yesterday mails sent and received.</li>
</ul>
<h3 id="version-0-3-13-05-2015">Version 0.3 - 13/05/2015</h3>
<ul>
<li>Log panel removed. Messages are now printed on the Thunderbird error console.</li>
<li>Added an option to choose the selected startup account.</li>
<li>Added a preference tab to set up custom identities on accounts.</li>
<li>Fixed a bug in labels positioning in Inbox Zero Folder Spread graph.</li>
</ul>
<h3 id="version-0-2-11-04-2015">Version 0.2 - 11/04/2015</h3>
<ul>
<li>Bug fixing.</li>
<li>Minor improvements.</li>
<li>New identities / accounts selector.</li>
<li>Graphs improvements.</li>
<li>Debug options added.</li>
</ul>
<h3 id="version-0-1-21-03-2015">Version 0.1 - 21/03/2015</h3>
<ul>
<li>First experimental release.</li>
</ul>
    </div>
</template>
  
  
  
<script setup>
import { ref } from 'vue'
import OptionDonationHeader from '../OptionDonationHeader.vue';

let show_v1 = ref(false);

</script>
  
  
  
  
<style scoped>

</style>
