// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import WidgetStatusStrip from '@/components/widgets/WidgetStatusStrip.vue';
import WidgetInboxZeroCalendar from '@/components/widgets/WidgetInboxZeroCalendar.vue';
import WidgetDayDashboard from '@/components/widgets/WidgetDayDashboard.vue';
import WidgetPeriodDashboard from '@/components/widgets/WidgetPeriodDashboard.vue';
import { tsDayModel } from '@statslib/mzts-daymodel';
import { tsPeriodModel } from '@statslib/mzts-periodmodel';
import { makeResult, makeInbox, mails, dayKeys } from '../fixtures/result.js';
import { day } from '../helpers.js';

const TODAY = '20261013';

// Charts are stubbed (no canvas in happy-dom); the Vue warnings (wrong prop types, missing props) fail the test
let warnings;
function options(extra = {}) {
  return {
    global: {
      stubs: { ChartDayVsNormal: true, ChartPeriodDays: true, ChartHourlyAverage: true },
      config: { warnHandler: (msg) => warnings.push(msg) },
    },
    ...extra,
  };
}

beforeEach(() => {
  warnings = [];
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(day(TODAY, 10, 30));
});

describe('WidgetStatusStrip', () => {
  const props = {
    badge_label: 'Keeping up', badge_tone: 'good', date_line1: 'Tuesday', date_line2: '00:00 → 10:30',
    flow: [{ label: 'Arrived', value: 4, sub: '' }, { label: 'Handled', value: 3, sub: '75%', color: 'var(--good)' }, { label: 'Left', value: 1, sub: '' }],
    side: [{ label: 'Clear in', value: '~2', sub: 'days' }],
    bar_good: '75%', bar_left: '25%',
  };

  it('shows the badge, the flow with the arrows and the bar', () => {
    let wrapper = mount(WidgetStatusStrip, options({ props }));
    expect(wrapper.get('.ts-strip-badge').classes()).toContain('tone-good');
    expect(wrapper.get('.ts-strip-badge').text()).toBe('Keeping up');
    expect(wrapper.findAll('.ts-strip-value').map(v => v.text())).toEqual(['4', '3', '1', '~2']);
    expect(wrapper.findAll('.ts-strip-arrow')).toHaveLength(2);
    expect(wrapper.findAll('.ts-strip-value')[1].attributes('style')).toContain('color: var(--good)');
    expect(wrapper.get('.ts-strip-bar-good').attributes('style')).toContain('width: 75%');
  });

  it('shows the spinners and no bar while loading', () => {
    let wrapper = mount(WidgetStatusStrip, options({ props: { ...props, is_loading: true } }));
    expect(wrapper.findAll('.spinner_small')).toHaveLength(4);
    expect(wrapper.find('.ts-strip-value').exists()).toBe(false);
    expect(wrapper.find('.ts-strip-bar-good').exists()).toBe(false);
  });
});

describe('WidgetInboxZeroCalendar', () => {
  // the props come from tsPeriodModel.inboxZero
  function calendar(inbox) {
    let days = dayKeys('20261006', TODAY);
    return tsPeriodModel.inboxZero({ days, today_key: TODAY, inbox, first_day_week: 1 });
  }

  it('renders the cells of the model', () => {
    let wrapper = mount(WidgetInboxZeroCalendar, options({ props: calendar(makeInbox({ '20261008': 9, '20261009': 2 })) }));
    expect(wrapper.findAll('.ts-iz-head').map(h => h.text())).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect(wrapper.findAll('.ts-iz-pad')).toHaveLength(1);
    let cells = wrapper.findAll('.ts-iz-cell:not(.ts-iz-pad)');
    expect(cells.map(c => c.get('.ts-iz-day').text())).toEqual(['6', '7', '8', '9', '10', '11', '12', '13']);
    expect(wrapper.findAll('.ts-iz-month')).toHaveLength(1);
    expect(wrapper.find('.ts-iz-range').exists()).toBe(true);
    expect(cells[2].classes()).toContain('state-missed');
    expect(cells[3].classes()).toContain('state-few');
    expect(cells[7].classes()).toContain('state-zero');
    expect(cells[0].attributes('style')).toContain('height: 44px');
    expect(wrapper.findAll('.ts-iz-num').map(n => n.text())).toEqual(['6', '4']);
    expect(wrapper.get('.ts-iz-lbl').text()).toBe('DaysAtZero[8]');
  });

  it('shows the spinner until the inbox is loaded', () => {
    let wrapper = mount(WidgetInboxZeroCalendar, options({ props: calendar(null) }));
    expect(wrapper.find('.circle_wait').exists()).toBe(true);
    expect(wrapper.find('.ts-iz-grid').exists()).toBe(false);
  });
});

// The models and the dashboards must agree on the props: mounting the model output
// in every loading state must render without Vue warnings
describe('dashboards with the model output', () => {
  function dayModel(loaded) {
    return tsDayModel.build({
      kind: 'today', day: day(TODAY),
      result: loaded ? makeResult(mails(3, { key: TODAY, hour: 9, correspondent: 'a@x.it' }), { from: TODAY, to: TODAY }) : null,
      inbox: loaded ? makeInbox({ [TODAY]: 1 }) : null,
      baseline_days: null, prev_days: loaded ? { '20261012': { received: 4 } } : null, prev_days_num: 7,
      progressive: false, hide_future: true, cmp: null, internal: null, involved_num: 10, first_day_week: 1,
    });
  }

  function periodModel(loaded) {
    let days = dayKeys('20261006', TODAY);
    return tsPeriodModel.build({
      kind: 'manydays', days, stat_days: days.slice(0, -1), today_key: TODAY,
      result: loaded ? makeResult(mails(5, { key: '20261009', hour: 9, correspondent: 'a@x.it' }), { from: days[0], to: TODAY }) : null,
      inbox: loaded ? makeInbox({}) : null, prev: loaded ? { received: 2, sent: 0 } : null, aggregate: null,
      only_businessdays: false, show_inbox: true, internal: null, involved_num: 10, first_day_week: 1, aggregation: 'day', cmp_result: null,
    });
  }

  const LOADING = { strip: true, chart: true, involved: true, domains: true, folders: true };
  const LOADED = { strip: false, chart: false, involved: false, domains: false, folders: false };

  it.each([['loading', false, LOADING], ['loaded', true, LOADED]])('day dashboard, %s', (_, loaded, loading) => {
    let model = dayModel(loaded);
    let wrapper = mount(WidgetDayDashboard, options({ props: { ...model, loading } }));
    expect(warnings).toEqual([]);
    expect(wrapper.findAll('.ts-kpi-row > *')).toHaveLength(model.kpis.length);
    let chart = wrapper.findComponent({ name: 'ChartDayVsNormal' });
    expect(chart.props('rcvd')).toEqual(model.chart.rcvd);
    expect(chart.props('is_loading')).toBe(loading.chart);
    if (loaded) {
      expect(wrapper.text()).toContain('KeepingUp');
      expect(wrapper.findAll('.ts-streak-square')).toHaveLength(14);
    }
  });

  it('day dashboard opens the inbox age strip from the Inbox backlog KPI and remembers it', async () => {
    let inbox_dates = { [TODAY]: 1, '20260601': 2 };
    let model = tsDayModel.build({
      kind: 'today', day: day(TODAY),
      result: makeResult(mails(3, { key: TODAY, hour: 9, correspondent: 'a@x.it' }), { from: TODAY, to: TODAY }),
      inbox: makeInbox(inbox_dates), baseline_days: null, prev_days: { '20261012': { received: 4 } }, prev_days_num: 7,
      progressive: false, hide_future: true, cmp: null, internal: null, involved_num: 10, first_day_week: 1,
    });
    let wrapper = mount(WidgetDayDashboard, options({ props: { ...model, loading: LOADED, inbox_dates, inbox_loading: false } }));
    await flushPromises();
    expect(warnings).toEqual([]);
    expect(wrapper.find('.ts-age-stack').exists()).toBe(false);

    await wrapper.find('.ts-kpi-link').trigger('click');
    expect(wrapper.text()).toContain('InboxAgeKpiLink[2]');
    expect(wrapper.findAll('.ts-age-segment')).toHaveLength(2);
    expect(wrapper.find('.ts-kpi-toggle').attributes('aria-expanded')).toBe('true');
    expect((await browser.storage.sync.get('inbox_age_expanded')).inbox_age_expanded).toBe(true);

    await wrapper.find('.ts-kpi-toggle').trigger('click');
    expect(wrapper.find('.ts-age-stack').exists()).toBe(false);
    expect((await browser.storage.sync.get('inbox_age_expanded')).inbox_age_expanded).toBe(false);

    await browser.storage.sync.set({ inbox_age_expanded: true });
    let reopened = mount(WidgetDayDashboard, options({ props: { ...model, loading: LOADED, inbox_dates, inbox_loading: false } }));
    await flushPromises();
    expect(reopened.find('.ts-age-stack').exists()).toBe(true);
  });

  it.each([['loading', false, LOADING], ['loaded', true, LOADED]])('period dashboard, %s', (_, loaded, loading) => {
    let model = periodModel(loaded);
    let wrapper = mount(WidgetPeriodDashboard, options({ props: { ...model, loading } }));
    expect(warnings).toEqual([]);
    let chart = wrapper.findComponent({ name: 'ChartPeriodDays' });
    expect(chart.props('days')).toHaveLength(8);
    expect(chart.props('rcvd_inbox')).toEqual(model.chart.rcvd_inbox);
    if (loaded) {
      expect(wrapper.text()).toContain('InboxZero');
      expect(wrapper.text()).toContain('VsPreviousPeriod[7|2]');
    }
  });

  it('period dashboard emits the chosen aggregation', async () => {
    let wrapper = mount(WidgetPeriodDashboard, options({
      props: { ...periodModel(true), loading: LOADED, aggregations: [{ id: 'day', label: 'Day' }, { id: 'week', label: 'Week' }], aggregation: 'day' },
    }));
    let buttons = wrapper.findAll('.ts-mini-segmented button');
    expect(buttons[0].classes()).toContain('is-active');
    await buttons[1].trigger('click');
    expect(wrapper.emitted('aggregation')).toEqual([['week']]);
  });
});
