# ThunderStats — Vue Components

## Component Hierarchy

Source of truth: the `import` statements in each `.vue` file.

```
App_ThunderStats.vue
└── ThunderStatsView.vue
    ├── HeadingNAV.vue
    │   └── SelectAccount.vue
    └── [tab-based navigation]
        ├── TAB_Today.vue
        │   ├── ExportMenu.vue
        │   └── WidgetDayDashboard.vue
        │       └── rail slot:   CounterYesterdayThisTime.vue, CounterManyDays_Table.vue (previous N days summary)
        ├── TAB_Yesterday.vue
        │   └── (same as Today, without CounterYesterdayThisTime)
        ├── TAB_ManyDays.vue
        │   ├── ExportMenu.vue
        │   └── WidgetPeriodDashboard.vue
        ├── TAB_CustomQry.vue
        │   ├── ExportMenu.vue
        │   ├── query panel (VueDatePicker, Multiselect for the folders filter)
        │   ├── WidgetDayDashboard.vue      (one-day range)
        │   └── WidgetPeriodDashboard.vue   (longer range)
        └── TAB_Info.vue

Widget children:
    WidgetDayDashboard.vue    → WidgetStatusStrip, CounterKpi, WidgetInboxAge (opened from the Inbox backlog KPI),
                                ChartDayVsNormal, WidgetTopCorrespondents, TableInvolved (when "See all" is open),
                                WidgetDomainBars, WidgetEndedUp
    WidgetPeriodDashboard.vue → WidgetStatusStrip, CounterKpi, ChartPeriodDays, ChartHourlyAverage, WidgetInboxZeroCalendar,
                                WidgetHeatmap, WidgetWeekdayBars, WidgetDomainBars, WidgetEndedUp, TableInvolved

App_Options.vue
└── OptionsView.vue                 (header with ThemeToggle, sidebar nav + donation card)
    └── [one section at a time]
        ├── OPTAB_Main.vue          → OptRow, OptNumber
        ├── OPTAB_Advanced.vue      → OptRow, OptSwitch, OptNumber
        ├── OPTAB_BusinessDays.vue  → OptRow
        ├── OPTAB_CustomIds.vue     → OptTagInput
        └── OPTAB_About.vue
```

The tabs load the data and build the props of the two dashboard layouts with `tsDayModel` and `tsPeriodModel` (see [02-statslib.md](02-statslib.md)); the widgets only display what they receive.

---

## Root Components

| File | Description |
|---|---|
| `src/App_ThunderStats.vue` | Root component for the main statistics window |
| `src/App_Options.vue` | Root component for the options/settings page |

---

## Views

| File | Description |
|---|---|
| `src/views/ThunderStatsView.vue` | Main statistics dashboard with tab navigation |
| `src/views/OptionsView.vue` | Settings page with tab navigation |

---

## Tab Components (`src/components/tabs/`)

| File | Description |
|---|---|
| `TAB_Today.vue` | Today (midnight to now): loads the day, inbox, previous days, comparison day and weekday baseline, builds the dashboard with `tsDayModel` and renders `WidgetDayDashboard`; rail adds the "yesterday at this time" comparison (with custom day picker) and the previous N days summary; passes the inbox dates for the "How old is your inbox" strip |
| `TAB_Yesterday.vue` | Same dashboard for yesterday (or the last business day with `bday_use_last_business_day`), without the comparison card |
| `TAB_ManyDays.vue` | Last `_many_days` days plus today: loads the period, the inbox and the previous period, builds the dashboard with `tsPeriodModel` and renders `WidgetPeriodDashboard` |
| `TAB_CustomQry.vue` | Query panel (period, Period B when comparing, "Compare periods" and "Working days only" switches, Run query, quick range chips, active filter chips, advanced filters panel) and the results: a one-day range renders `WidgetDayDashboard` (`kind: 'day'`, "Query result" badge, weekday baseline and previous 7 days loaded apart), a longer range renders `WidgetPeriodDashboard` (`kind: 'custom'`) with the Days / Weeks / Months / Years toggle of the main chart and Period B. Zoom on the main chart: the selected bars become `zoom_days` (the days they cover) with the default grouping for their length; the reset goes back to the whole range, "Run the query on this period" sets the dates to the zoomed days (Period B start moved by the same offset), keeps the filters and runs the query; every new query clears the zoom |
| `TAB_Info.vue` | About page with version and credits |

---

## Chart Components (`src/components/charts/`)

All charts use `chart.js` v4 with `vue-chartjs` as the Vue wrapper. Colors come from the CSS tokens (`themeColor`) and are recomputed when the theme changes.

| File | Description |
|---|---|
| `ChartDayVsNormal.vue` | Line chart of a single day (cumulative or hourly, per `_time_chart_progressive`): received and sent lines with an end dot, usual-range band of the same weekday, optional dashed comparison day, dashed "now" line and an HTML callout kept on its left |
| `ChartPeriodDays.vue` | Grouped bars per day, week, month or year (received, optionally with the mails still in the inbox stacked in `--warn`; sent), today lighter, non-business days with muted labels, dashed average lines with label chips (first left, second right); optional Period B as dotted lines; with `selectable`, dragging selects a range of at least 2 bars (`chart-range-select.js`) and emits `zoom(from_index, to_index)` |
| `ChartHourlyAverage.vue` | Average received / sent per hour of the day, lines with a light area fill; optional Period B as dashed lines |

---

## Counter Components (`src/components/counters/`)

| File | Description |
|---|---|
| `CounterKpi.vue` | KPI card: uppercase label, big value, delta, aside text, sub line, optional second sub line, default slot (Inbox Zero strip). With `expandable` a toggle button (chevron, `expanded` state) sits next to the label and emits `toggle`; `link` adds a text button under the sub lines that emits `expand` |
| `CounterYesterdayThisTime.vue` | Compares current count to yesterday (or last business day, or user-chosen day) at the same time. The day label is clickable and opens an inline date picker to select a custom comparison day. Emits `customDaySelected` event. |
| `CounterManyDays_Table.vue` | Total/max/min/avg sent and received over the previous `_many_days` days (excluding today); used in Today and Yesterday |

---

## Widget Components (`src/components/widgets/`)

| File | Description |
|---|---|
| `WidgetDayDashboard.vue` | Single-day layout: status strip, KPI row, chart card + right rail (top correspondents + `rail` slot), full recipients/senders tables when "See all" is open, domains + folders/tags row. The KPI with `expandable` (Inbox backlog) opens `WidgetInboxAge` as a full-width strip right under the KPI row, from its toggle or its link (`inbox_dates`, `inbox_loading` props); the open state is the `inbox_age_expanded` pref, saved on every toggle and kept in sync through `storage.onChanged` across the single-day tabs and the options page |
| `WidgetPeriodDashboard.vue` | Many-days layout: status strip, KPI grid, main chart (optional grouping toggle, emits `aggregation`; with `zoomable`, a "Drag on the chart to zoom" hint, or the zoomed range chip with its reset and the "Run the query on this period" link, emits `zoom`, `zoom_reset`, `zoom_query`), time of day + Inbox Zero calendar, heatmap + weekday bars, domains + folders/tags, Top N recipients + senders, `bottom` slot |
| `WidgetStatusStrip.vue` | Status badge (good / warn / neutral), date lines, flow values (Arrived → Filed or answered → Still in inbox), side values and the proportional bar |
| `WidgetTopCorrespondents.vue` | Rail card: top 5 merged senders/recipients with stacked bars (received part in `--rcvd`, sent part in `--sent`) and a "See all" toggle |
| `WidgetDomainBars.vue` | Domains as two horizontal bars (sent, received) with the "internal" tag and optional Period B values; first 8 rows, expandable |
| `WidgetEndedUp.vue` | "Where mails ended up": Folders / Tags toggle; inbox bar in `--rcvd`, filed folders in `--good`, tags in their own color; optional Period B values; computed footnote. Folder rows open the folder in Thunderbird (`tsCoreUtils.openFolder`, first mail tab with `inbox0_openFolderInFirstTab`); an info icon explains that folder counts include duplicates when `filter_duplicates` is on |
| `WidgetInboxAge.vue` | "How old is your inbox" strip: mails still in the inbox by age (today, yesterday, 2–7 days, 8–30 days, 1–3 months, older) as one stacked horizontal bar (segments sized by count, from a light `--rcvd` for the freshest to `--warn` for older than a month, tooltip with count and share) and a legend with the counts, plus a note; "Details by date", next to the title, shows one row per arrival date, sortable by date or by mails; the Hide button emits `close` |
| `WidgetInboxZeroCalendar.vue` | Inbox Zero calendar: one cell per day aligned on the first day of the week (at most the last 6 weeks), states closed at zero / ≤ 5 left / missed, today outlined; days at zero and streak at end |
| `WidgetHeatmap.vue` | "When mail arrives": received mails by hour (rows) and weekday (columns), 07–20 / 24h toggle, cell color mixes `--rcvd` with `--surface3` |
| `WidgetWeekdayBars.vue` | Average received / sent per weekday as paired columns, average received on top, optional Period B average, computed note |

---

## Options Page (`src/views/OptionsView.vue`, `src/components/options_tabs/`, `src/components/options/`)

Sidebar + card layout on the dashboard tokens (`tokens.css`, plus `--bg`, `--switchOff`, `--onAccent`; page styles in `src/assets/options.css`). `OptionsView` loads every pref (`browser.storage.sync.get(prefs_default)`) into a reactive object and provides it as `optPrefs` = `{ values, set(key, value, debounce) }`; `set` writes to storage at once (number and text inputs debounce 400 ms) and shows the "Reload ThunderStats" header button (`reloadThunderStats` message to the background, then closes the tab). The header is sticky at the top of the page so the reload button stays visible while scrolling (the sidebar sticks just below it). `theme_mode` goes through `tsTheme.setMode` and applies live. External storage changes (e.g. the toolbar theme toggle) update `values`. It also provides `optGoto(section)`. The section is in the URL hash (`#general`, `#advanced`, `#business`, `#identities`, `#about`). There is no Save button anywhere. Strings come from `browser.i18n.getMessage` (no `__MSG_` placeholders, so the `v-if` sections are always localized).

| File | Description |
|---|---|
| `OPTAB_Main.vue` | General: Startup (startup account select, disabled while "remember the last used account" is on), Loading data, Today & Yesterday chart, Many days & Custom (`_many_days`, date picker locale with a "Set default" button), Inbox Zero (`many_days_show_inbox`, `inbox0_openFolderInFirstTab`, `inbox_age_expanded`), Internal mail (disabled while off and no internal domain is set, link to Identities & domains), Appearance (`theme_mode`, `time_format`) |
| `OPTAB_Advanced.vue` | Archive folders (global switches + per-account grid saved in `accounts_adv_settings`), Other (first day of the week saved as a number, Top rows, long period warning), Performance & troubleshooting (concurrent queries, recent days cache, debug) |
| `OPTAB_BusinessDays.vue` | Working week day buttons (ordered by `first_day_week`, short names from `Intl`), business-days switches, Non-Business Days card (`bday_custom_days`: sorted by month/day, inline add/edit form opened by "Add non-business day" or by clicking a row, day validated against the month, empty name → "Non-Business Day", "Every year" or "<year> only", delete with confirm), Easter row with this year's dates |
| `OPTAB_CustomIds.vue` | Identities & domains: pill account switcher, read-only account identities, custom identities and internal domains as tag inputs (per account in `custom_identities` / `internal_domains`, saved lowercase) |
| `OPTAB_About.vue` | Donation banner, release notes accordion parsed from `CHANGELOG.md` (+ `CHANGELOG_v1.md` on request; latest version open, empty entries skipped; each entry is parsed with `DOMParser` and rendered as Vue nodes keeping only text, http(s) links and bold/italic, no `v-html`), license card with expandable full text and attributions link |
| `options/OptRow.vue` | Setting row: label, optional hint (or `hint` slot), control on the right; with `pref` it renders an `OptSwitch` bound to that boolean option |
| `options/OptSwitch.vue` | Toggle switch (`role="switch"`, `aria-checked`, animated knob) |
| `options/OptNumber.vue` | Number input bound to a pref: valid values saved while typing (debounced), clamped to `[min, max]` on change |
| `options/OptTagInput.vue` | Chip input: Enter, comma or blur adds; pasted text split on commas/whitespace; duplicates ignored; invalid entries stay in the field with a message; invalid stored entries get a warning border; Backspace on an empty field removes the last chip |

---

## Other Components

| File | Description |
|---|---|
| `HeadingNAV.vue` | Sticky toolbar on a three-column grid (left and right sides of equal width, so the centered tabs and the right-aligned icons never move when the side contents change; falls back to wrapping flex below 900px). Left: brand, account pill (`SelectAccount`), business-days-only icon. Center: tab segmented control (tabs list passed by `ThunderStatsView`, emits `selectTab`). Right: warning message, last-update time, Refresh / Export / Settings / Info icon buttons (Export emits `exportData` with the button as anchor), `ThemeToggle`. Applies the startup/remembered account |
| `ThemeToggle.vue` | Round theme toggle icon (sun morphing into a moon, title names the theme it switches to, `tsTheme.setMode`); in the dashboard toolbar and the options header |
| `SelectAccount.vue` | Account dropdown (native `select`) |
| `ExportMenu.vue` | CSV export menu, embedded in each stats tab (uses `@imengyu/vue3-context-menu`). Its own icon is hidden; each tab exposes `openExportMenu(anchor_el)`, which `ThunderStatsView` calls when the toolbar Export button is clicked |
| `tables/TableInvolved.vue` | Ranked list of top senders or recipients: rank, name over address, bar, count. `kind` = `sent` (recipients, `--sent` bars) or `rcvd` (senders) |

---

## Third-Party Component Libraries

| Library | Usage |
|---|---|
| `vue3-tabs-component` | Tab panels in the main view (its tab strip is hidden; `HeadingNAV` drives `selectTab`) |
| `@vueform/multiselect` | Folders filter of the Custom Query |
| `@vuepic/vue-datepicker` | Date pickers of the Custom Query and of the comparison day (Today) |
| `@imengyu/vue3-context-menu` | Export menu |
| `vue-chartjs` + `chart.js` | All chart components |
