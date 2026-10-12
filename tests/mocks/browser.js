// In-memory stand-in for the Thunderbird WebExtension API (globalThis.browser / messenger).
// Only the parts used by statslib are implemented; tests fill the data through the returned object:
//   mock.mailbox  = { accounts: [{id, name, identities, folders}], messages: [] }  (see tests/fixtures/mailbox.js)
//   mock.tags     = [{key, tag, color, ordinal}]
//   mock.contacts = [vCard strings]
//   mock.onQuery  = async (queryInfo) => {}  awaited before a messages.query resolves (to hold queries open)
//   mock.calls    = { query: [queryInfo], continueList: [id], accountsList: n }

// MailFolder as found in message.folder: no subFolders
function folderInfo(folder) {
  let { subFolders, ...info } = folder;
  return info;
}

function flatten(folders, output = []) {
  for (let folder of folders) {
    output.push(folder);
    flatten(folder.subFolders || [], output);
  }
  return output;
}

export function createBrowserMock() {
  const storage = {};
  const lists = new Map();
  let next_list = 1;

  const mock = {
    mailbox: { accounts: [], messages: [] },
    tags: [],
    contacts: [],
    onQuery: null,
    calls: { query: [], continueList: [], accountsList: 0 },

    storage: {
      sync: {
        // Same contract as the real API: an object argument gives the defaults for the missing keys
        async get(keys) {
          if (keys == null) return structuredClone(storage);
          if (typeof keys === 'string') keys = [keys];
          let output = {};
          if (Array.isArray(keys)) {
            for (let key of keys) {
              if (key in storage) output[key] = structuredClone(storage[key]);
            }
          } else {
            for (let key in keys) {
              output[key] = key in storage ? structuredClone(storage[key]) : keys[key];
            }
          }
          return output;
        },
        async set(values) {
          Object.assign(storage, structuredClone(values));
        },
      },
      onChanged: { addListener() {}, removeListener() {} },
    },

    i18n: {
      // "key" or "key[sub1|sub2]", so the assertions stay readable without the locale files
      getMessage(key, subs) {
        if (subs === undefined || subs === null) return key;
        let list = Array.isArray(subs) ? subs : [subs];
        return key + '[' + list.join('|') + ']';
      },
      getUILanguage() {
        return 'en-US';
      },
    },

    accounts: {
      async list() {
        mock.calls.accountsList++;
        return mock.mailbox.accounts.map(({ folders, ...account }) => structuredClone(account));
      },
    },

    folders: {
      async getSubFolders(account_id) {
        let account = mock.mailbox.accounts.find(a => a.id == account_id);
        return account ? structuredClone(account.folders) : [];
      },
      async query({ accountId, specialUse }) {
        let accounts = mock.mailbox.accounts.filter(a => !accountId || a.id == accountId);
        return accounts
          .flatMap(a => flatten(a.folders))
          .filter(f => (specialUse || []).every(use => (f.specialUse || []).includes(use)))
          .map(folderInfo);
      },
    },

    messages: {
      // Filters like Thunderbird: fromDate included, toDate excluded, folderId with or without subfolders
      async query(queryInfo) {
        mock.calls.query.push(queryInfo);
        if (mock.onQuery) await mock.onQuery(queryInfo);

        let folder_ids = null;
        if (queryInfo.folderId !== undefined) {
          folder_ids = new Set([].concat(queryInfo.folderId));
          if (queryInfo.includeSubFolders) {
            for (let folder of mock.mailbox.accounts.flatMap(a => flatten(a.folders))) {
              if (folder_ids.has(folder.id)) flatten(folder.subFolders || []).forEach(sub => folder_ids.add(sub.id));
            }
          }
        }
        let found = mock.mailbox.messages.filter(m =>
          (!queryInfo.fromDate || m.date >= queryInfo.fromDate) &&
          (!queryInfo.toDate || m.date < queryInfo.toDate) &&
          (!folder_ids || folder_ids.has(m.folder.id)) &&
          (queryInfo.subject === undefined || m.subject.includes(queryInfo.subject)) &&
          (queryInfo.unread === undefined || m.read != queryInfo.unread) &&
          (queryInfo.flagged === undefined || m.flagged == queryInfo.flagged)
        );
        return page(found, queryInfo.messagesPerPage || 100);
      },
      async continueList(id) {
        mock.calls.continueList.push(id);
        let rest = lists.get(id);
        lists.delete(id);
        return page(rest.messages, rest.per_page);
      },
      tags: {
        async list() {
          return structuredClone(mock.tags);
        },
      },
    },

    addressBooks: {
      async list() {
        return [{ id: 'book1', contacts: mock.contacts.map((vCard, i) => ({ id: 'c' + i, properties: { vCard } })) }];
      },
    },
  };

  function page(messages, per_page) {
    let output = { id: null, messages: messages.slice(0, per_page).map(m => ({ ...m, folder: folderInfo(m.folder) })) };
    if (messages.length > per_page) {
      output.id = 'list' + next_list++;
      lists.set(output.id, { messages: messages.slice(per_page), per_page });
    }
    return output;
  }

  return mock;
}
