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

await messenger.spaces.create(
  'thunderstats',
  './index.thunderstats.html',
  {
    badgeBackgroundColor: '#e64db9',
    badgeText: '',
    defaultIcons: 'images/mzts-icon-16px.png',
    title: 'ThunderStats'
  }
);


browser.browserAction.onClicked.addListener(() => {
    openTStab();
  });

  async function openTStab() {
      let thspace = await messenger.spaces.query({'name': 'thunderstats', isSelfOwned: true});
      messenger.spaces.open(thspace[0].id);
 }


messenger.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  // Check what type of message we have received and invoke the appropriate
  // handler function.
  if (message && message.hasOwnProperty("command")){
      switch (message.command) {
          case 'reloadThunderStats':
                  await reloadThunderStats();
                  return true;
          default:
              break;
      }
  }
  // Return false if the message was not handled by this listener.
  return false;
});

async function reloadThunderStats() {
  // reload the ThunderStats space tab
  const thspace = await messenger.spaces.query({'name': 'thunderstats', isSelfOwned: true});
  if (thspace.length > 0) {
    const spaceTab = await messenger.spaces.open(thspace[0].id);
    if (spaceTab && spaceTab.id) {
      await browser.tabs.reload(spaceTab.id);
    }
  }
}