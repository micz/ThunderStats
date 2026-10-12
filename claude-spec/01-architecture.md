# ThunderStats — Architecture

## Overview

ThunderStats is a **Thunderbird WebExtension** (Manifest V2) built with **Vue.js 3** and **Vite**. It provides email statistics directly inside Thunderbird by accessing messages through the Thunderbird WebExtension API.

The addon has two separate UI surfaces, each a self-contained Vue 3 application:

| Surface | Entry HTML | Vue App | Purpose |
|---|---|---|---|
| Main statistics window | `index.thunderstats.html` | `App_ThunderStats.vue` | Displays all email statistics |
| Options/Settings page | `index.ts-options.html` | `App_Options.vue` | User preferences and configuration |

## Manifest Configuration (`public/manifest.json`)

- **Manifest Version:** 2
- **Gecko ID:** `thunderstats@micz.it`
- **Min Thunderbird version:** 115.0
- **Browser action:** toolbar button that opens the stats window
- **Options UI:** `index.ts-options.html` (opens in a tab)
- **Background page:** `background.html` (loads `background.js`)

### Permissions
- `addressBooks` — access address book data
- `messagesRead` — read email messages
- `accountsRead` — enumerate accounts and folders
- `storage` — persist user preferences
- `tabs` — open/manage tabs
- `messagesTagsList` — read message tags

## Directory Structure

```
/
├── index.thunderstats.html       # Main UI entry point
├── index.ts-options.html         # Options UI entry point
├── vite.config.js                # Vite build config
├── build.js                      # XPI packager (production build)
├── LANG.md                       # Locales shipped in the XPI
├── package.json                  # Dependencies
├── public/
│   ├── manifest.json             # Addon manifest
│   ├── background.html           # Background page
│   ├── background.js             # Background script
│   ├── images/                   # Addon icons (16px, 32px, 64px)
│   └── _locales/                 # i18n message files
├── src/
│   ├── index.thunderstats.js     # Vue app bootstrap (main)
│   ├── index.ts-options.js       # Vue app bootstrap (options)
│   ├── App_ThunderStats.vue      # Root component (main)
│   ├── App_Options.vue           # Root component (options)
│   ├── views/
│   │   ├── ThunderStatsView.vue  # Main stats dashboard
│   │   └── OptionsView.vue       # Settings dashboard
│   └── components/               # All reusable components
│       ├── tabs/                 # Main stats tabs
│       ├── charts/               # Chart components
│       ├── counters/             # Counter/display components
│       ├── widgets/              # Widgets wrapping charts/counters
│       ├── options_tabs/         # Options tab components
│       └── tables/               # Table components
├── statslib/
│   ├── mzts-statscore.js         # Main stats engine
│   ├── mzts-statscore.utils.js   # Stats utilities
│   ├── mzts-utils.js             # General helpers
│   ├── mzts-export.js            # CSV export
│   ├── mzts-options.js           # Preferences API
│   ├── mzts-options-default.js   # Default settings
│   ├── mzts-i18n.js              # i18n resolver
│   ├── mzts-logger.js            # Debug logging
│   ├── mzts-store.js             # Shared reactive state (tsStore)
│   ├── mzts-theme.js             # Light/dark theme (tsTheme)
│   └── chartjs-lib/              # Custom Chart.js plugins
└── dist/                         # Compiled addon output
```

## Data Flow

```
Thunderbird API (browser.messages, browser.accounts, browser.folders)
       │
       ▼
statslib/mzts-statscore.js  ← configuration from mzts-options.js
       │                    ← utilities from mzts-statscore.utils.js
       ▼
Vue Tab Components (TAB_Today, TAB_Yesterday, TAB_ManyDays, TAB_CustomQry)
       │
       ▼
Chart/Counter/Widget Components (display only, receive data as props)

Shared state (current account, business day settings, colors, dark mode): statslib/mzts-store.js
Theme: statslib/mzts-theme.js sets tsStore.darkmode and the data-theme attribute on <html>; all colors come from the CSS tokens in src/assets/tokens.css
Preferences: browser.storage.sync via statslib/mzts-options.js
```

## Path Aliases (Vite)

| Alias | Resolves To |
|---|---|
| `@` | `./src` |
| `@statslib` | `./statslib` |
| `@public` | `./public` |

## Privacy

All data processing is entirely local. No data is ever sent to any external server or third-party service. The addon only reads data from the user's local Thunderbird installation.
