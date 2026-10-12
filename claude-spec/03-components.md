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
        │   ├── CounterSentReceived.vue
        │   ├── CounterYesterdayThisTime.vue
        │   ├── CounterManyDays_Table.vue   (previous N days summary)
        │   ├── ChartTime.vue
        │   ├── WidgetInboxZero.vue
        │   ├── TableInvolved.vue
        │   ├── WidgetDomains.vue
        │   └── WidgetFoldersTags.vue
        ├── TAB_Yesterday.vue
        │   └── (same as Today, without CounterYesterdayThisTime)
        ├── TAB_ManyDays.vue
        │   ├── ExportMenu.vue
        │   ├── CounterManyDays_Row.vue
        │   ├── ChartManyDays.vue
        │   ├── ChartTime.vue
        │   ├── WidgetWeekDay.vue
        │   ├── TableInvolved.vue
        │   ├── WidgetDomains.vue
        │   └── WidgetFoldersTags.vue
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
| `TAB_Today.vue` | Statistics for today: sent/received counts, comparison with yesterday at this time, previous N days summary, time chart, inbox zero, top correspondents, domain/folder/tag widgets |
| `TAB_Yesterday.vue` | Same layout as Today (without the "yesterday at this time" comparison) for yesterday's data |
| `TAB_ManyDays.vue` | Multi-day overview (`_many_days` pref, default 7): daily chart, total/max/min/avg, time and weekday charts, correspondents, domains, folders/tags |
| `TAB_CustomQry.vue` | Advanced query with date range picker and presets, filters (read/unread, starred, subject, folders), aggregation level selector, period comparison, and CSV export. A one-day range switches to single-day mode (Today-like counters and inbox zero) |
| `TAB_Info.vue` | About page with version and credits |

---

## Chart Components (`src/components/charts/`)

All charts use `chart.js` v4 with `vue-chartjs` as the Vue wrapper.

| File | Description |
|---|---|
| `ChartTime.vue` | Hourly sent/received distribution (bar chart) |
| `ChartWeekDays.vue` | Sent/received per weekday |
| `ChartManyDays.vue` | Daily bar chart for the Many Days tab. Supports stacked bars (used by the Received chart to show inbox messages as a red segment on top of non-inbox). Datalabels show stacked totals. |
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

---

## Widget Components (`src/components/widgets/`)

Composite components that combine multiple data points or sub-charts.

| File | Description |
|---|---|
| `WidgetDomains.vue` | Wraps `ChartDomains` |
| `WidgetFoldersTags.vue` | Folder and tag distribution (wraps `ChartFolders`, `ChartTags`) |
| `WidgetWeekDay.vue` | Thin wrapper around `ChartWeekDays` |
| `WidgetInboxZero.vue` | Inbox Zero section: inbox counters and inbox zero charts |

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
| `HeadingNAV.vue` | Top navigation bar; contains `SelectAccount` and applies the startup/remembered account |
| `SelectAccount.vue` | Account dropdown (uses `@vueform/multiselect`) |
| `ExportMenu.vue` | CSV export menu, embedded in each stats tab (uses `@imengyu/vue3-context-menu`) |
| `AdvancedAccountList.vue` | Per-account advanced settings list (in `OPTAB_Advanced`) |
| `InfoTooltip.vue` | Reusable info tooltip icon |
| `OptionDonationHeader.vue` | Donation banner (in `OPTAB_Info` and `OPTAB_License`) |
| `OptionDonationFooter.vue` | Donation banner at the bottom of `OptionsView` |
| `tables/TableInvolved.vue` | Table of top senders and recipients |

---

## Third-Party Component Libraries

| Library | Usage |
|---|---|
| `vue3-tabs-component` | Tab navigation in main and options views |
| `@vueform/multiselect` | Account selector dropdown |
| `@vuepic/vue-datepicker` | Date range picker in Custom Query tab |
| `@imengyu/vue3-context-menu` | Right-click export context menu |
| `vue-chartjs` + `chart.js` | All chart components |
| `chartjs-plugin-datalabels` | Data labels on charts |
