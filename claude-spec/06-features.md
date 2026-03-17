# ThunderStats — Features

## Main Statistics Window

The main window has five tabs accessible via the toolbar button.

---

### Tab: Today

Displays statistics for the current day (from midnight to now).

- **Sent / Received counters** — total sent and received emails
- **Inbox count** — current number of messages in the inbox
- **Inbox percent** — percentage of day's emails moved from inbox (or still in inbox, toggled via `inbox_percent_remaining` option)
- **Yesterday-at-this-time comparison** — compares current counts to the same time yesterday
- **Time-of-day chart** — hourly distribution of sent and received emails
- **Weekday chart** — distribution across days of the week
- **Top correspondents table** — configurable number of top senders and recipients
- **Domains widget** — top sender domains
- **Folders/Tags widget** — email distribution by folder and tag
- **Inbox Zero widget** — history of inbox zero achievements with embedded charts

---

### Tab: Yesterday

Same layout as Today but showing full statistics for the previous day.

---

### Tab: Many Days

Shows aggregated statistics for the last N days (default: 7, configurable in options).

- **Summary table** — max, min, and average sent/received over the period
- **Daily/weekly/monthly/yearly charts** — aggregated line/bar charts
- **Time-of-day chart** — hourly distribution aggregated over the period
- **Weekday chart** — per-weekday totals over the period
- **Business days support** — statistics can exclude non-business days

---

### Tab: Custom Query

Advanced filtering and analysis for an arbitrary date range.

#### Date Range
- Date picker with manual date input
- Start date and end date selection

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

#### Compare Periods
- Toggle button enables comparison mode
- User selects only the start date for Period B; the end date is auto-calculated to match Period A's length
- Period B data is overlaid on all charts with distinct colors (coral red for bars, purple/red for line charts)
- Delta summary row shows percentage change in sent and received between periods (green for increase, red for decrease)
- Disabled in single-day mode
- Categorical charts (domains, folders, tags) merge labels from both periods

#### Statistics Output
- Aggregated sent/received chart (based on selected aggregation level)
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

Displays add-on version, credits, and links.

---

## Options / Settings

Accessible via the addon options page (opens in a Thunderbird tab).

### Tab: Main
- **Number of days** for the Many Days view (default: 7)
- **Number of correspondents** (top senders/recipients count, default: 10)
- **Account-specific settings** toggle
- **Show inbox remaining %** (`inbox_percent_remaining`) — when enabled, the inbox percentage shows mails still in inbox instead of mails moved out (default: off)

### Tab: Advanced
- **Filter duplicates** — deduplicate messages that appear in multiple folders (e.g., sent + archive)
- **Include archive folders** — whether to count archived emails in statistics
- **Per-account advanced settings** — configure archive inclusion and duplicate filtering per account

### Tab: Business Days
- Define which weekdays are business days (Mon–Fri by default)
- Add custom holiday dates to exclude from business day count
- Toggle Easter holiday detection (automatic)
- Business day stats are used in Many Days and Custom Query aggregations

### Tab: Custom Identities
- Define additional email addresses that belong to the user
- These are used to correctly classify "sent" vs "received" emails when the user has addresses not registered as Thunderbird account identities

### Tab: License
- Displays the full GNU General Public License v3 text

### Tab: Info
- Shows current add-on version and author information

---

## CSV Export

Available in the Custom Query tab and via the export menu in other tabs.

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
- Optional **Easter detection**: automatically calculates Easter Sunday (and optionally Monday) for any year and excludes it
- Applied in: Many Days aggregation, Custom Query aggregation

---

## Multi-Account Support

- Account selector in the main statistics window allows switching between all Thunderbird accounts
- "All accounts" mode aggregates data across all accounts
- Per-account settings can be configured in Options → Advanced
- Custom identities can be defined per-account to correctly identify sent mail

---

## Caching

Tab data is cached for ~2 minutes to avoid redundant API calls when switching between tabs. The cache is invalidated when the user changes the selected account or refreshes manually.

---

## Privacy

All processing is local. No data leaves the user's machine. No analytics, no telemetry, no external requests.
