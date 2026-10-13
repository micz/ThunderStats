# ThunderStats — Build System

## Tooling

Vite + `@vitejs/plugin-vue` (with esbuild), run via Node.js + npm. Versions: see `package.json`.

---

## NPM Scripts

```bash
# Development: watch mode, auto-rebuild on file changes, no minification
npm run dev

# Production: single build with full minification
npm run build

# Preview (rarely used; standard Vite preview server)
npm run preview

# Tests: single run / watch mode
npm test
npm run test:watch

# Real data tests on the mailbox dumps in tests/real/data (see "Real data tests")
npm run test:real
npm run test:real:sample   # writes a synthetic dump (tests/real/data/sample-dump.json)
```

---

## Vite Configuration (`vite.config.js`)

```js
plugins: [
  vue(),
  { name: 'xpi-packager', apply: 'build',
    closeBundle() { if (mode === 'production') createXpi(); } },   // from build.js
],
build: {
  minify: mode === 'production',   // minify only for "npm run build"
  rolldownOptions: {
    input: {
      main:    'index.thunderstats.html',   // main stats window
      options: 'index.ts-options.html'      // options page
    },
    output: {
      codeSplitting: { groups: [            // third party libraries in their own chunks
        { name: 'vendor-chartjs', ... },    // chart.js, vue-chartjs, @kurkle/color
        { name: 'vendor-vue', ... },        // vue and @vue/*
        { name: 'vendor', ... },            // every other node_modules package
      ] }
    }
  }
}
```

The vendor chunk groups keep every chunk under Vite's 500 kB warning limit (the main chunk alone was over 600 kB minified).

### Path Aliases

| Alias | Resolves to |
|---|---|
| `@` | `./src` |
| `@statslib` | `./statslib` |
| `@public` | `./public` |

---

## Entry Points

### Main Statistics Window
- **HTML:** `index.thunderstats.html`
- **JS bootstrap:** `src/index.thunderstats.js`
- **Root Vue component:** `src/App_ThunderStats.vue`

### Options Page
- **HTML:** `index.ts-options.html`
- **JS bootstrap:** `src/index.ts-options.js`
- **Root Vue component:** `src/App_Options.vue`

---

## Build Output (`dist/`)

Every build (dev or production) writes the unpacked addon to `dist/`: the two HTML entry points, `assets/` (hashed JS/CSS bundles), and everything copied from `public/` (`manifest.json`, `background.html`, `background.js`, `images/`, `_locales/`).

`dist/` can be loaded directly in Thunderbird as a temporary addon.

---

## XPI Packaging (`build.js`)

`npm run build` (production mode only) also runs `createXpi()` after bundling:

- Output: `../thunderstats-<version>.xpi` (parent folder of the repo), version read from `package.json`
- Zips the content of `dist/`
- **Locale filter:** every `_locales/<code>` folder not listed in `LANG.md` is excluded. `LANG.md` is the author-maintained list of locales ready to ship; do not edit it.
- Adds `VENDORS.md`, `DEVELOPER.md`, and `LICENSE` from the repo root, if they exist

---

## Tests (Vitest)

`vitest.config.js` merges `vite.config.js` (aliases, Vue plugin; the XPI packager only applies to builds) and sets `TZ=Europe/Rome`, so the local-date logic and the DST changes behave the same on every machine. It excludes `tests/real/` (see "Real data tests"). Tests live in `tests/` (not bundled, not in the XPI):

| Path | Contents |
|---|---|
| `tests/setup.js` | Before each test: a fresh `browser`/`messenger` mock and the shipped business day settings of `tsStore`; real timers restored after each test |
| `tests/mocks/browser.js` | `createBrowserMock()`: in-memory `storage.sync` (defaults object like the real API), `i18n.getMessage` returning `key` or `key[sub1\|sub2]`, `getUILanguage` = `en-US`; `accounts`, `folders` (`getSubFolders`, `query`), `messages.query` (dates with both ends excluded, or included with `dateBounds = 'inclusive'`: the boundary tests run with both, `folderId` with or without subfolders, subject/unread/flagged, pages of `messagesPerPage` continued by `continueList`), `messages.tags.list`, `addressBooks.list`. Tests fill `mailbox`, `tags`, `contacts`, can hold or fail queries with `onQuery`, and read the calls in `calls` |
| `tests/fixtures/mailbox.js` | `createMailbox()` (folder ids like Thunderbird, `acc1://INBOX`; account `acc1` with inbox+subfolder, sent, a user folder, archives, trash, drafts, junk, templates; Gmail account `acc2`), `addMail`/`addMails` (received into the `acc1` inbox by default, `sent: true` from `ME`), `vCard(name, ...emails)` |
| `tests/helpers.js` | `day("YYYYMMDD", hours)` local date (noon by default) |
| `tests/fixtures/result.js` | `makeResult(mails, {from, to, folders, tags})` builds a `getFullStatsData`-shaped output from a list of mails; `makeInbox(dates)` (`getInboxZeroDates` output), `mails(n, mail)`, `dayKeys(from, to)` |
| `tests/unit/` | Pure functions: `tsUtils`, `EmailMatcher`/`DomainMatcher`, `tsCoreUtils` (business days, Easter, domains, labels), `tsInsights`; dashboard models `tsDayModel` and `tsPeriodModel` (loading state, badges, KPIs, charts, notes, Period B), with the clock fixed by fake timers; the mailbox dump anonymizer (`anonymize.test.js`) |
| `tests/integration/` | `thunderStastsCore` on the mocked mailbox: counts by day/hour/weekday/folder/domain/tag, correspondents and address book names, folders queried, archives and duplicates settings, paging, Custom Query filters, `aggregateData`, count-only stats, account emails and preferences, Inbox Zero and recent days caches (one scan shared by every caller, rescan after a failure or account change, size clamp), query queue (limit, release on error and early exit, clamp) |
| `tests/integration/export.test.js` | `tsExport`: CSV helpers, file name and download (stubbed `document` and `URL.createObjectURL`), every transform, and the CSV files built from a real `getCustomQryData` result |
| `tests/components/` | Vue components with `@vue/test-utils` in `happy-dom` (`// @vitest-environment happy-dom` at the top of the file): option controls (`OptSwitch`, `OptRow`, `OptNumber`, `OptTagInput`, with a stub `optPrefs` provide), `tsTheme` + `ThemeToggle`, `WidgetStatusStrip`, `WidgetInboxZeroCalendar`, and `WidgetDayDashboard`/`WidgetPeriodDashboard` mounted with the `tsDayModel`/`tsPeriodModel` output while loading and loaded. The charts are stubbed (no canvas) and any Vue warning (wrong prop type, missing prop) fails the test, so the models and the widgets cannot drift apart |

Code that reads the current date is tested with `vi.useFakeTimers()` + `vi.setSystemTime()` (only `Date` is faked in the integration tests, so `setImmediate` still flushes the pending promises). The core caches and the query queue are module-level: the integration tests call `clearCoreCaches()` and reset the cache size and the queue limit before each test, and resolve every pending query before the end. Known bugs are kept as `it.fails` tests with a comment: they start failing (as a reminder to turn them into normal tests) once the bug is fixed.

### Real data tests

`thunderStastsCore` and the dashboard models run on real mailboxes, loaded into the same browser mock from a **mailbox dump**: a JSON file with accounts, folder trees, tags, contacts and the message headers (no bodies), as returned by the WebExtension APIs.

- **Creating a dump:** `tools/mailbox-dump/` is a separate development extension (not built, not in the XPI): load its `manifest.json` as a temporary add-on, click its toolbar button, choose how many months and whether to anonymize (default on), and save the file. Format and anonymization rules in `tools/mailbox-dump/README.md`. `dump-format.js` (conversion) and `anonymize.js` are ES modules shared with the tests.
- **Where the dumps go:** `tests/real/data/*.json` (ignored by git: personal data) and/or the `TS_DUMP` environment variable (paths separated like `PATH`). `npm run test:real:sample` writes a synthetic dump with the cases a real mailbox has (`tests/real/make-sample-dump.js`, options `--days`, `--scale`, `--seed`, `--now`, `--plain`, `--out`).
- **Running:** `npm run test:real` uses `vitest.real.config.js` (only `tests/real/`, 10 minute timeout, `TZ` from `TS_TZ`, default `Europe/Rome`: use the time zone of the dump). Without dumps the suite is skipped. The clock is fixed to the dump creation time.

| Path | Contents |
|---|---|
| `tests/real/dump.js` | `findDumps()`, `loadDump(file)` (dates back to `Date`, folder ids to the folder objects of the trees), `installDump(dump)` into the mock |
| `tests/real/reference.js` | A second, plain implementation of the main counts of `getFullStatsData` (stats folders, sent/received/unmatched authors, inbox, per day, per folder, duplicates) |
| `tests/real/realdata.test.js` | Per dump: a data quality report (`console.table`: excluded folders, authors without an address, missing or duplicated Message-IDs, unknown tags, mixed case domains, recipients with a non-ASCII domain). Per account and for all the accounts: the reference counts over the last 365 days (`count = sent + received`), the totals of every grouping adding up (dates/weeks/months/years, hours, weekdays, internal/external, domains, folders), the duplicates filter, single days vs a period, the recent days cache vs a full scan, the Custom Query filters (read/unread, flagged/unflagged, a subject word, the busiest folder, a folder with and without its subfolders, combined filters; with and without the duplicates setting of the account) against the reference, Inbox Zero totals, the day and period dashboard models without NaN or infinite numbers; the accounts adding up to all the accounts |

---

## Installing for Development in Thunderbird

1. Run `npm run dev` to build and watch for changes.
2. In Thunderbird, open the Add-on Manager.
3. Click the gear icon → "Debug Add-ons" (or go to `about:debugging`).
4. Click "Load Temporary Add-on" and select any file in `dist/` (e.g. `manifest.json`).
5. The addon reloads automatically after each rebuild — you may need to manually reload the addon page in Thunderbird.

---

## Dependencies

See `package.json`. Runtime libraries bundled into the addon: `vue`, `chart.js`, `vue-chartjs`, `vue3-tabs-component`, `@vueform/multiselect`, `@vuepic/vue-datepicker`, `@imengyu/vue3-context-menu`. Dev only: `vite`, `@vitejs/plugin-vue`, `esbuild`, `vitest`, `happy-dom`, `@vue/test-utils`.
