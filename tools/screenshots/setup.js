// Installs a fake Thunderbird API (the mock of the tests, filled with the fake mailbox) and a fixed clock,
// before the real add-on code is loaded. Query string:
//   theme=light|dark   the theme_mode pref
//   time=HH:MM         the time of "now" (today), default 17:20
//   prefs={json}       extra prefs
import { createBrowserMock } from '../../tests/mocks/browser.js';
import { createFakeMailbox } from './fake-mailbox.js';

const params = new URLSearchParams(location.search);

// Fixed clock: today at the given time, still running so the elapsed times make sense
const RealDate = Date;
const [hh, mm] = (params.get('time') || '17:20').split(':').map(Number);
const real_now = new RealDate();
const offset = new RealDate(real_now.getFullYear(), real_now.getMonth(), real_now.getDate(), hh, mm).getTime() - RealDate.now();
class FakeDate extends RealDate {
  constructor(...args) {
    if (args.length === 0) super(RealDate.now() + offset);
    else super(...args);
  }
  static now() { return RealDate.now() + offset; }
}
globalThis.Date = FakeDate;

// Real English strings, with the same placeholder rules as the WebExtension i18n API
const messages = await (await fetch('/_locales/en/messages.json')).json();
function getMessage(key, subs) {
  let entry = messages[key];
  if (!entry) return '';
  let list = subs === undefined || subs === null ? [] : [].concat(subs).map(String);
  let text = entry.message.replace(/\$([A-Za-z0-9_@]+)\$/g, (match, name) => {
    let placeholder = entry.placeholders?.[name.toLowerCase()];
    return placeholder ? placeholder.content : match;
  });
  return text.replace(/\$(\d+|\$)/g, (match, n) => n == '$' ? '$' : (list[Number(n) - 1] ?? ''));
}

const manifest = await (await fetch('/manifest.json')).json();

const mock = createBrowserMock();
const fake = createFakeMailbox(new Date());
mock.mailbox = fake.mailbox;
mock.tags = fake.tags;
mock.contactCards = fake.contactCards;
mock.i18n.getMessage = getMessage;
mock.i18n.getUILanguage = () => 'en-US';
mock.runtime = {
  getManifest: () => manifest,
  getURL: (path) => new URL(path, location.origin + '/').href,
  async sendMessage() {},
  onMessage: { addListener() {}, removeListener() {} },
};
const noop = async () => {};
mock.tabs = { query: async () => [], update: noop, create: noop, remove: noop, getCurrent: async () => ({ id: 1 }) };
mock.windows = { WINDOW_ID_CURRENT: -2 };
mock.mailTabs = { create: noop, update: noop };

let prefs = { theme_mode: params.get('theme') || 'light', ...JSON.parse(params.get('prefs') || '{}') };
await mock.storage.sync.set(prefs);

globalThis.browser = mock;
globalThis.messenger = mock;
