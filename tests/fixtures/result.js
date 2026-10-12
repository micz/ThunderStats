// Builds an object shaped like the getFullStatsData output from a short list of mails,
// so the dashboard models can be tested without the stats engine.
import { tsUtils } from '@statslib/mzts-utils';
import { day } from '../helpers.js';

/*
  mails = [{ key: 'YYYYMMDD', hour: 0-23, sent: bool, inbox: bool, folder: id, tags: [id], domain, internal, correspondent }]
  options = { from: 'YYYYMMDD', to: 'YYYYMMDD', folders: {id: folder_data}, tags: {id: {tag, color}} }
*/
export function makeResult(mails, options) {
  let from = day(options.from, 0), to = day(options.to, 23);
  let empty = () => ({ received: 0, sent: 0 });
  let result = {
    received: 0,
    sent: 0,
    dates: tsUtils.getDateArray(from, to),
    dates_weeks: tsUtils.getDateArrayWeeks(from, to),
    dates_months: tsUtils.getDateArrayMonths(from, to),
    dates_years: tsUtils.getDateArrayYears(from, to),
    msg_hours: Object.fromEntries(Array.from({ length: 24 }, (_, h) => [h, empty()])),
    msg_weekdays: Array.from({ length: 7 }, empty),
    msg_weekday_hours: Array.from({ length: 7 }, () => Array.from({ length: 24 }, empty)),
    senders: {},
    recipients: {},
    folders: {},
    tags: {},
    domains: {},
  };

  for (let id in options.folders || {}) {
    result.folders[id] = { received: 0, sent: 0, folder_data: options.folders[id] };
  }
  for (let id in options.tags || {}) {
    result.tags[id] = { tag: options.tags[id].tag, color: options.tags[id].color, count: 0 };
  }

  for (let mail of mails) {
    let field = mail.sent ? 'sent' : 'received';
    let date = day(mail.key, mail.hour ?? 12);
    let wd = date.getDay();
    let h = date.getHours();
    result[field]++;
    for (let bucket of [
      result.dates[mail.key],
      result.dates_weeks[tsUtils.dateToYYYYWW(date)],
      result.dates_months[tsUtils.dateToYYYYMM(date)],
      result.dates_years[tsUtils.dateToYYYY(date)],
    ]) {
      bucket[field]++;
      bucket.count++;
      if (!mail.sent && mail.inbox) bucket.inbox++;
    }
    result.msg_hours[h][field]++;
    result.msg_weekdays[wd][field]++;
    result.msg_weekday_hours[wd][h][field]++;

    if (mail.correspondent) {
      let list = mail.sent ? result.recipients : result.senders;
      list[mail.correspondent] ??= { name: '', count: 0 };
      list[mail.correspondent].count++;
    }
    if (mail.folder) result.folders[mail.folder][field]++;
    for (let tag of mail.tags || []) result.tags[tag].count++;
    if (mail.domain) {
      result.domains[mail.domain] ??= { sent: 0, received: 0, internal: !!mail.internal };
      result.domains[mail.domain][field]++;
    }
  }
  return result;
}

// n identical mails
export function mails(n, mail) {
  return Array.from({ length: n }, () => ({ ...mail }));
}

// getInboxZeroDates output
export function makeInbox(dates, unread = 0) {
  let total = Object.values(dates).reduce((acc, n) => acc + n, 0);
  return { total, unread, dates };
}

// Consecutive day keys, both ends included
export function dayKeys(from, to) {
  return Object.keys(tsUtils.getDateArray(day(from), day(to)));
}
