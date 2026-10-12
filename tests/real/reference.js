// A second, plain implementation of the main counts of getFullStatsData, written from the spec and not
// from the core code: on a real mailbox the two must give the same numbers.
import { flattenFolders } from './dump.js';

const EXCLUDED_SPECIAL_USE = ['drafts', 'trash', 'junk', 'templates', 'outbox'];
// Same regex as tsUtils.regexEmail: the core takes the first address found in the author
const REGEX_EMAIL = /[a-zA-Z0-9._%+-][a-zA-Z0-9._%+'-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

export function dayKey(date) {
  return String(date.getFullYear()) + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0');
}

export function hasUse(folder, use) {
  return (folder.specialUse || []).includes(use);
}

// Ids of the folders counted in the stats of an account (0 = all): an excluded folder hides its subfolders
export function statsFolderIds(mailbox, account_id, include_archive = true) {
  let output = new Set();
  let explore = (folders) => {
    for (let folder of folders) {
      if (EXCLUDED_SPECIAL_USE.some(use => hasUse(folder, use))) continue;
      if (!include_archive && hasUse(folder, 'archives')) continue;
      output.add(folder.id);
      explore(folder.subFolders || []);
    }
  };
  for (let account of mailbox.accounts) {
    if (account_id == 0 || account.id == account_id) explore(account.folders);
  }
  return output;
}

export function accountFolders(mailbox, account_id) {
  return mailbox.accounts.filter(a => account_id == 0 || a.id == account_id).flatMap(a => flattenFolders(a.folders));
}

/*
  Counts of the messages of an account between from and to (both included):
  { count, sent, received, unmatched, count_in_inbox, days: {YYYYMMDD: {count, sent, received}}, folders: {id: count} }
  unmatched = messages whose author has no address: counted, neither sent nor received.
  With filter_duplicates only the first message of each headerMessageId is counted (folders not filled).
*/
export function referenceStats(mailbox, { from, to, account_id = 0, emails = [], filter_duplicates = false }) {
  let folder_ids = statsFolderIds(mailbox, account_id);
  let own = new Set(emails.map(e => e.toLowerCase()));
  let seen = new Set();
  let output = { count: 0, sent: 0, received: 0, unmatched: 0, count_in_inbox: 0, days: {}, folders: {} };

  for (let message of mailbox.messages) {
    if (!message.date || !folder_ids.has(message.folder.id)) continue;
    let time = message.date.getTime();
    if (time < from.getTime() || time > to.getTime()) continue;
    if (filter_duplicates) {
      if (seen.has(message.headerMessageId)) continue;
      seen.add(message.headerMessageId);
    } else {
      output.folders[message.folder.id] = (output.folders[message.folder.id] || 0) + 1;
    }

    let key = dayKey(message.date);
    let day = output.days[key] ??= { count: 0, sent: 0, received: 0 };
    output.count++;
    day.count++;
    if (hasUse(message.folder, 'inbox')) output.count_in_inbox++;

    let author = (message.author || '').match(REGEX_EMAIL);
    if (!author) {
      output.unmatched++;
    } else if (own.has(author[0].toLowerCase())) {
      output.sent++;
      day.sent++;
    } else {
      output.received++;
      day.received++;
    }
  }
  return output;
}
