// Mailbox dumps for the real data tests (format in tools/mailbox-dump/README.md).
// The dumps are read from tests/real/data/*.json (ignored by git) and from the TS_DUMP environment
// variable (one or more paths, separated like PATH).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORMAT, FORMAT_VERSION, flattenFolders } from '../../tools/mailbox-dump/dump-format.js';

export { flattenFolders };
export const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');

export function findDumps() {
  let output = [];
  if (fs.existsSync(DATA_DIR)) {
    output.push(...fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json')).sort().map(f => path.join(DATA_DIR, f)));
  }
  if (process.env.TS_DUMP) {
    output.push(...process.env.TS_DUMP.split(path.delimiter).filter(Boolean).map(f => path.resolve(f)));
  }
  return [...new Set(output)];
}

/*
  Reads a dump and turns it into the data of the browser mock (tests/mocks/browser.js):
  { file, name, created, meta, mailbox: { accounts, messages }, tags, contacts }
  The messages get their Date back and the folder object (from the account trees) instead of its id.
*/
export function loadDump(file) {
  let raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (raw.format != FORMAT) throw new Error(file + ': not a ThunderStats mailbox dump');
  if (raw.version > FORMAT_VERSION) throw new Error(file + ': dump version ' + raw.version + ' not supported (max ' + FORMAT_VERSION + ')');

  let folders = new Map();
  for (let account of raw.accounts) {
    for (let folder of flattenFolders(account.folders)) folders.set(folder.id, folder);
  }

  let messages = raw.messages.map(message => {
    let folder = folders.get(message.folder);
    if (!folder) throw new Error(file + ': message ' + message.id + ' in the unknown folder ' + message.folder);
    return { ...message, date: message.date ? new Date(message.date) : null, folder };
  });

  let { accounts, tags, contacts, messages: _, ...meta } = raw;
  return {
    file,
    name: path.basename(file),
    created: new Date(raw.created),
    meta,
    mailbox: { accounts, messages },
    tags: tags || [],
    contacts: contacts || [],
  };
}

// Puts the dump in the browser mock of the current test
export function installDump(dump) {
  browser.mailbox = dump.mailbox;
  browser.tags = dump.tags;
  browser.contactCards = dump.contacts;
}
