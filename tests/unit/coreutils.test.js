import { describe, it, expect } from 'vitest';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import { tsStore } from '@statslib/mzts-store';
import { tsUtils } from '@statslib/mzts-utils';
import { day } from '../helpers.js';

describe('calculateEaster', () => {
  it.each([
    [2019, '20190421'],
    [2024, '20240331'],
    [2025, '20250420'],
    [2026, '20260405'],
    [2038, '20380425'],    // latest possible date
    [2285, '22850322'],    // earliest possible date
  ])('Easter %i is %s', (year, key) => {
    expect(tsUtils.dateToYYYYMMDD(tsCoreUtils.calculateEaster(year))).toBe(key);
  });

  it('isEasterOrEasterMonday checks both days only', () => {
    expect(tsCoreUtils.isEasterOrEasterMonday(day('20260405'))).toBe(true);
    expect(tsCoreUtils.isEasterOrEasterMonday(day('20260406'))).toBe(true);
    expect(tsCoreUtils.isEasterOrEasterMonday(day('20260407'))).toBe(false);
  });
});

describe('checkBusinessDay', () => {
  it('follows the weekday settings', () => {
    expect(tsCoreUtils.checkBusinessDay('20261012')).toBe(true);     // Monday
    expect(tsCoreUtils.checkBusinessDay('20261010')).toBe(false);    // Saturday
    tsStore.bday_weekdays_6 = true;
    expect(tsCoreUtils.checkBusinessDay('20261010')).toBe(true);
  });

  it('skips Easter Monday only when the Easter setting is on', () => {
    expect(tsCoreUtils.checkBusinessDay('20260406')).toBe(true);
    tsStore.bday_easter = true;
    expect(tsCoreUtils.checkBusinessDay('20260406')).toBe(false);
  });

  it('skips the custom non-business days, yearly or of a given year (month is zero-based)', () => {
    tsStore.bday_custom_days = [
      { year: 'every_year', month: 11, day: 25 },
      { year: 2026, month: 5, day: 2 },
    ];
    expect(tsCoreUtils.checkBusinessDay('20261225')).toBe(false);
    expect(tsCoreUtils.checkBusinessDay('20271224')).toBe(true);
    expect(tsCoreUtils.checkBusinessDay('20271225')).toBe(false);
    expect(tsCoreUtils.checkBusinessDay('20260602')).toBe(false);
    expect(tsCoreUtils.checkBusinessDay('20270602')).toBe(true);
  });

  it('findPreviousBusinessDay skips weekends and holidays', () => {
    tsStore.bday_easter = true;
    expect(tsUtils.dateToYYYYMMDD(tsCoreUtils.findPreviousBusinessDay(day('20261012')))).toBe('20261009');
    expect(tsUtils.dateToYYYYMMDD(tsCoreUtils.findPreviousBusinessDay(day('20260407')))).toBe('20260403');
  });
});

describe('domains', () => {
  it('extractDomain', () => {
    expect(tsCoreUtils.extractDomain('a@b.com')).toBe('b.com');
    expect(tsCoreUtils.extractDomain('nobody')).toBeNull();
    expect(tsCoreUtils.extractDomain(null)).toBeNull();
  });

  it('extractDomains handles names, bare addresses and invalid entries', () => {
    expect(tsCoreUtils.extractDomains(['Mario Rossi <mario@rossi.it>', 'x@y.org', 'undisclosed-recipients:;']))
      .toEqual(['rossi.it', 'y.org']);
  });

  it('extractDomains takes the address in angle brackets, not the one in the display name', () => {
    expect(tsCoreUtils.extractDomains(['"anna@other.com" <mario@acme.it>', '"hans@firma.de" <hans@firma.de>']))
      .toEqual(['acme.it', 'firma.de']);
  });

  it('extractDomains gives the domains in lower case', () => {
    expect(tsCoreUtils.extractDomains(['Ordini <ordini@Cliente.COM>', 'X@ACME.IT'])).toEqual(['cliente.com', 'acme.it']);
  });

  it('extractDomains keeps the domain of an address with non-ASCII letters', () => {
    expect(tsCoreUtils.extractDomains(['José <josé@exämple.com>', '"a@b" <>'])).toEqual(['exämple.com']);
  });

  it('getInternalMailLabel computes the internal percentages', () => {
    let label = tsCoreUtils.getInternalMailLabel({
      'work.it': { sent: 3, received: 1, internal: true },
      'other.com': { sent: 1, received: 2, internal: false },
    });
    expect(label).toEqual({ sentPercent: '75.00%', receivedPercent: '33.33%' });
    expect(tsCoreUtils.getInternalMailLabel({})).toEqual({ sentPercent: '0.00%', receivedPercent: '0.00%' });
  });
});

describe('names', () => {
  it('getNameFromAddress takes the display name', () => {
    expect(tsCoreUtils.getNameFromAddress('Mario Rossi <mario@rossi.it>')).toBe('Mario Rossi');
    expect(tsCoreUtils.getNameFromAddress('mario@rossi.it')).toBe('');
  });
});

describe('getCustomQryLabel', () => {
  it('formats every key type', () => {
    expect(tsCoreUtils.getCustomQryLabel('2026', 'YYYY')).toBe('2026');
    expect(tsCoreUtils.getCustomQryLabel('202610', 'YYYYMM')).toBe('10/2026');
    expect(tsCoreUtils.getCustomQryLabel('202642', 'YYYYWW')).toBe('42 [2026]');
    expect(tsCoreUtils.getCustomQryLabel('20261013', 'YYYYMMDD')).toBe('10/13/2026');
  });

  it('formats the days in the Thunderbird UI language', () => {
    browser.i18n.getUILanguage = () => 'it-IT';
    expect(tsCoreUtils.getCustomQryLabel('20261013', 'YYYYMMDD')).toBe('13/10/2026');
  });
});
