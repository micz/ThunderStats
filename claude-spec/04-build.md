# ThunderStats — Build System

## Tooling

Vite + `@vitejs/plugin-vue` (with esbuild), run via Node.js + npm. Versions: see `package.json`.

---

## NPM Scripts

```bash
# Development: watch mode, auto-rebuild on file changes, no minification
npm run dev

# Production: single build with full minification
npm run build

# Preview (rarely used; standard Vite preview server)
npm run preview

# Tests: single run / watch mode
npm test
npm run test:watch
```

---

## Vite Configuration (`vite.config.js`)

```js
plugins: [
  vue(),
  { name: 'xpi-packager', apply: 'build',
    closeBundle() { if (mode === 'production') createXpi(); } },   // from build.js
],
build: {
  minify: mode === 'production',   // minify only for "npm run build"
  rollupOptions: {
    input: {
      main:    'index.thunderstats.html',   // main stats window
      options: 'index.ts-options.html'      // options page
    }
  }
}
```

### Path Aliases

| Alias | Resolves to |
|---|---|
| `@` | `./src` |
| `@statslib` | `./statslib` |
| `@public` | `./public` |

---

## Entry Points

### Main Statistics Window
- **HTML:** `index.thunderstats.html`
- **JS bootstrap:** `src/index.thunderstats.js`
- **Root Vue component:** `src/App_ThunderStats.vue`

### Options Page
- **HTML:** `index.ts-options.html`
- **JS bootstrap:** `src/index.ts-options.js`
- **Root Vue component:** `src/App_Options.vue`

---

## Build Output (`dist/`)

Every build (dev or production) writes the unpacked addon to `dist/`: the two HTML entry points, `assets/` (hashed JS/CSS bundles), and everything copied from `public/` (`manifest.json`, `background.html`, `background.js`, `images/`, `_locales/`).

`dist/` can be loaded directly in Thunderbird as a temporary addon.

---

## XPI Packaging (`build.js`)

`npm run build` (production mode only) also runs `createXpi()` after bundling:

- Output: `../thunderstats-<version>.xpi` (parent folder of the repo), version read from `package.json`
- Zips the content of `dist/`
- **Locale filter:** every `_locales/<code>` folder not listed in `LANG.md` is excluded. `LANG.md` is the author-maintained list of locales ready to ship; do not edit it.
- Adds `VENDORS.md`, `DEVELOPER.md`, and `LICENSE` from the repo root, if they exist

---

## Tests (Vitest)

`vitest.config.js` merges `vite.config.js` (aliases, Vue plugin; the XPI packager only applies to builds) and sets `TZ=Europe/Rome`, so the local-date logic and the DST changes behave the same on every machine. Tests live in `tests/` (not bundled, not in the XPI):

| Path | Contents |
|---|---|
| `tests/setup.js` | Before each test: a fresh `browser`/`messenger` mock and the shipped business day settings of `tsStore`; real timers restored after each test |
| `tests/mocks/browser.js` | `createBrowserMock()`: in-memory `storage.sync` (defaults object like the real API), `i18n.getMessage` returning `key` or `key[sub1\|sub2]`, `getUILanguage` = `en-US` |
| `tests/helpers.js` | `day("YYYYMMDD", hours)` local date (noon by default) |
| `tests/unit/` | Pure functions: `tsUtils`, `EmailMatcher`/`DomainMatcher`, `tsCoreUtils` (business days, Easter, domains, labels), `tsInsights` |

Code that reads the current date is tested with `vi.useFakeTimers()` + `vi.setSystemTime()`. Known bugs are kept as `it.fails` tests with a comment: they start failing (as a reminder to turn them into normal tests) once the bug is fixed.

---

## Installing for Development in Thunderbird

1. Run `npm run dev` to build and watch for changes.
2. In Thunderbird, open the Add-on Manager.
3. Click the gear icon → "Debug Add-ons" (or go to `about:debugging`).
4. Click "Load Temporary Add-on" and select any file in `dist/` (e.g. `manifest.json`).
5. The addon reloads automatically after each rebuild — you may need to manually reload the addon page in Thunderbird.

---

## Dependencies

See `package.json`. Runtime libraries bundled into the addon: `vue`, `chart.js`, `vue-chartjs`, `vue3-tabs-component`, `@vueform/multiselect`, `@vuepic/vue-datepicker`, `@imengyu/vue3-context-menu`. Dev only: `vite`, `@vitejs/plugin-vue`, `esbuild`, `vitest`.
