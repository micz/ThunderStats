// Captures the store screenshots with headless Edge (or Chrome) through the DevTools protocol.
// Start the dev server first (npx vite --config tools/screenshots/vite.config.js), then:
//   node tools/screenshots/shoot.js [browser.exe]
// The PNG files are written to tools/screenshots/out/.
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const BASE = 'http://localhost:5199/tools/screenshots/';
const WIDTH = 1280;
const HEIGHT = 800;
const SCALE = 1;
const PORT = 9333;
const BROWSER = process.argv[2] || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = fileURLToPath(new URL('./out/', import.meta.url));

const PREFS = encodeURIComponent(JSON.stringify({ remember_last_tab: true, customqry_warn_onlongperiod_days: 0 }));
// Today with the cumulative time of day chart
const PREFS_TODAY = encodeURIComponent(JSON.stringify({ remember_last_tab: true, _time_chart_progressive: true }));
// [file name, page, screens, buttons to click (by their text) once the page is loaded]
// A page shot on more screens gives <name>-a (top of the page), <name>-b (one screen down), <name>-c (two screens down)
const OPTIONS = ['general', 'advanced', 'business', 'identities', 'about'];
const SHOTS = [
  ['01-today-light', `index.html?theme=light&prefs=${PREFS_TODAY}#tab-today`, 2],
  ['02-today-dark', `index.html?theme=dark&prefs=${PREFS_TODAY}#tab-today`, 2],
  ['03-manydays', `index.html?theme=light&prefs=${PREFS}#tab-manydays`, 3],
  ['04-customqry', `index.html?theme=light&prefs=${PREFS}#tab-customqry`, 3, ['Current year', 'Weeks']],
  ...OPTIONS.map((section, i) => [`${String(5 + i).padStart(2, '0')}-options-${section}`, `options.html?theme=light#${section}`, 1]),
];

const profile = mkdtempSync(join(tmpdir(), 'ts-shots-'));
const browser = spawn(BROWSER, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--hide-scrollbars', '--force-color-profile=srgb', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 50; i++) {
    try {
      let list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      let page = list.find(t => t.type == 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch { }
    await sleep(200);
  }
  throw new Error('The browser did not start');
}

function connect(url) {
  return new Promise((resolve, reject) => {
    let ws = new WebSocket(url);
    let next = 1;
    let pending = new Map();
    let handlers = {};
    ws.onmessage = (event) => {
      let msg = JSON.parse(event.data);
      if (msg.method && handlers[msg.method]) handlers[msg.method](msg.params);
      if (msg.id && pending.has(msg.id)) {
        let { ok, ko } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? ko(new Error(msg.error.message)) : ok(msg.result);
      }
    };
    ws.onerror = reject;
    ws.onopen = () => resolve({
      send(method, params = {}) {
        let id = next++;
        ws.send(JSON.stringify({ id, method, params }));
        return new Promise((ok, ko) => pending.set(id, { ok, ko }));
      },
      on(method, handler) { handlers[method] = handler; },
      close() { ws.close(); },
    });
  });
}

// Scrolls the page (or the element that scrolls inside it) to the given number of screens down,
// or less if the page ends before; returns the scroll height
const scrollTo = (screens) => `(() => {
  let el = document.scrollingElement;
  if (el.scrollHeight <= el.clientHeight) {
    el = [...document.querySelectorAll('*')].find(e => e.scrollHeight > e.clientHeight + 10 &&
      ['auto', 'scroll'].includes(getComputedStyle(e).overflowY)) || el;
  }
  el.scrollTop = ${HEIGHT} * ${screens};
  return el.scrollHeight;
})()`;

async function capture(cdp, name) {
  // No clip: its coordinates are page coordinates, so it would miss the scrolled view
  let { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, name + '.png'), Buffer.from(data, 'base64'));
  console.log('saved', name + '.png');
}

try {
  mkdirSync(OUT, { recursive: true });
  let cdp = await connect(await target());
  await cdp.send('Page.enable');
  // A confirm() left open (e.g. the long period warning) would block the page: accept it
  cdp.on('Page.javascriptDialogOpening', () => cdp.send('Page.handleJavaScriptDialog', { accept: true }));
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: SCALE, mobile: false });

  for (let [name, path, screens, clicks = []] of SHOTS) {
    // A fresh page each time: the hash selects the tab only when the app starts
    await cdp.send('Page.navigate', { url: 'about:blank' });
    await sleep(300);
    await cdp.send('Page.navigate', { url: BASE + path });
    await sleep(9000);
    for (let text of clicks) {
      await cdp.send('Runtime.evaluate', { expression: `[...document.querySelectorAll('button')].find(b => b.textContent.trim() == ${JSON.stringify(text)})?.click()` });
      await sleep(6000);
    }
    if (screens == 1) {
      await capture(cdp, name);
      continue;
    }
    for (let i = 0; i < screens; i++) {
      if (i > 0) {
        let { result } = await cdp.send('Runtime.evaluate', { expression: scrollTo(i) });
        await sleep(1500);
        if (i == 1) console.log('  page height', result.value);
      }
      await capture(cdp, name + '-' + 'abc'[i]);
    }
  }
  cdp.close();
} finally {
  browser.kill();
  await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch { }
}
