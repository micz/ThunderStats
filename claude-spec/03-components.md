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
        │       └── bottom slot: WidgetInboxAge.vue
        ├── TAB_Yesterday.vue
        │   └── (same as Today, without CounterYesterdayThisTime)
        ├── TAB_ManyDays.vue
        │   ├── ExportMenu.vue
        │   └── WidgetPeriodDashboard.vue
        ├── TAB_CustomQry.vue
        │   ├── ExportMenu.vue
        │   ├── query panel (VueDatePicker, Multiselect for the folders filter)
        │   ├── WidgetDayDashboard.vue      (one-day range; bottom slot: WidgetInboxAge.vue)
        │   └── WidgetPeriodDashboard.vue   (longer range)
        └── TAB_Info.vue

Widget children:
    WidgetDayDashboard.vue    → WidgetStatusStrip, CounterKpi, ChartDayVsNormal, WidgetTopCorrespondents,
                                TableInvolved (when "See all" is open), WidgetDomainBars, WidgetEndedUp
    WidgetPeriodDashboard.vue → WidgetStatusStrip, CounterKpi, ChartPeriodDays, ChartHourlyAverage, WidgetInboxZeroCalendar,
                                WidgetHeatmap, WidgetWeekdayBars, WidgetDomainBars, WidgetEndedUp, TableInvolved

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
| `TAB_Today.vue` | Today (midnight to now): loads the day, inbox, previous days, comparison day and weekday baseline, builds the dashboard with `tsDayModel` and renders `WidgetDayDashboard`; rail adds the "yesterday at this time" comparison (with custom day picker) and the previous N days summary; bottom adds "How old is your inbox" |
| `TAB_Yesterday.vue` | Same dashboard for yesterday (or the last business day with `bday_use_last_business_day`), without the comparison card |
| `TAB_ManyDays.vue` | Last `_many_days` days plus today: loads the period, the inbox and the previous period, builds the dashboard with `tsPeriodModel` and renders `WidgetPeriodDashboard` |
| `TAB_CustomQry.vue` | Query panel (period, Period B when comparing, "Compare periods" and "Working days only" switches, Run query, quick range chips, active filter chips, advanced filters panel) and the results: a one-day range renders `WidgetDayDashboard` (`kind: 'day'`, "Query result" badge, weekday baseline and previous 7 days loaded apart), a longer range renders `WidgetPeriodDashboard` (`kind: 'custom'`) with the Days / Weeks / Months / Years toggle of the main chart and Period B |
| `TAB_Info.vue` | About page with version and credits |

---

## Chart Components (`src/components/charts/`)

All charts use `chart.js` v4 with `vue-chartjs` as the Vue wrapper. Colors come from the CSS tokens (`themeColor`) and are recomputed when the theme changes.

| File | Description |
|---|---|
| `ChartDayVsNormal.vue` | Line chart of a single day (cumulative or hourly, per `_time_chart_progressive`): received and sent lines with an end dot, usual-range band of the same weekday, optional dashed comparison day, dashed "now" line and an HTML callout kept on its left |
| `ChartPeriodDays.vue` | Grouped bars per day, week, month or year (received, optionally with the mails still in the inbox stacked in `--warn`; sent), today lighter, non-business days with muted labels, dashed average lines with label chips (first left, second right); optional Period B as dotted lines |
| `ChartHourlyAverage.vue` | Average received / sent per hour of the day, lines with a light area fill; optional Period B as dashed lines |

---

## Counter Components (`src/components/counters/`)

| File | Description |
|---|---|
| `CounterKpi.vue` | KPI card: uppercase label, big value, delta, aside text, sub line, optional second sub line, default slot (Inbox Zero strip) |
| `CounterYesterdayThisTime.vue` | Compares current count to yesterday (or last business day, or user-chosen day) at the same time. The day label is clickable and opens an inline date picker to select a custom comparison day. Emits `customDaySelected` event. |
| `CounterManyDays_Table.vue` | Total/max/min/avg sent and received over the previous `_many_days` days (excluding today); used in Today and Yesterday |

---

## Widget Components (`src/components/widgets/`)

| File | Description |
|---|---|
| `WidgetDayDashboard.vue` | Single-day layout: status strip, KPI row, chart card + right rail (top correspondents + `rail` slot), full recipients/senders tables when "See all" is open, domains + folders/tags row, `bottom` slot (a single card keeps one column width) |
| `WidgetPeriodDashboard.vue` | Many-days layout: status strip, KPI grid, main chart (optional grouping toggle, emits `aggregation`), time of day + Inbox Zero calendar, heatmap + weekday bars, domains + folders/tags, Top N recipients + senders, `bottom` slot |
| `WidgetStatusStrip.vue` | Status badge (good / warn / neutral), date lines, flow values (Arrived → Filed or answered → Still in inbox), side values and the proportional bar |
| `WidgetTopCorrespondents.vue` | Rail card: top 5 merged senders/recipients with bars (`--rcvd` if mostly received, `--sent` otherwise) and a "See all" toggle |
| `WidgetDomainBars.vue` | Domains as two horizontal bars (sent, received) with the "internal" tag and optional Period B values; first 8 rows, expandable |
| `WidgetEndedUp.vue` | "Where mails ended up": Folders / Tags toggle; inbox bar in `--rcvd`, filed folders in `--good`, tags in their own color; optional Period B values; computed footnote. Folder rows open the folder in Thunderbird (`tsCoreUtils.openFolder`, first mail tab with `inbox0_openFolderInFirstTab`); an info icon explains that folder counts include duplicates when `filter_duplicates` is on |
| `WidgetInboxAge.vue` | "How old is your inbox": mails still in the inbox by age (today, yesterday, 2–7 days, 8–30 days, 1–3 months, older; older than a month in `--warn`) with a note; "Details by date" shows one row per arrival date, sortable by date or by mails |
| `WidgetInboxZeroCalendar.vue` | Inbox Zero calendar: one cell per day aligned on the first day of the week (at most the last 6 weeks), states closed at zero / ≤ 5 left / missed, today outlined; days at zero and streak at end |
| `WidgetHeatmap.vue` | "When mail arrives": received mails by hour (rows) and weekday (columns), 07–20 / 24h toggle, cell color mixes `--rcvd` with `--surface3` |
| `WidgetWeekdayBars.vue` | Average received / sent per weekday as paired columns, average received on top, optional Period B average, computed note |

---

## Options Tab Components (`src/components/options_tabs/`)

| File | Description |
|---|---|
| `OPTAB_Main.vue` | General settings: startup/remembered account and tab, data reload behavior, many-days count and inbox bars, time chart options, folders (open in the first tab), custom query loading, date picker locale, internal mail %, color theme |
| `OPTAB_Advanced.vue` | Advanced settings: number of correspondents, first day of week, long-period warning, archive inclusion and duplicate filtering (global and per account), debug |
| `OPTAB_BusinessDays.vue` | Business weekdays, custom holidays, Easter, "business days only" default, compare with last business day |
| `OPTAB_CustomIds.vue` | "Identities & Domains" tab: define custom email identities for sent mail detection, and configure per-account Internal Domains (domain lists that identify domains belonging to the user's organization, used to distinguish internal from external email traffic) |
| `OPTAB_License.vue` | Displays the GPL v3 license text |
| `OPTAB_Info.vue` | Add-on version and info |

---

## Other Components

| File | Description |
|---|---|
| `HeadingNAV.vue` | Sticky toolbar: brand, account pill (`SelectAccount`), tab segmented control (tabs list passed by `ThunderStatsView`, emits `selectTab`), last-update time, Refresh / Export / Settings / Info icon buttons (Export emits `exportData` with the button as anchor), round theme toggle icon (sun morphing into a moon, title names the theme it switches to, `tsTheme.setMode`). Applies the startup/remembered account |
| `SelectAccount.vue` | Account dropdown (native `select`) |
| `ExportMenu.vue` | CSV export menu, embedded in each stats tab (uses `@imengyu/vue3-context-menu`). Its own icon is hidden; each tab exposes `openExportMenu(anchor_el)`, which `ThunderStatsView` calls when the toolbar Export button is clicked |
| `AdvancedAccountList.vue` | Per-account advanced settings list (in `OPTAB_Advanced`) |
| `OptionDonationHeader.vue` | Donation banner (in `OPTAB_Info` and `OPTAB_License`) |
| `OptionDonationFooter.vue` | Donation banner at the bottom of `OptionsView` |
| `tables/TableInvolved.vue` | Ranked list of top senders or recipients: rank, name over address, bar, count. `kind` = `sent` (recipients, `--sent` bars) or `rcvd` (senders) |

---

## Third-Party Component Libraries

| Library | Usage |
|---|---|
| `vue3-tabs-component` | Tab panels in the main view (its tab strip is hidden; `HeadingNAV` drives `selectTab`) and tab navigation in the options view |
| `@vueform/multiselect` | Folders filter of the Custom Query |
| `@vuepic/vue-datepicker` | Date pickers of the Custom Query, of the comparison day (Today) and of the holidays (Business Days options) |
| `@imengyu/vue3-context-menu` | Export menu |
| `vue-chartjs` + `chart.js` | All chart components |
