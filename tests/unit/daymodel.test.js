import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tsDayModel } from '@statslib/mzts-daymodel';
import { STREAK_STRIP_DAYS } from '@statslib/mzts-insights';
import { makeResult, makeInbox, mails } from '../fixtures/result.js';
import { day } from '../helpers.js';
import { tsStore } from '@statslib/mzts-store';

const TODAY = '20261013';        // Tuesday
const YESTERDAY = '20261012';    // Monday

const FOLDERS = {
  inbox: { name: 'Inbox', specialUse: ['inbox'] },
  work: { name: 'Work', specialUse: [] },
};

// msg_hours with `n` received mails at 9:00
function baselineDay(n) {
  let output = {};
  for (let h = 0; h < 24; h++) output[h] = { received: h == 9 ? n : 0, sent: 0 };
  return output;
}

function input(overrides) {
  return {
    kind: 'today', day: day(TODAY), result: null, inbox: null, baseline_days: null,
    prev_days: null, prev_days_num: 7, progressive: false, hide_future: false, cmp: null,
    internal: null, involved_num: 10, first_day_week: 1, duplicates_note: false,
    open_folder_in_first_tab: false, neutral_badge: false,
    ...overrides,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(day(TODAY, 10, 30));
});

describe('loading state', () => {
  it('builds with every input still null', () => {
    let model = tsDayModel.build(input({}));
    expect(model.kpis.map(k => [k.id, k.is_loading])).toEqual([['rcvd', true], ['sent', true], ['inbox', true], ['streak', true]]);
    expect(model.strip.badge_label).toBe('');
    expect(model.strip.badge_tone).toBe('neutral');
    expect(model.chart.rcvd).toEqual([]);
    expect(model.top.rows).toEqual([]);
    expect(model.domains).toEqual([]);
    expect(model.ended.folders).toEqual([]);
  });

  it('marks only the inbox KPIs as loading when the stats are there', () => {
    let model = tsDayModel.build(input({ result: makeResult([], { from: TODAY, to: TODAY }) }));
    expect(model.kpis.filter(k => k.is_loading).map(k => k.id)).toEqual(['inbox', 'streak']);
  });
});

describe('status badge', () => {
  const prev_days = { [YESTERDAY]: { received: 10 } };

  it.each([
    ['inbox at zero', {}, 'InboxZero', 'good'],
    ['keeping up', { [TODAY]: 3 }, 'KeepingUp', 'good'],
    ['backlog growing', { [TODAY]: 100 }, 'BacklogGrowing', 'warn'],
  ])('%s', (_, dates, label, tone) => {
    let model = tsDayModel.build(input({ inbox: makeInbox(dates), prev_days }));
    expect([model.strip.badge_label, model.strip.badge_tone]).toEqual([label, tone]);
  });

  it('is empty until the previous days are loaded', () => {
    expect(tsDayModel.build(input({ inbox: makeInbox({}) })).strip.badge_label).toBe('');
  });

  it('neutral_badge shows the query result badge', () => {
    let model = tsDayModel.build(input({ inbox: makeInbox({ [TODAY]: 100 }), prev_days, neutral_badge: true }));
    expect([model.strip.badge_label, model.strip.badge_tone]).toEqual(['QueryResult', 'neutral']);
  });

  it('shows how long the backlog takes to clear', () => {
    let model = tsDayModel.build(input({ inbox: makeInbox({ [TODAY]: 25 }), prev_days, prev_days_num: 1 }));
    expect(model.strip.side[1].value).toBe('~3');
    expect(model.strip.side[1].title).toBe('ClearInTooltip[1]');
  });
});

describe('strip flow', () => {
  it('splits the received mails into handled and still in the inbox', () => {
    let result = makeResult([
      ...mails(3, { key: TODAY, hour: 9 }),
      { key: TODAY, hour: 9, inbox: true },
    ], { from: TODAY, to: TODAY });
    let strip = tsDayModel.build(input({ result, inbox: makeInbox({ [TODAY]: 1, '20261008': 2 }) })).strip;
    expect(strip.flow.map(f => [f.value, f.sub])).toEqual([[4, ''], [3, '75.0%'], [1, 'OfInboxTotal[3]']]);
    expect([strip.bar_good, strip.bar_left]).toEqual(['75.0%', '25.0%']);
    // backlog added since the first day of the week (Monday 12): only today's mail
    expect(strip.side[0].value).toBe('+1');
  });

  it('shows the time range of today and the full day of the other days', () => {
    expect(tsDayModel.build(input({})).strip.date_line2).toBe('12:00 AM → 10:30 AM');
    expect(tsDayModel.build(input({ kind: 'yesterday', day: day(YESTERDAY) })).strip.date_line2).toBe('FullDayRange[12:00 AM|11:59 PM]');
  });

  it('formats the time range with the time format pref', () => {
    tsStore.time_format = '24';
    expect(tsDayModel.build(input({})).strip.date_line2).toBe('00:00 → 10:30');
    expect(tsDayModel.build(input({ kind: 'yesterday', day: day(YESTERDAY) })).strip.date_line2).toBe('FullDayRange[00:00|23:59]');
  });
});

describe('KPIs against the usual day', () => {
  const baseline_days = [baselineDay(4), baselineDay(4), baselineDay(4)];

  it('today compares with the usual count by now', () => {
    let result = makeResult(mails(6, { key: TODAY, hour: 8 }), { from: TODAY, to: TODAY });
    let rcvd = tsDayModel.build(input({ result, baseline_days })).kpis[0];
    expect(rcvd.label).toBe('KpiReceivedToday');
    expect(rcvd.value).toBe(6);
    expect(rcvd.delta).toEqual({ text: '▲ 50%', color: 'var(--warn)' });
    expect(rcvd.sub).toBe('VsUsualByNow[Tuesday|4]');
  });

  it('a past day compares with the weekday average', () => {
    let result = makeResult(mails(2, { key: YESTERDAY, hour: 9 }), { from: YESTERDAY, to: YESTERDAY });
    let rcvd = tsDayModel.build(input({ kind: 'yesterday', day: day(YESTERDAY), result, baseline_days })).kpis[0];
    expect(rcvd.label).toBe('KpiReceivedYesterday');
    expect(rcvd.delta.text).toBe('▼ 50%');
    expect(rcvd.sub).toBe('VsWeekdayAverage[Monday|4]');
  });

  it('says there is no history without baseline days', () => {
    let model = tsDayModel.build(input({ baseline_days: [] }));
    expect(model.kpis[0].delta).toBeNull();
    expect(model.kpis[0].sub).toBe('NoWeekdayHistory');
  });

  it('uses the "day" labels for any other kind', () => {
    expect(tsDayModel.build(input({ kind: 'day', day: day('20261001') })).kpis[1].label).toBe('KpiSentDay');
  });

  it('adds the internal traffic KPI only when enabled', () => {
    expect(tsDayModel.build(input({ internal: { enabled: false } })).kpis.map(k => k.id)).not.toContain('internal');
    let kpi = tsDayModel.build(input({ internal: { enabled: true, rcvd_percent: '45.6%', sent_percent: '10.2%' } })).kpis.find(k => k.id == 'internal');
    expect([kpi.value, kpi.sub]).toEqual(['46%', 'InternalTrafficSub[10%]']);
  });

  it('builds the Inbox Zero streak strip', () => {
    let streak = tsDayModel.build(input({ inbox: makeInbox({ '20261010': 9 }) })).kpis.find(k => k.id == 'streak');
    expect(streak.value).toBe(3);    // 11, 12, 13 at zero
    expect(streak.squares).toHaveLength(STREAK_STRIP_DAYS);
    expect(streak.squares.at(-1)).toMatchObject({ key: TODAY, bg: 'var(--accent)' });
    expect(streak.squares.find(s => s.key == '20261010').bg).toBe('var(--surface3)');
    expect(streak.aside).toBe(`InboxZeroStreakSub[${STREAK_STRIP_DAYS - 1}|${STREAK_STRIP_DAYS}]`);
  });
});

describe('chart', () => {
  it('hides the future hours of today and places the now line', () => {
    let result = makeResult(mails(2, { key: TODAY, hour: 9 }), { from: TODAY, to: TODAY });
    let chart = tsDayModel.build(input({ result, hide_future: true, progressive: true })).chart;
    expect(chart.rcvd.slice(8, 12)).toEqual([0, 2, 2, null]);
    expect(chart.now_position).toBe(10.5);
    expect(chart.callout.title).toBe('CalloutReceived[10:30 AM|2]');
  });

  it('a past day has no now line and the callout at the end of the day', () => {
    let result = makeResult(mails(2, { key: YESTERDAY, hour: 22 }), { from: YESTERDAY, to: YESTERDAY });
    let chart = tsDayModel.build(input({ kind: 'yesterday', day: day(YESTERDAY), result, hide_future: true })).chart;
    expect(chart.rcvd[22]).toBe(2);
    expect(chart.now_position).toBeNull();
    expect(chart.callout.title).toBe('CalloutReceived[11:59 PM|2]');
    tsStore.time_format = '24';
    expect(tsDayModel.build(input({ kind: 'yesterday', day: day(YESTERDAY), result })).chart.callout.title).toBe('CalloutReceived[23:59|2]');
  });

  it.each([
    [9, 'ChartNoteBusier'],
    [3, 'ChartNoteUsual'],
    [0, 'ChartNoteQuieter'],
  ])('%i received against a usual 2-4 range gives %s', (n, note) => {
    let result = makeResult(mails(n, { key: YESTERDAY, hour: 9 }), { from: YESTERDAY, to: YESTERDAY });
    let chart = tsDayModel.build(input({
      kind: 'yesterday', day: day(YESTERDAY), result, baseline_days: [baselineDay(2), baselineDay(4)],
    })).chart;
    expect(chart.note).toBe(note + '[Monday]');
    expect(chart.callout.sub).toBe('UsualByEndOfDay[2|4]');
  });

  it('adds the comparison day', () => {
    let result = makeResult([], { from: TODAY, to: TODAY });
    let cmp = { msg_hours: baselineDay(5), label: 'Last week' };
    let chart = tsDayModel.build(input({ result, cmp })).chart;
    expect(chart.cmp_rcvd[9]).toBe(5);
    expect(chart.cmp_label).toBe('Last week');
  });
});

describe('where the mails ended up', () => {
  it.each([
    ['some filed', [1, 3], 'EndedUpNote[3|4|Work]'],
    ['all filed', [0, 4], 'EndedUpNoteAllMoved[4|Work]'],
    ['none filed', [4, 0], 'EndedUpNoteNoneMoved[4]'],
  ])('%s', (_, [in_inbox, in_work], note) => {
    let result = makeResult([
      ...mails(in_inbox, { key: TODAY, folder: 'inbox' }),
      ...mails(in_work, { key: TODAY, folder: 'work' }),
    ], { from: TODAY, to: TODAY, folders: FOLDERS });
    let ended = tsDayModel.build(input({ result })).ended;
    expect(ended.note).toBe(note);
    expect(ended.title).toBe('EndedUpToday');
  });

  it('explains the duplicates and keeps the open folder option', () => {
    let ended = tsDayModel.build(input({ duplicates_note: true, open_folder_in_first_tab: true })).ended;
    expect(ended.info).toBe('InboxZeroFolderLocationNote');
    expect(ended.open_in_first_tab).toBe(true);
  });
});
