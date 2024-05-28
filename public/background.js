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

browser.browserAction.onClicked.addListener(() => {
    openTStab();
  });

  function openTStab() {
    // check if the tab is already there
    /*browser.tabs.query({url: browser.runtime.getURL("./index.thunderstats.html")}).then((tabs) => {
      if (tabs.length > 0) {
        // if the tab is already there, focus it
        browser.tabs.update(tabs[0].id, {active: true});
      } else {
        // if the tab is not there, create it
        browser.tabs.create({url: browser.runtime.getURL("./index.thunderstats.html")});
      }
    })*/
    browser.spacesToolbar.clickButton('thunderstats');
 }


if (browser.spacesToolbar) {
  browser.spacesToolbar.addButton(
    'thunderstats',
    {
      badgeBackgroundColor: '#e64db9',
      badgeText: '',
      defaultIcons: 'images/mzts-icon-16px.png',
      title: 'ThunderStats',
      url: './index.thunderstats.html'
    }
  );
}