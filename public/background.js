
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