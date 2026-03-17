# ThunderStats — Vue Components

## Component Hierarchy

```
App_ThunderStats.vue
└── ThunderStatsView.vue
    ├── HeadingNAV.vue              (account selector + navigation)
    ├── SelectAccount.vue           (account dropdown)
    ├── ExportMenu.vue              (CSV export trigger)
    └── [tab-based navigation]
        ├── TAB_Today.vue
        │   ├── CounterSentReceived.vue
        │   ├── CounterInbox.vue
        │   ├── CounterInboxPercent.vue
        │   ├── CounterYesterdayThisTime.vue
        │   ├── ChartTime.vue
        │   ├── ChartWeekDays.vue
        │   ├── WidgetDomains.vue
        │   ├── WidgetFoldersTags.vue
        │   ├── WidgetInboxZero.vue
        │   │   ├── ChartInboxZeroDates.vue
        │   │   ├── ChartInboxZeroDatesExtended.vue
        │   │   └── ChartInboxZeroFolders.vue
        │   └── TableInvolved.vue
        ├── TAB_Yesterday.vue
        │   └── (same counter/chart structure as Today)
        ├── TAB_ManyDays.vue
        │   ├── CounterManyDays_Table.vue
        │   ├── CounterManyDays_Row.vue
        │   ├── ChartManyDays.vue
        │   ├── ChartTime.vue
        │   └── ChartWeekDays.vue
        ├── TAB_CustomQry.vue
        │   ├── ChartCustomQry.vue
        │   ├── ChartTime.vue
        │   ├── ChartWeekDays.vue
        │   ├── ChartTags.vue
        │   ├── ChartFolders.vue
        │   ├── ChartDomains.vue
        │   └── TableInvolved.vue
        └── TAB_Info.vue

App_Options.vue
└── OptionsView.vue
    ├── OptionDonationHeader.vue
    ├── OptionDonationFooter.vue
    ├── AdvancedAccountList.vue
    └── [options tab navigation]
        ├── OPTAB_Main.vue
        ├── OPTAB_Advanced.vue
        ├── OPTAB_BusinessDays.vue
        ├── OPTAB_CustomIds.vue
        ├── OPTAB_License.vue
        └── OPTAB_Info.vue
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
| `TAB_Today.vue` | Statistics for today: sent/received counts, time chart, top correspondents, domain/folder/tag widgets, inbox zero |
| `TAB_Yesterday.vue` | Same layout as Today but for yesterday's data |
| `TAB_ManyDays.vue` | Multi-day overview (default: last 7 days + today), aggregated charts |
| `TAB_CustomQry.vue` | Advanced query with date range picker, filters (read/unread, starred, subject, folders), aggregation level selector, and CSV export |
| `TAB_Info.vue` | About page with version and credits |

---

## Chart Components (`src/components/charts/`)

All charts use `chart.js` v4 with `vue-chartjs` as the Vue wrapper.

| File | Description |
|---|---|
| `ChartTime.vue` | Hourly sent/received distribution (bar chart) |
| `ChartWeekDays.vue` | Sent/received per weekday |
| `ChartManyDays.vue` | Daily/weekly/monthly/yearly bar chart for a date range. Supports stacked bars (used by the Received chart to show inbox messages as a red segment on top of non-inbox). Datalabels show stacked totals. |
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
| `CounterSentReceived.vue` | Shows total sent and received counts |
| `CounterInbox.vue` | Shows current inbox count |
| `CounterInboxPercent.vue` | Shows inbox zero percentage |
| `CounterYesterdayThisTime.vue` | Compares current count to yesterday (or last business day, or user-chosen day) at the same time. The day label is clickable and opens an inline date picker to select a custom comparison day. Emits `customDaySelected` event. |
| `CounterManyDays_Table.vue` | Summary table (max/min/avg) for many-days view |
| `CounterManyDays_Row.vue` | A single row within the many-days summary table |

---

## Widget Components (`src/components/widgets/`)

Composite components that combine multiple data points or sub-charts.

| File | Description |
|---|---|
| `WidgetDomains.vue` | Shows top email domains with counts |
| `WidgetFoldersTags.vue` | Shows folder and tag distribution |
| `WidgetWeekDay.vue` | Highlights the busiest weekday |
| `WidgetInboxZero.vue` | Inbox Zero summary with embedded charts |

---

## Options Tab Components (`src/components/options_tabs/`)

| File | Description |
|---|---|
| `OPTAB_Main.vue` | Basic settings (number of days, involved count, etc.) |
| `OPTAB_Advanced.vue` | Advanced settings (duplicate filtering, archive inclusion, per-account settings) |
| `OPTAB_BusinessDays.vue` | Configure which days are business days; define custom holidays; Easter detection |
| `OPTAB_CustomIds.vue` | Define custom email identities for sent mail detection |
| `OPTAB_License.vue` | Displays the GPL v3 license text |
| `OPTAB_Info.vue` | Add-on version and info |

---

## Other Components

| File | Description |
|---|---|
| `HeadingNAV.vue` | Top navigation bar with account selector and controls |
| `SelectAccount.vue` | Account dropdown (uses `@vueform/multiselect`) |
| `ExportMenu.vue` | Context menu for CSV export (uses `@imengyu/vue3-context-menu`) |
| `AdvancedAccountList.vue` | Per-account advanced settings list in options |
| `InfoTooltip.vue` | Reusable info tooltip icon |
| `OptionDonationHeader.vue` | Donation banner shown at top of options page |
| `OptionDonationFooter.vue` | Donation banner shown at bottom of options page |
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
