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
| `getToday(account_id, account_emails)` | Stats from midnight to now |
| `getYesterday(account_id, account_emails)` | Stats for the full previous day |
| `getManyDaysData(account_id, account_emails)` | Stats for `_many_days` days including today |
| `getCustomQryData(fromDate, toDate, account_id, account_emails, only_businessdays, adv_filters)` | Custom date range with optional filters |
| `getFullStatsData(fromDate, toDate, ..., internal_domains)` | Base method: retrieves and processes all messages in a date range. Accepts an `internal_domains` parameter; when provided, domain entries in the output include an `internal: true/false` flag indicating whether the domain belongs to the user's organization |
| `getAggregatedStatsData(fromDate, toDate, ...)` | Aggregated by day/week/month/year |
| `getCountStatsData(fromDate, toDate, ...)` | Lightweight count-only stats |
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

**Class:** `tsCoreUtils`

Static utility methods used by `thunderStastsCore`.

**Key responsibilities:**
- Message filtering by account, folder, tags
- Duplicate message detection (`filter_duplicates`)
- Business day calculations (including Easter)
- `transformCountDataToDataset(data, do_progressive, get_labels)` — extracts `{ dataset_sent, dataset_rcvd, dataset_inbox }` arrays from date-keyed objects; supports cumulative mode
- Statistics aggregation (max, min, average)
- Date-range filtering helpers
- Account email address resolution
- `getFilterDuplicatesPreference(account_id)` — reads prefs to determine duplicate filtering
- `getAccountInternalDomains(account_id)` — returns the internal domains list for a specific account; when `account_id` is `0`, returns internal domains for all accounts

---

### `mzts-utils.js` — General Helpers

**Class:** `tsUtils`

General-purpose utility functions.

**Key responsibilities:**
- Date/time formatting for display
- Date parsing and conversion
- String manipulation helpers
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

**Class:** `tsExport`

Handles generation of CSV files from statistics data.

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

**Class:** `tsPrefs`

Wraps the Thunderbird/browser `storage` API for reading and writing user preferences.

- Uses `browser.storage.local`
- Async get/set methods
- Provides default values via `mzts-options-default.js`

---

### `mzts-options-default.js` — Default Settings

Plain object exporting all default preference values. Referenced by `tsPrefs` when a preference has not been set by the user.

---

### `mzts-i18n.js` — Internationalization

**Class:** `tsI18n`

Resolves `__MSG_key__` placeholders in strings using the Thunderbird i18n API (`browser.i18n.getMessage`).

Usage: replaces all `__MSG_xxx__` occurrences in a string with the translated string for key `xxx`.

---

### `mzts-logger.js` — Debug Logging

**Class:** `tsLogger`

Thin wrapper around `console.log`. Logging is gated by a `do_debug` flag so it can be silenced in production without changing call sites.

Constructor: `new tsLogger(label, do_debug)`

---

### `mzts-store.js` — Global State

**Object:** `tsStore`

A simple shared state object (not a Vuex/Pinia store) used to pass data between statslib modules without coupling them to Vue's reactivity system.

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
