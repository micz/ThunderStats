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
      <h3>Version 2.3.7 - 24/03/2025</h3>
      <ul>
        <li>Libraries updated.</li>
        <li>Translation improved. Thanks to <a href="https://hosted.weblate.org/engage/thunderstats/">Weblate</a>. Help <a href="https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/translate/">translate</a> ThunderStats in your language!</li>
      </ul>
      <h3>Version 2.3.6 - 18/02/2025</h3>
      <ul>
        <li>Toolbar button improved. Removed the need for the "Monitor extension usage and manage themes" permission.</li>
      </ul>
      <h3>Version 2.3.5 - 14/02/2025</h3>
      <ul>
        <li>Toolbar button improved.</li>
      </ul>
      <h3>Version 2.3.4 - 11/02/2025</h3>
      <ul>
        <li>The toolbar button is now working again.</li>
      </ul>
      <h3>Version 2.3.3 - 01/02/2025</h3>
      <ul>
        <li>Spaces button fixed for Thunderbird 135.* [<a href="https://github.com/micz/ThunderStats/issues/399">#399</a>].</li>
      </ul>
      <h3>Version 2.3.2 - 29/01/2025</h3>
      <ul>
        <li>The background color of some advanced filter fields has been fixed.</li>
        <li>The graphic style of some advanced filter fields has been improved.</li>
        <li>Various libraries updated.</li>
        <li>Implemented some minor fixes.</li>
      </ul>
      <h3>Version 2.3.1 - 25/11/2024</h3>
      <ul>
        <li>In the Custom View now it's also possible to manually write the date in the datepicker. The two dates must be separated by "<i>space hyphen space</i>", " - ".</li>
        <li>Now it's possible to extract all the new charts data (tags, folder, domains) and all the Custom View periods (daily, weekly, monthly, yearly mails) [<a href="https://github.com/micz/ThunderStats/issues/394">#394</a>].</li>
        <li>Inbox Zero Date Chart tooltip is now visible again [<a href="https://github.com/micz/ThunderStats/issues/392">#392</a>].</li>
        <li>Custom View sent and received charts day view has now a max width of 30.000 pixels, so it's visible also when querying hundreds of days [<a href="https://github.com/micz/ThunderStats/issues/390">#390</a>].</li>
        <li>Custom View export menu is now correctly updated [<a href="https://github.com/micz/ThunderStats/issues/393">#393</a>].</li>
        <li>Preventing concurrent data querying in the Custom View under some circumstances.</li>
        <li>Some buttons graphic and positioning improved.</li>
      </ul>
      <h3>Version 2.3.0 - 17/11/2024</h3>
      <ul>
        <li>It's now possible to search for read/unread and starred/unsterred in the Custom View [<a href="https://github.com/micz/ThunderStats/issues/158">#158</a>].</li>
        <li>It's now possible to search for a keyword in the subject in the Custom View [<a href="https://github.com/micz/ThunderStats/issues/354">#354</a>].</li>
        <li>Added the sent / received domains chart [<a href="https://github.com/micz/ThunderStats/issues/380">#380</a>].</li>
        <li>Added the sent / received folders chart [<a href="https://github.com/micz/ThunderStats/issues/357">#357</a>].</li>
        <li>Added the sent / received tags chart [<a href="https://github.com/micz/ThunderStats/issues/359">#359</a>].</li>
        <li>In the Custom View sent and received charts, the user can now select the chart scale (day, week, month, or year) [<a href="https://github.com/micz/ThunderStats/issues/362">#362</a>].</li>
        <li>Added a details view of the Inbox Zero Dates chart [<a href="https://github.com/micz/ThunderStats/issues/350">#350</a>]</li>
        <li>The advanced filters panel opening and closing spacing is now fixed [<a href="https://github.com/micz/ThunderStats/issues/386">#386</a>].</li>
        <li>Added an option to do not load data in the Custom View at startup.</li>
        <li>In Thunderbird 128 is now possible again to choose to open a folder from the Inbox Zero Folder Chart in a new tab or not.</li>
      </ul>
      <h3>Version 2.2.3 - 05/10/2024</h3>
      <ul>
        <li>Fixed opening the folder from the Inbox Zero Folder Chart [<a href="https://github.com/micz/ThunderStats/issues/381">#381</a>].</li>
        <li>Improved the label positioning in the Inbox Zero Folders graphs [<a href="https://github.com/micz/ThunderStats/issues/383">#383</a>].</li>
        <li>Better time chart legend positioning in small windows [<a href="https://github.com/micz/ThunderStats/issues/382">#382</a>].</li>
      </ul>
      <h3>Version 2.2.2 - 24/09/2024</h3>
      <ul>
        <li>In the Time Chart correctly displaying "Last Business Day" in legend and tooltip when needed.</li>
        <li>The minimum aggregate statistics were always zero. The problem has now been fixed.</li>
        <li>Javascript libraries updated.</li>
      </ul>
      <h3>Version 2.2.1 - 19/09/2024</h3>
      <ul>
        <li>ThunderStats Version 2.* is now compatible also with Thunderbird version 115.*.</li>
        <li>The option "When selecting a custom date range view, update the statistics immediately" is now true by default.</li>
        <li>The toolbar button is now always visible.</li>
        <li>Folders select dropdown text color fixed.</li>
        <li>Weekdays chart fixed [<a href="https://github.com/micz/ThunderStats/issues/374">#374</a>].</li>
        <li>Improved the positioning of the labels on the Inbox Zero Folders charts [<a href="https://github.com/micz/ThunderStats/issues/370">#370</a>, <a href="https://github.com/micz/ThunderStats/issues/373">#373</a>].</li>
        <li>In the advanced filters panel is now possible to check the "include subolders" checkbox clicking on its label [<a href="https://github.com/micz/ThunderStats/issues/371">#371</a>].</li>
        <li>Inbox percentage loading indicator timing fixed [<a href="https://github.com/micz/ThunderStats/issues/376">#376</a>].</li>
        <li>Fixed a label error in the weekdays chart, which misordered the days relative to the number of emails.</li>
        <li>Time chart tooltip width fixed even with large numbers.</li>
        <li>The "Current week", "Last week" and "Two last weeks" bookmarks are now considering the start week day option.</li>
        <li>Minor graphics fixes.</li>
      </ul>
      <h3>Version 2.2.0 - 11/09/2024</h3>
      <ul>
        <li>When executing a custom query for a single day, now is used the single day view [<a href="https://github.com/micz/ThunderStats/issues/315">#315</a>].</li>
        <li>The Inbox Zero Folders Chart is no longer partially hidden under the bottom border in certain circumstances.</li>
        <li>The labels on the Inbox Zero Folders charts no longer overlap [<a href="https://github.com/micz/ThunderStats/issues/341">#341</a>].</li>
        <li>Added the precentage of mails moved from inbox in all the single day views [<a href="https://github.com/micz/ThunderStats/issues/343">#343</a>].</li>
        <li>Fixed a concurrency bug in displaying the elapsed time. It now always shows the maximum value.</li>
        <li>Added a warning if querying too much days in the Custom View. Added an option in the advanced tab to choose the maximum number of days to query without a warning. It's also possible to disable the warning completely [<a href="https://github.com/micz/ThunderStats/issues/281">#281</a>].</li>
        <li>Added in the Custom View an Advanced Filters panel. Click on the Advanced Filters icon to show it [<a href="https://github.com/micz/ThunderStats/issues/347">#347</a>].</li>
        <li>In the Custom View is now possible to filter by one or more folders [<a href="https://github.com/micz/ThunderStats/issues/75">#75</a>, <a href="https://github.com/micz/ThunderStats/issues/125">#125</a>].</li>
        <li>A chart showing the cumulative volumes of sent and received emails, grouped by hour, has been added to the Custom View and Many Days view [<a href="https://github.com/micz/ThunderStats/issues/244">#244</a>].</li>
        <li>A chart showing the cumulative volumes of sent and received emails, grouped by weekday, has been added to the Custom View and Many Days view [<a href="https://github.com/micz/ThunderStats/issues/245">#245</a>].</li>
      </ul>
      <h3>Version 2.1.0 - 20/08/2024</h3>
      <ul>
       <li>It's now possible to define non-business days, allowing them to be excluded from aggregated statistics [<a href="https://github.com/micz/ThunderStats/issues/206">#206</a>].</li>
       <li>Implemented the data export in CSV format [<a href="https://github.com/micz/ThunderStats/issues/287">#287</a>].</li>
       <ul>
        <li>Added a menu in every data tab to export data [<a href="https://github.com/micz/ThunderStats/issues/333">#333</a>].</li>
        <li>Added the correspondents data extract.</li>
        <li>Added the daily emails data extract in the 7 Days and Custom Query tabs.</li>
        <li>Added an hourly email extract divider in the Today and Yesterday tabs.</li>
       </ul>
       <li>Added the total number of mails in aggregate stats in Today Tab, Yesterday Tab, 7 Days Tab and Custom View Tabs. This total also considers business days only if the corresponding option is active [<a href="https://github.com/micz/ThunderStats/issues/323">#323</a>].</li>
       <li>Added an option to display Today Tab's Time Chart lines only up to the current hour [<a href="https://github.com/micz/ThunderStats/issues/302">#302</a>].</li>
       <li>In Today Tab's Time Chart, a vertical line has been added to indicate the current hour [<a href="https://github.com/micz/ThunderStats/issues/79">#79</a>].</li>
       <li>Some options have been moved from the options page "Advanced" tab to the "General" tab.</li>
       <li>Displaying the last execution time for each tab [<a href="https://github.com/micz/ThunderStats/issues/314">#314</a>].</li>
       <li>Changed the color of the 'Today' bar in the 7-Days Tab Chart [<a href="https://github.com/micz/ThunderStats/issues/326">#326</a>].</li>
       <li>If the chosen account has been changed, switching to another tab reloads the data even if the "Reload data when changing tab" option is set to false [<a href="https://github.com/micz/ThunderStats/issues/327">#327</a>].</li>
       <li>Fixed the correct default duplicate messages filtering flag for Gmail account.</li>
      </ul>
      <h3>Version 2.0.3 - 08/08/2024</h3>
      <ul>
       <li>Using the correct locale for the datepicker [<a href="https://github.com/micz/ThunderStats/issues/295">#295</a>].</li>
       <li>Small graphic fixes [<a href="https://github.com/micz/ThunderStats/issues/303">#303</a>, <a href="https://github.com/micz/ThunderStats/issues/305">#305</a>].</li>
       <li>Correctly counting received messages for the Inbox Zero Folder chart [<a href="https://github.com/micz/ThunderStats/issues/298">#298</a>].</li>
       <li>Fixed statistics elaboration in sent folders under some circumstances.</li>
       <li>Correctly using the option to reload data when changing tab. It was always reloading data [<a href="https://github.com/micz/ThunderStats/issues/310">#310</a>].</li>
      </ul>
      <h3>Version 2.0.2 - 03/08/2024</h3>
      <ul>
       <li>Fixed a bug in showing the "All Accounts" option in the account selector.</li>
       <li>Fixed a bug that prevented to unset the "Filter duplicate messages" option in the account advanced settings.</li>
      </ul>
      <h3>Version 2.0.1 - 01/08/2024</h3>
      <ul>
       <li>Fixed a bug in getting the advanced account settings.</li>
      </ul>
      <h3>Version 2.0.0 - 18/07/2024</h3>
      <ul>
       <li>This is a complete rewrite of the original addon as a MailExtension, using Vue.js.</li>
       <li>Added dark mode [<a href="https://github.com/micz/ThunderStats/issues/197">#197</a>].</li>
       <li>It's now possibile to define a locale for the datepicker different from the default one [<a href="https://github.com/micz/ThunderStats/issues/238">#238</a>].</li>
       <li>Added an option to choose to remember last opened tab [<a href="https://github.com/micz/ThunderStats/issues/232">#232</a>].</li>
       <li>The Time Chart is now a line chart [<a href="https://github.com/micz/ThunderStats/issues/198">#198</a>].</li>
       <li>Added info for the last days in the Yesterday Tab [<a href="https://github.com/micz/ThunderStats/issues/276">#276</a>].</li>
       <li>The elaboration time is now shown [<a href="https://github.com/micz/ThunderStats/issues/218">#218</a>].</li>
       <li>The results are displayed as they become available [<a href="https://github.com/micz/ThunderStats/issues/219">#219</a>].</li>
      </ul>
    </div>
    <div v-if="!show_v1"><button type="button" @click="show_v1 = true">__MSG_ShowRelNotes1x__</button></div>
    <div v-if="show_v1">
      <h3>Version 1.9.1 - 20/08/2024</h3>
      <ul>
        <li>Minor bug fixes.</li>
      </ul>
<h3>Version 1.9.0 - 09/08/2024</h3>
      <ul>
       <li><b><i>This version 1.9 has been backported from ThunderStats version 2.0 to Thunderbird 115.</i></b></li>
       <li>This is a complete rewrite of the original addon as a MailExtension, using Vue.js.</li>
       <li>Added dark mode [<a href="https://github.com/micz/ThunderStats/issues/197">#197</a>].</li>
       <li>It's now possibile to define a locale for the datepicker different from the default one [<a href="https://github.com/micz/ThunderStats/issues/238">#238</a>].</li>
       <li>Added an option to choose to remember last opened tab [<a href="https://github.com/micz/ThunderStats/issues/232">#232</a>].</li>
       <li>The Time Chart is now a line chart [<a href="https://github.com/micz/ThunderStats/issues/198">#198</a>].</li>
       <li>Added info for the last days in the Yesterday Tab [<a href="https://github.com/micz/ThunderStats/issues/276">#276</a>].</li>
       <li>The elaboration time is now shown [<a href="https://github.com/micz/ThunderStats/issues/218">#218</a>].</li>
       <li>The results are displayed as they become available [<a href="https://github.com/micz/ThunderStats/issues/219">#219</a>].</li>
      </ul>
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
