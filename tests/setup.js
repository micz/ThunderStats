import { beforeEach, afterEach, vi } from 'vitest';
import { createBrowserMock } from './mocks/browser.js';
import { toRaw } from 'vue';
import { tsStore } from '@statslib/mzts-store';

// Business day settings of tsStore as shipped (Monday-Friday, no Easter, no custom days)
const RAW_STORE = toRaw(tsStore);
const STORE_DEFAULTS = structuredClone({
  bday_easter: RAW_STORE.bday_easter,
  bday_custom_days: RAW_STORE.bday_custom_days,
  first_day_week: RAW_STORE.first_day_week,
  ...Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map(d => ['bday_weekdays_' + d, RAW_STORE['bday_weekdays_' + d]])),
});

beforeEach(() => {
  globalThis.browser = createBrowserMock();
  globalThis.messenger = globalThis.browser;
  Object.assign(tsStore, structuredClone(STORE_DEFAULTS));
});

afterEach(() => {
  vi.useRealTimers();
});
