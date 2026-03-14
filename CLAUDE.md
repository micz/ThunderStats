# ThunderStats — Claude Code Context

## Project Summary

**ThunderStats** is a Thunderbird WebExtension (Manifest V2) that provides comprehensive email statistics. It is a full rewrite of the original ThunderStats using **Vue.js 3** and **Vite**.

- Author: Mic (m@micz.it)
- License: GNU GPL v3
- Minimum Thunderbird: 115.0
- Addon ID: `thunderstats@micz.it`

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | Vue 3.5 (Composition API + SFCs) |
| Bundler | Vite 6.4 |
| Charts | Chart.js 4.4 + vue-chartjs |
| Language | JavaScript (ES modules) |
| Extension API | Thunderbird WebExtension (Manifest V2) |

## Key Constraints — Always Respect

1. **Vue components always use `<script setup>`** and `<style scoped>`.
2. **All code must use English.** Variable names, function names, comments, and any developer-written text (logs, error messages, inline docs) must be in English. No exceptions.
3. **Keep spec files up to date.** When making code changes that affect a subsystem described in `claude-spec/`, update the relevant spec file to reflect the new behavior. Read the spec before modifying, update it after.
4. **Do not modify files in the /dist folder.** Those are files generated when building the extension.
5. **Translations.** When you need to modify the language files, modify only the english version.

## Build Commands

```bash
npm install          # Install dependencies (first time only)
npm run dev          # Watch mode — auto-rebuild on changes, no minification
npm run build        # Production build with minification → dist/
```

The compiled addon lives in `dist/`. Load `dist/manifest.json` in Thunderbird's addon debug page to install for development.

## Key Directories

| Path | Contents |
|---|---|
| `src/` | All Vue components (39 total) |
| `src/views/` | Two main views: ThunderStatsView, OptionsView |
| `src/components/tabs/` | 5 tab components (Today, Yesterday, ManyDays, CustomQry, Info) |
| `src/components/charts/` | 10 chart components |
| `src/components/counters/` | 6 counter/display components |
| `src/components/widgets/` | 4 widget components |
| `src/components/options_tabs/` | 6 options settings tab components |
| `statslib/` | Core statistics engine, utilities, export, i18n, prefs |
| `statslib/chartjs-lib/` | Custom Chart.js plugins |
| `public/` | manifest.json, icons, locale files |
| `public/_locales/` | i18n message files (en, it, de, fr, nl, mnw) |
| `dist/` | Build output (compiled addon) |

## Entry Points

| File | Purpose |
|---|---|
| `index.thunderstats.html` | Main statistics window |
| `index.ts-options.html` | Options/settings page |
| `src/index.thunderstats.js` | Vue app bootstrap (main) |
| `src/index.ts-options.js` | Vue app bootstrap (options) |

## Path Aliases

- `@` → `./src`
- `@statslib` → `./statslib`
- `@public` → `./public`

## Specification Files

Detailed specifications are in `claude-spec/`:

| File | Contents |
|---|---|
| [01-architecture.md](claude-spec/architecture.md) | Overall structure, data flow, permissions |
| [02-statslib.md](claude-spec/statslib.md) | Statistics library: classes, methods, data structures |
| [03-components.md](claude-spec/components.md) | All Vue components with hierarchy and descriptions |
| [04-build.md](claude-spec/build.md) | Build system, dependencies, dev workflow |
| [05-i18n.md](claude-spec/i18n.md) | Localization system and translation guide |
| [06-features.md](claude-spec/features.md) | Complete feature list, tab and options breakdown |
| [99-thunderbird-team-spec.md](claude-spec/99-thunderbird-team-spec.md) | Thunderbird team guidelines, documented deviations, VENDOR.md, i18n, API audit |
