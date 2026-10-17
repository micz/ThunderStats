import { describe, it, expect } from 'vitest';
import { tsInsights, INBOX_FEW_LEFT, STREAK_WINDOW_DAYS } from '@statslib/mzts-insights';
import { tsUtils } from '@statslib/mzts-utils';
import { day } from '../helpers.js';

// msg_hours of a day: {hour: {received, sent}}
function hours(received_by_hour, sent_by_hour = {}) {
  let output = {};
  for (let h = 0; h < 24; h++) {
    output[h] = { received: received_by_hour[h] || 0, sent: sent_by_hour[h] || 0 };
  }
  return output;
}

describe('series helpers', () => {
  it('hoursArray fills the missing hours with 0', () => {
    let values = tsInsights.hoursArray({ 9: { received: 4 } }, 'received');
    expect(values).toHaveLength(24);
    expect(values[9]).toBe(4);
    expect(tsInsights.sum(values)).toBe(4);
  });

  it('cumulative keeps the nulls (hours still to come)', () => {
    expect(tsInsights.cumulative([1, 2, 0, null])).toEqual([1, 3, 3, null]);
  });
});

describe('weekdayBaseline', () => {
  it('returns null without samples', () => {
    expect(tsInsights.weekdayBaseline([], false)).toBeNull();
    expect(tsInsights.weekdayBaseline(null, false)).toBeNull();
  });

  it('uses min-max of all the samples when they are less than 5', () => {
    let baseline = tsInsights.weekdayBaseline([hours({ 9: 2 }), hours({ 9: 6 }, { 10: 2 })], false);
    expect(baseline.num_days).toBe(2);
    expect(baseline.band_low[9]).toBe(2);
    expect(baseline.band_high[9]).toBe(6);
    expect(baseline.avg_received).toBe(4);
    expect(baseline.avg_sent).toBe(1);
    expect(baseline.rcvd_cum_avg[23]).toBe(4);
    expect(baseline.sent_cum_avg[23]).toBe(1);
  });

  it('drops the highest and the lowest day with 5 or more samples', () => {
    let days = [0, 3, 4, 5, 100].map(n => hours({ 9: n }));
    let baseline = tsInsights.weekdayBaseline(days, false);
    expect(baseline.band_low[9]).toBe(3);
    expect(baseline.band_high[9]).toBe(5);
    expect(baseline.avg_received).toBe(112 / 5);    // the average keeps every day
  });

  it('progressive uses the cumulative range as band', () => {
    let baseline = tsInsights.weekdayBaseline([hours({ 8: 1, 9: 2 }), hours({ 8: 3, 9: 3 })], true);
    expect(baseline.band_low[9]).toBe(3);
    expect(baseline.band_high[9]).toBe(6);
    expect(baseline.band_low).toEqual(baseline.rcvd_cum_low);
  });
});

describe('delta', () => {
  it.each([
    [12, 10, false, '▲ 20%', 'var(--text2)'],
    [12, 10, true, '▲ 20%', 'var(--warn)'],
    [5, 10, true, '▼ 50%', 'var(--text2)'],
    [10, 10, true, '±0%', 'var(--text2)'],
  ])('%i against %i (increase bad: %s)', (value, reference, bad, text, color) => {
    expect(tsInsights.delta(value, reference, bad)).toEqual({ text, color });
  });

  it('is null without a reference', () => {
    expect(tsInsights.delta(5, 0, false)).toBeNull();
    expect(tsInsights.delta(5, null, false)).toBeNull();
  });
});

describe('inbox zero', () => {
  it('inboxZeroDays classifies the days ending on end_date', () => {
    let days = tsInsights.inboxZeroDays({ '20261011': INBOX_FEW_LEFT, '20261012': INBOX_FEW_LEFT + 1 }, day('20261013'), 3);
    expect(days.map(d => [tsUtils.dateToYYYYMMDD(d.date), d.left, d.state])).toEqual([
      ['20261011', INBOX_FEW_LEFT, 'few'],
      ['20261012', INBOX_FEW_LEFT + 1, 'missed'],
      ['20261013', 0, 'zero'],
    ]);
  });

  it('inboxZeroStreak counts the consecutive zero days', () => {
    let dates = { '20261009': 2 };
    expect(tsInsights.inboxZeroStreak(dates, day('20261013'), false).current).toBe(4);
  });

  it('inboxZeroStreak skips the day in progress when it is not at zero', () => {
    let dates = { '20261009': 2, '20261013': 1 };
    expect(tsInsights.inboxZeroStreak(dates, day('20261013'), true).current).toBe(3);
    expect(tsInsights.inboxZeroStreak(dates, day('20261013'), false).current).toBe(0);
  });

  it('inboxZeroStreak is capped by the window', () => {
    expect(tsInsights.inboxZeroStreak({}, day('20261013'), false).current).toBe(STREAK_WINDOW_DAYS);
  });

  it('backlogAdded sums the range, both ends included', () => {
    let dates = { '20261005': 1, '20261006': 2, '20261010': 4, '20261011': 8 };
    expect(tsInsights.backlogAdded(dates, day('20261006'), day('20261010'))).toBe(6);
  });

  it('oldestDays ignores the empty days', () => {
    let dates = { '20261001': 0, '20261003': 2 };
    expect(tsInsights.oldestDays(dates, day('20261013', 18))).toBe(10);
    expect(tsInsights.oldestDays({}, day('20261013'))).toBe(0);
  });

  it('clearInDays uses the pace of the business days only', () => {
    // Fri 9: 10 received, 2 still in inbox → 8 handled; Mon 12: 4 received → 4 handled; Sat 10 ignored
    let msg_days = { '20261009': { received: 10 }, '20261010': { received: 50 }, '20261012': { received: 4 } };
    let inbox = { '20261009': 2 };
    expect(tsInsights.clearInDays(13, msg_days, inbox)).toBe(3);    // pace 6
    expect(tsInsights.clearInDays(0, msg_days, inbox)).toBe(0);
  });

  it('clearInDays is null without a pace', () => {
    expect(tsInsights.clearInDays(5, {}, {})).toBeNull();
    expect(tsInsights.clearInDays(5, { '20261012': { received: 3 } }, { '20261012': 3 })).toBeNull();
  });

  it('inboxAgeBuckets groups by age', () => {
    let dates = { '20261013': 1, '20261012': 2, '20261006': 3, '20260914': 4, '20260715': 5, '20250101': 6 };
    let buckets = tsInsights.inboxAgeBuckets(dates, day('20261013', 20));
    expect(buckets.map(b => [b.id, b.n])).toEqual([
      ['today', 1], ['yesterday', 2], ['week', 3], ['month', 4], ['quarter', 5], ['older', 6],
    ]);
  });
});

describe('lists', () => {
  it('topCorrespondents merges senders and recipients by address', () => {
    let result = tsInsights.topCorrespondents(
      { 'a@x.it': { name: 'A', count: 3 }, 'b@x.it': { name: 'B', count: 1 } },
      { 'a@x.it': { name: 'A', count: 2 }, 'c@x.it': { name: 'C', count: 4 } },
      2,
    );
    expect(result.count).toBe(3);
    expect(result.rows).toEqual([
      { email: 'a@x.it', name: 'A', received: 3, sent: 2, total: 5 },
      { email: 'c@x.it', name: 'C', received: 0, sent: 4, total: 4 },
    ]);
  });

  it('endedUpFolders puts the inbox first and drops the folders without received mails', () => {
    let rows = tsInsights.endedUpFolders({
      f1: { received: 2, folder_data: { name: 'Work' } },
      f2: { received: 1, folder_data: { name: 'Inbox', specialUse: ['inbox'] } },
      f3: { received: 5, folder_data: { name: 'News' } },
      f4: { received: 0, folder_data: { name: 'Empty' } },
    });
    expect(rows.map(r => [r.name, r.kind, r.n])).toEqual([['Inbox', 'inbox', 1], ['News', 'filed', 5], ['Work', 'filed', 2]]);
  });

  it('endedUpTags and domainRows sort by count', () => {
    expect(tsInsights.endedUpTags({
      $label1: { tag: 'Important', count: 1, color: '#f00' },
      $label2: { tag: 'Work', count: 3, color: '#0f0' },
      $label3: { tag: 'Unused', count: 0, color: '#00f' },
    }).map(r => r.name)).toEqual(['Work', 'Important']);

    expect(tsInsights.domainRows({
      'a.it': { sent: 1, received: 1 },
      'b.it': { sent: 5, received: 0, internal: true },
    })).toEqual([
      { name: 'b.it', sent: 5, received: 0, internal: true },
      { name: 'a.it', sent: 1, received: 1, internal: false },
    ]);
  });

  it('roundPercent', () => {
    expect(tsInsights.roundPercent('45.53%')).toBe('46%');
    expect(tsInsights.roundPercent('n/a')).toBe('0%');
  });
});

describe('time and weekday helpers', () => {
  it('peakWindow finds the first busiest window', () => {
    let values = new Array(24).fill(0);
    values[9] = 3; values[10] = 4; values[14] = 7;
    expect(tsInsights.peakWindow(values, 2)).toBe(9);
    expect(tsInsights.peakWindow(values, 1)).toBe(14);
    expect(tsInsights.peakWindow(new Array(24).fill(0))).toBeNull();
  });

  it('orderedWeekdays starts from the first day of the week', () => {
    expect(tsInsights.orderedWeekdays(1)).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(tsInsights.orderedWeekdays('6')).toEqual([6, 0, 1, 2, 3, 4, 5]);
  });

  it('weekdayAverages divides by the occurrences of each weekday', () => {
    // 2 Mondays (5, 12 Oct) and 1 Tuesday (6 Oct)
    let dates = { '20261005': {}, '20261006': {}, '20261012': {} };
    let msg_weekdays = Array.from({ length: 7 }, () => ({ received: 0, sent: 0 }));
    msg_weekdays[1] = { received: 10, sent: 4 };
    msg_weekdays[2] = { received: 3, sent: 1 };
    let rows = tsInsights.weekdayAverages(dates, msg_weekdays, 1);
    expect(rows[0]).toEqual({ weekday: 1, received: 5, sent: 2, occurrences: 2 });
    expect(rows[1]).toEqual({ weekday: 2, received: 3, sent: 1, occurrences: 1 });
    expect(rows[6]).toEqual({ weekday: 0, received: 0, sent: 0, occurrences: 0 });
  });

  it('heatGrid picks the hour rows and the max', () => {
    let grid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => ({ received: 0 })));
    grid[3][10].received = 9;
    let heat = tsInsights.heatGrid(grid, 8, 11, 1);
    expect(heat.rows.map(r => r.hour)).toEqual([8, 9, 10, 11]);
    expect(heat.rows[2].cells).toEqual([0, 0, 9, 0, 0, 0, 0]);
    expect(heat.max).toBe(9);
    expect(tsInsights.heatGrid(Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => ({ received: 0 }))), 0, 0, 0).max).toBe(1);
  });
});
