import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tsPeriodModel } from '@statslib/mzts-periodmodel';
import { makeResult, makeInbox, mails, dayKeys } from '../fixtures/result.js';
import { day } from '../helpers.js';
import { tsStore } from '@statslib/mzts-store';

const TODAY = '20261013';                          // Tuesday
const DAYS = dayKeys('20261006', TODAY);           // Many Days: 7 days + today
const STAT_DAYS = DAYS.slice(0, -1);               // Tue 6 - Mon 12: 5 business days, 2 weekend days
const BUSINESS = ['20261006', '20261007', '20261008', '20261009', '20261012'];

const FOLDERS = {
  inbox: { name: 'Inbox', specialUse: ['inbox'] },
  work: { name: 'Work', specialUse: [] },
};

// 10 received at 9:00 (2 left in the inbox) and 2 sent at 15:00 per business day,
// 1 received per weekend day, 3 received and 1 sent today
function periodMails() {
  let output = [];
  for (let key of BUSINESS) {
    output.push(...mails(8, { key, hour: 9, folder: 'work', domain: 'work.it', internal: true }));
    output.push(...mails(2, { key, hour: 9, inbox: true, folder: 'inbox', domain: 'other.com' }));
    output.push(...mails(2, { key, hour: 15, sent: true, domain: 'other.com' }));
  }
  output.push({ key: '20261010', hour: 11, folder: 'inbox' }, { key: '20261011', hour: 11, folder: 'inbox' });
  output.push(...mails(3, { key: TODAY, hour: 9, folder: 'inbox' }), { key: TODAY, hour: 15, sent: true });
  return output;
}

function aggregate() {
  return { max_received: 10, min_received: 1, avg_received: 7.43, max_sent: 2, min_sent: 0, avg_sent: 1.43 };
}

function input(overrides) {
  return {
    kind: 'manydays', days: DAYS, stat_days: STAT_DAYS, today_key: TODAY,
    result: null, inbox: null, prev: null, aggregate: null, only_businessdays: false, show_inbox: false,
    internal: null, involved_num: 10, first_day_week: 1, duplicates_note: false, open_folder_in_first_tab: false,
    aggregation: 'day', cmp_result: null,
    ...overrides,
  };
}

const RESULT = () => makeResult(periodMails(), { from: DAYS[0], to: TODAY, folders: FOLDERS });

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(day(TODAY, 18));
});

describe('loading state', () => {
  it('builds with only the days', () => {
    let model = tsPeriodModel.build(input({}));
    expect(model.kpis.every(k => k.is_loading)).toBe(true);
    expect(model.strip.badge_label).toBe('');
    expect(model.chart.days).toHaveLength(DAYS.length);
    expect(model.chart.note).toBe('');
    expect(model.tod.rcvd).toEqual([]);
    expect(model.iz.is_loading).toBe(true);
    expect(model.heat.msg_weekday_hours).toBeNull();
    expect(model.weekday.rows).toEqual([]);
    expect(model.domains).toEqual([]);
  });

  it('Many Days waits for the previous period, Custom Query does not', () => {
    expect(tsPeriodModel.build(input({ result: RESULT() })).kpis[0].is_loading).toBe(true);
    expect(tsPeriodModel.build(input({ kind: 'custom', result: RESULT() })).kpis[0].is_loading).toBe(false);
  });
});

describe('KPIs', () => {
  it('count the stat days only and report today apart', () => {
    let rcvd = tsPeriodModel.build(input({ result: RESULT(), prev: { received: 26, sent: 10 } })).kpis[0];
    expect(rcvd.value).toBe(52);
    expect(rcvd.aside).toBe('PlusToday[3]');
    expect(rcvd.delta).toEqual({ text: '▲ 100%', color: 'var(--warn)' });
    expect(rcvd.sub).toBe('VsPreviousPeriod[7|26]');
    expect(rcvd.is_loading).toBe(false);
  });

  it('show the average per day without a reference', () => {
    let model = tsPeriodModel.build(input({ kind: 'custom', today_key: null, result: RESULT(), aggregate: aggregate() }));
    expect(model.kpis[0].sub).toBe('AvgPerDay[7.4]');
    expect(model.kpis[0].sub2).toBe('DailyStats[10|1|7.43]');
    expect(model.kpis[0].aside).toBe('');
    expect(model.kpis[1].sub).toBe('AvgPerDay[1.4]');
  });

  it('compare with Period B in a Custom Query comparison', () => {
    let cmp_result = makeResult(mails(13, { key: '20260915' }), { from: '20260915', to: '20260921' });
    let rcvd = tsPeriodModel.build(input({ kind: 'custom', result: RESULT(), cmp_result })).kpis[0];
    expect(rcvd.delta.text).toBe('▲ 300%');
    expect(rcvd.sub).toBe('VsPeriodB[13]');
  });

  it('reply ratio', () => {
    let ratio = tsPeriodModel.build(input({ result: RESULT() })).kpis.find(k => k.id == 'ratio');
    expect([ratio.value, ratio.sub]).toEqual(['1 : 5.2', 'ReplyRatioSub[5.2]']);
    let none = tsPeriodModel.build(input({ result: makeResult([], { from: DAYS[0], to: TODAY }) })).kpis.find(k => k.id == 'ratio');
    expect([none.value, none.sub]).toEqual(['—', 'NoMailsSent']);
  });
});

describe('averages of a Custom Query ending today', () => {
  const days = dayKeys('20261009', TODAY);    // Fri, Sat, Sun, Mon and today
  const result = () => makeResult([
    ...mails(4, { key: '20261009' }),
    ...mails(1, { key: '20261010' }),
    ...mails(1, { key: '20261011' }),
    ...mails(6, { key: '20261012' }),
    ...mails(20, { key: TODAY, hour: 9 }),
  ], { from: days[0], to: TODAY });
  // the aggregate computed by the tab counts today
  const core_aggregate = { max_received: 20, min_received: 1, avg_received: 6.4, max_sent: 0, min_sent: 0, avg_sent: 0 };

  function build(only_businessdays) {
    return tsPeriodModel.build(input({
      kind: 'custom', days, stat_days: days, today_key: null, result: result(), aggregate: core_aggregate, only_businessdays,
    }));
  }

  it('leave out the day in progress, the totals keep it', () => {
    let model = build(false);
    expect(model.kpis[0].value).toBe(32);
    expect(model.kpis[0].sub).toBe('AvgPerDay[3]');
    expect(model.kpis[0].sub2).toBe('DailyStats[6|1|3]');
    expect(model.chart.avg_rcvd).toBe(3);
    expect(model.strip.side[0].value).toBe(5);              // Friday and Monday
    expect(model.tod.rcvd[9]).toBe(0);                      // today's mails at 9:00 left out
    expect(model.tod.rcvd[12]).toBe(3);
    expect(model.weekday.rows[1]).toMatchObject({ received: 0, sent: 0 });    // Tuesday: only today
    expect(model.chart.note).toMatch(/^PeriodNoteWorkingDays\[5\|1\] PeriodNotePeak\[.+\|20\]$/);
  });

  it('on business days only', () => {
    let model = build(true);
    expect(model.kpis[0].sub2).toBe('DailyStats[6|4|5]');
    expect(model.chart.avg_rcvd).toBe(5);
  });

  it('keep the aggregate of the tab when the range does not include today', () => {
    let past = dayKeys('20261005', '20261009');
    let model = tsPeriodModel.build(input({
      kind: 'custom', days: past, stat_days: past, today_key: null, result: makeResult([], { from: past[0], to: past.at(-1) }), aggregate: core_aggregate,
    }));
    expect(model.kpis[0].sub2).toBe('DailyStats[20|1|6.4]');
  });
});

describe('status strip', () => {
  it('Many Days shows the keeping-up status, Custom Query the query result', () => {
    expect(tsPeriodModel.build(input({ result: RESULT(), inbox: makeInbox({}) })).strip.badge_label).toBe('InboxZero');
    let custom = tsPeriodModel.build(input({ kind: 'custom', result: RESULT(), inbox: makeInbox({}) })).strip;
    expect([custom.badge_label, custom.badge_tone]).toEqual(['QueryResult', 'neutral']);
  });

  it('flow, working days and busiest day', () => {
    let strip = tsPeriodModel.build(input({ result: RESULT() })).strip;
    expect(strip.flow.map(f => f.value)).toEqual([52, 42, 10]);
    expect(strip.date_line2).toBe('PeriodDaysInfo[7|5]');
    expect(strip.side[0].value).toBe(10);
    expect(strip.side[1].sub).toBe('NumReceived[10]');
  });
});

describe('main chart', () => {
  it('has one entry per shown day, with today and the non-business days marked', () => {
    let chart = tsPeriodModel.build(input({ result: RESULT() })).chart;
    expect(chart.days.map(d => d.key)).toEqual(DAYS);
    expect(chart.days.at(-1).is_today).toBe(true);
    expect(chart.days.filter(d => !d.is_business).map(d => d.key)).toEqual(['20261010', '20261011']);
    expect(chart.rcvd).toEqual([10, 10, 10, 10, 1, 1, 10, 3]);
    expect(chart.rcvd_inbox).toBeNull();
    expect(chart.note).toMatch(/^PeriodNoteWorkingDays\[10\|1\] PeriodNotePeak\[.+\|10\]$/);
  });

  it('show_inbox splits the received mails still in the inbox', () => {
    let chart = tsPeriodModel.build(input({ result: RESULT(), show_inbox: true })).chart;
    expect(chart.rcvd.slice(0, 2)).toEqual([8, 8]);
    expect(chart.rcvd_inbox.slice(0, 2)).toEqual([2, 2]);
  });

  it('averages on business days only when asked', () => {
    let all = tsPeriodModel.build(input({ result: RESULT() })).chart;
    expect(all.avg_rcvd).toBeCloseTo(52 / 7);
    expect(all.avg_label).toBe('AvgChip');
    let business = tsPeriodModel.build(input({ result: RESULT(), only_businessdays: true })).chart;
    expect(business.avg_rcvd).toBe(10);
    expect(business.avg_label).toBe('AvgPerWorkingDayChip');
  });

  it('groups by month in a Custom Query', () => {
    let days = dayKeys('20260928', '20261004');
    let result = makeResult([
      ...mails(4, { key: '20260929' }),
      ...mails(6, { key: '20261002' }),
    ], { from: days[0], to: days.at(-1) });
    let chart = tsPeriodModel.build(input({ kind: 'custom', days, stat_days: days, today_key: null, result, aggregation: 'month' })).chart;
    expect(chart.days.map(d => d.key)).toEqual(['202609', '202610']);
    expect(chart.rcvd).toEqual([4, 6]);
    expect(chart.avg_rcvd).toBe(5);
    expect(chart.note).toMatch(/^PeriodNotePeak\[.+\|6\]$/);
  });

  it('aligns Period B by position', () => {
    let days = dayKeys('20261005', '20261007');
    let result = makeResult([], { from: days[0], to: days.at(-1) });
    let cmp_result = makeResult([
      ...mails(1, { key: '20260901' }), ...mails(2, { key: '20260902' }), ...mails(3, { key: '20260903' }), ...mails(4, { key: '20260904' }),
    ], { from: '20260901', to: '20260904' });
    let chart = tsPeriodModel.build(input({ kind: 'custom', days, stat_days: days, today_key: null, result, cmp_result })).chart;
    expect(chart.cmp_rcvd).toEqual([1, 2, 3]);
    expect(chart.cmp_label).toBe('PeriodB');
  });
});

describe('main chart zoom (Custom Query)', () => {
  const ZOOM_DAYS = dayKeys('20260928', '20261011');     // two ISO weeks, Monday to Sunday
  const zoomResult = () => makeResult([
    ...mails(4, { key: '20260929' }),
    ...mails(6, { key: '20261002' }),
    ...mails(5, { key: '20261006' }),
  ], { from: ZOOM_DAYS[0], to: ZOOM_DAYS.at(-1) });
  const custom = (overrides) => input({ kind: 'custom', days: ZOOM_DAYS, stat_days: ZOOM_DAYS, today_key: null, result: zoomResult(), ...overrides });

  it('shows only the zoomed days and keeps the averages of the whole period', () => {
    let whole = tsPeriodModel.build(custom({})).chart;
    let zoomed = tsPeriodModel.build(custom({ zoom_days: ZOOM_DAYS.slice(1, 5) })).chart;
    expect(whole.zoom_text).toBe('');
    expect(zoomed.zoom_text).not.toBe('');
    expect(zoomed.days.map(d => d.key)).toEqual(['20260929', '20260930', '20261001', '20261002']);
    expect(zoomed.days[0]).toMatchObject({ first: '20260929', last: '20260929' });
    expect(zoomed.rcvd).toEqual([4, 0, 0, 6]);
    expect(zoomed.avg_rcvd).toBeCloseTo(whole.avg_rcvd);
    expect(zoomed.note).toMatch(/\|6\]$/);
  });

  it('groups only the zoomed days, with the per-bucket averages of the whole period', () => {
    let zoomed = tsPeriodModel.build(custom({ zoom_days: dayKeys('20261001', '20261006'), aggregation: 'week' })).chart;
    expect(zoomed.rcvd).toEqual([6, 5]);     // the mails of 29 September are out of the zoom
    expect(zoomed.days.map(d => [d.first, d.last])).toEqual([['20261001', '20261004'], ['20261005', '20261006']]);
    expect(zoomed.avg_rcvd).toBe(7.5);       // (10 + 5) / 2 weeks
  });

  it('gives the first and last day of each bucket without zoom', () => {
    let chart = tsPeriodModel.build(custom({ aggregation: 'month' })).chart;
    expect(chart.days.map(d => [d.key, d.first, d.last])).toEqual([['202609', '20260928', '20260930'], ['202610', '20261001', '20261011']]);
    expect(chart.rcvd).toEqual([4, 11]);
  });

  it('cuts Period B with the same offset', () => {
    let days = dayKeys('20261005', '20261007');
    let result = makeResult([], { from: days[0], to: days.at(-1) });
    let cmp_result = makeResult([
      ...mails(1, { key: '20260901' }), ...mails(2, { key: '20260902' }), ...mails(3, { key: '20260903' }),
    ], { from: '20260901', to: '20260903' });
    let chart = tsPeriodModel.build(input({ kind: 'custom', days, stat_days: days, today_key: null, result, cmp_result, zoom_days: days.slice(1) })).chart;
    expect(chart.cmp_rcvd).toEqual([2, 3]);
  });
});

describe('Inbox Zero calendar', () => {
  it('pads to the first day of the week and counts the zero days', () => {
    let iz = tsPeriodModel.build(input({ inbox: makeInbox({ '20261008': 9 }) })).iz;
    expect(iz.cells[0]).toEqual({ key: 'pad0', pad: true });    // Tuesday 6, weeks start on Monday
    expect(iz.cells.filter(c => !c.pad)).toHaveLength(DAYS.length);
    expect(iz.zero).toBe(DAYS.length - 1);
    expect(iz.streak).toBe(5);    // 9 - 13
    expect(iz.big).toBe(true);
    expect(iz.weekday_labels[0]).toBe('Mon');
  });

  it('shows at most the last 6 weeks', () => {
    let days = dayKeys('20260601', TODAY);
    let iz = tsPeriodModel.build(input({ kind: 'custom', days, stat_days: days, inbox: makeInbox({}), first_day_week: 0 })).iz;
    expect(iz.total).toBe(42);
    expect(iz.cells.filter(c => !c.pad)[0].key).toBe('20260902');
    expect(iz.big).toBe(false);
  });
});

describe('notes of the other widgets', () => {
  it('time of day peaks', () => {
    tsStore.time_format = '24';
    let tod = tsPeriodModel.build(input({ result: RESULT() })).tod;
    expect(tod.note).toBe('TimeOfDayNote[08:00|10:00|14:00|16:00]');
    expect(tod.rcvd[9]).toBe(50 / STAT_DAYS.length);    // today left out
    expect(tod.sent[15]).toBe(10 / STAT_DAYS.length);
  });

  it('heatmap peak and busiest weekday', () => {
    expect(tsPeriodModel.build(input({ result: RESULT() })).heat.note).toBe('HeatNote[08:00 AM|10:00 AM|Tuesday]');
    tsStore.time_format = '24';
    expect(tsPeriodModel.build(input({ result: RESULT() })).heat.note).toBe('HeatNote[08:00|10:00|Tuesday]');
  });

  it('weekday averages leave out today', () => {
    let weekday = tsPeriodModel.build(input({ result: RESULT() })).weekday;
    expect(weekday.rows.map(r => r.label)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect(weekday.rows[1]).toMatchObject({ received: 10, sent: 2 });    // only Tuesday 6, not today (3 received, 1 sent)
    expect(weekday.note).toBe('');    // every business weekday has 10
  });

  it('busiest against lightest business weekday', () => {
    let days = dayKeys('20260928', '20261004');
    let result = makeResult([
      ...mails(10, { key: '20260928' }),    // Monday
      ...mails(5, { key: '20260929' }),     // Tuesday
      ...mails(8, { key: '20260930' }),
      ...mails(8, { key: '20261001' }),
      ...mails(8, { key: '20261002' }),
    ], { from: days[0], to: days.at(-1) });
    let weekday = tsPeriodModel.build(input({ kind: 'custom', days, stat_days: days, today_key: null, result })).weekday;
    expect(weekday.note).toBe('WeekdayNote[Monday|Tuesday|50]');
  });

  it('domains, folders and tags get the Period B values', () => {
    let cmp_result = makeResult([
      { key: '20260901', domain: 'work.it', folder: 'work' },
      { key: '20260901', sent: true, domain: 'work.it' },
    ], { from: '20260901', to: '20260901', folders: FOLDERS });
    let model = tsPeriodModel.build(input({ kind: 'custom', result: RESULT(), cmp_result }));
    expect(model.domains.find(r => r.name == 'work.it')).toMatchObject({ received: 40, cmp_received: 1, cmp_sent: 1, internal: true });
    expect(model.domains.find(r => r.name == 'other.com')).toMatchObject({ cmp_received: 0, cmp_sent: 0 });
    expect(model.ended.folders.map(f => [f.id, f.cmp_n])).toEqual([['inbox', 0], ['work', 1]]);
  });

  it('folders footnote counts the same days as the KPIs and the strip', () => {
    let model = tsPeriodModel.build(input({ result: RESULT() }));
    expect(model.ended.note).toBe('EndedUpNote[42|52|Work]');
    expect(model.strip.flow.map(f => f.value).slice(0, 2)).toEqual([52, 42]);
  });
});
