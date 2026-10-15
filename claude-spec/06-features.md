# ThunderStats — Features

## Main Statistics Window

The main window opens from the Thunderbird toolbar button. Its sticky top toolbar holds the account selector, a segmented control for the four stats tabs (Today, Yesterday, Many Days, Custom Query), the last-update time, Refresh / Export / Settings / Info icon buttons and a round theme toggle icon (a sun that morphs into a moon in dark mode). The Info tab is reached from the Info icon, not from the segmented control. Tab content is laid out as a responsive grid of cards (design tokens in `src/assets/tokens.css`).

---

### Tab: Today

Displays statistics for the current day (from midnight to now), putting each number in context against the user's own usual day. Layout (`WidgetDayDashboard`, data shaped by `tsDayModel`):

- **Status strip** — badge ("Inbox zero", "Keeping up" when the inbox can be cleared in ≤ 5 working days at the usual pace, otherwise "Backlog growing"), date and time range; flow Arrived → Filed or answered (received mails no longer in the inbox, with %) → Still in inbox (of the inbox total); Backlog trend (mails received since the first day of the week still in the inbox); Clear in (~N working days); proportional bar
- **KPI cards** — Received / Sent today with the change against the usual same weekday by now (average of the last 6 weeks); Inbox backlog (total, mails of the day still there, unread, age of the oldest, a "N waiting over a month ›" link and a toggle that open How old is your inbox); Internal traffic (only with `show_internal_mail_percent` and internal domains); Inbox Zero streak with a 14-day strip
- **Today against your normal day** — line chart (cumulative with `_time_chart_progressive`, hourly otherwise) with the usual range of the same weekday, the "now" line and a callout ("usual by now"); future hours hidden with `today_time_chart_do_no_show_future`; the comparison day as dashed lines with `today_time_chart_show_yesterday`; computed note (busier / quieter / in line with a usual weekday)
- **Right rail** — top 5 correspondents (senders and recipients merged), "See all" opens the full Top N Recipients / Top N Senders lists; the **yesterday-at-this-time comparison** (with `today_time_chart_show_yesterday`): compares current counts to the same time yesterday (or last business day). The "Yesterday" / "Last business day" label is clickable to open a date picker and choose any past day as the comparison. The custom day selection is session-only (resets when the TS tab is closed) but persists across data refreshes; the **previous days summary** (total/max/min/average over the previous `_many_days` days, excluding today)
- **Domains** — sent and received bars per domain, "internal" tag, first 8 rows expandable
- **Where today's mails ended up** — received mails by folder (inbox first) or by tag, with a computed footnote; clicking a folder opens it in Thunderbird (in the first mail tab with `inbox0_openFolderInFirstTab`); with `filter_duplicates` an info icon explains that duplicates are counted in every folder they are in. The same applies to "Where mails ended up" in Many Days
- **How old is your inbox** — a full-width strip under the KPI row, opened and closed from the Inbox backlog KPI (toggle or link) or its Hide button, the state remembered in `inbox_age_expanded`: mails still in the inbox by age as one stacked bar with a legend, with "Details by date" (one row per arrival date, sortable by date or by mails). It replaces the old Inbox Zero widget in Today and Yesterday: inbox total and unread are in the Inbox backlog KPI, the moved-out percentage in the status strip ("Filed or answered"), the day's folder distribution in "Where today's mails ended up".

The Inbox Zero streak, Backlog trend and Clear in are approximations (Thunderbird keeps no inbox history): see `tsInsights` in [02-statslib.md](02-statslib.md).

---

### Tab: Yesterday

Same layout as Today, without the "yesterday at this time" comparison, showing full statistics for the previous day: comparisons use the full-day average of the same weekday, the chart has no "now" line and its callout shows the "usual by end of day" range. With `bday_use_last_business_day` enabled and yesterday not a business day, it shows the last business day instead (tab renamed "Last business day").

---

### Tab: Many Days

Shows statistics for the last N days (default: 7, configurable in options), ending yesterday; today is shown apart. Layout (`WidgetPeriodDashboard`, data shaped by `tsPeriodModel`):

- **Status strip** — keeping-up badge (as in Today), date range, days and working days; Arrived → Filed or answered → Still in inbox ("added to backlog"); received per working day; busiest day
- **KPI cards** — Received and Sent with the change against the previous N days and "+N today", plus max / min / average per day (business days only with `bday_default_only`, explained in the tooltip); Internal traffic (with `show_internal_mail_percent` and internal domains); Reply ratio (1 : received/sent)
- **Day by day** — grouped bars per day (received, sent); with `many_days_show_inbox` the received mails still in the inbox are stacked on top in the warning color; today's bars are lighter; non-business days have muted labels; dashed lines for the average received and sent per day (per working day with `bday_default_only`); computed note (working days vs other days, peak day)
- **Time of day · average per day** — average received / sent per hour (today left out, like every average of the tab), with a note on the peak hours
- **Inbox Zero** — calendar of the period with closed at zero / ≤ 5 left / missed days, days at zero, streak at end (same approximation as Today)
- **When mail arrives** — heatmap of received mails by hour and weekday, 07–20 or 24h
- **By weekday · average per day** — received / sent averages per weekday (today left out), with a note on the busiest and lightest business weekday
- **Domains, Where mails ended up, Top N Recipients / Top N Senders**

---

### Tab: Custom Query

Analysis of an arbitrary date range. The query panel is a card at the top of the tab; the results use the same layouts as the other tabs.

#### Query panel
- **Period** — date range picker with manual date input
- **Compare periods** switch — shows the Period B start date picker; the end date is auto-calculated to match the length of the period. Disabled when the period is a single day
- **Working days only** switch (`bday_default_only` as default) — totals/max/min/average and the average lines count business days only. Disabled for a single day
- **Run query** button (the query also runs when a range or a quick range is chosen, with `customqry_loaddata_when_selectingrange`)
- **Quick ranges** chips: Yesterday, Current Week, Last Week, Last 2 Weeks, Current Month, Last Month, Current Year, Last Year, All Emails (the chosen chip stays highlighted until the dates are changed by hand). "All Emails" starts the range on 1 January 1970
- **Filters**: each active advanced filter is a removable chip; "+ Add filter" opens the advanced filters panel (`customqry_always_open_adv_filters` opens it at start)
- After a query: the account addresses (all of them in a tooltip when there are many) and the number of days
- Ranges longer than `customqry_warn_onlongperiod_days` ask for confirmation

#### Advanced Filters
- **Folders** — restrict to specific folders (with optional subfolder inclusion); needs a single account
- **Read/Unread** — all, read only, or unread only
- **Starred/Unstarred** — all, starred only, or unstarred only
- **Subject keyword** — filter messages containing a keyword in the subject (case sensitive)
- **Reset filters** — clears all advanced filters; disabled when no filters are active

#### Results
- **One day** — the Today/Yesterday layout (`WidgetDayDashboard`) with a "Query result" badge: comparison with the usual same weekday (not shown when filters are active, since the usual day is not filtered), pace from the 7 previous days, "How old is your inbox"
- **Longer range** — the Many Days layout (`WidgetPeriodDashboard`) with a "Query result" badge and no comparison with a previous period. The main chart has a **Days / Weeks / Months / Years** toggle; the default depends on the length of the range (days up to 62 days, weeks up to ~6 months, months up to 3 years, then years). Dragging on the main chart selects a range of bars, even a single one (the whole band is highlighted; a plain click does not zoom) and zooms the chart on it, regrouped with the same default for its length; only the chart changes, the rest of the dashboard and the average lines stay those of the whole range. A chip shows the zoomed range with an x to go back to the whole range, next to a "Run the query on this period" link that runs a new query on those days with the same filters (and Period B moved by the same offset). The Inbox Zero calendar shows at most the last 6 weeks of the range. When the range ends today, the totals include today but every average (per day, per working day, max/min/average, average lines, time of day, weekdays) leaves the day in progress out, as in Many Days

#### Compare Periods
- KPI cards show the change of Period A against Period B
- Period B is drawn as dotted lines on the main chart (in the chosen grouping, aligned by position; when zoomed, cut with the same offset) and as dashed lines on the time-of-day chart
- Weekdays, domains, folders and tags show the Period B value next to each Period A value ("B 42")

#### Export
- CSV export of query results (multiple data types available)
- When comparison is active, Period B data is also included in the export

---


Displays add-on version, credits, and links. Opened from the toolbar Info icon.

---

## Options / Settings

Accessible via the addon options page (opens in a Thunderbird tab). Sidebar with five sections (General, Advanced, Business days, Identities & domains, About), settings as cards with one setting per row (toggle switches, selects, number inputs, tag inputs). Every change is saved at once (typed numbers and text after 400 ms); there is no Save button. After a change the header shows a "Reload ThunderStats" button. The sidebar also holds a donation card and the version.

### Section: General
Pref keys and defaults: `statslib/mzts-options-default.js`.
- **Startup** — startup account (`startup_account`, disabled while the last account is remembered), remember last account (`remember_last_account`, overrides the startup account)
- **Loading data** — reload when changing account (`load_data_changing_account`), reload on every tab switch (`always_reload_tab_data`), reopen last tab (`remember_last_tab`), Custom: load data when it is the first tab / when picking a predefined period, always expand the advanced filters
- **Today & Yesterday chart** — show yesterday (`today_time_chart_show_yesterday`), progressive/cumulative lines (`_time_chart_progressive`), hide future hours (`today_time_chart_do_no_show_future`)
- **Many days & Custom** — number of days (`_many_days`, default 7, 2-365), date picker locale (`datepicker_locale`)
- **Inbox Zero** — show inbox mails in the bars (`many_days_show_inbox`), open the folder clicked in "Where mails ended up" in the first mail tab (`inbox0_openFolderInFirstTab`), keep How old is your inbox open under the Inbox backlog KPI in the single-day views (`inbox_age_expanded`, default: off; the same state the KPI toggle changes)
- **Show internal mail percentage** (`show_internal_mail_percent`) — shows the Internal traffic KPI card (received internal %, and % of the sent) in every stats tab, when internal domains are configured (default: off)
- **Appearance: color theme** (`theme_mode`) — `auto` (default, follows the system), `light` or `dark`. The toolbar theme toggle icon sets it too; changes apply live to every open ThunderStats page
- **Appearance: time format** (`time_format`) — `auto` (default, clock of the Thunderbird UI language), `24` or `12`. Applies to every clock time shown, chart axes and heatmap hours included; read when the stats page opens (a WebExtension cannot read the Thunderbird date/time settings)

### Section: Advanced
- **Number of correspondents** (`_involved_num`, default 10, 3-50)
- **First day of the week** (`first_day_week`)
- **Custom Query long period warning** (`customqry_warn_onlongperiod_days`, default 90, 0 = never)
- **Concurrent message queries** (`max_concurrent_queries`, default 2, 1-10) — how many `messages.query` run at the same time while loading; lower it if Thunderbird stutters while loading, raise it if loading is too slow
- **Recent days cache size** (`recent_days_cache_days`, default 49, 43-365) — days before today read in one pass, together with today, and shared by the tabs (today, yesterday, baseline, previous days, previous period); raise it when the Many Days period is longer than 24 days
- **Debug logging** (`do_debug`)
- **Filter duplicates** — deduplicate messages that appear in multiple folders (e.g., sent + archive)
- **Include archive folders** — whether to count archived emails in statistics
- **Per-account advanced settings** — configure archive inclusion and duplicate filtering per account

### Section: Business days
- Define which weekdays are business days (Mon–Fri by default), as day buttons
- Non-business days (`bday_custom_days`): add, edit (click the row) and delete fixed non-business days, every year or only one year, inline form
- Exclude Easter Sunday and Monday (`bday_easter`, default on)
- Use only business days by default (`bday_default_only`)
- Use the last business day instead of yesterday (`bday_use_last_business_day`) in the Yesterday tab and the Today comparison counter
- Business day stats are used in Many Days and Custom Query aggregations

### Section: Identities & domains (Custom Identities + Internal Domains)
- Per account (pill switcher): the account identities (read-only) and the custom ones, as chips
- Define additional email addresses that belong to the user (`custom_identities`, wildcards `*@example.com` and `@example.com`)
- These are used to correctly classify "sent" vs "received" emails when the user has addresses not registered as Thunderbird account identities
- **Internal Domains** — define per-account domain lists that identify domains belonging to the user's organization
  - Used to distinguish internal from external email traffic in statistics (domain entries gain an `internal: true/false` flag)
  - Supports wildcard patterns (e.g., `*.example.com`)
  - Stored in the `internal_domains` preference
  - The percentage display is toggled in General (`show_internal_mail_percent`)
- Entries are validated (address or pattern / hostname); invalid ones are not saved

### Section: About
- Donation banner, release notes (accordion from `CHANGELOG.md`, 1.x notes on request), GPL v3 license with the full text on request, attributions link

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
