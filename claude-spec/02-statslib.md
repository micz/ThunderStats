# ThunderStats — Statistics Library (`statslib/`)

## Overview

The `statslib/` directory contains all the core business logic: statistics calculation, data retrieval from the Thunderbird API, preferences management, export, and utilities. It is framework-agnostic JavaScript (ES modules) imported by Vue components.

---

## Files

### `mzts-statscore.js` — Main Statistics Engine

**Class:** `thunderStastsCore`

The central class that retrieves and processes email data from the Thunderbird `browser.messages` API.

**Constructor options:**
| Option | Default | Description |
|---|---|---|
| `do_debug` | `false` | Enable debug logging |
| `_involved_num` | `10` | Number of top senders/recipients to return |
| `_many_days` | `7` | Number of days for the "many days" view |
| `accounts_adv_settings` | `[]` | Per-account advanced settings |

**Key public methods:**

| Method | Description |
|---|---|
| `getToday(account_id, account_emails, internal_domains)` | Stats from midnight to now, built from the messages kept by the recent days cache (no query of its own) |
| `getYesterday(account_id, account_emails, internal_domains)` | Stats for the full previous day |
| `getManyDaysData(account_id, account_emails, internal_domains)` | Per-day stats for the last `_many_days` days plus today, not aggregated (`TAB_ManyDays.vue` aggregates) |
| `getManyDaysPreviousPeriod(account_id, account_emails)` | Count-only stats of the `_many_days` days before the Many Days period (KPI changes against the previous period); served from the recent days cache when `_many_days` is at most 24 |
| `getToday_manyDaysData(account_id, account_emails)` | Aggregated stats for the previous `_many_days` days excluding today (Today/Yesterday summary); served from the recent days cache |
| `getToday_YesterdayData(...)` / `getToday_SingleDayData(theDay, ...)` | Count-only data for the "yesterday at this time" / custom comparison day counter (yesterday from the messages kept by the recent days cache, another day from a query) |
| `getSingleDay(theDay, account_id, account_emails, internal_domains)` | Full stats for one day (from midnight to 23:59:59.999, so the date arrays of the output have that day only) |
| `getWeekdayBaseline(theDay, account_id, account_emails, num_weeks)` | Hourly counts (`msg_hours`) of the same weekday in the previous `num_weeks` weeks (non-business days skipped when `theDay` is a business day); the "usual day" of the Today/Yesterday dashboards; served from the recent days cache when the range is covered, otherwise by a single scan of the range |
| `getCustomQryData(fromDate, toDate, account_id, account_emails, only_businessdays, adv_filters, internal_domains)` | Custom date range with optional filters |
| `getDaysBefore(theDay, num_days, account_id, account_emails)` | Count-only stats of the `num_days` days before `theDay` (pace of a single-day Custom Query); served from the recent days cache when the range is covered |
| `getFullStatsData(fromDate, toDate, account_id, account_emails, do_aggregate_stats, filter_duplicates, only_businessdays, adv_filters, internal_domains)` | Base method: retrieves and processes all messages in a date range. When `internal_domains` is provided, domain entries in the output include an `internal: true/false` flag. The output also has `msg_weekday_hours` (weekday × hour sent/received grid, used by the heatmap) and `msg_hours_days` (`{YYYYMMDD: {hour: {sent, received}}}`, only the days with mails, used to leave the day in progress out of the time-of-day averages). `count_in_inbox` and every other counter skip the duplicates when the filter is on (a message without a Message-ID is never a duplicate). An author without an address (e.g. "Mail Delivery System") is received and external, with no sender and no domain entry, so `count = sent + received`. Tags no longer defined in Thunderbird are not counted (one debug log line per query) |
| `getCountStatsData(fromDate, toDate, account_id, account_emails, count_data_to_current_time, filter_duplicates)` | Lightweight count-only stats |
| `aggregateData(dates, only_businessdays)` | Computes total/max/min/avg from per-day data, optionally business days only; all zeros when no day is left |
| `getInboxZeroDates(account_id)` / `scanInboxZeroDates(account_id)` / `getInboxFolders(account_id)` | Inbox Zero data; `getInboxZeroDates` serves it from the Inbox Zero cache (one scan per account, shared by all the tabs) |
| `getAccountEmails(account_id, no_custom_identities)` | Returns the email addresses for an account |
| `getFilterDuplicates(account_id)` / `getStatsFoldersIds(account_id)` | Per-instance memo of the duplicates setting and of the ids of the folders to query (every folder of the account, or of all the accounts for 0, except drafts, trash, junk, templates, outbox with their subfolders and the archives when excluded), read once per data load instead of once per query |
| `loadIncludeArchive(account_id)` / `excludeMessage(message, account_id)` | `excludeMessage` is synchronous and skips drafts, trash and junk, plus the archives when the account setting excludes them; every scan awaits `loadIncludeArchive` first, which reads the setting once per account into the instance |
| `getDays(fromDate, toDate, account_id, account_emails)` / `scanDays(...)` / `getRecentDays(...)` / `getAggregatedRecentDays(...)` | Recent days cache (see below): per-day `{sent, received, msg_hours}` of a range, from the cache or from one scan. `scanDays` takes an optional `keep_messages_from` date: the headers of the messages dated from that day on come back in `messages: {YYYYMMDD: [MessageHeader]}`, unfiltered |
| `getRangeMessages(fromDate, toDate, account_id, account_emails, filter_duplicates, queryFn)` | The messages of a range to iterate with `for await`: the headers kept by the recent days cache when the range lies within the last `RECENT_MESSAGES_DAYS` days (today and yesterday), otherwise the pages of the query started by `queryFn` (through `getMessages`). Used by `getFullStatsData` (only without advanced filters, which are part of the query) and `getCountStatsData`; the callers apply the range, the exclusions and the duplicates filter themselves in both cases |
| `getFoldersMessages(queryInfo)` | Async generator over the messages of a query on a list of folders, one folder at a time: every folder of `queryInfo.folderId` is a `messages.query` of its own (same criteria, `folderId` of that folder), so Thunderbird's main thread is blocked for the scan of one folder instead of the whole mailbox; after `FOLDER_SCAN_SLICE_MS` (300) of queries it pauses for `FOLDER_SCAN_PAUSE_MS` (16, one frame) so Thunderbird can paint and handle the input; the pauses cost about 5% of the scan time. Without `folderId` the query runs as it is. Every stats query goes through it |
| `getMessages(queryFn)` | Async generator over the pages of a message list. `queryFn` starts the `browser.messages.query` call and is invoked only when a slot of the query queue is free |

**Query shape.** Every stats query passes the explicit list of folders to read (`folderId` from `getStatsFoldersIds`, `includeSubFolders: false`), so Thunderbird never converts the messages of drafts, trash, junk, templates, outbox or excluded archives, and the `QUERY_PAGING` options: `messagesPerPage: MESSAGES_PER_PAGE` (500) to cut the round trips and `autoPaginationTimeout: 0`, because with the automatic pagination on Thunderbird sets and clears a timer for every single header it examines (a quarter of the main thread time of a scan in a profile); the pages then come every 500 messages or at the end of the query. The Custom Query folder filters pass the user's folders instead; `excludeMessage` stays as a safety net. Thunderbird does not document whether a message dated exactly `fromDate` or `toDate` is returned, so every query asks for one more second on both sides (`queryDates`) and the core checks the range itself, both ends included (`inRange`); the ranges of a day end at 23:59:59.999, so a mail at midnight always belongs to exactly one day. The minimum Thunderbird version is 140, there are no version checks or TB 115 fallbacks.

**Query queue.** Every `browser.messages.query` runs on Thunderbird's main thread and is never interrupted (every header of its folders is examined in one go, see `getFoldersMessages` for the per-folder split), so many concurrent queries make the Thunderbird UI unresponsive. A module-level `QueryQueue` (shared by all `thunderStastsCore` instances) limits the running queries to the `max_concurrent_queries` preference (default 2, clamped to 1-10 by the exported `setMaxConcurrentQueries`, which `ThunderStatsView.updateStats` applies at every load); `getMessages` acquires a slot before starting the query and releases it when the iteration ends (also on early exit or error). The tabs also start their main query first and launch the secondary ones (inbox zero, baseline, previous period, days before) only after it has resolved.

**Recent days cache.** A date-filtered query scans every message anyway, so one scan of a wide range costs the same as a single-day one. The core keeps a module-level cache (shared by all instances) with the per-day sent/received counts and hourly grid of the last `recent_days_cache_days` days before today plus today (preference, default 49, clamped to 43-365 by the exported `setRecentDaysCacheDays`, applied by `ThunderStatsView.updateStats` at every load; 43 is the minimum for 6 full weeks before yesterday). The same scan keeps the message headers of the last `RECENT_MESSAGES_DAYS` days (2: today and yesterday), as they come from the query, and `getRangeMessages` hands them to `getFullStatsData` and `getCountStatsData` for any range inside those days: Today, "yesterday at this time" and the Yesterday tab day are built from the cache scan, so opening the Today tab runs one full scan (plus the Inbox Zero query of the inbox folders) instead of three. A comparison or Yesterday-tab day outside those two days (custom comparison day, last business day) and a Custom Query with advanced filters still run their own query. `getRecentDays` fills the cache once (the promise is shared by concurrent callers); `getDays` serves any range inside it without a new query and falls back to `scanDays` otherwise. The weekday baseline, the previous days of Today/Yesterday, the previous period of Many Days (when twice `_many_days` fits in the cache size) and the "days before" of a single-day Custom Query all come from it, so switching between Today and Yesterday starts no new heavy scan. The cache key includes today's date, the cache size, the account, its emails, the duplicates filter and the archive setting; `clearCoreCaches()` (exported) is called by `ThunderStatsView.updateStats` on every refresh or account change.

**Correspondent names.** While counting, `getFullStatsData` keeps only the first address seen of every sender and recipient (`{count, address}`); after the sort and the cut to `_involved_num` per type, `resolveCorrespondentNames` turns the entries left into `{count, name}` with `tsCoreUtils.getCorrespondantName`. So the address book is asked for a handful of correspondents, with one `contacts.quickSearch` each, cached by email (see `mzts-statscore.utils.js`); listing the whole address book made Thunderbird convert every contact with its vCard on its main thread (1.3 s with a big address book in a profile).

**Inbox Zero cache.** Same pattern for `getInboxZeroDates`: the scan of the inbox folders (total, unread, mails per date) is done once per account and day, the promise is shared by concurrent callers and every tab reads the same result. `clearCoreCaches()` resets it too.

**Advanced filters object (`adv_filters`):**
```js
{
  folders: [],                 // Array of folder IDs to include
  folders_do_subfolders: bool, // Include subfolders
  filterSubject: string,       // Keyword to search in subject
  read_unread: 0|1|2,          // 0=all, 1=read, 2=unread
  flagged_unflagged: 0|1|2,    // 0=all, 1=flagged, 2=unflagged
}
```

---

### `mzts-statscore.utils.js` — Stats Utilities

**Object:** `tsCoreUtils`

Utility methods used by `thunderStastsCore` and the Vue components.

**Key responsibilities:**
- Folder, tag, and account helpers (labels, colors, folder IDs, subfolders, archive inclusion); `openFolder(folder_data, in_first_tab)` shows a folder in a mail tab (a new tab unless `in_first_tab`)
- Business day calculations (`checkBusinessDay`, `findPreviousBusinessDay`, `isEasterOrEasterMonday`)
- Correspondent names: `getCorrespondantName(address)` looks the email up in the address book (`getAddressBookName`: one `contacts.quickSearch({searchString: email, includeRemote: false})` per distinct email, local books only so no network request per correspondent; the search matches several fields, so the exported `vCardNameForEmail` checks the vCard emails and returns its FN) and falls back to the display name in the address. The lookups are kept in a module-level Map email → promise of the name, which survives the data refreshes and the account changes (`clearCoreCaches()` does not touch it): it is reset by the `contacts` and `addressBooks` `onCreated`/`onUpdated`/`onDeleted` events (listeners added at the first lookup) and by the exported `clearContactsNamesCache()`
- `getCustomQryLabel(label, data_type)` — date, week, month or year key formatted for the CSV export (days in the Thunderbird UI language)
- Account email address resolution (`getAccountEmails`, `getAccountCustomIdentities`)
- `getFilterDuplicatesPreference(account_id)` / `getIncludeArchivePreference(account_id)` — read global or per-account prefs; the per-account ones come from `getAccountAdvSettings(account_id)`, the entry of the `accounts_adv_settings` list (default `[]`; any other stored value counts as an empty list)
- `getAccountInternalDomains(account_id)` — returns the internal domains list for a specific account; when `account_id` is `0`, returns internal domains for all accounts
- `extractDomains(recipients)` — lower case domains of a list of recipients, from the same address as the correspondent (`tsUtils.extractEmail`); entries without an address are skipped
- `getInternalMailLabel(domains)` — computes the internal mail percentage from a domains object. Returns `{ sentPercent, receivedPercent }` (strings like `75.00%`)

---

### `mzts-utils.js` — General Helpers

**Object:** `tsUtils`

General-purpose utility functions.

**Key responsibilities:**
- Date key formatting (`dateToYYYYMMDD`, `dateToYYYYMM`, `dateToYYYYWW`, `dateToYYYY`) and parsing; `dateToYYYYWW` is the ISO week with the ISO year (the year of its Thursday: 2024-12-30 is `202501`)
- Preset period helpers (`getLastMonday`, `getFirstDayOfLastMonth`, ...)
- `sortDays(first_day_week, days)` — weekdays (`idx` 0 = Sunday) ordered from any first day of the week
- `formatDateStringLocale(locale)` — date-fns pattern of a locale for the date picker, built with `formatToParts` (works with non-Latin digits, literals with Latin letters quoted)
- `formatTime(date, time_format = tsStore.time_format)` — hours and minutes in the UI language; `time_format` `'24'` / `'12'` forces the clock (`hourCycle` `h23` / `h12`), `'auto'` keeps the language convention. Every clock time shown (day strip range, chart callout, period notes, chart and heatmap tooltips, "updated at" time) goes through it. No WebExtension API exposes the Thunderbird date/time format settings, hence the pref
- `formatHour(hour, time_format)` — `formatTime` of the start of an hour (wrapped to 0-23)
- `formatHourShort(hour, time_format)` — compact hour without minutes for the chart x axes (`ChartDayVsNormal`, `ChartHourlyAverage`), the heatmap rows and its range button: `'09'` when the resolved clock is 24-hour, `'9 AM'` when it is 12-hour
- `daysBetween` (days of a range, both ends included, not affected by the DST changes)
- `regexEmail` finds the address in an author or recipient string; the local part may contain `+` (sub-addressing), `%` and apostrophes (not as first character); letters and digits of any alphabet are accepted (internationalized addresses, `josé@exämple.com`)
- `extractEmail(text)` — lower case address of an author or recipient, or `null`: the address in angle brackets wins over an address written in the display name (`"anna@x.com" <mario@y.com>` → `mario@y.com`). Used for the author (sent/received), the correspondents, the address book names and the recipient domains
- Date array generators (`getDateArray`, `getDateArrayWeeks`, `getDateArrayMonths`, `getDateArrayYears`) — each entry has fields: `{ count, sent, received, inbox }`

**Class:** `EmailMatcher`

Matches email addresses against a list that may contain exact addresses and wildcard patterns. Used internally by `mzts-statscore.js` to classify sent/received emails.

- Constructor accepts an array of email strings; entries and checked addresses are lowercased by the matcher itself, so the comparison always ignores the case
- Entries containing `*` or starting with `@` are treated as wildcard patterns
- `@domain.com` is shorthand for `*@domain.com`
- `*` is converted to `.*` in a compiled regex; all other regex special chars are escaped
- **`matches(email)`** — returns `true` if the email matches any exact address or wildcard pattern
- Exact addresses use a `Set` for O(1) lookup; wildcard patterns use pre-compiled `RegExp` objects

**Class:** `DomainMatcher`

Matches domain strings against a list that may contain exact domains and wildcard patterns. Used to identify internal (organizational) domains in email statistics.

- Constructor accepts an array of domain strings (already lowercased)
- Entries containing `*` are treated as wildcard patterns (e.g., `*.example.com`)
- `*` is converted to `.*` in a compiled regex; all other regex special chars are escaped
- **`matches(domain)`** — returns `true` if the domain matches any exact domain or wildcard pattern
- Exact domains use a `Set` for O(1) lookup; wildcard patterns use pre-compiled `RegExp` objects

---

### `mzts-export.js` — CSV Export

**Object:** `tsExport`

Handles generation and download of CSV files from statistics data. Most transforms accept `includeInternalExternal` to add internal/external counts.

- `arrayToCsv(rows)` writes the header from the keys of the first row; fields with a comma, a quote or a line break are quoted, with the quotes doubled (RFC 4180, `csvField`).
- `mergeSendersAndRecipients(senders, recipients)` builds the correspondents from the user's point of view (`received` = mails from the senders, `sent` = mails to the recipients), keeping the first non-empty name.

**Exportable data types:**
- Correspondents (senders/recipients)
- Time-based emails (hourly distribution)
- Daily mails
- Weekly mails
- Monthly mails
- Yearly mails
- Weekdays distribution
- Tags
- Folders
- Domains

---

### `mzts-options.js` — Preferences API

**Object:** `tsPrefs`

Wraps the `storage` API for reading and writing user preferences.

- Uses `browser.storage.sync`
- `getPref(id)`, `getPrefs(ids)`, `setPref(id, value)`; `saveOptions` / `restoreOptions` bind inputs by element `id` (no longer used by the options page, which keeps its own reactive copy of the prefs, see `OptionsView.vue`)
- Missing values fall back to `prefs_default` from `mzts-options-default.js`

---

### `mzts-options-default.js` — Default Settings

Exports `prefs_default`, the object with all preference keys and default values (source of truth for pref names and defaults). Referenced by `tsPrefs` when a preference has not been set by the user.

---

### `mzts-i18n.js` — Internationalization

**Object:** `i18n`

Replaces `__MSG_key__` placeholders in the DOM (`updateDocument`, `updateSubtree`) or in a string (`updateString`), using `messenger.i18n.getMessage`. See [05-i18n.md](05-i18n.md).

---

### `mzts-logger.js` — Debug Logging

**Class:** `tsLogger`

Thin wrapper around `console.log`. Logging is gated by a `do_debug` flag so it can be silenced in production without changing call sites.

Constructor: `new tsLogger(prefix, do_debug)`. Methods: `log(msg)` (only when `do_debug`), `warn(msg)`, `error(msg)` (always).

`msg` can be a function returning the message: it is called only when debugging is on. Use this form for messages that serialize large data (`tsLog.log(() => "result: " + JSON.stringify(result))`), so nothing is built when debugging is off.

---

### `mzts-insights.js` — Dashboard Metrics

**Object:** `tsInsights` (pure functions) plus constants (`BASELINE_WEEKS` = 6, `INBOX_FEW_LEFT` = 5, `STREAK_STRIP_DAYS` = 14, `STREAK_WINDOW_DAYS` = 90, `CLEAR_IN_GOOD_DAYS` = 5).

- `weekdayBaseline(days_msg_hours, progressive)` — usual range per hour (min–max of the past same weekdays, dropping the highest and lowest day when there are 5+ samples), cumulative ranges and averages, average received/sent per day.
- `delta(value, reference, increase_is_bad)` — KPI change text (`▲ 12%`, `▼ 25%`, `±0%`) and color (`--warn` when an increase is bad).
- Inbox approximations, based on the arrival dates of the mails still in the inbox (`getInboxZeroDates().dates`), since Thunderbird keeps no inbox history:
  - `inboxZeroDays` — per day: `zero` (no mail of that day left in the inbox), `few` (≤ 5 left), `missed`.
  - `inboxZeroStreak` — consecutive `zero` days up to the given day (a day still in progress is skipped if not at zero). No "best streak": old days always end up at zero once processed.
  - `backlogAdded` — mails received in a date range still in the inbox (status strip "Backlog trend", since the first day of the week).
  - `clearInDays` — current inbox / average mails per working day that left the inbox (received minus still in inbox) over the previous days.
  - `oldestDays` — age of the oldest mail in the inbox.
- `topCorrespondents`, `endedUpFolders` (received mails by folder, inbox first, with `folder_data` to open the folder), `endedUpTags`, `domainRows`.
- `inboxAgeBuckets(inbox_dates, ref_date)` — inbox mails by age: today, yesterday, ≤ 7, ≤ 30, ≤ 90 days, older.
- `peakWindow(values, width)` (busiest consecutive hours), `orderedWeekdays(first_day_week)`, `weekdayAverages(dates, msg_weekdays, first_day_week)` (weekday totals / occurrences of that weekday), `heatGrid(msg_weekday_hours, from_hour, to_hour, first_day_week)`.

---

### `mzts-daymodel.js` — Single-Day Dashboard Model

**Object:** `tsDayModel`. `build(input)` returns the props of `WidgetDayDashboard` (status strip, KPIs, chart, top correspondents, tables, domains, folders/tags) from the data loaded by a tab; every input except `kind` and `day` may be `null` while loading. `kind` is `today` (day in progress: "by now" comparisons, now line), `yesterday` or `day` (other single day, e.g. last business day). The status badge is "Inbox zero" (empty inbox), "Keeping up" (clear in ≤ 5 working days) or "Backlog growing". Dates use the Thunderbird UI language. `neutral_badge` (Custom Query single day) shows "Query result" instead of the keeping-up status. The Inbox backlog KPI has `expandable: true` and a `link` ("N waiting over a month ›", or "How old is your inbox ›" when nothing is older than a month; empty with an empty inbox) that open the inbox age strip.

---

### `mzts-periodmodel.js` — Period Dashboard Model

**Object:** `tsPeriodModel`. `build(input)` returns the props of `WidgetPeriodDashboard` from the data loaded by a tab. `days` are the days shown (chart, calendar), `stat_days` the days counted in totals and averages (Many Days: without today, reported apart as "+N today"). `kind` is `manydays` (keeping-up badge, changes against the previous period) or `custom` ("Query result" badge, for any range length). For `custom`, `aggregation` groups the main chart by day, week, month or year, and `cmp_result` (Period B) adds the changes against Period B to the received/sent KPIs, a "vs Period B" `sub2` to the internal traffic and reply ratio KPIs, a "B n" `cmp` text under every status strip value (`stripFigures` computes the strip figures of any dates object), Period B lines to the main and time-of-day charts (Period B is aligned by position), `cmp_zero` / `cmp_total` to the Inbox Zero calendar (days at zero over the same number of days, at the end of Period B), `cmp_msg_weekday_hours` to the heatmap (tooltips only), `cmp_received` / `cmp_sent` to the weekdays, and a Period B list to domains (`domains_b`), folders and tags (`ended.folders_b`, `ended.tags_b`) and correspondents (`involved.recipients_b`, `involved.senders_b`); domain, folder and tag rows of each list carry the count of the other period (`cmp_sent` / `cmp_received`, `cmp_n`). The week, month and year buckets of the main chart are grouped from `result.dates` (`bucketize`, ISO weeks as in `getFullStatsData`) and each bar carries the `first` and `last` day it covers. `zoom_days` (a slice of `days`, or null) limits the main chart to those days: the buckets count only the zoomed days, the average lines stay those of the whole period (per day, or per bucket of the whole period when grouped), the note is computed on the zoomed days, Period B is cut with the same offset in days, and `chart.zoom_text` holds the zoomed range (empty without zoom). The Inbox Zero calendar shows at most the last 6 weeks. Averages count business days only when `only_businessdays` is set, and never count the day in progress (a Custom Query may end today: the totals keep it, the averages, the max/min/avg of the KPIs, the time-of-day and the weekday averages leave it out; the time of day subtracts it with `msg_hours_days`). The folders footnote counts the same days as the KPIs and the status strip (`stat_days`). Computed notes: working days vs other days and peak day, time-of-day peaks, heatmap peak and busiest weekday, busiest vs lightest business weekday, folders footnote.

---

### `mzts-theme.js` — Color Theme

**Object:** `tsTheme`

- Reads the `theme_mode` pref (`auto` | `light` | `dark`; `auto` follows `prefers-color-scheme`).
- `media` — the `prefers-color-scheme: dark` query, read at the first use (`null` without a DOM), so the module can be imported anywhere.
- `init()` — called by both entry points before mounting; applies the theme, follows system changes while in `auto`, and listens to `browser.storage.onChanged` so every open ThunderStats page stays in sync.
- `apply(mode)` — sets `tsStore.theme_mode`, `tsStore.darkmode` and `data-theme="light|dark"` on the root element. All CSS dark rules are keyed on `:root[data-theme="dark"]` (no `prefers-color-scheme` media queries).
- `setMode(mode)` — applies and saves the pref (used by the toolbar theme toggle icon).

---

### `mzts-store.js` — Global State

**Object:** `tsStore`

A Vue `reactive()` object (not Vuex/Pinia) holding shared app state: debug flag, dark mode, current account, current tab, business day settings, first day of week, time format (`time_format` pref, loaded by `ThunderStatsView`), tags list. Imported by both components and statslib modules. `darkmode` (effective theme) and `theme_mode` (pref value) are written only by `tsTheme`.

---

## `chartjs-lib/` — Custom Chart.js Plugins

Chart helpers. The plugins used by a single chart (the "now" line, the average lines) live in the chart component itself.

| File | Purpose |
|---|---|
| `chart-theme.js` | `applyChartTheme(is_dark)` sets the global `Chart.defaults` text/grid colors and redraws open charts; called by `ThunderStatsView` when `tsStore.darkmode` changes. Charts must not set `Chart.defaults` themselves. Also exports `themeColor(name)` (current value of a CSS token) and `withAlpha(hex, alpha)` |
| `chart-range-select.js` | `createRangeSelectPlugin({ enabled, color, onSelect })`: dragging on a category x axis highlights the whole band of the bars covered (full chart height, no tooltip while dragging) and on release calls `onSelect(from_index, to_index)`, also for a single bar; a plain click (less than 4px of movement) selects nothing. The chart must list `mousedown` and `mouseup` in `options.events`. Also exports `indexAtPixel` and `bandEdges` |

---

## Import Pattern in Vue Components

```js
import { thunderStastsCore } from '@statslib/mzts-statscore';
import { tsPrefs } from '@statslib/mzts-options';
import { tsUtils } from '@statslib/mzts-utils';
import { tsExport } from '@statslib/mzts-export';
```

The `@statslib` alias is configured in `vite.config.js` to resolve to `./statslib`.
