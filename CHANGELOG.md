# ![TS] ThunderStats Release Notes




<h3>Version 2.3.8 - ??/??/2025</h3>
<ul>
      <li>Libraries updated.</li>
      <li>Dutch translation added, thanks to <a href="https://github.com/Fjoerfoks">Fjoerfoks</a>.</li>
      <li>Fix: Advanced filter fields colors fixed in Light Theme [<a href="https://github.com/micz/ThunderStats/issues/411">#411</a>].</li>
</ul>
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
        <li>Toolbar button is now working again.</li>
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

<br><br><br>



_[Go to the release notes files for version 1.x](CHANGELOG_v1.md)_


[TS]: public/images/mzts-icon-32px.png
