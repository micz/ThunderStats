// Opens the dump page in a tab when the toolbar button is clicked
browser.browserAction.onClicked.addListener(() => {
  browser.tabs.create({ url: browser.runtime.getURL('dump.html') });
});
