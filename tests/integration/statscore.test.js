import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  thunderStastsCore, clearCoreCaches, setMaxConcurrentQueries, setRecentDaysCacheDays, MESSAGES_PER_PAGE,
} from '@statslib/mzts-statscore';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import { tsUtils } from '@statslib/mzts-utils';
import { tsStore } from '@statslib/mzts-store';
import { createMailbox, addMail, addMails, vCard, ME, ME_GMAIL } from '../fixtures/mailbox.js';
import { day } from '../helpers.js';

const TODAY = '20261013';        // Tuesday
const YESTERDAY = '20261012';    // Monday

let mailbox;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(day(TODAY, 10, 30));
  clearCoreCaches();
  setRecentDaysCacheDays(49);
  setMaxConcurrentQueries(2);
  mailbox = createMailbox();
  browser.mailbox = mailbox;
  browser.tags = [{ key: '$label1', tag: 'Important', color: '#ff0000', ordinal: '' }];
});

afterEach(() => {
  setMaxConcurrentQueries(2);
});

const key = (date) => tsUtils.dateToYYYYMMDD(date);
const flush = () => new Promise(resolve => setImmediate(resolve));

describe('getFullStatsData', () => {
  // Monday 12: 3 received in the inbox, 1 internal in Clients, 1 in the archives,
  // 2 sent (one with an external recipient, one internal only), plus mails that must not be counted
  function fillDay() {
    addMails(mailbox, 3, { key: YESTERDAY, hour: 9 });
    addMail(mailbox, { key: YESTERDAY, hour: 11, from: 'Anna <anna@work.it>', folder: 'acc1://Clients', tags: ['$label1'] });
    addMail(mailbox, { key: YESTERDAY, folder: 'acc1://Archives' });
    addMail(mailbox, { key: YESTERDAY, hour: 15, sent: true, cc: ['luca@work.it'] });
    addMail(mailbox, { key: YESTERDAY, hour: 15, sent: true, to: ['anna@work.it'] });
    for (let folder of ['acc1://Trash', 'acc1://Trash/Old', 'acc1://Drafts', 'acc1://Junk', 'acc1://Templates', 'acc2://INBOX']) {
      addMail(mailbox, { key: YESTERDAY, folder });
    }
    addMail(mailbox, { key: TODAY });
  }

  it('counts sent and received by day, hour and weekday', async () => {
    fillDay();
    let result = await new thunderStastsCore().getSingleDay(day(YESTERDAY), 'acc1', [ME], ['work.it']);
    expect([result.received, result.sent, result.count, result.count_in_inbox]).toEqual([5, 2, 7, 3]);
    expect(Object.keys(result.dates)).toEqual([YESTERDAY]);
    expect(Object.keys(result.dates_weeks)).toEqual(['202642']);
    expect(result.dates[YESTERDAY]).toMatchObject({ count: 7, sent: 2, received: 5, inbox: 3 });
    expect(result.msg_hours_days[YESTERDAY][9].received).toBe(3);
    expect(result.msg_hours_days[YESTERDAY][15].sent).toBe(2);
    expect([result.msg_hours[9].received, result.msg_hours[10].received, result.msg_hours[11].received, result.msg_hours[15].sent])
      .toEqual([3, 1, 1, 2]);
    expect(result.msg_weekdays[1]).toMatchObject({ received: 5, sent: 2 });
    expect(result.msg_weekday_hours[1][9]).toEqual({ received: 3, sent: 0 });
  });

  it('splits internal and external traffic by domain', async () => {
    fillDay();
    let result = await new thunderStastsCore().getSingleDay(day(YESTERDAY), 'acc1', [ME], ['work.it']);
    expect(result.domains).toEqual({
      'client.com': { count: 5, sent: 1, received: 4, internal: false },
      'work.it': { count: 3, sent: 2, received: 1, internal: true },
    });
    expect(result.dates[YESTERDAY]).toMatchObject({ received_internal: 1, received_external: 4, sent_internal: 1, sent_external: 1 });
    expect(result.tags.$label1).toMatchObject({ count: 1, received: 1, received_internal: 1 });
  });

  it('groups by folder', async () => {
    fillDay();
    let result = await new thunderStastsCore().getSingleDay(day(YESTERDAY), 'acc1', [ME], []);
    let folders = Object.fromEntries(Object.entries(result.folders).map(([id, f]) => [id, [f.received, f.sent]]));
    expect(folders).toEqual({ 'acc1://INBOX': [3, 0], 'acc1://Clients': [1, 0], 'acc1://Archives': [1, 0], 'acc1://Sent': [0, 2] });
    expect(result.folders['acc1://INBOX'].folder_data.specialUse).toEqual(['inbox']);
  });

  it('lists the correspondents with the address book names first', async () => {
    fillDay();
    browser.contacts = [vCard('Anna Bianchi', 'ANNA@work.it')];
    let result = await new thunderStastsCore({ _involved_num: 10 }).getSingleDay(day(YESTERDAY), 'acc1', [ME], []);
    expect(result.senders).toEqual({
      'mario@client.com': { count: 4, name: 'Mario Rossi' },
      'anna@work.it': { count: 1, name: 'Anna Bianchi' },
    });
    expect(result.recipients).toEqual({
      'mario@client.com': { count: 1, name: 'Mario Rossi' },
      'luca@work.it': { count: 1, name: '' },
      'anna@work.it': { count: 1, name: 'Anna Bianchi' },
    });
  });

  it('keeps only the top _involved_num correspondents', async () => {
    for (let i = 1; i <= 4; i++) addMails(mailbox, i, { key: YESTERDAY, from: `p${i}@x.com` });
    let result = await new thunderStastsCore({ _involved_num: 2 }).getSingleDay(day(YESTERDAY), 'acc1', [ME], []);
    expect(Object.keys(result.senders)).toEqual(['p4@x.com', 'p3@x.com']);
  });

  it('queries only the useful folders of the account, in big pages', async () => {
    let core = new thunderStastsCore();
    await core.getSingleDay(day(YESTERDAY), 'acc1', [ME], []);
    let query = browser.calls.query[0];
    expect(query.folderId).toEqual(['acc1://INBOX', 'acc1://INBOX/Projects', 'acc1://Sent', 'acc1://Clients', 'acc1://Archives', 'acc1://Archives/2025']);
    expect(query.includeSubFolders).toBe(false);
    expect(query.messagesPerPage).toBe(MESSAGES_PER_PAGE);
  });

  it('skips the archives when the account setting excludes them', async () => {
    fillDay();
    await browser.storage.sync.set({ accounts_adv_settings: [{ id: 'acc1', include_archive: false }] });
    let result = await new thunderStastsCore().getSingleDay(day(YESTERDAY), 'acc1', [ME], []);
    expect(browser.calls.query[0].folderId).not.toContain('acc1://Archives');
    expect(result.received).toBe(4);
  });

  it('reads all the pages of a long list', async () => {
    addMails(mailbox, 2 * MESSAGES_PER_PAGE + 1, { key: YESTERDAY });
    let result = await new thunderStastsCore().getSingleDay(day(YESTERDAY), 'acc1', [ME], []);
    expect(result.received).toBe(2 * MESSAGES_PER_PAGE + 1);
    expect(browser.calls.continueList).toHaveLength(2);
  });

  it('counts a duplicated message once, but in every folder it is in', async () => {
    addMail(mailbox, { key: YESTERDAY, header_id: 'same@test' });
    addMail(mailbox, { key: YESTERDAY, header_id: 'same@test', folder: 'acc1://Clients' });
    await browser.storage.sync.set({ accounts_adv_settings: [{ id: 'acc1', filter_duplicates: true }] });
    let result = await new thunderStastsCore().getSingleDay(day(YESTERDAY), 'acc1', [ME], []);
    expect(result.received).toBe(1);
    expect(result.folders['acc1://INBOX'].received).toBe(1);
    expect(result.folders['acc1://Clients'].received).toBe(1);
  });

  it('skips a duplicated message also when its author has no address', async () => {
    addMail(mailbox, { key: YESTERDAY, header_id: 'same@test', from: 'Mailer Daemon' });
    addMail(mailbox, { key: YESTERDAY, header_id: 'same@test', from: 'Mailer Daemon', folder: 'acc1://Clients' });
    await browser.storage.sync.set({ accounts_adv_settings: [{ id: 'acc1', filter_duplicates: true }] });
    let result = await new thunderStastsCore().getSingleDay(day(YESTERDAY), 'acc1', [ME], []);
    expect(result.count).toBe(1);
    expect(result.dates[YESTERDAY].count).toBe(1);
  });

  it('counts a duplicated inbox message once in count_in_inbox', async () => {
    addMail(mailbox, { key: YESTERDAY, header_id: 'same@test' });
    addMail(mailbox, { key: YESTERDAY, header_id: 'same@test', folder: 'acc1://INBOX/Projects' });
    mailbox.accounts[0].folders[0].subFolders[0].specialUse = ['inbox'];
    await browser.storage.sync.set({ accounts_adv_settings: [{ id: 'acc1', filter_duplicates: true }] });
    let result = await new thunderStastsCore().getSingleDay(day(YESTERDAY), 'acc1', [ME], []);
    expect([result.received, result.count_in_inbox, result.dates[YESTERDAY].inbox]).toEqual([1, 1, 1]);
  });

  it('recognizes an identity with sub-addressing as the author', async () => {
    addMail(mailbox, { key: YESTERDAY, sent: true, from: 'Me <me+news@work.it>' });
    let result = await new thunderStastsCore().getSingleDay(day(YESTERDAY), 'acc1', [ME, 'me+news@work.it'], []);
    expect([result.sent, result.received]).toEqual([1, 0]);
  });

  it('counts the duplicates when the filter is off', async () => {
    addMail(mailbox, { key: YESTERDAY, header_id: 'same@test' });
    addMail(mailbox, { key: YESTERDAY, header_id: 'same@test', folder: 'acc1://Clients' });
    let result = await new thunderStastsCore().getSingleDay(day(YESTERDAY), 'acc1', [ME], []);
    expect(result.received).toBe(2);
  });
});

describe('Custom Query advanced filters', () => {
  const FILTERS = { folders: ['acc1://INBOX', 'acc1://INBOX'], folders_do_subfolders: true, filterSubject: 'Invoice', read_unread: 2, flagged_unflagged: 1 };

  it('pass the filters to the query', async () => {
    addMail(mailbox, { key: YESTERDAY, folder: 'acc1://INBOX/Projects', subject: 'Invoice 42', read: false, flagged: true });
    addMail(mailbox, { key: YESTERDAY, subject: 'Invoice 43', read: true, flagged: true });
    addMail(mailbox, { key: YESTERDAY, folder: 'acc1://Clients', subject: 'Invoice 44', read: false, flagged: true });
    let result = await new thunderStastsCore().getCustomQryData(day(YESTERDAY), day(YESTERDAY), 'acc1', [ME], false, FILTERS, []);
    expect(browser.calls.query[0]).toMatchObject({
      folderId: ['acc1://INBOX'], includeSubFolders: true, subject: 'Invoice', unread: true, flagged: true,
    });
    expect(result.received).toBe(1);
  });

  it('ignore the folders for all the accounts', async () => {
    await new thunderStastsCore().getCustomQryData(day(YESTERDAY), day(YESTERDAY), 0, [ME], false, FILTERS, []);
    expect(browser.calls.query[0].folderId).toContain('acc2://INBOX');
    expect(browser.calls.query[0].includeSubFolders).toBe(false);
  });

  it('map read and flagged to the query values', async () => {
    let core = new thunderStastsCore();
    await core.getCustomQryData(day(YESTERDAY), day(YESTERDAY), 'acc1', [ME], false, { read_unread: '1', flagged_unflagged: '2' }, []);
    await core.getCustomQryData(day(YESTERDAY), day(YESTERDAY), 'acc1', [ME], false, { read_unread: 0, flagged_unflagged: 0 }, []);
    expect(browser.calls.query[0]).toMatchObject({ unread: false, flagged: false });
    expect(browser.calls.query[1]).not.toHaveProperty('unread');
    expect(browser.calls.query[1]).not.toHaveProperty('flagged');
  });

  it('still skip trash and drafts when the user picks them', async () => {
    addMail(mailbox, { key: YESTERDAY, folder: 'acc1://Trash' });
    let result = await new thunderStastsCore().getCustomQryData(day(YESTERDAY), day(YESTERDAY), 'acc1', [ME], false, { folders: ['acc1://Trash'] }, []);
    expect(result.received).toBe(0);
  });

  it('aggregate on business days only when asked', async () => {
    addMails(mailbox, 4, { key: '20261009' });    // Friday
    addMails(mailbox, 1, { key: '20261010' });    // Saturday
    let result = await new thunderStastsCore().getCustomQryData(day('20261009'), day('20261011'), 'acc1', [ME], true, null, []);
    expect(result.aggregate).toMatchObject({ total_received: 4, max_received: 4, min_received: 4, avg_received: 4 });
  });
});

describe('getAggregatedStatsData', () => {
  it('counts by day and ignores the messages of the days outside the range', async () => {
    addMails(mailbox, 2, { key: YESTERDAY, hour: 15 });
    addMail(mailbox, { key: TODAY, hour: 9 });
    // from 12:00 to the next day 11:00: the days array has only the first day
    let result = await new thunderStastsCore().getAggregatedStatsData(day(YESTERDAY, 12), day(TODAY, 11), 'acc1', [ME], false);
    expect(result.msg_days).toEqual({ [YESTERDAY]: expect.objectContaining({ sent: 0, received: 2 }) });
    expect([result.received, result.count]).toEqual([2, 2]);
    expect(result.aggregate.total_received).toBe(2);
  });
});

describe('aggregateData', () => {
  const dates = {
    '20261009': { sent: 2, received: 4 },     // Friday
    '20261010': { sent: 0, received: 1 },     // Saturday
    '20261012': { sent: 1, received: 7 },     // Monday
  };

  it('computes total, max, min and average', async () => {
    expect(await new thunderStastsCore().aggregateData(dates, false)).toEqual({
      total_sent: 3, max_sent: 2, min_sent: 0, avg_sent: 1,
      total_received: 12, max_received: 7, min_received: 1, avg_received: 4,
    });
  });

  it('returns zeros when no day is left', async () => {
    let weekend = { '20261010': { sent: 1, received: 2 }, '20261011': { sent: 0, received: 3 } };
    expect(await new thunderStastsCore().aggregateData(weekend, true)).toEqual({
      total_sent: 0, max_sent: 0, min_sent: 0, avg_sent: 0,
      total_received: 0, max_received: 0, min_received: 0, avg_received: 0,
    });
  });

  it('follows the business days preference by default', async () => {
    await browser.storage.sync.set({ bday_default_only: true });
    expect(await new thunderStastsCore().aggregateData(dates)).toMatchObject({ total_received: 11, min_received: 4, avg_received: 5.5 });
  });
});

describe('count-only stats', () => {
  it('count yesterday only up to the current time, but keep every hour', async () => {
    addMail(mailbox, { key: YESTERDAY, hour: 9 });
    addMail(mailbox, { key: YESTERDAY, hour: 15 });
    addMail(mailbox, { key: YESTERDAY, hour: 8, sent: true });
    let result = await new thunderStastsCore().getToday_YesterdayData('acc1', [ME], true);
    expect([result.received, result.sent, result.count]).toEqual([1, 1, 2]);
    expect([result.msg_hours[9].received, result.msg_hours[15].received]).toEqual([1, 1]);
  });

  it('count nothing in the totals when not counting to the current time', async () => {
    addMail(mailbox, { key: YESTERDAY, hour: 9 });
    let result = await new thunderStastsCore().getToday_YesterdayData('acc1', [ME], false);
    expect([result.received, result.msg_hours[9].received]).toEqual([0, 1]);
  });
});

describe('folders and preferences', () => {
  it('getStatsFoldersIds covers every account and is read once per instance', async () => {
    let core = new thunderStastsCore();
    let ids = await core.getStatsFoldersIds(0);
    expect(ids).toContain('acc2://Sent');
    expect(ids).not.toContain('acc1://Trash/Old');
    await core.getStatsFoldersIds(0);
    expect(browser.calls.accountsList).toBe(1);
  });

  it('getAccountEmails adds the custom identities', async () => {
    await browser.storage.sync.set({ custom_identities: { acc1: ['Alias@Work.it'], acc2: ['*@team.gmail.com'] } });
    expect(await tsCoreUtils.getAccountEmails('acc1')).toEqual([ME, 'alias@work.it']);
    expect(await tsCoreUtils.getAccountEmails('acc1', true)).toEqual([ME]);
    expect(await tsCoreUtils.getAccountEmails(0)).toEqual([ME, ME_GMAIL, 'alias@work.it', '*@team.gmail.com']);
  });

  it('the duplicates filter defaults to on for Gmail accounts', async () => {
    expect(await tsCoreUtils.getFilterDuplicatesPreference('acc1')).toBe(false);
    expect(await tsCoreUtils.getFilterDuplicatesPreference('acc2')).toBe(true);
    await browser.storage.sync.set({ accounts_adv_settings: [{ id: 'acc2', filter_duplicates: false }], filter_duplicates_multi_account: true });
    expect(await tsCoreUtils.getFilterDuplicatesPreference('acc2')).toBe(false);
    expect(await tsCoreUtils.getFilterDuplicatesPreference(0)).toBe(true);
  });

  it('the archives are included by default', async () => {
    expect(await tsCoreUtils.getIncludeArchivePreference('acc1')).toBe(true);
    expect(await tsCoreUtils.getIncludeArchivePreference(0)).toBe(true);
    await browser.storage.sync.set({ include_archive_multi_account: false });
    expect(await tsCoreUtils.getIncludeArchivePreference(0)).toBe(false);
  });
});

describe('Inbox Zero cache', () => {
  beforeEach(() => {
    addMail(mailbox, { key: '20261001', read: false });
    addMails(mailbox, 2, { key: YESTERDAY });
    addMail(mailbox, { key: YESTERDAY, folder: 'acc1://INBOX/Projects' });
    addMail(mailbox, { key: YESTERDAY, folder: 'acc2://INBOX', read: false });
  });

  it('counts total, unread and arrival dates of the inbox folders', async () => {
    let inbox = await new thunderStastsCore().getInboxZeroDates('acc1');
    expect(inbox).toMatchObject({ total: 3, unread: 1, dates: { '20261001': 1, [YESTERDAY]: 2 } });
    let all = await new thunderStastsCore().getInboxZeroDates(0);
    expect([all.total, all.unread]).toEqual([4, 2]);
  });

  it('is scanned once for every tab and caller, until cleared', async () => {
    let [a, b] = await Promise.all([new thunderStastsCore().getInboxZeroDates('acc1'), new thunderStastsCore().getInboxZeroDates('acc1')]);
    expect(a).toBe(b);
    expect(browser.calls.query).toHaveLength(1);
    clearCoreCaches();
    await new thunderStastsCore().getInboxZeroDates('acc1');
    expect(browser.calls.query).toHaveLength(2);
  });

  it('is scanned again after a failure', async () => {
    browser.onQuery = async () => { browser.onQuery = null; throw new Error('busy'); };
    await expect(new thunderStastsCore().getInboxZeroDates('acc1')).rejects.toThrow('busy');
    expect((await new thunderStastsCore().getInboxZeroDates('acc1')).total).toBe(3);
  });
});

describe('recent days cache', () => {
  beforeEach(() => {
    addMails(mailbox, 2, { key: '20261006', hour: 9 });    // last Tuesday
    addMails(mailbox, 3, { key: '20260915', hour: 9 });    // a Tuesday 4 weeks ago
    addMail(mailbox, { key: '20260930' });                 // in the previous period of Many Days
    addMail(mailbox, { key: '20261009', sent: true });
  });

  it('serves the baseline, the previous days and the days before from one scan', async () => {
    let core = new thunderStastsCore({ _many_days: 7 });
    let baseline = await core.getWeekdayBaseline(day(TODAY), 'acc1', [ME], 6);
    let prev_days = await core.getToday_manyDaysData('acc1', [ME]);
    let before = await new thunderStastsCore().getDaysBefore(day('20261005'), 7, 'acc1', [ME]);
    let previous_period = await core.getManyDaysPreviousPeriod('acc1', [ME]);

    expect(browser.calls.query).toHaveLength(1);
    let query = browser.calls.query[0];
    expect([key(query.fromDate), key(query.toDate)]).toEqual(['20260825', YESTERDAY]);

    expect(baseline.days).toHaveLength(6);
    expect(baseline.days.map(d => d[9].received)).toEqual([0, 0, 3, 0, 0, 2]);
    expect([prev_days.received, prev_days.sent]).toEqual([2, 1]);
    expect(Object.keys(prev_days.msg_days)).toEqual(['20261006', '20261007', '20261008', '20261009', '20261010', '20261011', YESTERDAY]);
    expect(before.received).toBe(1);
    expect(previous_period.received).toBe(1);
  });

  it('skips the past holidays in the baseline of a business day', async () => {
    tsStore.bday_custom_days = [{ year: 2026, month: 8, day: 15 }];
    let baseline = await new thunderStastsCore().getWeekdayBaseline(day(TODAY), 'acc1', [ME], 6);
    expect(baseline.days.map(d => d[9].received)).toEqual([0, 0, 0, 0, 2]);
  });

  it('scans the range directly when it is outside the cache', async () => {
    addMails(mailbox, 4, { key: '20260601' });
    let before = await new thunderStastsCore().getDaysBefore(day('20260602'), 3, 'acc1', [ME]);
    expect(before.received).toBe(4);
    expect(browser.calls.query).toHaveLength(1);
    expect(key(browser.calls.query[0].fromDate)).toBe('20260530');
  });

  it('is scanned again for another account', async () => {
    await new thunderStastsCore().getToday_manyDaysData('acc1', [ME]);
    await new thunderStastsCore().getToday_manyDaysData('acc2', [ME_GMAIL]);
    await new thunderStastsCore().getToday_manyDaysData('acc1', [ME]);
    expect(browser.calls.query).toHaveLength(3);
  });

  it('is scanned again after a failure', async () => {
    browser.onQuery = async () => { browser.onQuery = null; throw new Error('busy'); };
    await expect(new thunderStastsCore().getToday_manyDaysData('acc1', [ME])).rejects.toThrow('busy');
    expect((await new thunderStastsCore().getToday_manyDaysData('acc1', [ME])).received).toBe(2);
  });

  it.each([
    [10, '20260831'],     // clamped to 43 days
    [400, '20251013'],    // clamped to 365 days
    ['x', '20260825'],    // default 49 days
  ])('size %s starts the cache on %s', async (size, from) => {
    setRecentDaysCacheDays(size);
    await new thunderStastsCore().getToday_manyDaysData('acc1', [ME]);
    expect(key(browser.calls.query[0].fromDate)).toBe(from);
  });
});

describe('query queue', () => {
  // Each started query waits for the test to resolve it
  function queries() {
    let started = [];
    let queryFn = () => new Promise((resolve, reject) => started.push({ resolve, reject }));
    return { started, queryFn };
  }

  async function consume(generator, stop_after = Infinity) {
    let n = 0;
    for await (let message of generator) {
      if (++n >= stop_after) break;
    }
    return n;
  }

  // Resolves every query (also the ones started meanwhile) until all the consumers are done
  async function drain(started, consumers) {
    let done = false;
    let all = Promise.allSettled(consumers).then(() => done = true);
    while (!done) {
      started.forEach(q => q.resolve({ id: null, messages: [] }));
      await flush();
    }
    return all;
  }

  it('runs at most max_concurrent_queries queries at the same time', async () => {
    let core = new thunderStastsCore();
    let { started, queryFn } = queries();
    let consumers = Array.from({ length: 5 }, () => consume(core.getMessages(queryFn)));
    await flush();
    expect(started).toHaveLength(2);
    started[0].resolve({ id: null, messages: [] });
    await flush();
    expect(started).toHaveLength(3);
    await drain(started, consumers);
    expect(started).toHaveLength(5);
  });

  it('frees the slot when a query fails or the reader stops early', async () => {
    setMaxConcurrentQueries(1);
    let core = new thunderStastsCore();
    let { started, queryFn } = queries();
    let failing = consume(core.getMessages(queryFn));
    let stopping = consume(core.getMessages(queryFn), 1);
    let last = consume(core.getMessages(queryFn));
    await flush();
    expect(started).toHaveLength(1);

    started[0].reject(new Error('query failed'));
    await expect(failing).rejects.toThrow('query failed');
    await flush();
    expect(started).toHaveLength(2);

    started[1].resolve({ id: 'more', messages: [{ id: 1 }, { id: 2 }] });
    expect(await stopping).toBe(1);
    await flush();
    expect(started).toHaveLength(3);
    expect(browser.calls.continueList).toEqual([]);

    await drain(started, [last]);
  });

  it('starts the waiting queries when the limit grows', async () => {
    let core = new thunderStastsCore();
    let { started, queryFn } = queries();
    let consumers = Array.from({ length: 5 }, () => consume(core.getMessages(queryFn)));
    await flush();
    setMaxConcurrentQueries(4);
    expect(started).toHaveLength(2);
    await flush();
    expect(started).toHaveLength(4);
    await drain(started, consumers);
  });

  it.each([
    [0, 1],
    [99, 10],
    ['x', 2],
  ])('limit %s is applied as %i', async (value, expected) => {
    setMaxConcurrentQueries(value);
    let core = new thunderStastsCore();
    let { started, queryFn } = queries();
    let consumers = Array.from({ length: 12 }, () => consume(core.getMessages(queryFn)));
    await flush();
    expect(started).toHaveLength(expected);
    await drain(started, consumers);
  });
});
