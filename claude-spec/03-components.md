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
        │       ├── rail slot:   CounterYesterdayThisTime.vue, CounterManyDays_Table.vue (previous N days summary)
        │       └── bottom slot: WidgetInboxZero.vue
        ├── TAB_Yesterday.vue
        │   └── (same as Today, without CounterYesterdayThisTime)
        ├── TAB_ManyDays.vue
        │   ├── ExportMenu.vue
        │   └── WidgetPeriodDashboard.vue
        ├── TAB_CustomQry.vue
        │   ├── ExportMenu.vue
        │   ├── CounterSentReceived.vue     (single-day mode only)
        │   ├── WidgetInboxZero.vue         (single-day mode only)
        │   ├── CounterManyDays_Row.vue     (multi-day mode)
        │   ├── ChartCustomQry.vue          (multi-day mode)
        │   ├── ChartTime.vue
        │   ├── WidgetWeekDay.vue
        │   ├── TableInvolved.vue
        │   ├── WidgetDomains.vue
        │   └── WidgetFoldersTags.vue
        └── TAB_Info.vue

Widget / counter children:
    WidgetDayDashboard.vue  → WidgetStatusStrip, CounterKpi, ChartDayVsNormal, WidgetTopCorrespondents,
                              TableInvolved (when "See all" is open), WidgetDomainBars, WidgetEndedUp
    WidgetPeriodDashboard.vue → WidgetStatusStrip, CounterKpi, ChartPeriodDays, ChartHourlyAverage, WidgetInboxZeroCalendar,
                              WidgetHeatmap, WidgetWeekdayBars, WidgetDomainBars, WidgetEndedUp, TableInvolved
    WidgetInboxZero.vue     → CounterInbox, CounterInboxPercent, ChartInboxZeroDates,
                              ChartInboxZeroDatesExtended, ChartInboxZeroFolders, InfoTooltip
    WidgetDomains.vue       → ChartDomains
    WidgetFoldersTags.vue   → ChartFolders, ChartTags
    WidgetWeekDay.vue       → ChartWeekDays
    CounterManyDays_Row.vue → InfoTooltip

App_Options.vue
└── OptionsView.vue
    ├── OptionDonationFooter.vue
    └── [options tab navigation]
        ├── OPTAB_Main.vue          → SelectAccount
        ├── OPTAB_Advanced.vue      → AdvancedAccountList
        ├── OPTAB_BusinessDays.vue
        ├── OPTAB_CustomIds.vue     → SelectAccount
        ├── OPTAB_License.vue       → OptionDonationHeader
        └── OPTAB_Info.vue          → OptionDonationHeader
```

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
| `TAB_Today.vue` | Today (midnight to now): loads the day, inbox, previous days, comparison day and weekday baseline, builds the dashboard with `tsDayModel` and renders `WidgetDayDashboard`; rail adds the "yesterday at this time" comparison (with custom day picker) and the previous N days summary; bottom adds the Inbox Zero widget |
| `TAB_Yesterday.vue` | Same dashboard for yesterday (or the last business day with `bday_use_last_business_day`), without the comparison card |
| `TAB_ManyDays.vue` | Last `_many_days` days plus today: loads the period, the inbox and the previous period, builds the dashboard with `tsPeriodModel` and renders `WidgetPeriodDashboard` |
| `TAB_CustomQry.vue` | Advanced query with date range picker and presets, filters (read/unread, starred, subject, folders), aggregation level selector, period comparison, and CSV export. A one-day range switches to single-day mode (Today-like counters and inbox zero) |
| `TAB_Info.vue` | About page with version and credits |

---

## Chart Components (`src/components/charts/`)

All charts use `chart.js` v4 with `vue-chartjs` as the Vue wrapper.

| File | Description |
|---|---|
| `ChartTime.vue` | Hourly sent/received distribution (bar chart) |
| `ChartDayVsNormal.vue` | Line chart of a single day (cumulative or hourly, per `_time_chart_progressive`): received and sent lines with an end dot, usual-range band of the same weekday, optional dashed comparison day, dashed "now" line and an HTML callout kept on its left. Colors from the CSS tokens, recomputed on theme change |
| `ChartWeekDays.vue` | Sent/received per weekday |
| `ChartPeriodDays.vue` | Day-by-day grouped bars (received, optionally with the mails still in the inbox stacked in `--warn`; sent), today lighter, non-business days with muted labels, dashed average lines with label chips (first left, second right) |
| `ChartHourlyAverage.vue` | Average received / sent per hour of the day, lines with a light area fill |
| `ChartCustomQry.vue` | Chart for custom query results, adapts to selected aggregation level. Accepts `is_comparing` prop to enable legend, tooltips, and suppress Period B datalabels when comparing periods. |
| `ChartInboxZeroDates.vue` | Timeline of inbox zero achievements |
| `ChartInboxZeroDatesExtended.vue` | Extended inbox zero history |
| `ChartInboxZeroFolders.vue` | Inbox zero by folder |
| `ChartTags.vue` | Email count by tag (doughnut/bar) |
| `ChartFolders.vue` | Email count by folder |
| `ChartDomains.vue` | Email count by sender domain |

---

## Counter Components (`src/components/counters/`)

Small display components that show a single statistic value.

| File | Description |
|---|---|
| `CounterSentReceived.vue` | Shows total sent and received counts. Accepts optional `show_internal_percent` and `internal_percent` props to display the internal mail percentage (based on configured internal domains) when enabled. |
| `CounterInbox.vue` | Shows current inbox count |
| `CounterInboxPercent.vue` | Shows inbox zero percentage |
| `CounterYesterdayThisTime.vue` | Compares current count to yesterday (or last business day, or user-chosen day) at the same time. The day label is clickable and opens an inline date picker to select a custom comparison day. Emits `customDaySelected` event. |
| `CounterManyDays_Table.vue` | Total/max/min/avg sent and received over the previous `_many_days` days (excluding today); used in Today and Yesterday |
| `CounterManyDays_Row.vue` | Total/max/min/avg row for a period; used in Many Days and Custom Query |
| `CounterKpi.vue` | KPI card: uppercase label, big value, delta, aside text, sub line, default slot (Inbox Zero strip) |

---

## Widget Components (`src/components/widgets/`)

Composite components that combine multiple data points or sub-charts.

| File | Description |
|---|---|
| `WidgetDomains.vue` | Wraps `ChartDomains` |
| `WidgetFoldersTags.vue` | Folder and tag distribution (wraps `ChartFolders`, `ChartTags`) |
| `WidgetWeekDay.vue` | Thin wrapper around `ChartWeekDays` |
| `WidgetInboxZero.vue` | Inbox Zero section: inbox counters and inbox zero charts |
| `WidgetDayDashboard.vue` | Single-day layout: status strip, KPI row, chart card + right rail (top correspondents + `rail` slot), full recipients/senders tables when "See all" is open, domains + folders/tags row, `bottom` slot |
| `WidgetStatusStrip.vue` | Status badge (good / warn / neutral), date lines, flow values (Arrived → Filed or answered → Still in inbox), side values and the proportional bar. Generic, reusable by the period views |
| `WidgetTopCorrespondents.vue` | Rail card: top 5 merged senders/recipients with bars (`--rcvd` if mostly received, `--sent` otherwise) and a "See all" toggle |
| `WidgetDomainBars.vue` | Domains as two horizontal bars (sent, received) with the "internal" tag; first 8 rows, expandable |
| `WidgetEndedUp.vue` | "Where mails ended up": Folders / Tags toggle; inbox bar in `--rcvd`, filed folders in `--good`, tags in their own color; computed footnote |
| `WidgetPeriodDashboard.vue` | Many-days layout: status strip, KPI grid, day-by-day chart, time of day + Inbox Zero calendar, heatmap + weekday bars, domains + folders/tags, Top N recipients + senders, `bottom` slot |
| `WidgetInboxZeroCalendar.vue` | Inbox Zero calendar: one cell per day aligned on the first day of the week, states closed at zero / ≤ 5 left / missed, today outlined; days at zero and streak at end |
| `WidgetHeatmap.vue` | "When mail arrives": received mails by hour (rows) and weekday (columns), 07–20 / 24h toggle, cell color mixes `--rcvd` with `--surface3` |
| `WidgetWeekdayBars.vue` | Average received / sent per weekday as paired columns, average received on top, computed note |

---

## Options Tab Components (`src/components/options_tabs/`)

| File | Description |
|---|---|
| `OPTAB_Main.vue` | General settings: startup/remembered account and tab, data reload behavior, many-days count and inbox bars, time chart options, custom query loading, date picker locale, inbox %, internal mail % |
| `OPTAB_Advanced.vue` | Advanced settings: number of correspondents, first day of week, long-period warning, archive inclusion and duplicate filtering (global and per account), debug |
| `OPTAB_BusinessDays.vue` | Business weekdays, custom holidays, Easter, "business days only" default, compare with last business day |
| `OPTAB_CustomIds.vue` | "Identities & Domains" tab: define custom email identities for sent mail detection, and configure per-account Internal Domains (domain lists that identify domains belonging to the user's organization, used to distinguish internal from external email traffic) |
| `OPTAB_License.vue` | Displays the GPL v3 license text |
| `OPTAB_Info.vue` | Add-on version and info |

---

## Other Components

| File | Description |
|---|---|
| `HeadingNAV.vue` | Sticky toolbar: brand, account pill (`SelectAccount`), tab segmented control (tabs list passed by `ThunderStatsView`, emits `selectTab`), last-update time, Refresh / Export / Settings / Info icon buttons (Export emits `exportData` with the button as anchor), Light/Dark switch (`tsTheme.setMode`). Applies the startup/remembered account |
| `SelectAccount.vue` | Account dropdown (uses `@vueform/multiselect`) |
| `ExportMenu.vue` | CSV export menu, embedded in each stats tab (uses `@imengyu/vue3-context-menu`). Its own icon is hidden; each tab exposes `openExportMenu(anchor_el)`, which `ThunderStatsView` calls when the toolbar Export button is clicked |
| `AdvancedAccountList.vue` | Per-account advanced settings list (in `OPTAB_Advanced`) |
| `InfoTooltip.vue` | Reusable info tooltip icon |
| `OptionDonationHeader.vue` | Donation banner (in `OPTAB_Info` and `OPTAB_License`) |
| `OptionDonationFooter.vue` | Donation banner at the bottom of `OptionsView` |
| `tables/TableInvolved.vue` | Ranked list of top senders or recipients: rank, name over address, bar, count. `kind` = `sent` (recipients, `--sent` bars) or `rcvd` (senders) |

---

## Third-Party Component Libraries

| Library | Usage |
|---|---|
| `vue3-tabs-component` | Tab panels in the main view (its tab strip is hidden; `HeadingNAV` drives `selectTab`) and tab navigation in the options view |
| `@vueform/multiselect` | Account selector dropdown |
| `@vuepic/vue-datepicker` | Date range picker in Custom Query tab |
| `@imengyu/vue3-context-menu` | Right-click export context menu |
| `vue-chartjs` + `chart.js` | All chart components |
| `chartjs-plugin-datalabels` | Data labels on charts |
