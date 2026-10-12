// Synthetic mailbox dump for the real data tests, while a real one is not available:
//   node tests/real/make-sample-dump.js [--days 400] [--scale 1] [--seed 1] [--plain] [--out file]
// Three accounts (IMAP work account, Gmail with its duplicates in All Mail, Local Folders) with the cases
// a real mailbox has: authors without an address, mixed case domains, mails at midnight, unknown tags,
// missing Message-ID, mails in trash/junk/drafts. The dump goes through the same conversion and
// anonymization (unless --plain) as the dump extension (tools/mailbox-dump).
import fs from 'node:fs';
import path from 'node:path';
import { createAnonymizer } from '../../tools/mailbox-dump/anonymize.js';
import { FORMAT, FORMAT_VERSION, dumpAccount, dumpMessage, dumpTag, dumpContact } from '../../tools/mailbox-dump/dump-format.js';
import { DATA_DIR } from './dump.js';

function option(name, fallback) {
  let i = process.argv.indexOf('--' + name);
  if (i < 0) return fallback;
  return typeof fallback == 'boolean' ? true : process.argv[i + 1];
}

const DAYS = Number(option('days', 400));
const SCALE = Number(option('scale', 1));
const SEED = Number(option('seed', 1));
const PLAIN = option('plain', false);
const OUT = option('out', path.join(DATA_DIR, 'sample-dump.json'));

// mulberry32
let state = SEED >>> 0;
function random() {
  state = (state + 0x6D2B79F5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const chance = (p) => random() < p;
const pick = (list) => list[Math.floor(random() * list.length)];
const between = (min, max) => min + Math.floor(random() * (max - min + 1));
// Poisson-like count around mean
const around = (mean) => Math.max(0, Math.round(mean * SCALE * (0.5 + random())));

function folder(account_id, folder_path, special_use = [], sub_folders = []) {
  return { id: account_id + ':/' + folder_path, accountId: account_id, name: folder_path.split('/').at(-1), path: folder_path, specialUse: special_use, subFolders: sub_folders };
}

const ACCOUNTS = [
  {
    id: 'account1', name: 'Lavoro', type: 'imap', identities: [{ email: 'Mario.Rossi@Acme.it' }, { email: 'info@acme.it' }],
    folders: [
      folder('account1', '/INBOX', ['inbox'], [folder('account1', '/INBOX/Clienti'), folder('account1', '/INBOX/Fornitori')]),
      folder('account1', '/Sent', ['sent']),
      folder('account1', '/Archives', ['archives'], [folder('account1', '/Archives/2025', ['archives'])]),
      folder('account1', '/Progetti'),
      folder('account1', '/Trash', ['trash'], [folder('account1', '/Trash/Vecchi')]),
      folder('account1', '/Drafts', ['drafts']),
      folder('account1', '/Junk', ['junk']),
      folder('account1', '/Templates', ['templates']),
    ],
  },
  {
    id: 'account2', name: 'Gmail', type: 'imap', identities: [{ email: 'mario.rossi@gmail.com' }],
    folders: [
      folder('account2', '/INBOX', ['inbox']),
      folder('account2', '/[Gmail]', [], [
        folder('account2', '/[Gmail]/Sent Mail', ['sent']),
        folder('account2', '/[Gmail]/All Mail', ['all']),
        folder('account2', '/[Gmail]/Trash', ['trash']),
        folder('account2', '/[Gmail]/Spam', ['junk']),
        folder('account2', '/[Gmail]/Drafts', ['drafts']),
      ]),
    ],
  },
  {
    id: 'account3', name: 'Local Folders', type: 'none', identities: [],
    folders: [
      folder('account3', '/Trash', ['trash']),
      folder('account3', '/Unsent Messages', ['outbox']),
      folder('account3', '/Vecchia posta'),
    ],
  },
];

const TAGS = [
  { key: '$label1', tag: 'Important', color: '#FF0000', ordinal: '' },
  { key: '$label2', tag: 'Work', color: '#FF9900', ordinal: '' },
  { key: 'clienti', tag: 'Clienti VIP', color: '#3333FF', ordinal: '' },
];

const COLLEAGUES = ['"Bianchi, Anna" <anna.bianchi@acme.it>', 'Luca Verdi <luca.verdi@acme.it>', 'paolo@acme.it', 'Segreteria <segreteria@ACME.it>'];
const CLIENTS = ['Giulia Neri <giulia@cliente.com>', 'Ordini <ordini@Cliente.COM>', 'John Smith <john.smith@bigcorp.co.uk>', 'Hans <hans@firma.de>',
  'Supporto <support@sub.fornitore.it>', 'fornitore@fornitore.it', '"hans@firma.de" <hans@firma.de>'];
const NEWSLETTERS = ['Newsletter <news@shop.example.com>', 'noreply@notifications.service.io', 'Banca <avvisi@banca.it>'];
const FRIENDS = ['Marco <marco.b@gmail.com>', 'Sara <sara77@hotmail.it>', 'Mamma <mamma@libero.it>', 'Club <info@club-tennis.it>'];
const NO_ADDRESS = ['Mail Delivery System', 'undisclosed-recipients:;', 'José <josé@exämple.com>', ''];
const WORDS = ['offerta', 'riunione', 'fattura', 'progetto', 'ordine', 'consegna', 'report', 'urgente', 'domanda', 'aggiornamento'];

const now = new Date(option('now', new Date().toISOString()));
const messages = [];
let next_id = 1;

function message(account, date, options) {
  let id = next_id++;
  let raw = {
    id,
    headerMessageId: chance(0.002) ? '' : 'msg' + id + '.' + SEED + '@' + (options.sent ? 'acme.it' : 'mail.example.net'),
    date,
    author: options.author,
    recipients: options.recipients,
    ccList: options.cc || [],
    bccList: options.bcc || [],
    subject: (chance(0.3) ? 'Re: ' : '') + pick(WORDS) + ' ' + pick(WORDS) + ' n. ' + between(1, 999),
    read: options.read ?? true,
    flagged: chance(0.03),
    tags: options.tags || [],
    folder: account.id + ':/' + options.folder,
  };
  messages.push(raw);
  return raw;
}

// Working hours most of the time, sometimes the evening, the night or midnight exactly
function time(day) {
  let date = new Date(day);
  let roll = random();
  if (roll < 0.01) return date;    // 00:00:00
  let hour = roll < 0.85 ? between(8, 18) : roll < 0.97 ? between(19, 23) : between(0, 7);
  date.setHours(hour, between(0, 59), between(0, 59));
  return date;
}

function tags() {
  if (chance(0.9)) return [];
  return [pick(['$label1', '$label2', 'clienti', 'clienti', '$label9', 'tag_cancellato'])];
}

for (let d = DAYS; d >= 0; d--) {
  let day = new Date(now);
  day.setDate(day.getDate() - d);
  day.setHours(0, 0, 0, 0);
  let business = day.getDay() != 0 && day.getDay() != 6;
  let age = d;
  let [work, gmail, local] = ACCOUNTS;

  // Work account: received
  for (let i = around(business ? 22 : 3); i > 0; i--) {
    let date = time(day);
    if (date > now) continue;
    let author = chance(0.01) ? pick(NO_ADDRESS) : chance(0.35) ? pick(COLLEAGUES) : chance(0.75) ? pick(CLIENTS) : pick(NEWSLETTERS);
    let to = chance(0.15) ? ['info@acme.it'] : ['Mario Rossi <mario.rossi@acme.it>'];
    let destination = age < 20 ? (chance(0.7) ? 'INBOX' : 'INBOX/Clienti') :
      pick(['INBOX', 'INBOX/Clienti', 'INBOX/Fornitori', 'Progetti', age > 365 ? 'Archives/2025' : 'Archives', 'Trash', 'Trash/Vecchi', 'Junk']);
    message(work, date, { author, recipients: to, cc: chance(0.2) ? [pick(COLLEAGUES)] : [], folder: '/' + destination,
      read: age > 2 || chance(0.4), tags: tags() });
  }
  // Work account: sent (some to colleagues only, some with an external cc), drafts and templates
  for (let i = around(business ? 8 : 0.5); i > 0; i--) {
    let date = time(day);
    if (date > now) continue;
    let internal = chance(0.4);
    let from = chance(0.8) ? 'Mario Rossi <Mario.Rossi@acme.it>' : 'Info Acme <INFO@acme.it>';
    let to = internal ? [pick(COLLEAGUES)] : [pick(CLIENTS), ...(chance(0.2) ? [pick(CLIENTS)] : [])];
    message(work, date, { author: from, recipients: to, cc: chance(0.25) ? [pick(COLLEAGUES)] : [], bcc: chance(0.05) ? [pick(CLIENTS)] : [],
      folder: chance(0.97) ? '/Sent' : pick(['/Drafts', '/Templates']), tags: tags() });
  }
  // Gmail: received in the inbox, each one also in All Mail (same Message-ID); sent also in All Mail
  for (let i = around(business ? 5 : 8); i > 0; i--) {
    let date = time(day);
    if (date > now) continue;
    let author = chance(0.6) ? pick(FRIENDS) : pick(NEWSLETTERS);
    let raw = message(gmail, date, { author, recipients: ['mario.rossi@gmail.com'], folder: chance(0.9) ? '/INBOX' : pick(['/[Gmail]/Spam', '/[Gmail]/Trash']),
      read: age > 5 || chance(0.5) });
    if (raw.folder.endsWith('/INBOX')) messages.push({ ...raw, id: next_id++, folder: gmail.id + '://[Gmail]/All Mail' });
  }
  for (let i = around(business ? 1 : 2); i > 0; i--) {
    let date = time(day);
    if (date > now) continue;
    let raw = message(gmail, date, { author: 'Mario Rossi <mario.rossi@gmail.com>', recipients: [pick(FRIENDS)], folder: '/[Gmail]/Sent Mail' });
    messages.push({ ...raw, id: next_id++, folder: gmail.id + '://[Gmail]/All Mail' });
  }
  // Local Folders: old mails moved from the work account
  if (age > 200 && chance(0.3)) {
    message(local, time(day), { author: pick(CLIENTS), recipients: ['mario.rossi@acme.it'], folder: '/Vecchia posta' });
  }
}

const CONTACTS = [
  'BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Anna Bianchi\r\nEMAIL;PREF=1:Anna.Bianchi@acme.it\r\nEND:VCARD',
  'BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Giulia Neri (Cliente S.p.A.)\r\nEMAIL;TYPE=work:giulia@cliente.com\r\nitem1.EMAIL:giulia.neri@\r\n gmail.com\r\nEND:VCARD',
  'BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Marco Bruni\r\nEMAIL:marco.b@gmail.com\r\nEND:VCARD',
];

let anon = PLAIN ? null : createAnonymizer(SEED);
let folder_ids = new Map();
let dump = {
  format: FORMAT,
  version: FORMAT_VERSION,
  created: now.toISOString(),
  time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  thunderbird: 'synthetic',
  anonymized: !!anon,
  from_date: null,
  accounts: ACCOUNTS.map((account, index) => dumpAccount(account, index, anon, folder_ids)),
  tags: TAGS.map(tag => dumpTag(tag, anon)),
  contacts: CONTACTS.map(vCard => dumpContact(vCard, anon)),
  messages: messages.sort((a, b) => a.date - b.date).map(m => dumpMessage(m, folder_ids.get(m.folder), anon)),
  errors: [],
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(dump));
console.log(`${OUT}: ${dump.messages.length} messages over ${DAYS + 1} days${anon ? ' (anonymized)' : ''}`);
