// A small Thunderbird profile for the stats engine tests: two accounts with the usual special folders.
import { day } from '../helpers.js';

function folder(account_id, path, special_use = [], sub_folders = []) {
  return {
    id: account_id + ':/' + path,
    accountId: account_id,
    name: path.split('/').at(-1),
    path: '/' + path,
    specialUse: special_use,
    subFolders: sub_folders,
  };
}

export const ME = 'me@work.it';
export const ME_GMAIL = 'me@gmail.com';

export function createMailbox() {
  return {
    accounts: [
      {
        id: 'acc1', name: 'Work', identities: [{ email: 'Me@Work.it' }],
        folders: [
          folder('acc1', 'INBOX', ['inbox'], [folder('acc1', 'INBOX/Projects')]),
          folder('acc1', 'Sent', ['sent']),
          folder('acc1', 'Clients'),
          folder('acc1', 'Archives', ['archives'], [folder('acc1', 'Archives/2025')]),
          folder('acc1', 'Trash', ['trash'], [folder('acc1', 'Trash/Old')]),
          folder('acc1', 'Drafts', ['drafts']),
          folder('acc1', 'Junk', ['junk']),
          folder('acc1', 'Templates', ['templates']),
        ],
      },
      {
        id: 'acc2', name: 'Gmail', identities: [{ email: ME_GMAIL }],
        folders: [
          folder('acc2', 'INBOX', ['inbox']),
          folder('acc2', 'Sent', ['sent']),
        ],
      },
    ],
    messages: [],
  };
}

// Finds a folder by id in the mailbox
export function findFolder(mailbox, id) {
  let search = (folders) => {
    for (let f of folders) {
      if (f.id == id) return f;
      let found = search(f.subFolders || []);
      if (found) return found;
    }
    return null;
  };
  for (let account of mailbox.accounts) {
    let found = search(account.folders);
    if (found) return found;
  }
  throw new Error('Unknown folder ' + id);
}

let next_id = 1;

/*
  Adds a message. Received by default (from someone else into the acc1 inbox); `sent: true` makes it
  authored by ME into acc1 Sent.
  options = { key: 'YYYYMMDD', hour, minute, from, to: [], cc: [], bcc: [], folder: id, sent, read, flagged, tags: [], subject, header_id }
*/
export function addMail(mailbox, options) {
  let sent = !!options.sent;
  let id = next_id++;
  let message = {
    id,
    headerMessageId: options.header_id || ('msg' + id + '@test'),
    date: day(options.key, options.hour ?? 10, options.minute ?? 0),
    author: options.from || (sent ? 'Me <' + ME + '>' : 'Mario Rossi <mario@client.com>'),
    recipients: options.to || (sent ? ['Mario Rossi <mario@client.com>'] : [ME]),
    ccList: options.cc || [],
    bccList: options.bcc || [],
    subject: options.subject || 'Subject ' + id,
    read: options.read ?? true,
    flagged: !!options.flagged,
    tags: options.tags || [],
    folder: findFolder(mailbox, options.folder || (sent ? 'acc1:/Sent' : 'acc1:/INBOX')),
  };
  mailbox.messages.push(message);
  return message;
}

export function addMails(mailbox, n, options) {
  return Array.from({ length: n }, () => addMail(mailbox, options));
}

export function vCard(name, ...emails) {
  return ['BEGIN:VCARD', 'VERSION:4.0', 'FN:' + name, ...emails.map(e => 'EMAIL;PREF=1:' + e), 'END:VCARD'].join('\r\n');
}
