import { describe, it, expect, vi } from 'vitest';
import { tsUtils, EmailMatcher, DomainMatcher } from '@statslib/mzts-utils';
import { day } from '../helpers.js';

describe('date keys', () => {
  it('formats YYYYMMDD, YYYYMM and YYYY with leading zeros', () => {
    expect(tsUtils.dateToYYYYMMDD(day('20260105'))).toBe('20260105');
    expect(tsUtils.dateToYYYYMM(day('20260105'))).toBe('202601');
    expect(tsUtils.dateToYYYY(day('20260105'))).toBe('2026');
  });

  it('uses the local date, not UTC, just after midnight', () => {
    expect(tsUtils.dateToYYYYMMDD(day('20260301', 0, 30))).toBe('20260301');
  });

  it('parses YYYYMMDD back to a local midnight date', () => {
    let date = tsUtils.parseYYYYMMDDToDate('20261013');
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2026, 9, 13, 0]);
  });

  it.each([
    ['20260615', '202625'],
    ['20260105', '202602'],
    ['20240101', '202401'],
  ])('ISO week of %s is %s', (key, week) => {
    expect(tsUtils.dateToYYYYWW(day(key))).toBe(week);
  });

  it.each([
    ['20241230', '202501'],
    ['20210101', '202053'],
    ['20261231', '202653'],
    ['20270101', '202653'],
  ])('ISO week of %s at the year boundary is %s (the year of its Thursday)', (key, week) => {
    expect(tsUtils.dateToYYYYWW(day(key))).toBe(week);
  });
});

describe('date arrays', () => {
  const EMPTY = { count: 0, sent: 0, received: 0, inbox: 0, sent_internal: 0, sent_external: 0, received_internal: 0, received_external: 0 };

  it('getDateArray has one empty entry per day, both ends included', () => {
    let array = tsUtils.getDateArray(day('20260228'), day('20260302'));
    expect(Object.keys(array)).toEqual(['20260228', '20260301', '20260302']);
    expect(array['20260301']).toEqual(EMPTY);
  });

  it('getDateArray does not change the from date', () => {
    let from = day('20260101');
    tsUtils.getDateArray(from, day('20260105'));
    expect(tsUtils.dateToYYYYMMDD(from)).toBe('20260101');
  });

  it('getDateArray crosses the DST change without skipping or repeating days', () => {
    let array = tsUtils.getDateArray(day('20260328', 0), day('20260330', 0));
    expect(Object.keys(array)).toEqual(['20260328', '20260329', '20260330']);
  });

  it('groups by week, month and year', () => {
    expect(Object.keys(tsUtils.getDateArrayWeeks(day('20260601'), day('20260614')))).toEqual(['202623', '202624']);
    expect(Object.keys(tsUtils.getDateArrayMonths(day('20261130'), day('20270102')))).toEqual(['202611', '202612', '202701']);
    expect(Object.keys(tsUtils.getDateArrayYears(day('20251231'), day('20260101')))).toEqual(['2025', '2026']);
  });
});

describe('daysBetween', () => {
  it('counts both ends', () => {
    expect(tsUtils.daysBetween(day('20261013'), day('20261013'))).toBe(1);
    expect(tsUtils.daysBetween(day('20261001', 23), day('20261007', 1))).toBe(7);
  });

  it('is not affected by the start of DST', () => {
    expect(tsUtils.daysBetween(day('20260328'), day('20260330'))).toBe(3);
  });

  it('is not affected by the end of DST', () => {
    expect(tsUtils.daysBetween(day('20261024'), day('20261026'))).toBe(3);
  });
});

describe('preset periods', () => {
  it('compute the periods relative to the current date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(day('20260304', 10));    // Wednesday

    expect(tsUtils.dateToYYYYMMDD(tsUtils.getLastMonday())).toBe('20260302');
    expect(tsUtils.dateToYYYYMMDD(tsUtils.getLastSunday())).toBe('20260301');
    expect(tsUtils.dateToYYYYMMDD(tsUtils.getFirstDayOfCurrentMonth())).toBe('20260301');
    expect(tsUtils.dateToYYYYMMDD(tsUtils.getFirstDayOfLastMonth())).toBe('20260201');
    expect(tsUtils.dateToYYYYMMDD(tsUtils.getLastDayOfLastMonth())).toBe('20260228');
    expect(tsUtils.dateToYYYYMMDD(tsUtils.getFirstDayOfCurrentYear())).toBe('20260101');
    expect(tsUtils.dateToYYYYMMDD(tsUtils.getFirstDayOfLastYear())).toBe('20250101');
    expect(tsUtils.dateToYYYYMMDD(tsUtils.getLastDayOfLastYear())).toBe('20251231');
    expect(tsUtils.isToday(day('20260304', 23))).toBe(true);
    expect(tsUtils.isToday(day('20260303', 23))).toBe(false);
  });

  it('getPreviousWeekday returns the same day when it already is that weekday', () => {
    expect(tsUtils.dateToYYYYMMDD(tsUtils.getPreviousWeekday(day('20260302'), 1))).toBe('20260302');
    expect(tsUtils.dateToYYYYMMDD(tsUtils.getPreviousWeekday(day('20260302'), 2))).toBe('20260224');
  });

  it('getFirstDayOfLastMonth works in January', () => {
    vi.useFakeTimers();
    vi.setSystemTime(day('20270115'));
    expect(tsUtils.dateToYYYYMMDD(tsUtils.getFirstDayOfLastMonth())).toBe('20261201');
  });
});

describe('formatting', () => {
  it('builds the date pattern of a locale', () => {
    expect(tsUtils.formatDateStringLocale('it-IT')).toBe('dd/MM/yyyy');
    expect(tsUtils.formatDateStringLocale('en-US')).toBe('MM/dd/yyyy');
    expect(tsUtils.formatDateStringLocale('de-DE')).toBe('dd.MM.yyyy');
    expect(tsUtils.formatDateStringLocale('ja-JP')).toBe('yyyy/MM/dd');
  });

  it('builds the date pattern with non-Latin digits and quotes the Latin literals', () => {
    expect(tsUtils.formatDateStringLocale('ar-EG')).toMatch(/^dd\W+MM\W+yyyy$/u);
    expect(tsUtils.formatDateStringLocale('fa-IR')).toMatch(/yyyy.*MM.*dd/u);
    // a literal with Latin letters would be read as tokens by date-fns
    let parts = [{ type: 'day', value: '27' }, { type: 'literal', value: ' de ' }, { type: 'month', value: '07' }, { type: 'literal', value: " o'k " }, { type: 'year', value: '2000' }];
    let spy = vi.spyOn(Intl.DateTimeFormat.prototype, 'formatToParts').mockReturnValue(parts);
    try {
      expect(tsUtils.formatDateStringLocale('xx')).toBe("dd' de 'MM' o''k 'yyyy");
    } finally {
      spy.mockRestore();
    }
  });

  it.each([
    [0, ''],
    [999, '999ms'],
    [61000, '1m 1s'],
    [3723004, '1h 2m 3s 4ms'],
  ])('convertFromMilliseconds(%i) is "%s"', (ms, text) => {
    expect(tsUtils.convertFromMilliseconds(ms)).toBe(text);
  });

  it('sortDays orders by first day of week without changing the input', () => {
    let days = [1, 2, 3, 4, 5, 6, 0].map(idx => ({ idx }));
    expect(tsUtils.sortDays(0, days).map(d => d.idx)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(tsUtils.sortDays(6, days).map(d => d.idx)).toEqual([6, 0, 1, 2, 3, 4, 5]);
    expect(tsUtils.sortDays(1, days).map(d => d.idx)).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(tsUtils.sortDays('3', days).map(d => d.idx)).toEqual([3, 4, 5, 6, 0, 1, 2]);
    expect(days.map(d => d.idx)).toEqual([1, 2, 3, 4, 5, 6, 0]);
    // the input order does not matter
    expect(tsUtils.sortDays(1, [...days].reverse()).map(d => d.idx)).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });
});

describe('regexEmail', () => {
  it.each([
    ['Mario Rossi <mario@client.com>', 'mario@client.com'],
    ['Me <me+news@work.it>', 'me+news@work.it'],
    ["o'brien@example.ie", "o'brien@example.ie"],
    ["'mario@client.com' <mario@client.com>", 'mario@client.com'],
    ['first.last-x_y%z@sub.example.co.uk', 'first.last-x_y%z@sub.example.co.uk'],
  ])('finds the address in %s', (text, address) => {
    expect(text.match(tsUtils.regexEmail)[0]).toBe(address);
  });

  it('finds nothing without an address', () => {
    expect('Mailer Daemon'.match(tsUtils.regexEmail)).toBeNull();
  });
});

describe('EmailMatcher', () => {
  const matcher = new EmailMatcher(['me@example.com', '*@work.it', '@corp.org', 'info+*@shop.com']);

  it.each([
    ['me@example.com', true],
    ['you@example.com', false],
    ['anyone@work.it', true],
    ['anyone@work.it.evil.com', false],
    ['boss@corp.org', true],
    ['boss@sub.corp.org', false],
    ['info+orders@shop.com', true],
    ['infoxorders@shop.com', false],
  ])('%s → %s', (email, expected) => {
    expect(matcher.matches(email)).toBe(expected);
  });

  it('escapes the regex characters of the patterns', () => {
    let dots = new EmailMatcher(['*@a.b']);
    expect(dots.matches('x@a.b')).toBe(true);
    expect(dots.matches('x@aXb')).toBe(false);
  });

  it('matches patterns ignoring the case, exact addresses only as given (already lowercased)', () => {
    expect(matcher.matches('ANYONE@WORK.IT')).toBe(true);
    expect(matcher.matches('ME@example.com')).toBe(false);
  });
});

describe('DomainMatcher', () => {
  const matcher = new DomainMatcher([' Example.com ', '*.corp.org']);

  it.each([
    ['example.com', true],
    ['EXAMPLE.COM', true],
    ['sub.example.com', false],
    ['mail.corp.org', true],
    ['corp.org', false],
    ['mail.corpXorg', false],
  ])('%s → %s', (domain, expected) => {
    expect(matcher.matches(domain)).toBe(expected);
  });
});
