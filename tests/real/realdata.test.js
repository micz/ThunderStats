// Real data tests: thunderStastsCore and the dashboard models on the mailbox dumps found by findDumps()
// (npm run test:real). The expected numbers come from a second implementation (reference.js) and from
// the totals that must add up; a data quality report of each dump is printed.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { thunderStastsCore, clearCoreCaches } from '@statslib/mzts-statscore';
import { tsUtils } from '@statslib/mzts-utils';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import { tsDayModel } from '@statslib/mzts-daymodel';
import { tsPeriodModel } from '@statslib/mzts-periodmodel';
import { findDumps, loadDump, installDump } from './dump.js';
import { referenceStats, accountFolders, statsFolderIds, hasUse, dayKey } from './reference.js';
import { PUBLIC_DOMAINS } from '../../tools/mailbox-dump/anonymize.js';

const PERIOD_DAYS = 365;
const RECENT_DAYS = 42;

const dumps = findDumps().map(loadDump);

if (dumps.length == 0) {
  describe('real data', () => {
    it.skip('no dump in tests/real/data: add one or run "npm run test:real:sample"', () => {});
  });
}

// Local midnight `days` days before date
function daysBefore(date, days) {
  let output = new Date(date);
  output.setDate(output.getDate() - days);
  output.setHours(0, 0, 0, 0);
  return output;
}

function endOfDay(date) {
  let output = new Date(date);
  output.setHours(23, 59, 59, 999);
  return output;
}

function sumOf(values, field) {
  return Object.values(values).reduce((acc, v) => acc + v[field], 0);
}

// Paths of the numbers that are NaN or infinite
function badNumbers(value, path = '$', output = []) {
  if (typeof value == 'number') {
    if (!Number.isFinite(value)) output.push(path + '=' + value);
  } else if (value && typeof value == 'object' && !(value instanceof Date)) {
    for (let [key, item] of Object.entries(value)) badNumbers(item, path + '.' + key, output);
  }
  return output;
}

// Settings of a scope: own addresses (identities) and internal domains (their non-webmail domains)
async function scopeSettings(core, account_id) {
  let emails = await core.getAccountEmails(account_id);
  let domains = [...new Set(emails.map(e => e.split('@')[1]).filter(d => d && !PUBLIC_DOMAINS.has(d)))];
  return { emails, domains };
}

function qualityReport(dump) {
  let messages = dump.mailbox.messages;
  let tag_keys = new Set(dump.tags.map(t => t.key));
  let ids = new Map();
  for (let m of messages) if (m.headerMessageId) ids.set(m.headerMessageId, (ids.get(m.headerMessageId) || 0) + 1);
  let dates = messages.filter(m => m.date).map(m => m.date.getTime());
  let domains = new Map();
  for (let m of messages) {
    for (let address of [m.author, ...m.recipients, ...m.ccList, ...m.bccList]) {
      let match = (address || '').match(tsUtils.regexEmail);
      if (!match) continue;
      let domain = match[0].split('@')[1];
      if (!domains.has(domain.toLowerCase())) domains.set(domain.toLowerCase(), new Set());
      domains.get(domain.toLowerCase()).add(domain);
    }
  }
  let excluded = statsFolderIds(dump.mailbox, 0);
  return {
    file: dump.name,
    thunderbird: dump.meta.thunderbird,
    anonymized: dump.meta.anonymized,
    accounts: dump.mailbox.accounts.length,
    folders: accountFolders(dump.mailbox, 0).length,
    folder_errors: (dump.meta.errors || []).length,
    messages: messages.length,
    first_date: dates.length ? new Date(Math.min(...dates)).toISOString().slice(0, 10) : '',
    last_date: dates.length ? new Date(Math.max(...dates)).toISOString().slice(0, 10) : '',
    in_excluded_folders: messages.filter(m => !excluded.has(m.folder.id)).length,
    without_date: messages.filter(m => !m.date).length,
    author_without_address: messages.filter(m => !(m.author || '').match(tsUtils.regexEmail)).length,
    without_message_id: messages.filter(m => !m.headerMessageId).length,
    duplicated_message_ids: [...ids.values()].filter(n => n > 1).length,
    unknown_tags: messages.filter(m => m.tags.some(t => !tag_keys.has(t))).length,
    mixed_case_domains: [...domains.values()].filter(set => set.size > 1).length,
    // recipients from which tsCoreUtils.extractDomains reads something that is not a domain
    broken_recipient_domains: messages.filter(m => tsCoreUtils.extractDomains([...m.recipients, ...m.ccList, ...m.bccList])
      .some(d => !/^[a-z0-9.-]+$/i.test(d))).length,
    contacts: dump.contacts.length,
  };
}

for (let dump of dumps) {
  describe(dump.name, () => {
    let now = dump.created;
    let scopes = [0, ...dump.mailbox.accounts.map(a => a.id)];

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(now);
      clearCoreCaches();
      installDump(dump);
      // the core logs an error for each message with a tag no longer defined (counted in the report)
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('data quality report', () => {
      let report = qualityReport(dump);
      console.table(report);
      expect(report.messages).toBeGreaterThan(0);
    });

    describe.each(scopes)('account %s', (account_id) => {
      const from = daysBefore(now, PERIOD_DAYS);
      const to = endOfDay(now);

      it('matches the reference counts over the period', async () => {
        let core = new thunderStastsCore();
        let { emails, domains } = await scopeSettings(core, account_id);
        let result = await core.getFullStatsData(new Date(from), new Date(to), account_id, emails, true, false, -99, null, domains);
        let ref = referenceStats(dump.mailbox, { from, to, account_id, emails });
        console.log(`[${dump.name}] account ${account_id}: ${result.count} messages in ${Math.round(result.elapsed)} ms`);

        expect({ count: result.count, sent: result.sent, received: result.received, count_in_inbox: result.count_in_inbox })
          .toEqual({ count: ref.count, sent: ref.sent, received: ref.received, count_in_inbox: ref.count_in_inbox });
        // authors without an address are counted, but neither as sent nor as received
        expect(result.count - result.sent - result.received).toBe(ref.unmatched);

        let days = Object.fromEntries(Object.entries(result.dates)
          .filter(([key, d]) => d.count > 0 || ref.days[key])
          .map(([key, d]) => [key, { count: d.count, sent: d.sent, received: d.received }]));
        expect(days).toEqual(ref.days);
        let folders = Object.fromEntries(Object.entries(result.folders).map(([id, f]) => [id, f.count]));
        expect(folders).toEqual(ref.folders);
      });

      it('adds up the totals of every grouping', async () => {
        let core = new thunderStastsCore();
        let { emails, domains } = await scopeSettings(core, account_id);
        let result = await core.getFullStatsData(new Date(from), new Date(to), account_id, emails, true, false, -99, null, domains);

        for (let grouping of ['dates', 'dates_weeks', 'dates_months', 'dates_years']) {
          for (let field of ['count', 'sent', 'received']) {
            expect(sumOf(result[grouping], field), grouping + '.' + field).toBe(result[field]);
          }
        }
        for (let grouping of ['msg_hours', 'msg_weekdays']) {
          expect(sumOf(result[grouping], 'sent'), grouping).toBe(result.sent);
          expect(sumOf(result[grouping], 'received'), grouping).toBe(result.received);
        }
        let weekday_hours = Object.values(result.msg_weekday_hours).flatMap(hours => Object.values(hours));
        expect(sumOf(weekday_hours, 'sent') + sumOf(weekday_hours, 'received')).toBe(result.sent + result.received);
        let day_hours = Object.values(result.msg_hours_days).flatMap(hours => Object.values(hours));
        expect(sumOf(day_hours, 'sent') + sumOf(day_hours, 'received')).toBe(result.sent + result.received);
        for (let [key, d] of Object.entries(result.dates)) {
          expect(d.sent_internal + d.sent_external, key).toBe(d.sent);
          expect(d.received_internal + d.received_external, key).toBe(d.received);
          expect(d.inbox, key).toBeLessThanOrEqual(d.received);
        }
        // each received mail has exactly one sender domain
        expect(sumOf(result.domains, 'received')).toBe(result.received);
        expect(sumOf(result.folders, 'count')).toBe(result.count);
        expect(badNumbers(result.aggregate)).toEqual([]);
      });

      it('counts each message once with the duplicates filter', async () => {
        let core = new thunderStastsCore();
        let { emails } = await scopeSettings(core, account_id);
        let result = await core.getFullStatsData(new Date(from), new Date(to), account_id, emails, false, true);
        let ref = referenceStats(dump.mailbox, { from, to, account_id, emails, filter_duplicates: true });
        expect([result.count, result.sent, result.received]).toEqual([ref.count, ref.sent, ref.received]);
      });

      it('gives the same days from single day queries and from a period query', async () => {
        let core = new thunderStastsCore();
        let { emails } = await scopeSettings(core, account_id);
        let week_from = daysBefore(now, 7);
        let week = await core.getFullStatsData(new Date(week_from), endOfDay(daysBefore(now, 1)), account_id, emails);
        for (let i = 7; i >= 1; i--) {
          let theDay = daysBefore(now, i);
          let single = await core.getFullStatsData(new Date(theDay), endOfDay(theDay), account_id, emails);
          let key = dayKey(theDay);
          expect([single.count, single.sent, single.received], key)
            .toEqual([week.dates[key].count, week.dates[key].sent, week.dates[key].received]);
        }
      });

      it('gives the same days from the recent days cache and from a full scan', async () => {
        let core = new thunderStastsCore();
        let { emails } = await scopeSettings(core, account_id);
        let filter_duplicates = await core.getFilterDuplicates(account_id);
        let range_from = daysBefore(now, RECENT_DAYS);
        let range_to = endOfDay(daysBefore(now, 1));
        let cached = await core.getDays(new Date(range_from), new Date(range_to), account_id, emails);
        expect(cached.from_cache).toBe(true);
        let full = await core.getFullStatsData(new Date(range_from), new Date(range_to), account_id, emails, false, filter_duplicates);
        for (let [key, d] of Object.entries(cached.days)) {
          expect([d.sent, d.received], key).toEqual([full.dates[key].sent, full.dates[key].received]);
        }
      });

      it('counts every inbox message in Inbox Zero', async () => {
        let inbox_ids = new Set(accountFolders(dump.mailbox, account_id).filter(f => hasUse(f, 'inbox')).map(f => f.id));
        let inbox = dump.mailbox.messages.filter(m => inbox_ids.has(m.folder.id));
        let result = await new thunderStastsCore().getInboxZeroDates(account_id);
        expect([result.total, result.unread]).toEqual([inbox.length, inbox.filter(m => !m.read).length]);
      });

      it('builds the dashboards without NaN or infinite numbers', async () => {
        let core = new thunderStastsCore();
        let { emails, domains } = await scopeSettings(core, account_id);
        let inbox = await core.getInboxZeroDates(account_id);

        let yesterday = daysBefore(now, 1);
        let day_model = tsDayModel.build({
          kind: 'yesterday', day: yesterday,
          result: await core.getYesterday(account_id, emails, domains),
          inbox,
          baseline_days: (await core.getWeekdayBaseline(new Date(yesterday), account_id, emails)).days,
          prev_days: (await core.getDaysBefore(new Date(yesterday), 7, account_id, emails)).msg_days, prev_days_num: 7,
          progressive: false, hide_future: false, cmp: null, internal: null, involved_num: 10, first_day_week: 1,
          duplicates_note: false, open_folder_in_first_tab: false, neutral_badge: false,
        });
        expect(badNumbers(day_model)).toEqual([]);

        let result = await core.getManyDaysData(account_id, emails, domains);
        let days = Object.keys(result.dates);
        let stat_days = days.slice(0, -1);
        let period_model = tsPeriodModel.build({
          kind: 'manydays', days, stat_days, today_key: days.at(-1), result, inbox,
          prev: await core.getManyDaysPreviousPeriod(account_id, emails),
          aggregate: await core.aggregateData(Object.fromEntries(stat_days.map(k => [k, result.dates[k]]))),
          only_businessdays: false, show_inbox: true, internal: null, involved_num: 10, first_day_week: 1,
          duplicates_note: false, open_folder_in_first_tab: false, aggregation: 'day', cmp_result: null,
        });
        expect(badNumbers(period_model)).toEqual([]);
      });
    });

    it.runIf(scopes.length > 2)('adds up the accounts to all the accounts', async () => {
      let from = daysBefore(now, PERIOD_DAYS);
      let to = endOfDay(now);
      let core = new thunderStastsCore();
      let all = await core.getFullStatsData(new Date(from), new Date(to), 0, await core.getAccountEmails(0));
      let sum = 0;
      for (let account_id of scopes.slice(1)) {
        sum += (await core.getFullStatsData(new Date(from), new Date(to), account_id, await core.getAccountEmails(account_id))).count;
      }
      expect(sum).toBe(all.count);
    });
  });
}
