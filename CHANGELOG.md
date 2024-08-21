# ![TS] ThunderStats Release Notes



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
       <li>Added an option to display today's time graph lines only up to the current hour [<a href="https://github.com/micz/ThunderStats/issues/302">#302</a>].</li>
       <li>In today's time graph, a vertical line has been added to indicate the current hour [<a href="https://github.com/micz/ThunderStats/issues/79">#79</a>].</li>
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
       <li>The Time Graph is now a line graph [<a href="https://github.com/micz/ThunderStats/issues/198">#198</a>].</li>
       <li>Added info for the last days in the Yesterday Tab [<a href="https://github.com/micz/ThunderStats/issues/276">#276</a>].</li>
       <li>The elaboration time is now shown [<a href="https://github.com/micz/ThunderStats/issues/218">#218</a>].</li>
       <li>The results are displayed as they become available [<a href="https://github.com/micz/ThunderStats/issues/219">#219</a>].</li>
      </ul>

<br><br><br>



_[Go to the release notes files for version 1.x](CHANGELOG_v1.md)_


[TS]: public/images/mzts-icon-32px.png
