# ![TS] ThunderStats Release Notes

### Version 1.4.5 - 16/12/2019
- Update for 68+ changes
- Compatibility 60, 68, 72(basic testing)
- Note: Some issues with nbd focus
  Possible identities issue
  Please report issues!
- Use flatpickr to replace date picker
  https://github.com/flatpickr/flatpickr
- Use listJs to replace Richlistbox
  Jonny Strömberg
  https://listjs.com/
- Create list controller for keyboard/mouse
- Make custom identities case insensitive
  (no solution yet for main identities)
- Update deprecated elements
- Add access keys for business days editor


### Version 1.4.4 - 22/02/2019 
- German (de) locale updated.
- Italian (it) locale updated.
- add manifest.json back
- Change License, ChangeLog URLs


### Version 1.4.3 - 16/02/2019 
- Bump compatibility to TB60.*
- Add Escape key warning window close.
- German (de) locale updated.


### Version 1.4.2 - 15/04/2018
- Debugger output improved.
- Added compatibility with Thunderbird up to ### Version 60.0


### Version 1.4.1 - 05/02/2018
- jQuery library update to ### Version 3.3.1. 


### Version 1.4 - 03/02/2018
- Debugger output improved.
- Minor bugs fixed.
- Added compatibility with Thunderbird 57.
- Moment.js library update to ### Version 2.20.1.
- d3.js library updated to ### Version 3.5.17.


### Version 1.3.2 - 02/01/2017
- Debugger output improved.
- Minor bugs fixed.


### Version 1.3.1 - 25/12/2016
- Debugger output improved.
- Added the "Advanced" tab in the settings window.
- France (fr) locale added. Thanks to Goofy (from BabelZilla.org).


### Version 1.3 - 29/11/2016
- Added an option to always show the account name in the top senders and recipients tables when the mail is associated with a Thunderbird account.
- Added a debugger tool to create a report to be sent by email.


### Version 1.2.2 - 23/12/2015
- Inbox Zero Folder Spread Graph label positioning fixed.
- Inbox Zero Folder Spread Graph label lines are now colored.
- Inbox Zero Folder Spread Graph labels now handles special chars with no errors.
- "Custom View" single day query now shows the time graph and the Inbox Zero status for the selected day.


### Version 1.2.1 - 28/10/2015
- Daylight Saving Time bug fixed in CustomView query.
- Added the new "Last Year" and "Current Year" bookmarked views.
- Added a warning in the CustomView query if the date interval is more than 99 days long.
- Added an option to define the max number of senders and recipients to be shown in the "Top" tables.
- The toolbar button is now added at first run.


### Version 1.2 - 10/09/2015
- Added an option to set the Business Days and to show the last business day instead of yesterday.
- German (de) locale added. Thanks to Real Raven (from BabelZilla.org).
- In the custom query date interval is now possible to get the data considering only the business days.
- Fixed a bug in the "Folder Spread Graph" when displaying more folders with the same name.
- In the "Folder Spread Graph" Inbox folders have colors in the shades of red.
- Open the folder clicking on its name in the "Folder Spread Graph". There is also an option to choose between opening the folder always in the first tab or in a new tab.
- Chinese (Simplified) (zh-CN) locale removed, because it's no more maintained.
- "Custom" tab is now renamed to "Custom View" tab, in the default english locale.
- Some graphical improvements.


### Version 1.1 - 06/08/2015
- New Tab: Custom range date interval. Choose the dates range you want to get the statistics on.
- Added max, min, average mails sent and received also in the "Multiple Days" tab.
- In the "Multiple Days" tab the total sent and received mails are now shown without the today mails, that are shown separately.
- In the "Inbox Zero" folder spread graph the inbox folders have now a label with bold text.
- Fixed a bug in max, min, average mails sent and received over a period elaboration.


### Version 1.0.1 - 22/07/2015
- License file added.
- In the "Multiple Days" tab the stats of the choosen number of days are printed. Also today is printed in a different color.


### Version 1.0 - 14/07/2015
- First stable release.
- Release notes added in the preference info tab.
- Added an option to show the time graphs with progressive data bars.
- Time graph labels improved.
- Added max, min, average mails sent and received over a period.
- "Last 7 Days" tab now made dynamic. Choose the number of days to show from the addon option.
- Chinese (Simplified) (zh-CN) locale added, thanks to yfdyh000 (from BabelZilla.org).


### Version 0.5 - 07/06/2015
- Italian (it) locale added.
- Inbox mails counting routine bug fixed.
- Today time graph bars improved.
- More efficent way to search for inbox mails, searching only in the current account inbox folders. Added an option to activate the old behaviour, searching always in all inbox folders of all accounts.
- Now the tabs are updated all at once and not at tab switching. Added an option to switch to the old behaviour, updating a tab when switching to it.


### Version 0.4 - 31/05/2015
- Inbox Zero Date Spread graph tooltip's position is now on the left.
- Inbox Zero added unread mails count.
- Graphical improvements.
- Added a new time graph for the today and yesterday mails sent and received.


### Version 0.3 - 13/05/2015
- Log panel removed. Messages are now printed on the Thunderbird error console.
- Added an option to choose the selected startup account.
- Added a preference tab to set up custom identities on accounts.
- Fixed a bug in labels positioning in Inbox Zero Folder Spread graph.


### Version 0.2 - 11/04/2015
- Bug fixing.
- Minor improvements.
- New identities / accounts selector.
- Graphs improvements.
- Debug options added.


### Version 0.1 - 21/03/2015
- First experimental release.


[TS]: rep-resources/images/mzts-icon.png 