# Store screenshots

Development tool (not in the XPI) that renders the real ThunderStats pages in a normal browser, on top of the
fake Thunderbird API of the tests (`tests/mocks/browser.js`) filled with a fictional mailbox, and saves the
screenshots for the addons.thunderbird.net page.

- `fake-mailbox.js`: two accounts (Work, Personal), about 14 months of mail, fictional names, domains only under the reserved `.example` and `.invalid` TLDs. Seeded, so the data is the same on every run.
- `setup.js`: installs the mock, the real English strings and a fixed clock (today at 17:20) before the add-on code loads.
- `index.html`, `options.html`: the main page and the options page. Query string: `theme=light|dark`, `time=HH:MM`, `prefs={json}`; the hash picks the tab (with `remember_last_tab: true`).
- `shoot.js`: drives headless Edge through the DevTools protocol and writes 1280×800 PNG files to `out/`: Today in light and dark theme (cumulative time of day chart), then in light theme only Last 7 days, Custom View (current year by weeks) and every Options section. The stats pages are shot more than once while scrolling: `-a` is the top of the page, `-b` one screen further down, `-c` two screens down (Today has `-a` and `-b`, Last 7 days and Custom View all three); the Options sections give only the top of the page.

## Usage

From the repository root, start the dev server and leave it running:

```bash
npm run screenshots:serve
```

Then, in another terminal:

```bash
npm run screenshots
```

Pass the path of another Chromium browser (`npm run screenshots -- "C:/path/to/chrome.exe"`) if Edge is not in its default folder.
Open `http://localhost:5199/tools/screenshots/index.html?theme=dark` to look at the page by hand.

The dashboard sets no `font-family`, so `index.html` gives the body the same font stack as the options page;
without it a desktop browser falls back to a serif font.
