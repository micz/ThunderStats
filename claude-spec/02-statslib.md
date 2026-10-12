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
| `getToday(account_id, account_emails, internal_domains)` | Stats from midnight to now |
| `getYesterday(account_id, account_emails, internal_domains)` | Stats for the full previous day |
| `getManyDaysData(account_id, account_emails, internal_domains)` | Per-day stats for the last `_many_days` days plus today, not aggregated (`TAB_ManyDays.vue` aggregates) |
| `getToday_manyDaysData(account_id, account_emails)` | Aggregated stats for the previous `_many_days` days excluding today (Today/Yesterday summary) |
| `getToday_YesterdayData(...)` / `getToday_SingleDayData(theDay, ...)` | Count-only data for the "yesterday at this time" / custom comparison day counter |
| `getSingleDay(theDay, account_id, account_emails, internal_domains)` | Full stats for one day |
| `getCustomQryData(fromDate, toDate, account_id, account_emails, only_businessdays, adv_filters, internal_domains)` | Custom date range with optional filters |
| `getFullStatsData(fromDate, toDate, account_id, account_emails, do_aggregate_stats, filter_duplicates, only_businessdays, adv_filters, internal_domains)` | Base method: retrieves and processes all messages in a date range. When `internal_domains` is provided, domain entries in the output include an `internal: true/false` flag |
| `getAggregatedStatsData(fromDate, toDate, account_id, account_emails, filter_duplicates)` | Aggregated (total/max/min/avg) stats |
| `getCountStatsData(fromDate, toDate, account_id, account_emails, count_data_to_current_time, filter_duplicates)` | Lightweight count-only stats |
| `aggregateData(dates, only_businessdays)` | Computes total/max/min/avg from per-day data, optionally business days only |
| `getInboxZeroDates(account_id)` / `getInboxFolders(account_id)` | Inbox Zero data |
| `getAccountEmails(account_id, no_custom_identities)` | Returns the email addresses for an account |

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
- Folder, tag, and account helpers (labels, colors, folder IDs, subfolders, archive inclusion)
- Business day calculations (`checkBusinessDay`, `findPreviousBusinessDay`, `isEasterOrEasterMonday`)
- `transformCountDataToDataset(data, do_progressive, get_labels)` — extracts `{ dataset_sent, dataset_rcvd, dataset_inbox }` arrays from date-keyed objects; supports cumulative mode
- Chart label/color helpers and dataset transforms
- Account email address resolution (`getAccountEmails`, `getAccountCustomIdentities`)
- `mergeCategoricalComparisonData(...)` — merges labels of two periods for categorical charts in compare mode
- `getFilterDuplicatesPreference(account_id)` / `getIncludeArchivePreference(account_id)` — read global or per-account prefs
- `getAccountInternalDomains(account_id)` — returns the internal domains list for a specific account; when `account_id` is `0`, returns internal domains for all accounts
- `getInternalMailLabel(domains)` — computes the internal mail percentage from a domains object. Returns `{ percent, sent, received, internalSent, internalReceived }`

---

### `mzts-utils.js` — General Helpers

**Object:** `tsUtils`

General-purpose utility functions.

**Key responsibilities:**
- Date key formatting (`dateToYYYYMMDD`, `dateToYYYYMM`, `dateToYYYYWW`, `dateToYYYY`) and parsing
- Preset period helpers (`getLastMonday`, `getFirstDayOfLastMonth`, ...)
- Weekday sorting, dark mode detection, Thunderbird version comparison
- Date array generators (`getDateArray`, `getDateArrayWeeks`, `getDateArrayMonths`, `getDateArrayYears`) — each entry has fields: `{ count, sent, received, inbox }`

**Class:** `EmailMatcher`

Matches email addresses against a list that may contain exact addresses and wildcard patterns. Used internally by `mzts-statscore.js` to classify sent/received emails.

- Constructor accepts an array of email strings (already lowercased)
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
- `getPref(id)`, `getPrefs(ids)`, `setPref(id, value)`; `saveOptions` / `restoreOptions` bind options-page inputs by element `id`
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

---

### `mzts-store.js` — Global State

**Object:** `tsStore`

A Vue `reactive()` object (not Vuex/Pinia) holding shared app state: debug flag, dark mode, current account, current tab, business day settings, first day of week, tags list, and the `chart_colors` palette. Imported by both components and statslib modules.

---

## `chartjs-lib/` — Custom Chart.js Plugins

Custom plugins and external tooltip handlers used by chart components.

| File | Purpose |
|---|---|
| `plugin-barposition.js` | Adjusts bar chart positioning |
| `plugin-doughnutlabels.js` | Labels inside doughnut charts |
| `plugin-timechart-legend.js` | Custom legend for time charts |
| `plugin-timechart-vertical-line.js` | Vertical line overlay on time charts |
| `external-tooltip-timechartlines.js` | Custom tooltip for time charts |
| `external-tooltip-inboxzerodates.js` | Custom tooltip for Inbox Zero date charts |

---

## Import Pattern in Vue Components

```js
import { thunderStastsCore } from '@statslib/mzts-statscore';
import { tsPrefs } from '@statslib/mzts-options';
import { tsUtils } from '@statslib/mzts-utils';
import { tsExport } from '@statslib/mzts-export';
```

The `@statslib` alias is configured in `vite.config.js` to resolve to `./statslib`.
