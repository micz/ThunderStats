import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tsExport } from '@statslib/mzts-export';
import { tsStore } from '@statslib/mzts-store';
import { thunderStastsCore, clearCoreCaches } from '@statslib/mzts-statscore';
import { createMailbox, addMail, addMails, ME } from '../fixtures/mailbox.js';
import { day } from '../helpers.js';

const YESTERDAY = '20261012';
const INTERNAL_COLUMNS = (prefix) => [prefix + ' InternalMailLabel', prefix + ' ExternalMailLabel'];

// Same format as getCustomQryLabel for YYYYMMDD keys
function dateLabel(key) {
  return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(day(key));
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 9, 13, 9, 5, 7));
});

describe('CSV helpers', () => {
  it('arrayToCsv writes the header from the first row', () => {
    expect(tsExport.arrayToCsv([{ a: 1, b: 'x' }, { a: 2, b: 'y' }])).toBe('a,b\n1,x\n2,y');
    expect(tsExport.arrayToCsv([])).toBe('');
    expect(tsExport.arrayToCsv(null)).toBe('');
  });

  // Known bug: the values are not quoted, so a comma, a quote or a new line in a name shifts the columns
  it.fails.each([
    ['Rossi, Mario', '"Rossi, Mario"'],
    ['The "Boss"', '"The ""Boss"""'],
    ['two\nlines', '"two\nlines"'],
  ])('arrayToCsv quotes %j', (value, quoted) => {
    expect(tsExport.arrayToCsv([{ name: value, n: 1 }])).toBe('name,n\n' + quoted + ',1');
  });

  it('makeSafeForFilePath replaces the unsafe characters', () => {
    expect(tsExport.makeSafeForFilePath('Daily Emails')).toBe('Daily_Emails');
    expect(tsExport.makeSafeForFilePath('a/b\\c:d*e?"f<g>h|i')).toBe('a_b_c_d_e_f_g_h_i');
    expect(tsExport.makeSafeForFilePath('Città — 2026')).toBe('Citt_2026');
  });

  it('getCurrentTimestamp is YYYYMMDDhhmmss in local time', () => {
    expect(tsExport.getCurrentTimestamp()).toBe('20261013090507');
  });

  it('downloadCSV downloads a CSV file with a timestamped name', async () => {
    let link = { setAttribute: vi.fn(), click: vi.fn() };
    vi.stubGlobal('document', { createElement: vi.fn(() => link) });
    let createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    try {
      tsExport.downloadCSV([{ a: 1 }], tsExport.export.daily_mails.name);
      expect(link.setAttribute).toHaveBeenCalledWith('download', 'ThunderStats_Export_Daily_Emails_20261013090507.csv');
      expect(link.href).toBe('blob:test');
      expect(link.click).toHaveBeenCalledOnce();
      let blob = createObjectURL.mock.calls[0][0];
      expect(blob.type).toBe('text/csv;charset=utf-8;');
      expect(await blob.text()).toBe('a\n1');
    } finally {
      createObjectURL.mockRestore();
      vi.unstubAllGlobals();
    }
  });
});

describe('transforms', () => {
  it('mergeRecipientsAndSenders: recipients in "received", senders in "sent" (the correspondent point of view)', () => {
    expect(tsExport.mergeRecipientsAndSenders(
      { 'a@x.it': { count: 2, name: 'A' }, 'b@y.com': { count: 1, name: 'B' } },
      { 'a@x.it': { count: 5, name: 'A' }, 'c@z.org': { count: 3, name: '' } },
    )).toEqual({
      'a@x.it': { sent: 5, received: 2, name: 'A' },
      'b@y.com': { sent: 0, received: 1, name: 'B' },
      'c@z.org': { sent: 3, received: 0, name: '' },
    });
  });

  it('correspondents, with the domain columns when the domains are given', () => {
    let json = { 'a@x.it': { sent: 1, received: 2, name: 'A' }, 'c@z.org': { sent: 3, received: 0, name: '' } };
    expect(tsExport.transformCorrespondentsJsonToArray(json)).toEqual([
      { Name: 'A', Mail: 'a@x.it', 'TimeChart.Sent': 1, 'TimeChart.Rcvd': 2 },
      { Name: '', Mail: 'c@z.org', 'TimeChart.Sent': 3, 'TimeChart.Rcvd': 0 },
    ]);
    let rows = tsExport.transformCorrespondentsJsonToArray(json, { 'x.it': { internal: true } });
    expect(rows.map(r => [r.Domains, r.InternalMailLabel])).toEqual([['x.it', 'Yes'], ['z.org', 'No']]);
  });

  it.each([
    ['YYYYMMDD', 'Date', { '20261012': {} }, dateLabel('20261012')],
    ['YYYYWW', 'Week [Year]', { '202642': {} }, '42 [2026]'],
    ['YYYYMM', 'Month', { '202610': {} }, '10/2026'],
    ['YYYY', 'Year', { '2026': {} }, '2026'],
  ])('period mails by %s', (data_type, date_column, keys, label) => {
    let json = Object.fromEntries(Object.keys(keys).map(k => [k, { sent: 1, received: 2, sent_internal: 1, received_external: 2 }]));
    expect(tsExport.transformPeriodMailsJsonToArray(json, data_type)).toEqual([{ [date_column]: label, 'TimeChart.Sent': 1, 'TimeChart.Rcvd': 2 }]);
    let full = tsExport.transformPeriodMailsJsonToArray(json, data_type, true)[0];
    expect(Object.keys(full)).toEqual([date_column, 'TimeChart.Sent', 'TimeChart.Rcvd', ...INTERNAL_COLUMNS('TimeChart.Sent'), ...INTERNAL_COLUMNS('TimeChart.Rcvd')]);
    expect(Object.values(full).slice(3)).toEqual([1, 0, 0, 2]);
  });

  it('time mails use the hour as a number', () => {
    let rows = tsExport.transformTimeMailsJsonToArray({ 0: { sent: 0, received: 1 }, 23: { sent: 2, received: 0 } });
    expect(rows).toEqual([
      { 'TimeChart.Time': 0, 'TimeChart.Sent': 0, 'TimeChart.Rcvd': 1 },
      { 'TimeChart.Time': 23, 'TimeChart.Sent': 2, 'TimeChart.Rcvd': 0 },
    ]);
  });

  it('tags use the tag names of the store', () => {
    tsStore.tags_list = { $label1: { tag: 'Important' } };
    expect(tsExport.transformTagsJsonToArray({ $label1: { sent: 1, received: 4 } }))
      .toEqual([{ Tags: 'Important', 'TimeChart.Sent': 1, 'TimeChart.Rcvd': 4 }]);
  });

  it('folders use the folder path without the account', () => {
    let rows = tsExport.transformFoldersJsonToArray({ 'acc1://INBOX/Projects': { sent: 0, received: 3, received_internal: 1 } }, true);
    expect(rows).toEqual([{
      Folders: 'INBOX/Projects', 'TimeChart.Sent': 0, 'TimeChart.Rcvd': 3,
      'TimeChart.Sent InternalMailLabel': 0, 'TimeChart.Sent ExternalMailLabel': 0,
      'TimeChart.Rcvd InternalMailLabel': 1, 'TimeChart.Rcvd ExternalMailLabel': 0,
    }]);
  });

  it('domains add the internal column only when asked', () => {
    let json = { 'work.it': { sent: 2, received: 1, internal: true }, 'other.com': { sent: 0, received: 5, internal: false } };
    expect(tsExport.transformDomainsJsonToArray(json)[0]).toEqual({ Domains: 'work.it', 'TimeChart.Sent': 2, 'TimeChart.Rcvd': 1 });
    expect(tsExport.transformDomainsJsonToArray(json, true).map(r => r.InternalMailLabel)).toEqual(['Yes', 'No']);
  });

  it('weekdays use the weekday names', () => {
    let rows = tsExport.transformWeekdaysJsonToArray({ 0: { sent: 1, received: 0 }, 1: { sent: 0, received: 2 } });
    expect(rows.map(r => r.Weekdays)).toEqual(['WeekDay0', 'WeekDay1']);
  });
});

describe('export of real stats', () => {
  beforeEach(() => {
    clearCoreCaches();
    let mailbox = createMailbox();
    browser.mailbox = mailbox;
    browser.tags = [{ key: '$label1', tag: 'Important', color: '#ff0000', ordinal: '' }];
    addMails(mailbox, 2, { key: YESTERDAY, hour: 9, tags: ['$label1'] });
    addMail(mailbox, { key: YESTERDAY, hour: 9, from: 'Anna <anna@work.it>', folder: 'acc1://Clients' });
    addMail(mailbox, { key: YESTERDAY, hour: 16, sent: true, to: ['anna@work.it'] });
  });

  it('turns getFullStatsData into the CSV files of the export menu', async () => {
    let result = await new thunderStastsCore().getCustomQryData(day(YESTERDAY), day(YESTERDAY), 'acc1', [ME], false, null, ['work.it']);

    expect(tsExport.arrayToCsv(tsExport.transformPeriodMailsJsonToArray(result.dates, 'YYYYMMDD', true))).toBe(
      'Date,TimeChart.Sent,TimeChart.Rcvd,TimeChart.Sent InternalMailLabel,TimeChart.Sent ExternalMailLabel,TimeChart.Rcvd InternalMailLabel,TimeChart.Rcvd ExternalMailLabel\n' +
      dateLabel(YESTERDAY) + ',1,3,1,0,1,2');

    let hours = tsExport.arrayToCsv(tsExport.transformTimeMailsJsonToArray(result.msg_hours)).split('\n');
    expect(hours).toHaveLength(25);
    expect(hours[10]).toBe('9,0,3');
    expect(hours[17]).toBe('16,1,0');

    let correspondents = tsExport.mergeRecipientsAndSenders(result.recipients, result.senders);
    expect(tsExport.arrayToCsv(tsExport.transformCorrespondentsJsonToArray(correspondents, result.domains)).split('\n')).toEqual([
      'Name,Mail,TimeChart.Sent,TimeChart.Rcvd,Domains,InternalMailLabel',
      // the name comes from the list where the address is found first: recipients, here written as a bare address
      ',anna@work.it,1,1,work.it,Yes',
      'Mario Rossi,mario@client.com,2,0,client.com,No',
    ]);

    expect(tsExport.arrayToCsv(tsExport.transformTagsJsonToArray(result.tags))).toBe('Tags,TimeChart.Sent,TimeChart.Rcvd\nImportant,0,2');
    expect(tsExport.arrayToCsv(tsExport.transformFoldersJsonToArray(result.folders)).split('\n').slice(1))
      .toEqual(['INBOX,0,2', 'Clients,0,1', 'Sent,1,0']);
  });
});
