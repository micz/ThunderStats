// Mailbox dump for the ThunderStats real data tests: accounts, folder trees, tags, contacts and the
// headers of the messages, read with the same WebExtension APIs used by ThunderStats.
// Format documented in README.md, read by tests/real/dump.js.
import { createAnonymizer } from './anonymize.js';
import { FORMAT, FORMAT_VERSION, flattenFolders, dumpAccount, dumpMessage, dumpTag, dumpContact } from './dump-format.js';

const MESSAGES_PER_PAGE = 1000;

const log_element = document.getElementById('log');

function log(text) {
  log_element.textContent += text + '\n';
}

async function* queryAll(queryInfo) {
  let page = await browser.messages.query(queryInfo);
  yield* page.messages;
  while (page.id) {
    page = await browser.messages.continueList(page.id);
    yield* page.messages;
  }
}

async function createDump(months, anonymize) {
  let created = new Date();
  let fromDate = null;
  if (months > 0) {
    fromDate = new Date(created);
    fromDate.setMonth(fromDate.getMonth() - months);
    fromDate.setHours(0, 0, 0, 0);
  }
  let anon = anonymize ? createAnonymizer() : null;
  let browser_info = await browser.runtime.getBrowserInfo();
  let errors = [];

  let folder_ids = new Map();
  let raw_accounts = await browser.accounts.list(true);
  let accounts = raw_accounts.map((account, index) => dumpAccount(account, index, anon, folder_ids));
  log(raw_accounts.length + ' accounts');

  let messages = [];
  let all_folders = raw_accounts.flatMap(account => flattenFolders(account.rootFolder ? (account.rootFolder.subFolders || []) : (account.folders || [])));
  for (let [index, folder] of all_folders.entries()) {
    let queryInfo = { folderId: folder.id, includeSubFolders: false, messagesPerPage: MESSAGES_PER_PAGE };
    if (fromDate) queryInfo.fromDate = fromDate;
    let count = 0;
    try {
      for await (let message of queryAll(queryInfo)) {
        messages.push(dumpMessage(message, folder_ids.get(folder.id), anon));
        count++;
      }
    } catch (error) {
      // e.g. a folder that cannot hold messages, like the [Gmail] parent folder
      errors.push({ folder: folder_ids.get(folder.id), error: String(error) });
    }
    log('Folder ' + (index + 1) + '/' + all_folders.length + ' [' + (folder.specialUse || []).join(',') + ']: ' + count + ' messages');
  }

  let tags = (await browser.messages.tags.list()).map(tag => dumpTag(tag, anon));

  let contacts = [];
  for (let book of await browser.addressBooks.list(true)) {
    for (let contact of (book.contacts || [])) {
      let vCard = contact.vCard ?? contact.properties?.vCard;
      if (vCard) contacts.push(dumpContact(vCard, anon));
    }
  }

  return {
    format: FORMAT,
    version: FORMAT_VERSION,
    created: created.toISOString(),
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    thunderbird: browser_info.version,
    anonymized: !!anon,
    from_date: fromDate ? fromDate.toISOString() : null,
    accounts,
    tags,
    contacts,
    messages,
    errors,
  };
}

document.getElementById('start').addEventListener('click', async (event) => {
  event.target.disabled = true;
  log_element.textContent = '';
  try {
    let start = performance.now();
    let dump = await createDump(Number(document.getElementById('months').value), document.getElementById('anonymize').checked);
    let blob = new Blob([JSON.stringify(dump)], { type: 'application/json' });
    let link = document.getElementById('download');
    link.href = URL.createObjectURL(blob);
    link.download = 'mailbox-dump-' + dump.created.slice(0, 10).replaceAll('-', '') + '.json';
    link.textContent = 'Download ' + link.download;
    link.hidden = false;
    log('\nDone in ' + Math.round((performance.now() - start) / 1000) + 's: ' + dump.messages.length + ' messages, ' +
      dump.contacts.length + ' contacts, ' + dump.errors.length + ' folder errors, ' + Math.round(blob.size / 1024) + ' KB');
    link.click();
  } catch (error) {
    log('\nERROR: ' + error);
  } finally {
    event.target.disabled = false;
  }
});
