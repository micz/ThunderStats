# ThunderStats — Features

## Main Statistics Window

The main window opens from the Thunderbird toolbar button. Its sticky top toolbar holds the account selector, a segmented control for the four stats tabs (Today, Yesterday, Many Days, Custom Query), the last-update time, Refresh / Export / Settings / Info icon buttons and a Light/Dark theme switch. The Info tab is reached from the Info icon, not from the segmented control. Tab content is laid out as a responsive grid of cards (design tokens in `src/assets/tokens.css`).

---

### Tab: Today

Displays statistics for the current day (from midnight to now).

- **Sent / Received counters** — total sent and received emails
- **Previous days summary** — total/max/min/average sent and received over the previous `_many_days` days (excluding today)
- **Yesterday-at-this-time comparison** — compares current counts to the same time yesterday (or last business day). The "Yesterday" / "Last business day" label is clickable to open a date picker and choose any past day as the comparison. The custom day selection is session-only (resets when the TS tab is closed) but persists across data refreshes.
- **Time-of-day chart** — hourly distribution of sent and received emails (optionally with yesterday's lines and without future hours)
- **Inbox Zero widget** — inbox count, inbox percent (mails moved out of the inbox, or still in it with `inbox_percent_remaining`), inbox zero history and per-folder charts
- **Top correspondents table** — configurable number of top senders and recipients
- **Domains widget** — email count by domain
- **Folders/Tags widget** — email distribution by folder and tag

---

### Tab: Yesterday

Same layout as Today, without the "yesterday at this time" comparison, showing full statistics for the previous day. With `bday_use_last_business_day` enabled and yesterday not a business day, it shows the last business day instead (tab renamed "Last business day").

---

### Tab: Many Days

Shows aggregated statistics for the last N days (default: 7, configurable in options).

- **Summary rows** — total, max, min, and average sent/received over the period
- **Daily chart** — sent and received per day; received bars show mails still in the inbox as a red segment (`many_days_show_inbox`)
- **Time-of-day chart** — hourly distribution aggregated over the period
- **Weekday chart** — per-weekday totals over the period
- **Top correspondents, domains, folders/tags**
- **Business days support** — total/max/min/avg can exclude non-business days

---

### Tab: Custom Query

Advanced filtering and analysis for an arbitrary date range.

#### Date Range
- Date picker with manual date input
- Start date and end date selection
- Preset periods via context menu: Current Week, Last Week, Last 2 Weeks, Current Month, Last Month, Current Year, Last Year, All Emails
- "All Emails" queries the oldest message date to set the start of the range

#### Aggregation Level
- Daily
- Weekly
- Monthly
- Yearly

#### Advanced Filters
- **Folders** — restrict to specific folders (with optional subfolder inclusion)
- **Read/Unread** — all, read only, or unread only
- **Starred/Unstarred** — all, starred only, or unstarred only
- **Subject keyword** — filter messages containing a keyword in the subject
- **Reset button** — clears all advanced filters back to defaults; disabled when no filters are active

#### Compare Periods
- Toggle button enables comparison mode
- User selects only the start date for Period B; the end date is auto-calculated to match Period A's length
- Period B data is overlaid on all charts with distinct colors (coral red for bars, purple/red for line charts)
- Delta summary row shows percentage change in sent and received between periods (green for increase, red for decrease)
- Disabled in single-day mode
- Categorical charts (domains, folders, tags) merge labels from both periods

#### Statistics Output
- Aggregated sent/received chart (based on selected aggregation level); a one-day range switches to single-day mode, showing sent/received counters (with internal %) and the Inbox Zero widget instead
- Time-of-day distribution chart
- Weekday distribution chart
- Tags distribution chart
- Folders distribution chart
- Domains distribution chart
- Top correspondents table
- Max / min / average summary

#### Export
- CSV export of query results (multiple data types available)
- When comparison is active, Period B data is also included in the export

---

### Tab: Info

Displays add-on version, credits, and links. Opened from the toolbar Info icon.

---

## Options / Settings

Accessible via the addon options page (opens in a Thunderbird tab).

### Tab: Main
Pref keys and defaults: `statslib/mzts-options-default.js`.
- **Startup account** (`startup_account`), **Remember last account** (`remember_last_account`, overrides the startup account), **Remember last tab** (`remember_last_tab`)
- **Data loading** — reload data on every tab switch (`always_reload_tab_data`), reload when changing account (`load_data_changing_account`)
- **Many Days** — number of days (`_many_days`, default 7), show inbox mails in the bars (`many_days_show_inbox`)
- **Time chart** — show yesterday (`today_time_chart_show_yesterday`), hide future hours (`today_time_chart_do_no_show_future`), progressive/cumulative lines (`_time_chart_progressive`)
- **Custom Query** — load data when selecting a range / when opening the add-on, always open advanced filters
- **Date picker locale** (`datepicker_locale`)
- **Show inbox remaining %** (`inbox_percent_remaining`) — inbox percentage shows mails still in inbox instead of mails moved out (default: off)
- **Show internal mail percentage** (`show_internal_mail_percent`) — shows the percentage of internal mails (based on configured internal domains) next to the sent/received counters in the Today, Yesterday, and Custom Query (single-day) tabs (default: off)
- **Color theme** (`theme_mode`) — `auto` (default, follows the system), `light` or `dark`. The toolbar Light/Dark switch sets it too; changes apply live to every open ThunderStats page

### Tab: Advanced
- **Number of correspondents** (`_involved_num`, default 10)
- **First day of the week** (`first_day_week`)
- **Custom Query long period warning** (`customqry_warn_onlongperiod_days`, default 90)
- **Debug logging** (`do_debug`)
- **Filter duplicates** — deduplicate messages that appear in multiple folders (e.g., sent + archive)
- **Include archive folders** — whether to count archived emails in statistics
- **Per-account advanced settings** — configure archive inclusion and duplicate filtering per account

### Tab: Business Days
- Define which weekdays are business days (Mon–Fri by default)
- Add custom holiday dates to exclude from business day count
- Exclude Easter Sunday and Monday (`bday_easter`, default on)
- Use only business days by default (`bday_default_only`)
- Use the last business day instead of yesterday (`bday_use_last_business_day`) in the Yesterday tab and the Today comparison counter
- Business day stats are used in Many Days and Custom Query aggregations

### Tab: Identities & Domains (Custom Identities + Internal Domains)
- Define additional email addresses that belong to the user
- These are used to correctly classify "sent" vs "received" emails when the user has addresses not registered as Thunderbird account identities
- **Internal Domains** — define per-account domain lists that identify domains belonging to the user's organization
  - Used to distinguish internal from external email traffic in statistics (domain entries gain an `internal: true/false` flag)
  - Supports wildcard patterns (e.g., `*.example.com`)
  - Stored in the `internal_domains` preference
  - The percentage display is toggled in the Main tab (`show_internal_mail_percent`)

### Tab: License
- Displays the full GNU General Public License v3 text

### Tab: Info
- Shows current add-on version and author information

---

## CSV Export

Available via the toolbar Export button, which opens the export menu of the current stats tab (Today, Yesterday, Many Days, Custom Query). When `show_internal_mail_percent` is enabled and internal domains are configured, exports can include internal/external counts.

**Exportable data types:**

| Type | Content |
|---|---|
| Correspondents | Top senders and recipients with counts |
| Time Emails | Hourly email distribution |
| Daily Mails | Per-day sent/received counts |
| Weekly Mails | Per-week sent/received counts |
| Monthly Mails | Per-month sent/received counts |
| Yearly Mails | Per-year sent/received counts |
| Weekdays | Per-weekday sent/received counts |
| Tags | Email count per tag |
| Folders | Email count per folder |
| Domains | Email count per sender domain |

---

## Business Days Logic

The business days feature (in `mzts-statscore.utils.js`) allows filtering statistics to include only business days.

- Configurable per-weekday (any combination of Mon–Sun)
- Supports a list of custom holiday dates (excluded even if they fall on a configured business day)
- Optional **Easter** exclusion: calculates Easter Sunday for any year and excludes both Sunday and Monday
- Applied in: Many Days and Custom Query aggregation (total/max/min/avg), and the "last business day" logic in Today and Yesterday

---

## Multi-Account Support

- Account selector in the main statistics window allows switching between all Thunderbird accounts
- "All accounts" mode aggregates data across all accounts
- Per-account settings can be configured in Options → Advanced
- Custom identities can be defined per-account to correctly identify sent mail

---

## Tab Data Loading

Each stats tab loads its data the first time it is opened in a session and is not reloaded on later visits, unless `always_reload_tab_data` is enabled (`ThunderStatsView.vue`, `tabChanged`). Custom Query loading is controlled by its own prefs. Changing account reloads data if `load_data_changing_account` is enabled.

When `remember_last_tab` is enabled, the selected tab is remembered by vue3-tabs-component for 2 minutes (`cache-lifetime` = 120000 ms); this is tab selection memory, not a data cache.

---

## Privacy

All processing is local. No data leaves the user's machine. No analytics, no telemetry, no external requests.
