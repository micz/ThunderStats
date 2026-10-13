// A second, plain implementation of the main counts of getFullStatsData, written from the spec and not
// from the core code: on a real mailbox the two must give the same numbers.
import { flattenFolders } from './dump.js';

const EXCLUDED_SPECIAL_USE = ['drafts', 'trash', 'junk', 'templates', 'outbox'];
// Same regex as tsUtils.regexEmail
const REGEX_EMAIL = /[\p{L}\p{N}._%+-][\p{L}\p{N}._%+'-]*@[\p{L}\p{N}.-]+\.\p{L}{2,}/u;

// The address of an author: the (last) one in angle brackets, otherwise the first one in the text
export function authorEmail(author) {
  let bracketed = /.*<([^<>]*@[^<>]*)>/.exec(author || '');   // greedy: the last one
  let match = (bracketed && bracketed[1].match(REGEX_EMAIL)) || (author || '').match(REGEX_EMAIL);
  return match ? match[0].toLowerCase() : null;
}

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

// The folders chosen in the Custom Query filters, with all their subfolders when subfolders is true
export function chosenFolderIds(mailbox, ids, subfolders = false) {
  let output = new Set();
  for (let folder of accountFolders(mailbox, 0)) {
    if (!ids.includes(folder.id)) continue;
    output.add(folder.id);
    if (subfolders) flattenFolders(folder.subFolders || []).forEach(sub => output.add(sub.id));
  }
  return output;
}

export function accountFolders(mailbox, account_id) {
  return mailbox.accounts.filter(a => account_id == 0 || a.id == account_id).flatMap(a => flattenFolders(a.folders));
}

/*
  Counts of the messages of an account between from and to (both included):
  { count, sent, received, unmatched, count_in_inbox, days: {YYYYMMDD: {count, sent, received}}, folders: {id: count} }
  unmatched = received messages whose author has no address (no sender, no domain).
  With filter_duplicates only the first message of each headerMessageId is counted (folders not filled);
  a message without a Message-ID is never a duplicate.
  filters are the Custom Query advanced filters: { folders: [ids], subfolders, subject, read, flagged }.
  folders replaces the stats folders with the chosen ones (and their subfolders when asked), still
  skipping the messages of the excluded special folders; subject is a part of the subject (case sensitive,
  like the browser mock); read and flagged keep only the messages with that value.
*/
export function referenceStats(mailbox, { from, to, account_id = 0, emails = [], filter_duplicates = false, filters = {} }) {
  let folder_ids = filters.folders ? chosenFolderIds(mailbox, filters.folders, filters.subfolders) : statsFolderIds(mailbox, account_id);
  let own = new Set(emails.map(e => e.toLowerCase()));
  let seen = new Set();
  let output = { count: 0, sent: 0, received: 0, unmatched: 0, count_in_inbox: 0, days: {}, folders: {} };

  for (let message of mailbox.messages) {
    if (!message.date || !folder_ids.has(message.folder.id)) continue;
    let time = message.date.getTime();
    if (time < from.getTime() || time > to.getTime()) continue;
    if (filters.folders && EXCLUDED_SPECIAL_USE.some(use => hasUse(message.folder, use))) continue;
    if (filters.subject !== undefined && !(message.subject || '').includes(filters.subject)) continue;
    if (filters.read !== undefined && message.read != filters.read) continue;
    if (filters.flagged !== undefined && message.flagged != filters.flagged) continue;
    if (filter_duplicates && message.headerMessageId) {
      if (seen.has(message.headerMessageId)) continue;
      seen.add(message.headerMessageId);
    }
    if (!filter_duplicates) {
      output.folders[message.folder.id] = (output.folders[message.folder.id] || 0) + 1;
    }

    let key = dayKey(message.date);
    let day = output.days[key] ??= { count: 0, sent: 0, received: 0 };
    output.count++;
    day.count++;
    if (hasUse(message.folder, 'inbox')) output.count_in_inbox++;

    let author = authorEmail(message.author);
    if (author && own.has(author)) {
      output.sent++;
      day.sent++;
    } else {
      output.received++;
      day.received++;
      if (!author) output.unmatched++;
    }
  }
  return output;
}
