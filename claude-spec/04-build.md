# ThunderStats — Build System

## Tooling

| Tool | Version | Role |
|---|---|---|
| Vite | ^6.4.1 | Bundler and dev server |
| @vitejs/plugin-vue | ^5.2.3 | Vue 3 SFC support |
| esbuild | ^0.25.1 | JavaScript transformation (used by Vite) |
| Node.js + npm | any LTS | Runtime and package manager |

---

## NPM Scripts

```bash
# Development: watch mode, auto-rebuild on file changes, no minification
npm run dev

# Production: single build with full minification
npm run build

# Preview (rarely used; standard Vite preview server)
npm run preview
```

---

## Vite Configuration (`vite.config.js`)

```js
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

After running `npm run build`, the `dist/` folder contains the ready-to-install Thunderbird addon:

```
dist/
├── index.thunderstats.html
├── index.ts-options.html
├── background.html
├── manifest.json
├── images/
├── _locales/
└── assets/
    ├── index.thunderstats-[hash].js   (main app bundle)
    ├── index.ts-options-[hash].js     (options bundle)
    └── *.css
```

The `dist/` folder can be loaded directly in Thunderbird as a temporary addon (via the addon manager debug interface) or packaged as a `.xpi` file.

---

## Installing for Development in Thunderbird

1. Run `npm run dev` to build and watch for changes.
2. In Thunderbird, open the Add-on Manager.
3. Click the gear icon → "Debug Add-ons" (or go to `about:debugging`).
4. Click "Load Temporary Add-on" and select any file in `dist/` (e.g. `manifest.json`).
5. The addon reloads automatically after each rebuild — you may need to manually reload the addon page in Thunderbird.

---

## Dependencies

### Runtime (bundled into the addon)

| Package | Version | Purpose |
|---|---|---|
| vue | ^3.5.13 | UI framework |
| chart.js | ^4.4.2 | Charting library |
| vue-chartjs | ^5.3.1 | Vue wrapper for Chart.js |
| chartjs-plugin-datalabels | ^2.2.0 | Data labels on charts |
| vue3-tabs-component | ^1.3.7 | Tab navigation |
| @vueform/multiselect | ^2.6.10 | Multi-select dropdown |
| @vuepic/vue-datepicker | ^8.7.0 | Date picker |
| @imengyu/vue3-context-menu | ^1.4.1 | Context menu for export |

### Dev Only (not in addon)

| Package | Version | Purpose |
|---|---|---|
| vite | ^6.4.1 | Build tool |
| @vitejs/plugin-vue | ^5.2.3 | Vite Vue plugin |
| esbuild | ^0.25.1 | Fast JS transformer |
